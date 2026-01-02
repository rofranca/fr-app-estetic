'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClientFullProfile } from "@/app/actions/client-actions";
import {
    User, Calendar, History, FileText, DollarSign, Paperclip,
    ShoppingBag, CheckCircle2, XCircle, AlertCircle, ExternalLink,
    Phone, Mail, MessageCircle, Edit3, UserPlus, Clock, RotateCcw
} from "lucide-react";
import { format, differenceInYears, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
            <DialogContent className="max-w-[1200px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-[#f8fafc]">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : client && (
                    <>
                        {/* Header Section */}
                        <div className="bg-white border-b p-6 flex items-start justify-between">
                            <div className="flex gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-slate-700">{client.name}</h2>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                        {age !== null && (
                                            <div className="flex items-center">
                                                <User className="h-3 w-3 mr-1" />
                                                {age} anos ({birthdayStr})
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <Phone className="h-3 w-3 mr-1" />
                                            {client.phone}
                                            <a
                                                href={`https://wa.me/${client.phone?.replace(/\D/g, '')}`}
                                                target="_blank"
                                                className="ml-2 text-emerald-600 hover:underline flex items-center font-medium"
                                            >
                                                <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                                            </a>
                                        </div>
                                        {client.email && (
                                            <div className="flex items-center">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {client.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-slate-50 border rounded-lg p-3 text-center min-w-[80px]">
                                    <div className="text-2xl font-bold text-blue-600">{stats.atendidos}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Atendidos</div>
                                </div>
                                <div className="bg-slate-50 border rounded-lg p-3 text-center min-w-[80px]">
                                    <div className="text-2xl font-bold text-slate-600">{stats.faltas}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Faltas</div>
                                </div>
                                <div className="bg-slate-50 border rounded-lg p-3 text-center min-w-[80px]">
                                    <div className="text-2xl font-bold text-slate-600">{stats.cancelados}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cancelados</div>
                                </div>

                                <div className="w-[180px] space-y-2">
                                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => onEdit(client)}>
                                        <Edit3 className="h-3 w-3 mr-2" /> EDITAR CLIENTE
                                    </Button>
                                    <div className="relative">
                                        <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-200 text-slate-600" onClick={() => setShowSearch(!showSearch)}>
                                            <RotateCcw className="h-3 w-3 mr-2" /> TROCAR CLIENTE
                                        </Button>

                                        {showSearch && (
                                            <div className="absolute right-0 top-full mt-2 w-[250px] bg-white border shadow-xl rounded-lg p-2 z-50">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar cliente..."
                                                    className="w-full p-2 text-sm border rounded mb-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <div className="max-h-[200px] overflow-auto">
                                                    {allClients
                                                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                        .slice(0, 10)
                                                        .map(c => (
                                                            <button
                                                                key={c.id}
                                                                className="w-full text-left p-2 text-sm hover:bg-slate-50 rounded truncate transition-colors"
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
                                <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent px-2 py-3 text-xs font-semibold flex items-center gap-1.5 transition-all">
                                    <Clock className="h-4 w-4" /> Linha do Tempo
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

                                <TabsContent value="timeline" className="mt-0">
                                    <div className="bg-white rounded-lg border p-6 min-h-[400px]">
                                        <h3 className="text-lg font-bold text-slate-700 mb-6">Evolução do Prontuário</h3>
                                        {client.records?.length > 0 ? (
                                            <div className="relative border-l-2 border-blue-100 pl-8 ml-4 space-y-8">
                                                {client.records.map((record: any) => (
                                                    <div key={record.id} className="relative">
                                                        <div className="absolute -left-[41px] top-0 bg-blue-600 rounded-full h-5 w-5 border-4 border-white shadow-sm" />
                                                        <div className="space-y-1">
                                                            <time className="text-xs font-bold text-blue-600 uppercase">{format(new Date(record.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</time>
                                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{record.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 text-slate-400">Nenhum registro de evolução.</div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="anamnese" className="mt-0 text-center py-20 bg-white rounded-lg border">
                                    <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400">Módulo de Anamnese, Fichas e Contratos em desenvolvimento.</p>
                                </TabsContent>

                                <TabsContent value="budget" className="mt-0 text-center py-20 bg-white rounded-lg border">
                                    <DollarSign className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400">Módulo de Orçamentos em desenvolvimento.</p>
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
