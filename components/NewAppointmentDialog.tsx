"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAppointment } from "@/app/actions/appointment-actions";
import { getActivePackagesForClient } from "@/app/actions/package-actions";
import { useEffect } from "react";

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
    const [packageId, setPackageId] = useState<string>("none");
    const [activePackages, setActivePackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (clientId && serviceId) {
            getActivePackagesForClient(clientId, serviceId).then(packages => {
                setActivePackages(packages);
                if (packages.length > 0) {
                    setPackageId(packages[0].id); // Auto-select the first available package
                } else {
                    setPackageId("none");
                }
            });
        } else {
            setActivePackages([]);
            setPackageId("none");
        }
    }, [clientId, serviceId]);

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
            professionalId,
            packageId: packageId === "none" ? undefined : packageId
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

                    {activePackages.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="package" className="text-right text-emerald-600 font-semibold">
                                Pacote
                            </Label>
                            <div className="col-span-3">
                                <Select onValueChange={setPackageId} value={packageId}>
                                    <SelectTrigger className="border-emerald-200 bg-emerald-50">
                                        <SelectValue placeholder="Usar sessão de pacote?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Não usar pacote (Cobrança avulsa)</SelectItem>
                                        {activePackages.map(pkg => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                Pacote ({pkg.remainingSessions}/{pkg.totalSessions} sessões)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

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
