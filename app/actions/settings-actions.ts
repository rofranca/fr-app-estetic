'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOrganization() {
    try {
        // Find the first organization or create default
        let org = await prisma.organization.findFirst();

        if (!org) {
            org = await prisma.organization.create({
                data: {
                    name: "Minha Clínica",
                }
            });
        }

        return { success: true, organization: org };
    } catch (error) {
        console.error("Error getting organization:", error);
        return { success: false, error: "Falha ao buscar dados da empresa" };
    }
}

export async function updateOrganization(data: {
    name: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    address?: string;
}) {
    try {
        const org = await prisma.organization.findFirst();

        if (!org) throw new Error("Organização não encontrada");

        const updated = await prisma.organization.update({
            where: { id: org.id },
            data: {
                name: data.name,
                cnpj: data.cnpj,
                email: data.email,
                phone: data.phone,
                address: data.address
            }
        });

        revalidatePath('/settings');
        return { success: true, organization: updated };
    } catch (error) {
        console.error("Error updating organization:", error);
        return { success: false, error: "Falha ao atualizar dados" };
    }
}
