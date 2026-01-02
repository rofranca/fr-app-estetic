"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createAppointment } from "@/app/actions/appointment-actions";
import { getActivePackagesForClient } from "@/app/actions/package-actions";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ClientSearchDialog } from "./ClientSearchDialog";
import { Search } from "lucide-react";

interface NewAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    clients: { id: string, name: string }[];
    services: { id: string, name: string }[];
    professionals: { id: string, name: string }[];
    rooms: { id: string, name: string }[];
}

export function NewAppointmentDialog({ isOpen, onClose, selectedDate, clients, services, professionals, rooms }: NewAppointmentDialogProps) {
    const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
    const [clientId, setClientId] = useState("");
    const [serviceId, setServiceId] = useState(""); // For single service selection
    const [professionalId, setProfessionalId] = useState(professionals[0]?.id || "");
    const [roomId, setRoomId] = useState("");
    const [activePackages, setActivePackages] = useState<any[]>([]);
    const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch packages when client changes
    useEffect(() => {
        if (clientId) {
            getActivePackagesForClient(clientId).then(packages => {
                setActivePackages(packages);
                setSelectedPackageIds([]); // Reset selection
            });
        } else {
            setActivePackages([]);
            setSelectedPackageIds([]);
        }
    }, [clientId]);

    const togglePackage = (pkgId: string) => {
        if (selectedPackageIds.includes(pkgId)) {
            setSelectedPackageIds(selectedPackageIds.filter(id => id !== pkgId));
        } else {
            setSelectedPackageIds([...selectedPackageIds, pkgId]);
        }
    };

    const toggleAllPackages = () => {
        if (selectedPackageIds.length === activePackages.length) {
            setSelectedPackageIds([]);
        } else {
            setSelectedPackageIds(activePackages.map(p => p.id));
        }
    };

    const handleSubmit = async () => {
        if (!selectedDate || !clientId || !professionalId) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }

        if (selectedPackageIds.length === 0 && !serviceId) {
            toast.error("Selecione um serviço ou pelo menos um pacote.");
            return;
        }

        setLoading(true);
        try {
            if (activePackages.length > 0 && selectedPackageIds.length > 0) {
                // Multi-package SEQUENTIAL implementation
                const packagesToSchedule = activePackages.filter(p => selectedPackageIds.includes(p.id));

                // Sort by service name for consistency
                packagesToSchedule.sort((a, b) => a.service.name.localeCompare(b.service.name));

                let currentStartTime = new Date(selectedDate);
                let successCount = 0;

                for (const pkg of packagesToSchedule) {
                    const result = await createAppointment({
                        startTime: currentStartTime,
                        clientId,
                        serviceId: pkg.serviceId,
                        professionalId,
                        packageId: pkg.id,
                        roomId: roomId || undefined
                    });

                    if (result.success) {
                        successCount++;
                        // Increment start time by duration
                        const duration = pkg.service.duration || 30;
                        currentStartTime = new Date(currentStartTime.getTime() + duration * 60000);
                    } else {
                        toast.error(`Erro ao agendar ${pkg.service.name}: ${result.error}`);
                        break;
                    }
                }

                if (successCount > 0) {
                    toast.success(`${successCount} agendamentos sequenciais criados!`);
                    onClose();
                }

            } else {
                // Single service mode
                const result = await createAppointment({
                    startTime: selectedDate,
                    clientId,
                    serviceId,
                    professionalId,
                    roomId: roomId || undefined
                });

                if (result.success) {
                    toast.success("Agendamento criado!");
                    onClose();
                } else {
                    toast.error(result.error || "Erro ao criar agendamento");
                }
            }
        } catch (error) {
            toast.error("Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
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
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                                onClick={() => setIsClientSearchOpen(true)}
                            >
                                {clientId
                                    ? clients.find(c => c.id === clientId)?.name
                                    : "Clique para buscar..."}
                                <Search className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                            <ClientSearchDialog
                                isOpen={isClientSearchOpen}
                                onClose={() => setIsClientSearchOpen(false)}
                                onSelect={setClientId}
                                clients={clients}
                                selectedId={clientId}
                            />
                        </div>
                    </div>

                    {/* Packages Section */}
                    {activePackages.length > 0 ? (
                        <div className="col-span-4 border rounded-lg p-4 bg-emerald-50/50 border-emerald-100">
                            <div className="flex justify-between items-center mb-3">
                                <Label className="text-emerald-800 font-bold">Pacotes Disponíveis</Label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={toggleAllPackages}
                                    className="text-xs h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                >
                                    {selectedPackageIds.length === activePackages.length ? "Desmarcar Todos" : "Fazer Todas Regiões"}
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                {activePackages.map(pkg => (
                                    <div key={pkg.id} className="flex items-center space-x-2 bg-white p-2 rounded border border-emerald-100">
                                        <Checkbox
                                            id={pkg.id}
                                            checked={selectedPackageIds.includes(pkg.id)}
                                            onCheckedChange={() => togglePackage(pkg.id)}
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor={pkg.id} className="text-sm font-medium cursor-pointer block">
                                                {pkg.service.name}
                                            </Label>
                                            <span className="text-xs text-emerald-600">
                                                Restam: {pkg.remainingSessions} de {pkg.totalSessions}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-emerald-600/80 italic">
                                * Selecione os pacotes para agendar múltiplas regiões de uma vez.
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service" className="text-right">Serviço</Label>
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
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="professional" className="text-right">Profissional</Label>
                        <div className="col-span-3">
                            <Select onValueChange={setProfessionalId} value={professionalId}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {professionals.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-base py-3">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
                        {loading ? "Processando..." : (selectedPackageIds.length > 1 ? `Agendar ${selectedPackageIds.length} Itens` : "Agendar")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
