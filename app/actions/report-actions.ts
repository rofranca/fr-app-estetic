'use server';

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfYesterday, endOfYesterday, subMonths, format, startOfDay, endOfDay } from "date-fns";

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

export async function getBirthdaysToday() {
    try {
        const today = new Date();
        const clients = await prisma.client.findMany({
            where: { birthDate: { not: null } },
            select: { name: true, birthDate: true, phone: true, email: true }
        });

        return clients.filter((c: any) => {
            const b = new Date(c.birthDate!);
            return b.getDate() === today.getDate() && b.getMonth() === today.getMonth();
        });
    } catch (error) {
        console.error("Error fetching today's birthdays:", error);
        return [];
    }
}

export async function getDailyCashFlow() {
    try {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const transactions = await prisma.transaction.findMany({
            where: {
                createdAt: { gte: start, lte: end },
                status: "PAID"
            }
        });

        // Group by day
        const daysInMonth = end.getDate();
        const flow = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            entradas: 0,
            saidas: 0
        }));

        transactions.forEach((t: any) => {
            const day = new Date(t.createdAt).getDate();
            if (t.type === "INCOME") flow[day - 1].entradas += Number(t.amount);
            else flow[day - 1].saidas += Number(t.amount);
        });

        return flow;
    } catch (error) {
        console.error("Error fetching daily cash flow:", error);
        return [];
    }
}

export async function getServiceDistribution() {
    try {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const appointments = await prisma.appointment.findMany({
            where: { startTime: { gte: start, lte: end } },
            include: { service: true }
        });

        const distribution: any = {};
        appointments.forEach((a: any) => {
            const name = a.service.name;
            distribution[name] = (distribution[name] || 0) + 1;
        });

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    } catch (error) {
        console.error("Error fetching service distribution:", error);
        return [];
    }
}

export async function getSalesDistribution() {
    try {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const transactions = await prisma.transaction.findMany({
            where: {
                type: "INCOME",
                createdAt: { gte: start, lte: end }
            }
        });

        // This is a bit tricky if descriptions are used, but for now we'll mock it or use common descriptions
        // In a real app we'd link Transaction to Service. 
        // Our Transaction has 'packageId' or 'appointmentId'.

        const distribution: any = {};
        for (const t of transactions) {
            let category = "Venda Avulsa";
            if (t.packageId) category = "Pacote";
            distribution[category] = (distribution[category] || 0) + Number(t.amount);
        }

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    } catch (error) {
        console.error("Error fetching sales distribution:", error);
        return [];
    }
}

