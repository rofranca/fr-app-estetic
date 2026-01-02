'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPackage(data: {
    clientId: string;
    serviceId: string;
    totalSessions: number;
    price: number;
}) {
    try {
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

        // Create a transaction for the package sale
        await prisma.transaction.create({
            data: {
                description: `Venda de Pacote: ${data.totalSessions} sessões`,
                amount: data.price,
                type: "INCOME",
                status: "PAID", // Assuming paid for now, integrated with Asaas later if needed
                clientId: data.clientId,
                packageId: pkg.id,
            }
        });

        revalidatePath("/clients");
        return { success: true, package: pkg };
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
