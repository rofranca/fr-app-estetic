'use client';

import { useState } from "react";
import {
    Calculator, Plus, Search, Filter, Calendar, User,
    MoreHorizontal, Edit, Trash2, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BudgetDialog } from "./BudgetDialog";
import { deleteBudget, updateBudgetStatus } from "@/app/actions/budget-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BudgetsPageClientProps {
    initialBudgets: any[];
    services: any[];
    team: any[];
    clients: any[];
}

export default function BudgetsPageClient({ initialBudgets, services, team, clients }: BudgetsPageClientProps) {
    const [budgets, setBudgets] = useState(initialBudgets);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("TODOS");
    const [professionalFilter, setProfessionalFilter] = useState("TODOS");
    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<any>(null);

    // ... (rest of filtering and handlers same)
    const filteredBudgets = budgets.filter(b => {
        const matchesSearch = b.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "TODOS" || b.status === statusFilter;
        const matchesProfessional = professionalFilter === "TODOS" || b.userId === professionalFilter;
        return matchesSearch && matchesStatus && matchesProfessional;
    });

    const handleDelete = async (id: string) => {
        if (confirm("Deseja realmente excluir este orçamento?")) {
            try {
                await deleteBudget(id);
                setBudgets(budgets.filter(b => b.id !== id));
                toast.success("Orçamento excluído!");
            } catch (error) {
                toast.error("Erro ao excluir orçamento");
            }
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateBudgetStatus(id, newStatus);
            setBudgets(budgets.map(b => b.id === id ? { ...b, status: newStatus } : b));
            toast.success("Status atualizado!");
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    const handleEdit = (budget: any) => {
        setSelectedBudget(budget);
        setIsBudgetDialogOpen(true);
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <Calculator className="mr-3 h-8 w-8 text-blue-600" />
                        Gestão de Orçamentos
                    </h1>
                    <p className="text-slate-500 mt-1">Visualize e gerencie as propostas enviadas aos clientes.</p>
                </div>
                <Button onClick={() => {
                    setSelectedBudget(null);
                    setIsBudgetDialogOpen(true);
                }} className="bg-blue-600 hover:bg-blue-700 font-bold">
                    <Plus className="mr-2 h-4 w-4" /> NOVO ORÇAMENTO
                </Button>
            </div>
            {/* ... rest of the table and dialog */}
            <Card className="border-none shadow-sm">
                <CardHeader className="bg-white rounded-t-xl border-b pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por cliente ou nome do orçamento..."
                                className="pl-10 bg-slate-50 border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[150px] bg-slate-50">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos Status</SelectItem>
                                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                                        <SelectItem value="APROVADO">Aprovado</SelectItem>
                                        <SelectItem value="REPROVADO">Reprovado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                                <SelectTrigger className="w-[180px] bg-slate-50">
                                    <SelectValue placeholder="Profissional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODOS">Todos Profissionais</SelectItem>
                                    {team.map(member => (
                                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold text-[10px] uppercase text-slate-500 pl-6">Data / Validade</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-slate-500">Cliente</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-slate-500">Orçamento / Profissional</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-slate-500 text-right">Valor Total</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-slate-500 text-center">Status</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-slate-500 text-right pr-6">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBudgets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Calculator className="h-12 w-12 opacity-10 mb-2" />
                                            <p>Nenhum orçamento encontrado.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredBudgets.map((b) => (
                                <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <TableCell className="pl-6">
                                        <div className="font-bold text-slate-700">{format(new Date(b.date), "dd/MM/yyyy")}</div>
                                        <div className="text-[10px] text-red-500 font-bold uppercase mt-0.5">
                                            Val: {b.validUntil ? format(new Date(b.validUntil), "dd/MM/yyyy") : "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-blue-600">{b.client?.name}</div>
                                        <div className="text-[10px] text-slate-400">{b.client?.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-slate-700">{b.name}</div>
                                        <div className="flex items-center text-[10px] text-slate-400 mt-0.5">
                                            <User className="h-2.5 w-2.5 mr-1" /> {b.user?.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="text-lg font-black text-slate-800">
                                            R$ {Number(b.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-[10px] text-slate-400">{b.items?.length} itens</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Select
                                            value={b.status}
                                            onValueChange={(val) => handleStatusChange(b.id, val)}
                                        >
                                            <SelectTrigger className={cn(
                                                "h-8 text-[10px] font-bold uppercase w-[120px] mx-auto",
                                                b.status === "APROVADO" ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-100" :
                                                    b.status === "REPROVADO" ? "bg-red-50 border-red-200 text-red-700 shadow-sm shadow-red-100" :
                                                        "bg-blue-50 border-blue-200 text-blue-700 shadow-sm shadow-blue-100"
                                            )}>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    {b.status === "APROVADO" && <CheckCircle2 className="h-3 w-3" />}
                                                    {b.status === "REPROVADO" && <XCircle className="h-3 w-3" />}
                                                    {b.status === "PENDENTE" && <Clock className="h-3 w-3" />}
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDENTE">Pendente</SelectItem>
                                                <SelectItem value="APROVADO">Aprovado</SelectItem>
                                                <SelectItem value="REPROVADO">Reprovado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEdit(b)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(b.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <BudgetDialog
                isOpen={isBudgetDialogOpen}
                onClose={() => {
                    setIsBudgetDialogOpen(false);
                    setSelectedBudget(null);
                    window.location.reload();
                }}
                client={selectedBudget?.client}
                clients={clients}
                services={services}
                team={team}
                budget={selectedBudget}
            />
        </div>
    );
}
