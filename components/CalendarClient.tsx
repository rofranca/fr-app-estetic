"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateAppointmentTime } from "@/app/actions/appointment-actions";
import { toast } from "sonner";

import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";

interface CalendarClientProps {
    initialEvents: any[];
    clients: { id: string, name: string }[];
    services: { id: string, name: string }[];
    professionals: { id: string, name: string }[];
}

export default function CalendarClient({ initialEvents, clients, services, professionals }: CalendarClientProps) {
    const [events, setEvents] = useState(initialEvents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const router = useRouter();

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const handleEventDrop = async (info: any) => {
        const { id, start, end } = info.event;

        // Ask if same-day update (always default to false unless confirmed?)
        // User asked: "quero que mude as sessões que eram do mesmo dia..."
        // So prompt: "Deseja mover todos os agendamentos deste cliente neste dia?"
        const updateSameDay = window.confirm("Mover também os outros agendamentos deste cliente neste dia?");

        const response = await updateAppointmentTime(id, start, end, updateSameDay);

        if (!response.success) {
            info.revert();
            toast.error("Erro ao mover agendamento.");
        } else {
            toast.success(updateSameDay ? "Agendamentos do dia atualizados!" : "Agendamento atualizado!");
        }
    };

    const handleDateClick = (arg: any) => {
        setSelectedDate(arg.date);
        setIsDialogOpen(true);
    };

    const handleEventClick = (info: any) => {
        setSelectedEvent(info.event);
        setIsDetailsOpen(true);
    };

    return (
        <div className="p-4 bg-white rounded-md shadow h-full relative flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <Button onClick={() => { setSelectedDate(new Date()); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Atualizar Agenda
                </Button>
            </div>

            <div className="flex-1">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                    }}
                    locale={ptBrLocale}
                    events={events}
                    editable={true}
                    droppable={true}
                    selectable={true}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    height="100%"
                    buttonText={{
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia',
                        list: 'Lista'
                    }}
                />
                <NewAppointmentDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    selectedDate={selectedDate}
                    clients={clients}
                    services={services}
                    professionals={professionals}
                />
                <AppointmentDetailsDialog
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    appointment={selectedEvent}
                />
            </div>
        </div>
    );
}
