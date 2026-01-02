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
    return appointments.map(appt => {
        let color = '#3b82f6'; // Default (SCHEDULED)
        switch (appt.status) {
            case 'CONFIRMED': color = '#10b981'; break; // Green
            case 'COMPLETED': color = '#059669'; break; // Darker Green
            case 'WAITING': color = '#f59e0b'; break; // Orange
            case 'LATE': color = '#ef4444'; break; // Red
            case 'NO_SHOW': color = '#7f1d1d'; break; // Dark Red
            case 'CANCELLED': color = '#94a3b8'; break; // Gray
        }

        return {
            id: appt.id,
            title: `${appt.service.name} - ${appt.client.name}`,
            start: appt.startTime,
            end: appt.endTime,
            extendedProps: {
                status: appt.status,
                professional: appt.user.name,
                packageId: appt.packageId
            },
            backgroundColor: color,
            borderColor: color,
        }
    })
}

export async function updateAppointmentTime(id: string, newStart: Date, newEnd: Date, updateSeries: boolean = false) {
    try {
        const appointment = await prisma.appointment.findUnique({ where: { id } });
        if (!appointment) throw new Error("Appointment not found");

        const startTimeDiff = new Date(newStart).getTime() - new Date(appointment.startTime).getTime();
        const endTimeDiff = new Date(newEnd).getTime() - new Date(appointment.endTime).getTime();

        // Update current appointment
        await prisma.appointment.update({
            where: { id },
            data: {
                startTime: newStart,
                endTime: newEnd
            }
        });

        // If series update requested and part of a package, update future appointments
        if (updateSeries && appointment.packageId) {
            const futureAppointments = await prisma.appointment.findMany({
                where: {
                    packageId: appointment.packageId,
                    startTime: { gt: appointment.startTime },
                    id: { not: id } // Exclude current one explicitly just in case
                }
            });

            for (const appt of futureAppointments) {
                const newApptStart = new Date(appt.startTime.getTime() + startTimeDiff);
                const newApptEnd = new Date(appt.endTime.getTime() + endTimeDiff);

                await prisma.appointment.update({
                    where: { id: appt.id },
                    data: {
                        startTime: newApptStart,
                        endTime: newApptEnd
                    }
                });
            }
        }

        revalidatePath('/agenda');
        return { success: true };
    } catch (error) {
        console.error("Error updating appointment:", error);
        return { success: false, error: "Failed to update appointment" };
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

export async function getClientPackages(clientId: string) {
    try {
        const packages = await prisma.package.findMany({
            where: {
                clientId: clientId,
                status: 'ACTIVE',
                remainingSessions: { gt: 0 }
            },
            include: {
                service: true
            }
        });
        return packages;
    } catch (error) {
        console.error("Error fetching client packages:", error);
        return [];
    }
}

export async function getServices() {
    return await prisma.service.findMany({
        where: { active: true },
        select: { id: true, name: true, duration: true, price: true }
    })
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        const appointment = await prisma.appointment.findUnique({ where: { id } });
        if (!appointment) throw new Error("Appointment not found");

        const oldStatus = appointment.status;

        // Logic for refunding session if cancelled
        if (status === 'CANCELLED' && oldStatus !== 'CANCELLED' && appointment.packageId) {
            // Give back the session if it was part of a package
            await prisma.package.update({
                where: { id: appointment.packageId },
                data: {
                    remainingSessions: { increment: 1 },
                    status: 'ACTIVE' // Ensure active if it was completed
                }
            });
        }

        // Logic for consuming session if reactivating a cancelled one?
        // If it was cancelled (session refunded) and now we set directly to CONFIRMED or NO_SHOW, we should deduct again.
        if (oldStatus === 'CANCELLED' && status !== 'CANCELLED' && appointment.packageId) {
            const pkg = await prisma.package.findUnique({ where: { id: appointment.packageId } });
            if (pkg && pkg.remainingSessions > 0) {
                await prisma.package.update({
                    where: { id: appointment.packageId },
                    data: {
                        remainingSessions: { decrement: 1 }
                    }
                });
            } else {
                return { success: false, error: "Pacote sem sessões disponíveis para reativar." };
            }
        }

        await prisma.appointment.update({
            where: { id },
            data: { status }
        });

        revalidatePath('/agenda');
        return { success: true };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Falha ao atualizar status" };
    }
}

export async function getProfessionals() {
    return await prisma.user.findMany({
        where: { role: 'PROFESSIONAL' },
        select: { id: true, name: true }
    })
}
