'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getTeam() {
    try {
        const team = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        return team;
    } catch (error) {
        console.error("Error fetching team:", error);
        return [];
    }
}

export async function createTeamMember(data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
}) {
    try {
        const hashedPassword = await bcrypt.hash(data.password || "changeme123", 10);

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role || "PROFESSIONAL",
            },
        });
        revalidatePath("/team");
        return { success: true };
    } catch (error) {
        console.error("Error creating team member:", error);
        return { success: false, error: "Falha ao criar membro da equipe." };
    }
}

export async function updateTeamMember(id: string, data: {
    name: string;
    email: string;
    role: string;
}) {
    try {
        await prisma.user.update({
            where: { id },
            data,
        });
        revalidatePath("/team");
        return { success: true };
    } catch (error) {
        console.error("Error updating team member:", error);
        return { success: false, error: "Falha ao atualizar membro da equipe." };
    }
}

export async function deleteTeamMember(id: string) {
    try {
        // Prevent deleting the last admin or something? 
        // Basic implementation for now.
        await prisma.user.delete({
            where: { id },
        });
        revalidatePath("/team");
        return { success: true };
    } catch (error) {
        console.error("Error deleting team member:", error);
        return { success: false, error: "Falha ao excluir membro da equipe." };
    }
}
