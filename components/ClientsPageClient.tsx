"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient, importClients } from "@/app/actions/client-actions";
import { PackageDialog } from "./PackageDialog";
import { RecordsDialog } from "./RecordsDialog";
import { PackagePlus, History, ClipboardList, Download, Upload, Search, UserCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { ClientDetailDialog } from "./ClientDetailDialog";

interface ClientsPageProps {
    clients: any[];
    services: any[];
}

export default function ClientsPage({ clients, services }: ClientsPageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
    const [isRecordsDialogOpen, setIsRecordsDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [editingClient, setEditingClient] = useState<any>(null);

    const handleOpenPackage = (client: any) => {
        setSelectedClient(client);
        setIsPackageDialogOpen(true);
    };

    const handleOpenRecords = (client: any) => {
        setSelectedClient(client);
        setIsRecordsDialogOpen(true);
    };

    const handleOpenDetail = (client: any) => {
        setEditingClient(client);
        setIsDetailDialogOpen(true);
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    // Update form fields - we'll use document.getElementsByName for simplicity in a non-state form
                    (document.getElementsByName("address")[0] as HTMLInputElement).value = data.logradouro;
                    (document.getElementsByName("neighborhood")[0] as HTMLInputElement).value = data.bairro;
                    (document.getElementsByName("city")[0] as HTMLInputElement).value = data.localidade;
                    (document.getElementsByName("state")[0] as HTMLInputElement).value = data.uf;
                }
            } catch (err) {
                console.error("CEP fetch error:", err);
            }
        }
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(clients);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
        XLSX.writeFile(workbook, "clientes_sara_estetica.xlsx");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const data = evt.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);

            const res = await importClients(json);
            if (res.success) {
                toast.success(`${res.count} clientes importados!`);
                window.location.reload();
            } else {
                toast.error("Falha ao importar planilha.");
            }
        };
        reader.readAsBinaryString(file);
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            birthDate: formData.get('birthDate') ? new Date(formData.get('birthDate') as string) : undefined,
            cpf: formData.get('cpf') as string,
            rg: formData.get('rg') as string,
            cep: formData.get('cep') as string,
            address: formData.get('address') as string,
            number: formData.get('number') as string,
            complement: formData.get('complement') as string,
            neighborhood: formData.get('neighborhood') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            referencePoint: formData.get('referencePoint') as string,
            notes: formData.get('notes') as string,
            referralSource: formData.get('referralSource') as string,
            status: formData.get('status') as string,
            clientCredit: Number(formData.get('clientCredit')) || 0,
            creditNotes: formData.get('creditNotes') as string,
        };

        const result = await createClient(data);
        setLoading(false);

        if (result.success) {
            toast.success("Cliente cadastrado com sucesso!");
            setIsOpen(false);
            window.location.reload();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Exportar
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleImport}
                        />
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" /> Importar
                        </Button>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>Novo Cliente</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Cadastrar Cliente</DialogTitle>
                            </DialogHeader>
                            <form action={handleSubmit} className="space-y-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nome Completo</Label>
                                        <Input name="name" required placeholder="Joana da Silva" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <select name="status" className="w-full border rounded-md p-2 text-sm">
                                            <option value="ATIVO">Ativo</option>
                                            <option value="INATIVO">Inativo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>CPF / CNPJ</Label>
                                        <Input name="cpf" required placeholder="000.000.000-00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>RG</Label>
                                        <Input name="rg" placeholder="00.000.000-0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data de Nascimento</Label>
                                        <Input name="birthDate" type="date" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Celular (WhatsApp)</Label>
                                        <Input name="phone" required placeholder="(11) 99999-9999" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-mail</Label>
                                        <Input name="email" type="email" placeholder="joana@email.com" />
                                    </div>
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="font-semibold text-sm text-slate-500 uppercase">Endereço</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>CEP</Label>
                                            <Input name="cep" placeholder="00000-000" onBlur={handleCepBlur} />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label>Rua / Logradouro</Label>
                                            <Input name="address" placeholder="Av. Paulista" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Número</Label>
                                            <Input name="number" placeholder="100" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Complemento</Label>
                                            <Input name="complement" placeholder="Apto 12" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bairro</Label>
                                            <Input name="neighborhood" placeholder="Centro" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Cidade</Label>
                                            <Input name="city" placeholder="São Paulo" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Estado</Label>
                                            <Input name="state" placeholder="SP" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ponto de Referência</Label>
                                        <Input name="referencePoint" placeholder="Ao lado da farmácia" />
                                    </div>
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="font-semibold text-sm text-slate-500 uppercase">Informações Adicionais</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Como nos Conheceu?</Label>
                                            <select name="referralSource" className="w-full border rounded-md p-2 text-sm">
                                                <option value="NAO_INFORMADO">Não Informado</option>
                                                <option value="AMIGOS">Amigos</option>
                                                <option value="INSTAGRAM">Instagram</option>
                                                <option value="GOOGLE">Google</option>
                                                <option value="WHATSAPP">WhatsApp</option>
                                                <option value="FOLDER">Folder</option>
                                                <option value="PASSANTE">Passante</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Crédito Inicial (R$)</Label>
                                            <Input name="clientCredit" type="number" step="0.01" placeholder="0,00" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Motivo do Crédito</Label>
                                        <Input name="creditNotes" placeholder="Ex: Adiantamento de pacote" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Observações Gerais</Label>
                                        <textarea name="notes" className="w-full border rounded-md p-2 text-sm min-h-[80px]" />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Salvando..." : "Finalizar Cadastro"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cód / Cadastro</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Celular</TableHead>
                            <TableHead>Cidade/Estado</TableHead>
                            <TableHead>Status</TableHead>
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
                                <TableCell className="text-xs">
                                    <div className="font-mono text-slate-400">{client.id.split('-')[0]}</div>
                                    <div className="text-[10px]">{new Date(client.createdAt).toLocaleDateString()}</div>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => handleOpenDetail(client)}
                                        className="font-semibold text-blue-600 hover:underline flex items-center"
                                    >
                                        <UserCircle className="h-3 w-3 mr-1" />
                                        {client.name}
                                    </button>
                                </TableCell>
                                <TableCell>{client.phone}</TableCell>
                                <TableCell>{client.city} / {client.state}</TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-[10px] font-bold",
                                        client.status === "ATIVO" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {client.status}
                                    </span>
                                </TableCell>
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
                <PackageDialog
                    isOpen={isPackageDialogOpen}
                    onClose={() => setIsPackageDialogOpen(false)}
                    client={selectedClient}
                    services={services}
                />
            )}

            {selectedClient && (
                <RecordsDialog
                    isOpen={isRecordsDialogOpen}
                    onClose={() => setIsRecordsDialogOpen(false)}
                    client={selectedClient}
                />
            )}

            {editingClient && (
                <ClientDetailDialog
                    isOpen={isDetailDialogOpen}
                    onClose={() => setIsDetailDialogOpen(false)}
                    client={editingClient}
                />
            )}
        </div>
    );
}
