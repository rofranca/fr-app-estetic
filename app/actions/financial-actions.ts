'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) return null;
    return await prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function getFinancialSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    const income = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expense = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
        income,
        expense,
        balance: income - expense
    };
}

export async function getRecentTransactions() {
    return await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
    });
}

// Categories Actions
export async function getCategories() {
    try {
        return await prisma.financialCategory.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createCategory(data: {
    name: string;
    type: string;
    isRecurring: boolean;
    defaultAmount?: number;
    dueDay?: number;
}) {
    try {
        const category = await prisma.financialCategory.create({
            data: {
                ...data,
                defaultAmount: data.defaultAmount ? Number(data.defaultAmount) : null
            }
        });
        revalidatePath("/financial/categories");
        return { success: true, category };
    } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, error: "Falha ao criar categoria" };
    }
}

export async function updateCategory(id: string, data: {
    name: string;
    type: string;
    isRecurring: boolean;
    defaultAmount?: number;
    dueDay?: number;
}) {
    try {
        const category = await prisma.financialCategory.update({
            where: { id },
            data: {
                ...data,
                defaultAmount: data.defaultAmount ? Number(data.defaultAmount) : null
            }
        });
        revalidatePath("/financial/categories");
        return { success: true, category };
    } catch (error) {
        console.error("Error updating category:", error);
        return { success: false, error: "Falha ao atualizar categoria" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.financialCategory.delete({
            where: { id }
        });
        revalidatePath("/financial/categories");
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, error: "Falha ao excluir categoria. Verifique se existem lançamentos vinculados." };
    }
}

// Account Actions
export async function getAccounts() {
    try {
        return await prisma.account.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return [];
    }
}

export async function createAccount(data: { name: string; balance: number; type: string }) {
    try {
        const account = await prisma.account.create({
            data: {
                name: data.name,
                balance: Number(data.balance),
                type: data.type
            }
        });
        revalidatePath("/financial/accounts");
        return { success: true, account };
    } catch (error) {
        console.error("Error creating account:", error);
        return { success: false, error: "Falha ao criar conta" };
    }
}

export async function updateAccount(id: string, data: { name: string; balance: number; type: string }) {
    try {
        const account = await prisma.account.update({
            where: { id },
            data: {
                name: data.name,
                balance: Number(data.balance),
                type: data.type
            }
        });
        revalidatePath("/financial/accounts");
        return { success: true, account };
    } catch (error) {
        console.error("Error updating account:", error);
        return { success: false, error: "Falha ao atualizar conta" };
    }
}

export async function deleteAccount(id: string) {
    try {
        await prisma.account.delete({ where: { id } });
        revalidatePath("/financial/accounts");
        return { success: true };
    } catch (error) {
        console.error("Error deleting account:", error);
        return { success: false, error: "Falha ao excluir conta" };
    }
}

// Payment Method Actions
export async function getPaymentMethods() {
    try {
        return await prisma.paymentMethod.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching payment methods:", error);
        return [];
    }
}

export async function createPaymentMethod(data: { name: string; type: string; receiptDays: number; active: boolean }) {
    try {
        const method = await prisma.paymentMethod.create({
            data: {
                name: data.name,
                type: data.type,
                receiptDays: Number(data.receiptDays),
                active: data.active
            }
        });
        revalidatePath("/financial/payment-methods");
        return { success: true, method };
    } catch (error) {
        console.error("Error creating payment method:", error);
        return { success: false, error: "Falha ao criar forma de pagamento" };
    }
}

export async function updatePaymentMethod(id: string, data: { name: string; type: string; receiptDays: number; active: boolean }) {
    try {
        const method = await prisma.paymentMethod.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                receiptDays: Number(data.receiptDays),
                active: data.active
            }
        });
        revalidatePath("/financial/payment-methods");
        return { success: true, method };
    } catch (error) {
        console.error("Error updating payment method:", error);
        return { success: false, error: "Falha ao atualizar forma de pagamento" };
    }
}

export async function deletePaymentMethod(id: string) {
    try {
        await prisma.paymentMethod.delete({ where: { id } });
        revalidatePath("/financial/payment-methods");
        return { success: true };
    } catch (error) {
        console.error("Error deleting payment method:", error);
        return { success: false, error: "Falha ao excluir forma de pagamento" };
    }
}

// Cash Register Actions
export async function getOpenCashRegister() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        return await prisma.cashRegister.findFirst({
            where: {
                userId: user.id,
                status: "OPEN"
            },
            include: {
                transactions: true
            }
        });
    } catch (error) {
        console.error("Error fetching open cash register:", error);
        return null;
    }
}

export async function openCashRegister(openingBalance: number) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Usuário não autenticado");

        const register = await prisma.cashRegister.create({
            data: {
                userId: user.id,
                openingBalance: Number(openingBalance),
                status: "OPEN",
                openingDate: new Date()
            }
        });
        revalidatePath("/financial");
        revalidatePath("/financial/cash-registers");
        return { success: true, register };
    } catch (error) {
        console.error("Error opening cash register:", error);
        return { success: false, error: "Falha ao abrir o caixa" };
    }
}

export async function closeCashRegister(id: string, closingBalance: number) {
    try {
        const register = await prisma.cashRegister.update({
            where: { id },
            data: {
                closingBalance: Number(closingBalance),
                status: "CLOSED",
                closingDate: new Date()
            }
        });
        revalidatePath("/financial");
        revalidatePath("/financial/cash-registers");
        return { success: true, register };
    } catch (error) {
        console.error("Error closing cash register:", error);
        return { success: false, error: "Falha ao fechar o caixa" };
    }
}

export async function getCashRegisterHistory() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        return await prisma.cashRegister.findMany({
            where: { userId: user.id },
            orderBy: { openingDate: 'desc' },
            take: 30
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}

// Transaction Actions
export async function getTransactions(filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    categoryId?: string;
}) {
    try {
        const where: any = {};
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
            };
        }
        if (filters?.type) where.type = filters.type;
        if (filters?.categoryId) where.categoryId = filters.categoryId;

        return await prisma.transaction.findMany({
            where,
            include: {
                category: true,
                account: true,
                paymentMethod: true,
                client: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function createTransaction(data: {
    description: string;
    amount: number;
    type: string;
    categoryId?: string;
    accountId?: string;
    paymentMethodId?: string;
    dueDate?: Date;
    paidAt?: Date;
    status: string;
    notes?: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Não autorizado");

        // Find open register
        const openRegister = await prisma.cashRegister.findFirst({
            where: { userId: user.id, status: "OPEN" }
        });

        const transaction = await prisma.transaction.create({
            data: {
                description: data.description,
                amount: Number(data.amount),
                type: data.type,
                categoryId: data.categoryId,
                accountId: data.accountId,
                paymentMethodId: data.paymentMethodId,
                dueDate: data.dueDate,
                paidAt: data.paidAt,
                status: data.status,
                notes: data.notes,
                cashRegisterId: openRegister?.id
            }
        });

        // Update account balance if PAID
        if (data.status === 'PAID' && data.accountId) {
            const amount = Number(data.amount);
            await prisma.account.update({
                where: { id: data.accountId },
                data: {
                    balance: {
                        [data.type === 'INCOME' ? 'increment' : 'decrement']: amount
                    }
                }
            });
        }

        revalidatePath("/financial");
        revalidatePath("/financial/transactions");
        return { success: true, transaction };
    } catch (error) {
        console.error("Error creating transaction:", error);
        return { success: false, error: "Falha ao criar lançamento" };
    }
}

export async function deleteTransaction(id: string) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id }
        });

        if (!transaction) throw new Error("Lançamento não encontrado");

        // Reverse account balance if it was PAID
        if (transaction.status === 'PAID' && transaction.accountId) {
            const amount = Number(transaction.amount);
            await prisma.account.update({
                where: { id: transaction.accountId },
                data: {
                    balance: {
                        [transaction.type === 'INCOME' ? 'decrement' : 'increment']: amount
                    }
                }
            });
        }

        await prisma.transaction.delete({
            where: { id }
        });

        revalidatePath("/financial/transactions");
        return { success: true };
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return { success: false, error: "Falha ao excluir lançamento" };
    }
}

export async function checkAndCreateRecurringTransactions() {
    try {
        const today = new Date();
        const currentDay = today.getDate();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Find recurring categories that should have triggered by now
        const recurringCategories = await prisma.financialCategory.findMany({
            where: {
                isRecurring: true,
                dueDay: { lte: currentDay }
            }
        });

        for (const cat of recurringCategories) {
            // Check if transaction already exists for this category this month
            const exists = await prisma.transaction.findFirst({
                where: {
                    categoryId: cat.id,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            if (!exists) {
                // Create pending transaction
                await prisma.transaction.create({
                    data: {
                        description: `Recorrente: ${cat.name}`,
                        amount: cat.defaultAmount || 0,
                        type: cat.type,
                        categoryId: cat.id,
                        status: "PENDING",
                        dueDate: new Date(today.getFullYear(), today.getMonth(), cat.dueDay || 1)
                    }
                });
            }
        }
        revalidatePath("/financial/transactions");
        return { success: true };
    } catch (error) {
        console.error("Error in recurring system:", error);
        return { success: false };
    }
}
