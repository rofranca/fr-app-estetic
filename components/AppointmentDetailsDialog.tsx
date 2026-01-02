"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { updateAppointmentStatus } from "@/app/actions/appointment-actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
}

const STATUS_OPTIONS = [
    { value: "SCHEDULED", label: "Agendado", color: "bg-blue-100 text-blue-800" },
    { value: "CONFIRMED", label: "Confirmado", color: "bg-emerald-100 text-emerald-800" },
    { value: "WAITING", label: "Em Espera", color: "bg-amber-100 text-amber-800" },
    { value: "COMPLETED", label: "Realizado", color: "bg-green-100 text-green-800" },
    { value: "LATE", label: "Atrasado", color: "bg-red-100 text-red-800" },
    { value: "NO_SHOW", label: "Faltou", color: "bg-red-900 text-red-100" },
    { value: "CANCELLED", label: "Cancelado", color: "bg-slate-100 text-slate-800" },
];

export function AppointmentDetailsDialog({ isOpen, onClose, appointment }: AppointmentDetailsDialogProps) {
    const [status, setStatus] = useState(appointment?.extendedProps?.status || "SCHEDULED");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (appointment) {
            setStatus(appointment.extendedProps.status);
        }
    }, [appointment]);

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
        setLoading(true);
        const result = await updateAppointmentStatus(appointment.id, newStatus);
        setLoading(false);

        if (result.success) {
            toast.success("Status atualizado!");
            onClose();
        } else {
            toast.error(result.error || "Erro ao atualizar status");
            // Revert on error?
        }
    };

    if (!appointment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Detalhes do Agendamento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500 uppercase font-bold">Cliente / Serviço</Label>
                        <p className="text-lg font-medium">{appointment.title}</p>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500 uppercase font-bold">Profissional</Label>
                        <p>{appointment.extendedProps?.professional}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500 uppercase font-bold">Início</Label>
                            <p>{appointment.start ? format(new Date(appointment.start), "HH:mm", { locale: ptBR }) : "--:--"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500 uppercase font-bold">Fim</Label>
                            <p>{appointment.end ? format(new Date(appointment.end), "HH:mm", { locale: ptBR }) : "--:--"}</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <Label>Alterar Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {STATUS_OPTIONS.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant="outline"
                                    size="sm"
                                    className={`justify-start ${status === opt.value ? 'ring-2 ring-offset-1 ring-slate-400 font-bold' : ''} ${opt.color}`}
                                    onClick={() => handleStatusChange(opt.value)}
                                    disabled={loading}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
