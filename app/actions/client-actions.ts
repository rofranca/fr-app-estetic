'use server'

import prisma from "@/lib/prisma"
import { AsaasService } from "@/lib/asaas"
import { revalidatePath } from "next/cache"

export async function createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    birthDate?: Date;
    cpf?: string;
    rg?: string;
    cep?: string;
    address?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    referencePoint?: string;
    notes?: string;
    referralSource?: string;
    status?: string;
    clientCredit?: number;
    creditNotes?: string;
}) {
    try {
        const newClient = await prisma.client.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                birthDate: data.birthDate,
                cpf: data.cpf,
                rg: data.rg,
                cep: data.cep,
                address: data.address,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                referencePoint: data.referencePoint,
                notes: data.notes,
                referralSource: data.referralSource || "NAO_INFORMADO",
                status: data.status || "ATIVO",
                clientCredit: data.clientCredit || 0,
                creditNotes: data.creditNotes,
            }
        });

        try {
            if (data.email && data.cpf) {
                const asaasCustomer = await AsaasService.createCustomer({
                    name: data.name,
                    email: data.email,
                    cpf: data.cpf,
                    phone: data.phone
                });
                await prisma.client.update({
                    where: { id: newClient.id },
                    data: { asaasId: asaasCustomer.id }
                });
            }
        } catch (asaasError) {
            console.error("Asaas sync failure:", asaasError);
        }

        revalidatePath('/clients');
        return { success: true, client: newClient };
    } catch (error) {
        console.error("Error creating client:", error);
        return { success: false, error: "Erro ao criar cliente." };
    }
}

export async function updateClient(id: string, data: any) {
    try {
        const updated = await prisma.client.update({
            where: { id },
            data
        });
        revalidatePath('/clients');
        return { success: true, client: updated };
    } catch (error) {
        console.error("Error updating client:", error);
        return { success: false, error: "Erro ao atualizar cliente." };
    }
}

export async function getClientsList() {
    return await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function importClients(clientsData: any[]) {
    try {
        const results = await Promise.all(clientsData.map(async (c) => {
            return prisma.client.upsert({
                where: { cpf: c.cpf || 'no-cpf-' + Math.random() },
                update: { ...c },
                create: { ...c }
            });
        }));
        revalidatePath('/clients');
        return { success: true, count: results.length };
    } catch (error) {
        console.error("Error importing clients:", error);
        return { success: false, error: "Erro ao importar clientes." };
    }
}
export async function deleteClient(id: string) {
    try {
        await prisma.client.delete({
            where: { id }
        });
        revalidatePath('/clients');
        return { success: true };
    } catch (error) {
        console.error("Error deleting client:", error);
        return { success: false, error: "Erro ao excluir cliente. Verifique se existem agendamentos vinculados." };
    }
}
