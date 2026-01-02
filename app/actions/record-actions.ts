'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRecord(data: {
    clientId: string;
    content: string;
    photos?: string[]; // Array of URLs
}) {
    try {
        const record = await prisma.record.create({
            data: {
                clientId: data.clientId,
                content: data.content,
                photos: data.photos ? JSON.stringify(data.photos) : "[]",
                date: new Date(),
            }
        });

        revalidatePath(`/clients/${data.clientId}/records`);
        return { success: true, record };
    } catch (error) {
        console.error("Error creating record:", error);
        return { success: false, error: "Falha ao salvar prontuário." };
    }
}

export async function getClientRecords(clientId: string) {
    try {
        const records = await prisma.record.findMany({
            where: { clientId },
            orderBy: { date: 'desc' },
        });

        // Parse photos JSON
        return records.map((r: any) => ({
            ...r,
            photos: r.photos ? JSON.parse(r.photos) : []
        }));
    } catch (error) {
        console.error("Error fetching records:", error);
        return [];
    }
}

export async function deleteRecord(id: string) {
    try {
        const record = await prisma.record.delete({ where: { id } });
        revalidatePath(`/clients/${record.clientId}/records`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting record:", error);
        return { success: false, error: "Falha ao excluir prontuário." };
    }
}
