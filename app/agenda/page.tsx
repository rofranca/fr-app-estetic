import CalendarClient from "@/components/CalendarClient";
import { getAppointments, getClients, getServices, getProfessionals, getCalendarBlocks } from "../actions/appointment-actions";
import { getOrganization } from "../actions/settings-actions";

export default async function AgendaPage() {
    const [initialEvents, clients, services, professionals, orgResult, blocks] = await Promise.all([
        getAppointments(),
        getClients(),
        getServices(),
        getProfessionals(),
        getOrganization(),
        getCalendarBlocks()
    ]);

    // Merge blocks into events
    const allEvents = [...initialEvents, ...blocks];

    // Prepare config
    const org = orgResult.organization;
    const slotDurationMinutes = org?.slotDuration || 30;
    const slotDuration = `00:${slotDurationMinutes < 10 ? '0' : ''}${slotDurationMinutes}:00`;

    const config = {
        slotDuration,
        slotMinTime: org?.startTime ? `${org.startTime}` : "08:00",
        slotMaxTime: org?.endTime ? `${org.endTime}` : "20:00"
    };

    return (
        <div className="h-[calc(100vh-80px)] p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Agenda</h1>
                {/* Could add a button to 'New Appointment' here */}
            </div>
            <div className="h-full border rounded-lg overflow-hidden">
                <CalendarClient
                    initialEvents={allEvents}
                    clients={clients}
                    services={services}
                    professionals={professionals}
                    config={config}
                />
            </div>
        </div>
    );
}
