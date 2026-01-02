'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createPackage } from "@/app/actions/package-actions";
import { Package } from "lucide-react";

interface PackageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    client: { id: string, name: string };
    services: { id: string, name: string, price: any }[];
}

export function PackageDialog({ isOpen, onClose, client, services }: PackageDialogProps) {
    const [serviceId, setServiceId] = useState("");
    const [sessions, setSessions] = useState("10");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    // Update price when service changes
    const handleServiceChange = (id: string) => {
        setServiceId(id);
        const service = services.find(s => s.id === id);
        if (service) {
            // Default package price: sessions * service price (maybe with discount?)
            const totalPrice = parseFloat(service.price.toString()) * parseInt(sessions);
            setPrice(totalPrice.toFixed(2));
        }
    };

    const handleSessionsChange = (val: string) => {
        setSessions(val);
        const service = services.find(s => s.id === serviceId);
        if (service) {
            const totalPrice = parseFloat(service.price.toString()) * parseInt(val);
            setPrice(totalPrice.toFixed(2));
        }
    };

    const handleSubmit = async () => {
        if (!serviceId || !sessions || !price) {
            toast.error("Preencha todos os campos");
            return;
        }

        setLoading(true);
        const res = await createPackage({
            clientId: client.id,
            serviceId,
            totalSessions: parseInt(sessions),
            price: parseFloat(price),
        });
        setLoading(false);

        if (res.success) {
            toast.success("Pacote vendido com sucesso!");
            onClose();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5 text-emerald-500" />
                        Vender Pacote - {client.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Serviço do Pacote</Label>
                        <Select onValueChange={handleServiceChange} value={serviceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tratamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Número de Sessões</Label>
                            <Input
                                type="number"
                                value={sessions}
                                onChange={(e) => handleSessionsChange(e.target.value)}
                                placeholder="Ex: 10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Preço Total (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                        {loading ? "Processando..." : "Confirmar Venda"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
