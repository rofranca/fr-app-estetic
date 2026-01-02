'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) return null;
    return await prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function getSaleData() {
    try {
        const [clients, services, paymentMethods, accounts, team] = await Promise.all([
            prisma.client.findMany({
                where: { status: "ATIVO" },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, email: true, phone: true }
            }),
            prisma.service.findMany({
                where: { active: true },
                orderBy: { name: 'asc' }
            }),
            prisma.paymentMethod.findMany({
                where: { active: true },
                orderBy: { name: 'asc' }
            }),
            prisma.account.findMany({
                orderBy: { name: 'asc' }
            }),
            prisma.user.findMany({
                orderBy: { name: 'asc' },
                select: { id: true, name: true, commissionRate: true }
            })
        ]);

        return { clients, services, paymentMethods, accounts, team };
    } catch (error) {
        console.error("Error fetching sale data:", error);
        return { clients: [], services: [], paymentMethods: [], accounts: [], team: [] };
    }
}

interface SaleItem {
    serviceId: string;
    quantity: number;
    pricePerSession: number;
}

interface CreateSaleData {
    clientId: string;
    items: SaleItem[];
    paymentMethodId: string;
    installments: number;
    paidNow: boolean;
    accountId?: string;
    sellerId?: string;
    discount?: number;
    discountType?: string;
    couponCode?: string;
}

export async function createSale(data: CreateSaleData) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Calculate subtotal
        const subtotal = data.items.reduce((acc, item) => {
            return acc + (item.quantity * item.pricePerSession);
        }, 0);

        // Apply discount
        let discountAmount = 0;
        if (data.discount && data.discount > 0) {
            if (data.discountType === 'PERCENTAGE') {
                discountAmount = (subtotal * data.discount) / 100;
            } else {
                discountAmount = data.discount;
            }
        }

        const totalAmount = subtotal - discountAmount;

        // Calculate commission if seller is specified
        let commission = 0;
        if (data.sellerId) {
            const seller = await prisma.user.findUnique({
                where: { id: data.sellerId }
            });
            if (seller && seller.commissionRate) {
                commission = (totalAmount * Number(seller.commissionRate)) / 100;
            }
        }

        // Get payment method details
        const paymentMethod = await prisma.paymentMethod.findUnique({
            where: { id: data.paymentMethodId }
        });

        if (!paymentMethod) throw new Error("Forma de pagamento não encontrada");

        // Get client details
        const client = await prisma.client.findUnique({
            where: { id: data.clientId }
        });

        if (!client) throw new Error("Cliente não encontrado");

        // Create budget (approved)
        const budget = await prisma.budget.create({
            data: {
                name: `Venda - ${client.name}`,
                clientId: data.clientId,
                userId: user.id,
                sellerId: data.sellerId,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                status: "APROVADO",
                totalAmount: totalAmount,
                discount: discountAmount,
                discountType: data.discountType,
                couponCode: data.couponCode,
                commission: commission,
                items: {
                    create: data.items.map(item => ({
                        serviceId: item.serviceId,
                        quantity: item.quantity,
                        pricePerSession: item.pricePerSession,
                        totalPrice: item.quantity * item.pricePerSession
                    }))
                }
            },
            include: {
                items: {
                    include: { service: true }
                }
            }
        });

        // Create packages for services that have duration > 0 (assuming services are packages)
        // Or check if we should always create a package for each item
        for (const item of data.items) {
            const service = await prisma.service.findUnique({ where: { id: item.serviceId } });
            if (service) {
                // If quantity > 1, we might want to create a package with X sessions
                // Or create X packages. Usually it's one package with Total Sessions = quantity
                // Assuming "quantity" in cart means "Number of Sessions" mostly, 
                // OR "Number of Packages". 
                // Let's assume quantity = sessions for now as per typical aesthetic app logic
                // Actually, if I sell "Botox", quantity 1 = 1 session.

                await prisma.package.create({
                    data: {
                        clientId: data.clientId,
                        serviceId: item.serviceId,
                        totalSessions: item.quantity,
                        remainingSessions: item.quantity,
                        price: service.price,
                        status: "ACTIVE"
                    }
                });
            }
        }

        // Get open cash register
        const openRegister = await prisma.cashRegister.findFirst({
            where: { userId: user.id, status: "OPEN" }
        });

        // Create financial transactions based on installments
        const installmentValue = totalAmount / data.installments;
        const transactions = [];

        // Get the current day of month for the sale
        const saleDate = new Date(); // Normalized to today? No, just now.

        for (let i = 0; i < data.installments; i++) {
            // Calculate due date: same day of month, i months from now
            // We use a fresh date object from saleDate for each iteration to avoid mutation issues
            const dueDate = new Date(saleDate);

            // Explicitly add months
            dueDate.setMonth(dueDate.getMonth() + i);

            // Verify if due date rolled over incorrectly (e.g. Jan 31 -> Feb 28/29)
            // The logic setMonth handles this by overflowing, but we might want to stick to end of month
            // JS setMonth(currentMonth + 1) on Jan 31 results in March 3rd (approx).
            // We want Feb 28.
            const targetMonth = (saleDate.getMonth() + i) % 12;
            if (dueDate.getMonth() !== targetMonth) {
                // If month mismatch, it means overflow happened. Set to last day of previous month within that year.
                dueDate.setDate(0);
            }

            const isFirstInstallment = i === 0;
            const isPaid = data.paidNow && isFirstInstallment;

            const transaction = await prisma.transaction.create({
                data: {
                    description: `Venda: ${budget.name} - Parcela ${i + 1}/${data.installments}`,
                    amount: installmentValue,
                    type: "INCOME",
                    status: isPaid ? "PAID" : "PENDING",
                    dueDate: dueDate,
                    paidAt: isPaid ? new Date() : null,
                    clientId: data.clientId,
                    paymentMethodId: data.paymentMethodId,
                    accountId: isPaid ? data.accountId : null,
                    cashRegisterId: isPaid ? openRegister?.id : null,
                    notes: `Gerado da venda #${budget.id}\nItens: ${budget.items.map(i => `${i.service.name} (${i.quantity}x)`).join(', ')}`
                }
            });

            // Update account balance if paid
            if (isPaid && data.accountId) {
                await prisma.account.update({
                    where: { id: data.accountId },
                    data: {
                        balance: {
                            increment: installmentValue
                        }
                    }
                });
            }

            transactions.push(transaction);
        }

        revalidatePath("/sales");
        revalidatePath("/financial");
        revalidatePath("/financial/transactions");
        revalidatePath("/budgets");

        return {
            success: true,
            budget,
            transactions,
            message: `Venda realizada com sucesso! ${data.installments > 1 ? `${data.installments} parcelas criadas.` : 'Pagamento à vista registrado.'}`
        };
    } catch (error) {
        console.error("Error creating sale:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Falha ao criar venda"
        };
    }
}

export async function getSalesToday() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sales = await prisma.budget.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                },
                status: "APROVADO",
                name: {
                    startsWith: "Venda -"
                }
            },
            include: {
                client: {
                    select: { name: true }
                },
                user: {
                    select: { name: true }
                },
                items: {
                    include: {
                        service: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate summary
        const summary = {
            total: sales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0),
            count: sales.length,
            ticket: sales.length > 0 ? sales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0) / sales.length : 0
        };

        return { sales, summary };
    } catch (error) {
        console.error("Error fetching today sales:", error);
        return { sales: [], summary: { total: 0, count: 0, ticket: 0 } };
    }
}
