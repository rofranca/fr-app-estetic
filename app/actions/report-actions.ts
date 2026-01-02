'use server';

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfYesterday, endOfYesterday, subMonths, format } from "date-fns";

export async function getFinancialSummary() {
    try {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);

        const transactions = await prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
        });

        const income = transactions
            .filter((t: any) => t.type === "INCOME" && t.status === "PAID")
            .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

        const expenses = transactions
            .filter((t: any) => t.type === "EXPENSE")
            .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

        const pendingIncome = transactions
            .filter((t: any) => t.type === "INCOME" && t.status === "PENDING")
            .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

        return {
            revenue: income,
            expenses: expenses,
            balance: income - expenses,
            pending: pendingIncome,
        };
    } catch (error) {
        console.error("Error fetching financial summary:", error);
        return { revenue: 0, expenses: 0, balance: 0, pending: 0 };
    }
}

export async function getMonthlyRevenueChart() {
    try {
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const income = await prisma.transaction.aggregate({
                where: {
                    type: "INCOME",
                    status: "PAID",
                    createdAt: { gte: start, lte: end }
                },
                _sum: { amount: true }
            });

            data.push({
                name: format(date, "MMM"),
                total: Number(income._sum.amount || 0)
            });
        }
        return data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
        return [];
    }
}

export async function getUpcomingBirthdays() {
    try {
        const clients = await prisma.client.findMany({
            where: {
                birthDate: { not: null }
            },
            select: { name: true, birthDate: true, phone: true }
        });

        const now = new Date();
        const currentMonth = now.getMonth();

        return clients.filter((c: any) => {
            if (!c.birthDate) return false;
            return c.birthDate.getMonth() === currentMonth;
        }).sort((a: any, b: any) => a.birthDate!.getDate() - b.birthDate!.getDate());
    } catch (error) {
        console.error("Error fetching birthdays:", error);
        return [];
    }
}
