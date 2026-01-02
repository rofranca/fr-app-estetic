'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AsaasService } from "@/lib/asaas";

export async function createPackage(data: {
    clientId: string;
    serviceId: string;
    totalSessions: number;
    price: number;
}) {
    try {
        // 1. Fetch Client info for Asaas
        const client = await prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client) throw new Error("Cliente não encontrado.");

        let asaasId = client.asaasId;

        // 2. Sync with Asaas if not synced
        if (!asaasId) {
            const asaasCustomer = await AsaasService.createCustomer({
                name: client.name,
                email: client.email || "",
                cpf: client.cpf || "",
                phone: client.phone || ""
            });
            asaasId = asaasCustomer.id;
            await prisma.client.update({
                where: { id: client.id },
                data: { asaasId }
            });
        }

        // 3. Create Package in DB
        const pkg = await prisma.package.create({
            data: {
                clientId: data.clientId,
                serviceId: data.serviceId,
                totalSessions: data.totalSessions,
                remainingSessions: data.totalSessions,
                price: data.price,
                status: "ACTIVE",
            },
        });

        // 4. Create Charge on Asaas
        let invoiceUrl = "";
        let transactionAsaasId = "";
        try {
            const charge = await AsaasService.createCharge({
                customerId: asaasId!,
                value: data.price,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
                description: `Pacote Estética: ${data.totalSessions} sessões`
            });
            invoiceUrl = charge.invoiceUrl;
            transactionAsaasId = charge.id;
        } catch (err) {
            console.error("Erro ao gerar cobranca no Asaas:", err);
            // We continue anyway, but without the asaas link
        }

        // 5. Create a transaction for the package sale
        await prisma.transaction.create({
            data: {
                description: `Venda de Pacote: ${data.totalSessions} sessões`,
                amount: data.price,
                type: "INCOME",
                status: transactionAsaasId ? "PENDING" : "PAID",
                clientId: data.clientId,
                packageId: pkg.id,
                asaasId: transactionAsaasId,
                invoiceUrl: invoiceUrl
            }
        });

        revalidatePath("/clients");
        return { success: true, package: pkg, invoiceUrl };
    } catch (error) {
        console.error("Error creating package:", error);
        return { success: false, error: "Falha ao contratar pacote." };
    }
}

export async function getClientPackages(clientId: string) {
    try {
        const packages = await prisma.package.findMany({
            where: { clientId },
            include: {
                service: true,
                appointments: {
                    orderBy: { startTime: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return packages;
    } catch (error) {
        console.error("Error fetching packages:", error);
        return [];
    }
}

export async function getActivePackagesForClient(clientId: string, serviceId?: string) {
    try {
        const where: any = {
            clientId,
            status: "ACTIVE",
            remainingSessions: { gt: 0 }
        };
        if (serviceId) {
            where.serviceId = serviceId;
        }

        return await prisma.package.findMany({
            where,
            include: { service: true }
        });
    } catch (error) {
        console.error("Error fetching active packages:", error);
        return [];
    }
}
