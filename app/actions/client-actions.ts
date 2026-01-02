'use server'

import prisma from "@/lib/prisma"
import { AsaasService } from "@/lib/asaas"
import { revalidatePath } from "next/cache"

export async function createClient(data: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    address: string;
}) {
    try {
        // 1. Create in Local DB
        const newClient = await prisma.client.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf,
                address: data.address
            }
        });

        // 2. Integration with Asaas (Fire and Forget or Await)
        // Ideally we store the Asaas ID in our DB. I will assume we might add 'asaasId' to Client model later on,
        // or just ensure they exist there for billing.
        try {
            const asaasCustomer = await AsaasService.createCustomer({
                name: data.name,
                email: data.email,
                cpf: data.cpf,
                phone: data.phone
            });
            console.log("Cliente sincronizado no Asaas:", asaasCustomer.id);

            // Update local client with Asaas ID
            await prisma.client.update({
                where: { id: newClient.id },
                data: { asaasId: asaasCustomer.id }
            });
        } catch (asaasError) {
            console.error("Falha ao criar no Asaas (mas salvo localmente):", asaasError);
        }

        revalidatePath('/clients');
        return { success: true, client: newClient };
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        return { success: false, error: "Erro ao criar cliente localmente." };
    }
}

export async function getClientsList() {
    return await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
    });
}
