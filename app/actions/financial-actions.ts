'use server'

import prisma from "@/lib/prisma"

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
