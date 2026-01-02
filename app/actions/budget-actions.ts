'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBudget(data: {
    name: string;
    clientId: string;
    userId: string;
    validUntil: Date;
    status: string;
    items: {
        serviceId: string;
        quantity: number;
        pricePerSession: number;
    }[];
}) {
    try {
        const totalAmount = data.items.reduce((acc, item) => {
            return acc + (item.quantity * item.pricePerSession);
        }, 0);

        const budget = await prisma.budget.create({
            data: {
                name: data.name,
                clientId: data.clientId,
                userId: data.userId,
                validUntil: data.validUntil,
                status: data.status,
                totalAmount: totalAmount,
                items: {
                    create: data.items.map(item => ({
                        serviceId: item.serviceId,
                        quantity: item.quantity,
                        pricePerSession: item.pricePerSession,
                        totalPrice: item.quantity * item.pricePerSession
                    }))
                }
            }
        });

        revalidatePath("/clients");
        return budget;
    } catch (error) {
        console.error("Error creating budget:", error);
        throw new Error("Falha ao criar orçamento");
    }
}

export async function getBudgetsByClient(clientId: string) {
    try {
        return await prisma.budget.findMany({
            where: { clientId },
            include: {
                items: {
                    include: { service: true }
                },
                user: true
            },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        return [];
    }
}

export async function updateBudgetStatus(budgetId: string, status: string) {
    try {
        const budget = await prisma.budget.update({
            where: { id: budgetId },
            data: { status }
        });
        revalidatePath("/clients");
        return budget;
    } catch (error) {
        console.error("Error updating budget status:", error);
        throw new Error("Falha ao atualizar status do orçamento");
    }
}

export async function deleteBudget(budgetId: string) {
    try {
        // Prisma will delete items due to relation if configured, 
        // but let's be safe if not using Cascade
        await prisma.budgetItem.deleteMany({
            where: { budgetId }
        });

        await prisma.budget.delete({
            where: { id: budgetId }
        });

        revalidatePath("/clients");
        return { success: true };
    } catch (error) {
        console.error("Error deleting budget:", error);
        throw new Error("Falha ao excluir orçamento");
    }
}
export async function getAllBudgets() {
    try {
        return await prisma.budget.findMany({
            include: {
                client: true,
                user: true,
                items: {
                    include: { service: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Error fetching all budgets:", error);
        return [];
    }
}

export async function updateBudget(id: string, data: {
    name: string;
    userId: string;
    validUntil: Date;
    status: string;
    items: {
        serviceId: string;
        quantity: number;
        pricePerSession: number;
    }[];
}) {
    try {
        const totalAmount = data.items.reduce((acc, item) => {
            return acc + (item.quantity * item.pricePerSession);
        }, 0);

        // Delete old items and create new ones for simplicity
        await prisma.budgetItem.deleteMany({
            where: { budgetId: id }
        });

        const budget = await prisma.budget.update({
            where: { id },
            data: {
                name: data.name,
                userId: data.userId,
                validUntil: data.validUntil,
                status: data.status,
                totalAmount: totalAmount,
                items: {
                    create: data.items.map(item => ({
                        serviceId: item.serviceId,
                        quantity: item.quantity,
                        pricePerSession: item.pricePerSession,
                        totalPrice: item.quantity * item.pricePerSession
                    }))
                }
            }
        });

        revalidatePath("/budgets");
        revalidatePath("/clients");
        return budget;
    } catch (error) {
        console.error("Error updating budget:", error);
        throw new Error("Falha ao atualizar orçamento");
    }
}
