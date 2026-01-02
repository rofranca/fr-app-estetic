'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DollarSign, Plus, Trash2, Calculator, Calendar as CalendarIcon, User, Tag } from "lucide-react";
import { createBudget } from "@/app/actions/budget-actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BudgetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    client: { id: string, name: string };
    services: { id: string, name: string, price: any }[];
    team: { id: string, name: string }[];
}

interface SelectedItem {
    id: string;
    serviceId: string;
    serviceName: string;
    quantity: number;
    pricePerSession: number;
    totalPrice: number;
}

export function BudgetDialog({ isOpen, onClose, client, services, team }: BudgetDialogProps) {
    const [name, setName] = useState("");
    const [validUntil, setValidUntil] = useState(format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"));
    const [status, setStatus] = useState("PENDENTE");
    const [userId, setUserId] = useState("");

    // Item being added
    const [currentServiceId, setCurrentServiceId] = useState("");
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);

    // List of items in the budget
    const [items, setItems] = useState<SelectedItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName("");
            setItems([]);
            setUserId("");
            setCurrentServiceId("");
            setCurrentQuantity(1);
            setCurrentPrice(0);
        }
    }, [isOpen]);

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
            await createBudget({
                name,
                clientId: client.id,
                userId,
                validUntil: new Date(validUntil),
                status,
                items: items.map(i => ({
                    serviceId: i.serviceId,
                    quantity: i.quantity,
                    pricePerSession: i.pricePerSession
                }))
            });
            toast.success("Orçamento criado com sucesso!");
            onClose();
        } catch (error) {
            toast.error("Erro ao criar orçamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1400px] w-[95vw] p-0 overflow-hidden bg-white border-none shadow-2xl h-[95vh] flex flex-col">
                <DialogHeader className="bg-blue-600 p-6 text-white shrink-0">
                    <DialogTitle className="flex items-center text-2xl font-bold">
                        <DollarSign className="mr-3 h-8 w-8" />
                        Novo Orçamento - {client.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row flex-1 min-h-0">
                    {/* Main Form Area */}
                    <div className="flex-1 p-8 overflow-y-auto space-y-8">
                        {/* Budget Info */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="space-y-3">
                                <Label className="text-[12px] font-black uppercase text-slate-400 tracking-widest">Nome do Orçamento</Label>
                                <Input
                                    placeholder="Ex: Black Friday, Combo Natal..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-slate-200"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[12px] font-black uppercase text-slate-400 tracking-widest">Profissional Responsável</Label>
                                <Select value={userId} onValueChange={setUserId}>
                                    <SelectTrigger className="bg-white border-slate-200 h-12 text-base">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {team.map(member => (
                                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[12px] font-black uppercase text-slate-400 tracking-widest">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-white border-slate-200 h-12 text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                                        <SelectItem value="APROVADO">Aprovado</SelectItem>
                                        <SelectItem value="REPROVADO">Reprovado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[12px] font-black uppercase text-slate-400 tracking-widest">Validade</Label>
                                <Input
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="bg-white border-slate-200 h-12 text-base"
                                />
                            </div>
                        </div>

                        <div className="space-y-6 border-t pt-8">
                            <h3 className="text-xl font-bold text-slate-700 flex items-center">
                                <Tag className="h-6 w-6 mr-3 text-blue-500" /> Adicionar Serviços
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <div className="md:col-span-3 space-y-2">
                                    <Label className="text-[12px] font-bold text-blue-600 uppercase tracking-wider">Serviço / Produto</Label>
                                    <Select value={currentServiceId} onValueChange={handleServiceChange}>
                                        <SelectTrigger className="bg-white h-14 text-base">
                                            <SelectValue placeholder="Escolha um item..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name} - R${Number(s.price).toFixed(2)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[12px] font-bold text-blue-600 uppercase tracking-wider">Qtd</Label>
                                    <Input
                                        type="number"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                                        className="bg-white h-14 text-lg text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[12px] font-bold text-blue-600 uppercase tracking-wider">Valor Un.</Label>
                                    <Input
                                        type="number"
                                        value={currentPrice}
                                        onChange={(e) => setCurrentPrice(Number(e.target.value))}
                                        className="bg-white h-14 text-lg text-right font-bold"
                                    />
                                </div>
                                <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 font-bold h-14 text-base">
                                    <Plus className="h-5 w-5 mr-1" /> INCLUIR
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="w-full lg:w-[450px] bg-slate-50 border-l border-slate-200 flex flex-col">
                        <div className="p-6 bg-slate-800 text-white font-bold flex items-center justify-between shrink-0">
                            <span className="flex items-center text-lg"><Calculator className="h-6 w-6 mr-3" /> Resumo do Orçamento</span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{items.length} itens</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.length > 0 ? items.map(item => (
                                <div key={item.id} className="bg-white p-5 rounded-xl border shadow-sm group relative">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <div className="text-sm font-bold text-slate-700 truncate mb-2">{item.serviceName}</div>
                                    <div className="flex justify-between items-center text-slate-500">
                                        <span className="text-xs font-semibold">{item.quantity}x R$ {Number(item.pricePerSession).toFixed(2)}</span>
                                        <span className="text-base font-black text-blue-600">R$ {Number(item.totalPrice).toFixed(2)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                    <DollarSign className="h-12 w-12 opacity-20 mb-2" />
                                    <p className="text-sm">Nenhum item adicionado</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-white border-t border-slate-200 shrink-0">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Geral</span>
                                <span className="text-4xl font-black text-slate-800 tracking-tighter">R$ {totalBudget.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={onClose} className="font-bold h-14 border-slate-300 text-slate-600 text-base">
                                    CANCELAR
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 font-bold h-14 text-base shadow-lg shadow-emerald-100">
                                    {loading ? "SALVANDO..." : "FINALIZAR"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
