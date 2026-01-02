'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Plus, Trash2, Calculator, Tag } from "lucide-react";
import { createBudget, updateBudget } from "@/app/actions/budget-actions";
import { format } from "date-fns";

interface BudgetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    client?: { id: string, name: string };
    clients?: { id: string, name: string }[];
    services: { id: string, name: string, price: any }[];
    team: { id: string, name: string }[];
    budget?: any;
}

interface SelectedItem {
    id: string;
    serviceId: string;
    serviceName: string;
    quantity: number;
    pricePerSession: number;
    totalPrice: number;
}

export function BudgetDialog({ isOpen, onClose, client, clients, services, team, budget }: BudgetDialogProps) {
    const [name, setName] = useState("");
    const [validUntil, setValidUntil] = useState(format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"));
    const [status, setStatus] = useState("PENDENTE");
    const [userId, setUserId] = useState("");
    const [selectedClientId, setSelectedClientId] = useState("");

    const budgetsClientSelected = !client && clients && selectedClientId
        ? clients.find(c => c.id === selectedClientId)
        : null;

    // Item being added
    const [currentServiceId, setCurrentServiceId] = useState("");
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);

    // List of items in the budget
    const [items, setItems] = useState<SelectedItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (budget) {
                setName(budget.name);
                setStatus(budget.status);
                setUserId(budget.userId);
                setValidUntil(budget.validUntil ? format(new Date(budget.validUntil), "yyyy-MM-dd") : "");
                setItems(budget.items.map((item: any) => ({
                    id: item.id,
                    serviceId: item.serviceId,
                    serviceName: item.service?.name || "Serviço",
                    quantity: item.quantity,
                    pricePerSession: Number(item.pricePerSession),
                    totalPrice: Number(item.totalPrice)
                })));
                setSelectedClientId(budget.clientId);
            } else {
                setName("");
                setItems([]);
                setUserId("");
                setStatus("PENDENTE");
                setValidUntil(format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"));
                setSelectedClientId(client?.id || "");
            }
            setCurrentServiceId("");
            setCurrentQuantity(1);
            setCurrentPrice(0);
        }
    }, [isOpen, budget]);

    const handleServiceChange = (id: string) => {
        setCurrentServiceId(id);
        const service = services.find(s => s.id === id);
        if (service) {
            setCurrentPrice(Number(service.price));
        }
    };

    const addItem = () => {
        if (!currentServiceId) {
            toast.error("Selecione um serviço");
            return;
        }

        const service = services.find(s => s.id === currentServiceId);
        if (!service) return;

        const newItem: SelectedItem = {
            id: Math.random().toString(36).substr(2, 9),
            serviceId: currentServiceId,
            serviceName: service.name,
            quantity: currentQuantity,
            pricePerSession: currentPrice,
            totalPrice: currentQuantity * currentPrice
        };

        setItems([...items, newItem]);
        setCurrentServiceId("");
        setCurrentQuantity(1);
        setCurrentPrice(0);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const totalBudget = items.reduce((acc, item) => acc + item.totalPrice, 0);

    const handleSubmit = async () => {
        if (!name) return toast.error("Informe o nome do orçamento");
        if (!userId) return toast.error("Selecione o profissional");
        if (items.length === 0) return toast.error("Adicione pelo menos um item");

        setLoading(true);
        try {
            const finalClientId = client?.id || selectedClientId;
            if (!finalClientId) return toast.error("Selecione um cliente");

            const budgetData = {
                name,
                clientId: finalClientId,
                userId,
                validUntil: new Date(validUntil),
                status,
                items: items.map(i => ({
                    serviceId: i.serviceId,
                    quantity: i.quantity,
                    pricePerSession: i.pricePerSession
                }))
            };

            if (budget) {
                await updateBudget(budget.id, budgetData);
                toast.success("Orçamento atualizado com sucesso!");
            } else {
                await createBudget(budgetData);
                toast.success("Orçamento criado com sucesso!");
            }
            onClose();
        } catch (error) {
            toast.error(budget ? "Erro ao atualizar orçamento" : "Erro ao criar orçamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-[1400px] w-full p-0 overflow-hidden bg-white border-none shadow-2xl h-[95vh] flex flex-col z-[110]">
                <DialogHeader className="bg-white border-b px-6 py-4">
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                        <Calculator className="mr-2 h-5 w-5 text-blue-600" />
                        {budget ? "Editar Orçamento" : "Novo Orçamento"}
                        {(client || budgetsClientSelected) && ` - ${client?.name || budgetsClientSelected?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side: Form */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {!client && clients && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-sm font-semibold text-slate-700">Cliente</Label>
                                    <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={!!budget}>
                                        <SelectTrigger className="bg-white border-slate-200 h-11">
                                            <SelectValue placeholder="Selecione o cliente..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nome do Orçamento</Label>
                                <Input
                                    placeholder="Ex: Black Friday, Combo Natal..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-slate-200 h-10 text-sm px-3"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Profissional Responsável</Label>
                                <Select value={userId} onValueChange={setUserId}>
                                    <SelectTrigger className="bg-white border-slate-200 h-10 text-sm">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {team.map(member => (
                                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-white border-slate-200 h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                                        <SelectItem value="APROVADO">Aprovado</SelectItem>
                                        <SelectItem value="REPROVADO">Reprovado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Validade</Label>
                                <Input
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="bg-white border-slate-200 h-10 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-6 border-t pt-8">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-blue-500" /> Adicionar Serviços ao Orçamento
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-bold text-blue-600 uppercase">Serviço / Produto</Label>
                                    <Select value={currentServiceId} onValueChange={handleServiceChange}>
                                        <SelectTrigger className="bg-white h-10 text-sm">
                                            <SelectValue placeholder="Escolha um item..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name} - R${Number(s.price).toFixed(2)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-blue-600 uppercase">Qtd</Label>
                                    <Input
                                        type="number"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                                        className="bg-white h-10 text-sm text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-blue-600 uppercase">Valor Un.</Label>
                                    <Input
                                        type="number"
                                        value={currentPrice}
                                        onChange={(e) => setCurrentPrice(Number(e.target.value))}
                                        className="bg-white h-10 text-sm text-right font-bold"
                                    />
                                </div>
                                <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 font-bold h-10 text-sm">
                                    <Plus className="h-4 w-4 mr-1" /> INCLUIR
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[400px] bg-slate-50 border-l border-slate-200 flex flex-col">
                        <div className="p-4 bg-slate-800 text-white font-bold flex items-center justify-between shrink-0">
                            <span className="flex items-center text-sm"><Calculator className="h-4 w-4 mr-2" /> Resumo do Orçamento</span>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded italic">{items.length} itens</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.length > 0 ? items.map(item => (
                                <div key={item.id} className="bg-white p-3 rounded-xl border shadow-sm group relative">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute -top-1 -right-1 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                    <div className="text-xs font-bold text-slate-700 truncate">{item.serviceName}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-slate-400 font-bold">{item.quantity}x R$ {Number(item.pricePerSession).toFixed(2)}</span>
                                        <span className="text-xs font-black text-blue-600">R$ {Number(item.totalPrice).toFixed(2)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                    <DollarSign className="h-12 w-12 opacity-20 mb-2" />
                                    <p className="text-sm">Nenhum item adicionado</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Total Geral</span>
                                <span className="text-2xl font-black text-slate-800">R$ {totalBudget.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={onClose} className="font-bold border-slate-300 text-slate-600">
                                    CANCELAR
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-100">
                                    {loading ? "SALVANDO..." : budget ? "ATUALIZAR" : "FINALIZAR"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
