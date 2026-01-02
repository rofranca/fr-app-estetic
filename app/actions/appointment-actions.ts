'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAppointments() {
    const appointments = await prisma.appointment.findMany({
        include: {
            client: true,
            service: true,
            user: true // Professional
        }
    })

    // Map to FullCalendar format
    return appointments.map(appt => ({
        id: appt.id,
        title: `${appt.service.name} - ${appt.client.name}`,
        start: appt.startTime,
        end: appt.endTime,
        extendedProps: {
            status: appt.status,
            professional: appt.user.name
        },
        // Color coding based on status (optional)
        backgroundColor: appt.status === 'CONFIRMED' ? '#10b981' : '#3b82f6',
        borderColor: appt.status === 'CONFIRMED' ? '#10b981' : '#3b82f6',
    }))
}

export async function updateAppointmentTime(id: string, newStart: Date, newEnd: Date) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: {
                startTime: newStart,
                endTime: newEnd
            }
        })
        revalidatePath('/agenda')
        return { success: true }
    } catch (error) {
        console.error("Error updating appointment:", error)
        return { success: false, error: "Failed to update appointment" }
    }
}

export async function createAppointment(data: {
    startTime: Date;
    serviceId: string;
    clientId: string;
    professionalId: string;
    notes?: string;
    packageId?: string;
}) {
    try {
        const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
        if (!service) throw new Error("Service not found")

        // Calculate end time based on service duration
        const endTime = new Date(new Date(data.startTime).getTime() + service.duration * 60000)

        // If a package is used, check and decrement
        if (data.packageId) {
            const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
            if (!pkg || pkg.remainingSessions <= 0) {
                throw new Error("Package not found or no sessions remaining");
            }

            await prisma.package.update({
                where: { id: data.packageId },
                data: {
                    remainingSessions: pkg.remainingSessions - 1,
                    status: pkg.remainingSessions - 1 === 0 ? "COMPLETED" : "ACTIVE"
                }
            });
        }

        await prisma.appointment.create({
            data: {
                startTime: data.startTime,
                endTime: endTime,
                serviceId: data.serviceId,
                clientId: data.clientId,
                userId: data.professionalId,
                status: "SCHEDULED",
                notes: data.notes,
                packageId: data.packageId
            }
        })

        revalidatePath('/agenda')
        return { success: true }
    } catch (error: any) {
        console.error("Error creating appointment:", error)
        return { success: false, error: error.message || "Failed to create appointment" }
    }
}

export async function getClients() {
    return await prisma.client.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })
}

export async function getServices() {
    return await prisma.service.findMany({
        where: { active: true },
        select: { id: true, name: true, duration: true, price: true }
    })
}

export async function getProfessionals() {
    return await prisma.user.findMany({
        where: { role: 'PROFESSIONAL' },
        select: { id: true, name: true }
    })
}
