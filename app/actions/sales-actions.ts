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
        const [clients, services, paymentMethods, accounts] = await Promise.all([
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
            })
        ]);

        return { clients, services, paymentMethods, accounts };
    } catch (error) {
        console.error("Error fetching sale data:", error);
        return { clients: [], services: [], paymentMethods: [], accounts: [] };
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
}

export async function createSale(data: CreateSaleData) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Calculate total
        const totalAmount = data.items.reduce((acc, item) => {
            return acc + (item.quantity * item.pricePerSession);
        }, 0);

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
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                status: "APROVADO",
                totalAmount: totalAmount,
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

        // Get open cash register
        const openRegister = await prisma.cashRegister.findFirst({
            where: { userId: user.id, status: "OPEN" }
        });

        // Create financial transactions based on installments
        const installmentValue = totalAmount / data.installments;
        const transactions = [];

        // Get the current day of month for the sale
        const saleDate = new Date();
        const dayOfMonth = saleDate.getDate();

        for (let i = 0; i < data.installments; i++) {
            // Calculate due date: same day of month, i months from now
            const dueDate = new Date(saleDate);
            dueDate.setMonth(dueDate.getMonth() + i);

            // Handle edge case: if original day doesn't exist in target month (e.g., Jan 31 -> Feb 31)
            // JavaScript will automatically adjust to the last day of the month
            if (dueDate.getDate() !== dayOfMonth) {
                // Set to last day of the month
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
