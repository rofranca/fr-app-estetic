'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClientFullProfile } from "@/app/actions/client-actions";
import {
    User, Calendar, History, FileText, DollarSign, Paperclip,
    ShoppingBag, CheckCircle2, XCircle, AlertCircle, ExternalLink,
    Phone, Mail, MessageCircle, Edit3, UserPlus, Clock, RotateCcw,
    Plus, Trash2
} from "lucide-react";
import { format, differenceInYears, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BudgetDialog } from "./BudgetDialog";
import { getServices } from "@/app/actions/service-actions";
import { getTeam } from "@/app/actions/team-actions";
import { deleteBudget, updateBudgetStatus } from "@/app/actions/budget-actions";
import { toast } from "sonner";

interface ClientSummaryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    allClients: any[];
    onEdit: (client: any) => void;
    onSwitchClient: (clientId: string) => void;
}

export function ClientSummaryDialog({ isOpen, onClose, clientId, allClients, onEdit, onSwitchClient }: ClientSummaryDialogProps) {
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const [servicesData, teamData] = await Promise.all([
            getServices(),
            getTeam()
        ]);
        setServices(servicesData);
        setTeam(teamData);
    };

    useEffect(() => {
        if (isOpen && clientId) {
            loadProfile();
        }
    }, [isOpen, clientId]);

    const loadProfile = async () => {
        setLoading(true);
        const data = await getClientFullProfile(clientId);
        setClient(data);
        setLoading(false);
    };

    if (!clientId) return null;

    const stats = {
        atendidos: client?.appointments?.filter((a: any) => a.status === "COMPLETED" || a.status === "SCHEDULED").length || 0,
        faltas: client?.appointments?.filter((a: any) => a.status === "ABSENT").length || 0,
        cancelados: client?.appointments?.filter((a: any) => a.status === "CANCELLED").length || 0
    };

    const age = client?.birthDate ? differenceInYears(new Date(), new Date(client.birthDate)) : null;
    const birthdayStr = client?.birthDate ? format(new Date(client.birthDate), "dd/MM") : "";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-[1400px] w-full h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#f8fafc] border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : client && (
                    <>
                        {/* Header Section */}
                        <div className="bg-white border-b p-6 flex flex-col lg:flex-row items-start justify-between gap-6">
                            <div className="flex-1 space-y-2">
                                <h2 className="text-3xl font-bold text-slate-800 leading-tight">{client.name}</h2>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                                    {age !== null && (
                                        <div className="flex items-center bg-slate-50 px-2 py-1 rounded border">
                                            <User className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                            <span className="font-semibold">{age} anos</span>
                                            <span className="ml-1 opacity-70">({birthdayStr})</span>
                                        </div>
                                    )}
                                    <div className="flex items-center bg-slate-50 px-2 py-1 rounded border">
                                        <Phone className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                        <span className="font-semibold">{client.phone}</span>
                                        <a
                                            href={`https://wa.me/${client.phone?.replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="ml-3 text-emerald-600 hover:text-emerald-700 flex items-center font-bold"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                                        </a>
                                    </div>
                                    {client.email && (
                                        <div className="flex items-center bg-slate-50 px-2 py-1 rounded border">
                                            <Mail className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                            <span className="font-medium">{client.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                                <div className="flex gap-3">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center min-w-[90px] shadow-sm">
                                        <div className="text-2xl font-black text-blue-600">{stats.atendidos}</div>
                                        <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Atendidos</div>
                                    </div>
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center min-w-[90px] shadow-sm">
                                        <div className="text-2xl font-black text-orange-600">{stats.faltas}</div>
                                        <div className="text-[10px] text-orange-400 uppercase font-black tracking-widest">Faltas</div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center min-w-[90px] shadow-sm">
                                        <div className="text-2xl font-black text-slate-500">{stats.cancelados}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Cancelados</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[180px]">
                                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm" onClick={() => onEdit(client)}>
                                        <Edit3 className="h-3.5 w-3.5 mr-2" /> EDITAR CLIENTE
                                    </Button>
                                    <div className="relative">
                                        <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 transition-all shadow-sm" onClick={() => setShowSearch(!showSearch)}>
                                            <RotateCcw className="h-3.5 w-3.5 mr-2" /> TROCAR CLIENTE
                                        </Button>

                                        {showSearch && (
                                            <div className="absolute right-0 top-full mt-2 w-[300px] bg-white border shadow-2xl rounded-xl p-3 z-50 animate-in fade-in zoom-in duration-200">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar cliente por nome..."
                                                    className="w-full p-2.5 text-sm border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                                    autoFocus
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <div className="max-h-[250px] overflow-auto custom-scrollbar">
                                                    {allClients
                                                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                        .slice(0, 10)
                                                        .map(c => (
                                                            <button
                                                                key={c.id}
                                                                className="w-full text-left p-3 text-sm hover:bg-blue-50 rounded-lg truncate transition-colors border-b last:border-0 font-medium text-slate-700"
                                                                onClick={() => {
                                                                    onSwitchClient(c.id);
                                                                    setShowSearch(false);
                                                                    setSearchQuery("");
                                                                }}
                                                            >
                                                                {c.name}
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <Tabs defaultValue="resumo" className="flex-1 flex flex-col">
                            <TabsList className="bg-white border-b rounded-none h-auto p-0 flex justify-start px-6 gap-6 overflow-x-auto scrollbar-hide">
                                <TabsTrigger value="resumo" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent px-2 py-3 text-xs font-semibold flex items-center gap-1.5 transition-all">
                                    <FileText className="h-4 w-4" /> Resumo
                                </TabsTrigger>
                                <TabsTrigger value="anamnese" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent px-2 py-3 text-xs font-semibold flex items-center gap-1.5 transition-all">
                                    <Paperclip className="h-4 w-4" /> Anamnese, Ficha e Contrato
                                </TabsTrigger>
                                <TabsTrigger value="budget" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent px-2 py-3 text-xs font-semibold flex items-center gap-1.5 transition-all">
                                    <DollarSign className="h-3.5 w-3.5" /> Orçamento
                                </TabsTrigger>
                                <TabsTrigger value="attachments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent px-2 py-3 text-xs font-semibold flex items-center gap-1.5 transition-all">
                                    <Paperclip className="h-4 w-4" /> Anexos
                                </TabsTrigger>
                                <TabsTrigger value="vendas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent px-2 py-3 text-xs font-semibold flex items-center gap-1.5 transition-all">
                                    <ShoppingBag className="h-4 w-4" /> Vendas
                                </TabsTrigger>
                                <TabsTrigger value="agendamento" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent px-2 py-3 text-xs font-semibold flex items-center gap-1.5 transition-all">
                                    <History className="h-4 w-4" /> Hist. Agendamento
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                                <TabsContent value="resumo" className="mt-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Agendamentos */}
                                        <Card className="shadow-sm border-none">
                                            <CardHeader className="pb-3 border-b bg-white rounded-t-lg">
                                                <CardTitle className="text-sm font-bold flex items-center text-slate-600">
                                                    <Calendar className="h-4 w-4 mr-2 text-blue-500" /> Agendamentos
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="divide-y max-h-[400px] overflow-auto">
                                                    {client.appointments?.length > 0 ? client.appointments.map((appt: any) => (
                                                        <div key={appt.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                                                            <div className="text-center min-w-[50px]">
                                                                <div className="text-sm font-bold text-slate-700">{format(new Date(appt.startTime), "dd/MM")}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold">{format(new Date(appt.startTime), "HH:mm")}</div>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <div className="text-sm font-semibold text-slate-700">{appt.service?.name}</div>
                                                                <div className="text-[11px] text-slate-400 flex items-center">
                                                                    <Badge variant="outline" className="text-[8px] h-4 uppercase">{appt.status}</Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="p-8 text-center text-sm text-slate-400">Nenhum agendamento registrado.</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Pacotes em Andamento */}
                                        <Card className="shadow-sm border-none">
                                            <CardHeader className="pb-3 border-b bg-white rounded-t-lg">
                                                <CardTitle className="text-sm font-bold flex items-center text-slate-600">
                                                    <ShoppingBag className="h-4 w-4 mr-2 text-emerald-500" /> Pacotes em Andamento
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                {client.packages?.length > 0 ? client.packages.map((pkg: any) => (
                                                    <div key={pkg.id} className="space-y-2 mb-4 p-3 border rounded-lg bg-emerald-50/20">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-slate-700">{pkg.service?.name}</span>
                                                            <Badge variant="outline" className="text-[10px] bg-white">{pkg.sessionsRemaining}/{pkg.count} sessões</Badge>
                                                        </div>
                                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-emerald-500 h-full transition-all"
                                                                style={{ width: `${(pkg.sessionsRemaining / pkg.count) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-8 text-sm text-slate-400">Nenhum pacote em andamento.</div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Últimos Serviços */}
                                        <Card className="shadow-sm border-none">
                                            <CardHeader className="pb-3 border-b bg-white rounded-t-lg">
                                                <CardTitle className="text-sm font-bold flex items-center text-slate-600">
                                                    <Clock className="h-4 w-4 mr-2 text-orange-500" /> Últimos Serviços
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="divide-y max-h-[400px] overflow-auto">
                                                    {client.appointments?.filter((a: any) => new Date(a.startTime) < new Date()).slice(0, 10).map((appt: any) => (
                                                        <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                            <span className="text-sm text-slate-700 font-medium">{appt.service?.name}</span>
                                                            <div className="text-right">
                                                                <div className="text-sm font-bold text-slate-500">{format(new Date(appt.startTime), "dd/MM")}</div>
                                                                <div className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(appt.startTime), { addSuffix: true, locale: ptBR })}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {client.appointments?.filter((a: any) => new Date(a.startTime) < new Date()).length === 0 && (
                                                        <div className="p-8 text-center text-sm text-slate-400">Sem histórico de serviços.</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>



                                <TabsContent value="anamnese" className="mt-0 text-center py-20 bg-white rounded-lg border">
                                    <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400">Módulo de Anamnese, Fichas e Contratos em desenvolvimento.</p>
                                </TabsContent>

                                <TabsContent value="budget" className="mt-0">
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-slate-700">Orçamentos do Cliente</h3>
                                            <Button size="sm" onClick={() => setIsBudgetDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs">
                                                <Plus className="h-3 w-3 mr-1" /> NOVO ORÇAMENTO
                                            </Button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-white border-b">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Data/Validade</th>
                                                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Nome/Profissional</th>
                                                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Itens</th>
                                                        <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Valor Total</th>
                                                        <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                                                        <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {client.budgets?.length > 0 ? client.budgets.map((b: any) => (
                                                        <tr key={b.id} className="hover:bg-slate-50/50">
                                                            <td className="px-6 py-4">
                                                                <div className="text-slate-700 font-medium">{format(new Date(b.date), "dd/MM/yyyy")}</div>
                                                                <div className="text-[10px] text-red-400 font-bold uppercase">Val: {b.validUntil ? format(new Date(b.validUntil), "dd/MM/yyyy") : "-"}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-slate-700 font-bold">{b.name}</div>
                                                                <div className="text-[10px] text-slate-400 flex items-center">
                                                                    <User className="h-2.5 w-2.5 mr-1" /> {b.user?.name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {b.items.map((item: any, idx: number) => (
                                                                        <Badge key={idx} variant="outline" className="text-[9px] bg-slate-50 px-1 py-0 h-4">
                                                                            {item.quantity}x {item.service?.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="text-sm font-black text-blue-600">R$ {Number(b.totalAmount).toFixed(2)}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <Select
                                                                    defaultValue={b.status}
                                                                    onValueChange={async (val) => {
                                                                        await updateBudgetStatus(b.id, val);
                                                                        toast.success("Status atualizado");
                                                                        loadProfile();
                                                                    }}
                                                                >
                                                                    <SelectTrigger className={`h-7 text-[10px] font-bold uppercase w-[110px] ${b.status === "APROVADO" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                                                        b.status === "REPROVADO" ? "bg-red-50 border-red-200 text-red-700" :
                                                                            "bg-blue-50 border-blue-200 text-blue-700"
                                                                        }`}>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                                                                        <SelectItem value="APROVADO">Aprovado</SelectItem>
                                                                        <SelectItem value="REPROVADO">Reprovado</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                                    onClick={async () => {
                                                                        if (confirm("Deseja excluir este orçamento?")) {
                                                                            await deleteBudget(b.id);
                                                                            toast.success("Orçamento excluído");
                                                                            loadProfile();
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                                                <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                                Nenhum orçamento registrado para este cliente.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="attachments" className="mt-0 text-center py-20 bg-white rounded-lg border">
                                    <Paperclip className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400">Nenhum anexo encontrado para este cliente.</p>
                                </TabsContent>

                                <TabsContent value="vendas" className="mt-0">
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Data</th>
                                                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Descrição</th>
                                                    <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Valor</th>
                                                    <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {client.transactions?.length > 0 ? client.transactions.map((t: any) => (
                                                    <tr key={t.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 text-slate-600">{format(new Date(t.createdAt), "dd/MM/yyyy")}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-700">{t.description}</td>
                                                        <td className="px-6 py-4 text-right font-bold">R$ {Number(t.amount).toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Badge variant={t.status === "PAID" ? "default" : "outline"} className={t.status === "PAID" ? "bg-emerald-500" : ""}>
                                                                {t.status === "PAID" ? "Pago" : "Pendente"}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Nenhuma venda registrada.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="agendamento" className="mt-0">
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Data/Hora</th>
                                                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Serviço</th>
                                                    <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {client.appointments?.length > 0 ? client.appointments.map((appt: any) => (
                                                    <tr key={appt.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 text-slate-600">{format(new Date(appt.startTime), "dd/MM/yyyy HH:mm")}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-700">{appt.service?.name}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                                                {appt.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-10 text-center text-slate-400">Nenhum agendamento registrado.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <BudgetDialog
                            isOpen={isBudgetDialogOpen}
                            onClose={() => {
                                setIsBudgetDialogOpen(false);
                                loadProfile();
                            }}
                            client={{ id: client.id, name: client.name }}
                            services={services}
                            team={team}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
