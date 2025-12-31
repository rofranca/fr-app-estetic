"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { updateAppointmentTime } from "@/app/actions/appointment-actions";
import { toast } from "sonner";

import { NewAppointmentDialog } from "./NewAppointmentDialog";

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

    const handleEventDrop = async (info: any) => {
        const { id, start, end } = info.event;
        const response = await updateAppointmentTime(id, start, end);
        if (!response.success) {
            info.revert();
            toast.error("Erro ao mover agendamento.");
        } else {
            toast.success("Agendamento atualizado!");
        }
    };

    const handleDateClick = (arg: any) => {
        setSelectedDate(arg.date);
        setIsDialogOpen(true);
    };

    return (
        <div className="p-4 bg-white rounded-md shadow h-full relative">
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
        </div>
    );
}
