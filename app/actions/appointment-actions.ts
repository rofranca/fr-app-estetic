'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAppointments() {
    const appointments = await prisma.appointment.findMany({
        where: {
            status: { not: 'CANCELLED' }
        },
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

export async function updateAppointmentTime(id: string, newStart: Date, newEnd: Date, updateSameDay: boolean = false) {
    try {
        const appointment = await prisma.appointment.findUnique({ where: { id } });
        if (!appointment) throw new Error("Appointment not found");

        const oldStart = new Date(appointment.startTime);
        const startTimeDiff = new Date(newStart).getTime() - oldStart.getTime();
        const endTimeDiff = new Date(newEnd).getTime() - new Date(appointment.endTime).getTime();

        // Update current appointment
        await prisma.appointment.update({
            where: { id },
            data: {
                startTime: newStart,
                endTime: newEnd
            }
        });

        // If same-day update requested
        if (updateSameDay) {
            // Find start and end of the original day
            const startOfDay = new Date(oldStart);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(oldStart);
            endOfDay.setHours(23, 59, 59, 999);

            const sameDayAppointments = await prisma.appointment.findMany({
                where: {
                    clientId: appointment.clientId,
                    startTime: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    id: { not: id } // Exclude the one we already updated
                }
            });

            for (const appt of sameDayAppointments) {
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
    roomId?: string;
}) {
    try {
        const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
        if (!service) throw new Error("Service not found")

        // Calculate end time based on service duration
        const endTime = new Date(new Date(data.startTime).getTime() + service.duration * 60000)

        // Conflict Check
        // 1. Check Professional Availability
        const professionalConflict = await prisma.appointment.findFirst({
            where: {
                userId: data.professionalId,
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
                OR: [
                    { startTime: { lt: endTime }, endTime: { gt: data.startTime } }
                ]
            }
        });

        if (professionalConflict) {
            throw new Error("Profissional já possui agendamento neste horário.");
        }

        // 2. Check Room Availability (if room selected)
        if (data.roomId) {
            const roomConflict = await prisma.appointment.findFirst({
                where: {
                    roomId: data.roomId,
                    status: { notIn: ['CANCELLED', 'NO_SHOW'] },
                    OR: [
                        { startTime: { lt: endTime }, endTime: { gt: data.startTime } }
                    ]
                }
            });
            if (roomConflict) {
                throw new Error("Sala já ocupada neste horário.");
            }
        }

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
                packageId: data.packageId,
                roomId: data.roomId
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

        // CASCADE UPDATE LOGIC
        // If status is changed, apply to ALL appointments of this client on this day
        // This is per specific user request: "ao cancelar... exclua todos os agendamentos do mesmo cliente"
        // We extend this to ANY status change to keep consistency (e.g. Confirming all sequentially)

        const startOfDay = new Date(appointment.startTime);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointment.startTime);
        endOfDay.setHours(23, 59, 59, 999);

        const sameDayAppointments = await prisma.appointment.findMany({
            where: {
                clientId: appointment.clientId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        for (const appt of sameDayAppointments) {
            // Skip if already in the target status (optimization)
            if (appt.status === status) continue;

            // Handle Package Logic
            // Refund session if Cancelling
            if (status === 'CANCELLED' && appt.status !== 'CANCELLED' && appt.packageId) {
                await prisma.package.update({
                    where: { id: appt.packageId },
                    data: {
                        remainingSessions: { increment: 1 },
                        status: 'ACTIVE'
                    }
                });
            }
            // Consume session if Reactivating (from Cancelled -> Scheduled/Confirmed)
            else if (appt.status === 'CANCELLED' && status !== 'CANCELLED' && appt.packageId) {
                const pkg = await prisma.package.findUnique({ where: { id: appt.packageId } });
                if (pkg && pkg.remainingSessions > 0) {
                    await prisma.package.update({
                        where: { id: appt.packageId },
                        data: {
                            remainingSessions: { decrement: 1 }
                        }
                    });
                }
            }

            // Update status
            await prisma.appointment.update({
                where: { id: appt.id },
                data: { status }
            });
        }

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


// Blocks
export async function createCalendarBlock(data: { startTime: Date, endTime: Date, reason?: string }) {
    try {
        await prisma.calendarBlock.create({
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                reason: data.reason
            }
        });
        revalidatePath('/agenda');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Falha ao bloquear horário" };
    }
}

export async function getCalendarBlocks() {
    try {
        const blocks = await prisma.calendarBlock.findMany();
        return blocks.map(block => ({
            id: block.id,
            title: block.reason || "Bloqueado",
            start: block.startTime,
            end: block.endTime,
            display: 'background',
            color: '#ef4444', // Red background
            overlap: false
        }));
    } catch (error) {
        return [];
    }
}

