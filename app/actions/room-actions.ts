"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRooms() {
    try {
        const rooms = await prisma.room.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        return { success: true, rooms };
    } catch (error) {
        console.error("Error getting rooms:", error);
        return { success: false, error: "Falha ao buscar salas" };
    }
}

export async function createRoom(data: { name: string, description?: string }) {
    try {
        const room = await prisma.room.create({
            data: {
                name: data.name,
                description: data.description
            }
        });
        revalidatePath('/settings');
        return { success: true, room };
    } catch (error) {
        console.error("Error creating room:", error);
        return { success: false, error: "Falha ao criar sala" };
    }
}

export async function deleteRoom(id: string) {
    try {
        await prisma.room.update({
            where: { id },
            data: { active: false }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Error deleting room:", error);
        return { success: false, error: "Falha ao excluir sala" };
    }
}
