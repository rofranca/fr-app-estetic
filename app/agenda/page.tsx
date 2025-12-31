import CalendarClient from "@/components/CalendarClient";
import { getAppointments, getClients, getServices, getProfessionals } from "../actions/appointment-actions";

export default async function AgendaPage() {
    const [initialEvents, clients, services, professionals] = await Promise.all([
        getAppointments(),
        getClients(),
        getServices(),
        getProfessionals()
    ]);

    return (
        <div className="h-[calc(100vh-80px)] p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Agenda</h1>
                {/* Could add a button to 'New Appointment' here */}
            </div>
            <div className="h-full border rounded-lg overflow-hidden">
                <CalendarClient
                    initialEvents={initialEvents}
                    clients={clients}
                    services={services}
                    professionals={professionals}
                />
            </div>
        </div>
    );
}
