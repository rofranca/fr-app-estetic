'use client';

import { useState } from "react";
import { Plus, Pencil, Trash2, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createService, updateService, deleteService } from "@/app/actions/service-actions";

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: any; // Decimal type from Prisma
    duration: number;
    active: boolean;
}

interface ServicesPageClientProps {
    initialServices: Service[];
}

export default function ServicesPageClient({ initialServices }: ServicesPageClientProps) {
    const [services, setServices] = useState(initialServices);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setDuration("");
        setEditingService(null);
    };

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setName(service.name);
            setDescription(service.description || "");
            setPrice(service.price.toString());
            setDuration(service.duration.toString());
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name,
            description,
            price: parseFloat(price),
            duration: parseInt(duration),
        };

        if (editingService) {
            const res = await updateService(editingService.id, { ...data, active: true });
            if (res.success) {
                setServices(services.map(s => s.id === editingService.id ? { ...s, ...data } : s));
                toast.success("Serviço atualizado!");
                setIsDialogOpen(false);
            } else {
                toast.error(res.error);
            }
        } else {
            const res = await createService(data);
            if (res.success) {
                // For simplicity, re-fetch or just update state with random ID or refresh
                // Ideally createService returns the new object
                toast.success("Serviço criado!");
                window.location.reload(); // Simple way to sync for now
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Deseja realmente excluir este serviço?")) {
            const res = await deleteService(id);
            if (res.success) {
                setServices(services.filter(s => s.id !== id));
                toast.success("Serviço excluído!");
            } else {
                toast.error(res.error);
            }
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
                    <p className="text-muted-foreground">Gerencie os tratamentos oferecidos pela clínica.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        Nenhum serviço cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                services.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">{service.name}</TableCell>
                                        <TableCell>{service.duration} min</TableCell>
                                        <TableCell>R$ {parseFloat(service.price.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}>
                                                <Pencil className="h-4 w-4 text-sky-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Serviço</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Limpeza de Pele Profunda" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição (Opcional)</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do tratamento" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duração (minutos)</Label>
                                <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 60" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Preço (R$)</Label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 150.00" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">{editingService ? "Salvar Alterações" : "Criar Serviço"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
