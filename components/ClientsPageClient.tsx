"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/app/actions/client-actions";
import { PackageDialog } from "./PackageDialog";
import { RecordsDialog } from "./RecordsDialog";
import { PackagePlus, History, ClipboardList } from "lucide-react";

interface ClientsPageProps {
    clients: any[];
    services: any[];
}

export default function ClientsPage({ clients, services }: ClientsPageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
    const [isRecordsDialogOpen, setIsRecordsDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const handleOpenPackage = (client: any) => {
        setSelectedClient(client);
        setIsPackageDialogOpen(true);
    };

    const handleOpenRecords = (client: any) => {
        setSelectedClient(client);
        setIsRecordsDialogOpen(true);
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            cpf: formData.get('cpf') as string,
            address: formData.get('address') as string,
            birthDate: formData.get('birthDate') ? new Date(formData.get('birthDate') as string) : undefined,
        };

        const result = await createClient(data);
        setLoading(false);

        if (result.success) {
            toast.success("Cliente cadastrado com sucesso!");
            setIsOpen(false);
            // Refresh logic usually handled by revalidatePath + router.refresh() 
            // but for simplicity in this demo assume Next.js handles it or we reload
            window.location.reload();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>Novo Cliente</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cadastrar Cliente</DialogTitle>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input name="name" required placeholder="Joana da Silva" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CPF</Label>
                                    <Input name="cpf" required placeholder="000.000.000-00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Nascimento</Label>
                                    <Input name="birthDate" type="date" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Telefone</Label>
                                    <Input name="phone" required placeholder="(11) 99999-9999" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input name="email" type="email" required placeholder="joana@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Endereço</Label>
                                <Input name="address" placeholder="Rua das Flores, 123" />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Salvando..." : "Cadastrar"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum cliente cadastrado.</TableCell>
                            </TableRow>
                        ) : clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>{client.phone}</TableCell>
                                <TableCell>{client.cpf}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenRecords(client)} title="Prontuário">
                                        <ClipboardList className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenPackage(client)} title="Vender Pacote">
                                        <PackagePlus className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Histórico">
                                        <History className="h-4 w-4 text-slate-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedClient && (
                <>
                    <PackageDialog
                        isOpen={isPackageDialogOpen}
                        onClose={() => setIsPackageDialogOpen(false)}
                        client={selectedClient}
                        services={services}
                    />
                    <RecordsDialog
                        isOpen={isRecordsDialogOpen}
                        onClose={() => setIsRecordsDialogOpen(false)}
                        client={selectedClient}
                    />
                </>
            )}
        </div>
    );
}
