"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAppointment } from "@/app/actions/appointment-actions";

interface NewAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    clients: { id: string, name: string }[];
    services: { id: string, name: string }[];
    professionals: { id: string, name: string }[];
}

export function NewAppointmentDialog({ isOpen, onClose, selectedDate, clients, services, professionals }: NewAppointmentDialogProps) {
    const [clientId, setClientId] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [professionalId, setProfessionalId] = useState(professionals[0]?.id || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedDate || !clientId || !serviceId || !professionalId) {
            toast.error("Preencha todos os campos");
            return;
        }

        setLoading(true);
        const result = await createAppointment({
            startTime: selectedDate,
            clientId,
            serviceId,
            professionalId
        });
        setLoading(false);

        if (result.success) {
            toast.success("Agendamento criado!");
            onClose();
        } else {
            toast.error("Erro ao criar agendamento");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Horário</Label>
                        <div className="col-span-3 text-sm font-medium">
                            {selectedDate?.toLocaleString()}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="client" className="text-right">
                            Cliente
                        </Label>
                        <div className="col-span-3">
                            <Select onValueChange={setClientId} value={clientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service" className="text-right">
                            Serviço
                        </Label>
                        <div className="col-span-3">
                            <Select onValueChange={setServiceId} value={serviceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o serviço" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="professional" className="text-right">
                            Profissional
                        </Label>
                        <div className="col-span-3">
                            <Select onValueChange={setProfessionalId} value={professionalId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {professionals.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Criando..." : "Agendar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
