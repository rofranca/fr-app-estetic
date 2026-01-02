'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getServices() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { name: 'asc' },
        });
        return services;
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}

export async function createService(data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
}) {
    try {
        await prisma.service.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration,
            },
        });
        revalidatePath("/services");
        return { success: true };
    } catch (error) {
        console.error("Error creating service:", error);
        return { success: false, error: "Falha ao criar serviço." };
    }
}

export async function updateService(id: string, data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    active: boolean;
}) {
    try {
        await prisma.service.update({
            where: { id },
            data,
        });
        revalidatePath("/services");
        return { success: true };
    } catch (error) {
        console.error("Error updating service:", error);
        return { success: false, error: "Falha ao atualizar serviço." };
    }
}

export async function deleteService(id: string) {
    try {
        await prisma.service.delete({
            where: { id },
        });
        revalidatePath("/services");
        return { success: true };
    } catch (error) {
        console.error("Error deleting service:", error);
        return { success: false, error: "Falha ao excluir serviço." };
    }
}
