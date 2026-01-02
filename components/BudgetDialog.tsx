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
            <DialogContent className="max-w-[95vw] sm:max-w-[1400px] w-full p-0 overflow-hidden bg-white border-none shadow-2xl h-[95vh] flex flex-col z-[110]">
                <DialogHeader className="bg-blue-600 p-8 text-white shrink-0">
                    <DialogTitle className="flex items-center text-4xl font-extrabold tracking-tight">
                        <DollarSign className="mr-4 h-12 w-12" />
                        Novo Orçamento - {client.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row flex-1 min-h-0">
                    {/* Main Form Area */}
                    <div className="flex-1 p-10 overflow-y-auto space-y-10">
                        {/* Budget Info */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                            <div className="space-y-4">
                                <Label className="text-[14px] font-black uppercase text-slate-500 tracking-widest">Nome do Orçamento</Label>
                                <Input
                                    placeholder="Ex: Black Friday, Combo Natal..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-slate-200 h-16 text-xl px-5"
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[14px] font-black uppercase text-slate-500 tracking-widest">Profissional Responsável</Label>
                                <Select value={userId} onValueChange={setUserId}>
                                    <SelectTrigger className="bg-white border-slate-200 h-16 text-xl px-5">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {team.map(member => (
                                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[14px] font-black uppercase text-slate-500 tracking-widest">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-white border-slate-200 h-16 text-xl px-5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                                        <SelectItem value="APROVADO">Aprovado</SelectItem>
                                        <SelectItem value="REPROVADO">Reprovado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[14px] font-black uppercase text-slate-500 tracking-widest">Validade</Label>
                                <Input
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="bg-white border-slate-200 h-16 text-xl px-5"
                                />
                            </div>
                        </div>

                        <div className="space-y-8 border-t pt-10">
                            <h3 className="text-3xl font-extrabold text-slate-800 flex items-center">
                                <Tag className="h-10 w-10 mr-4 text-blue-600" /> Adicionar Serviços ao Orçamento
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end bg-blue-50 p-8 rounded-3xl border-2 border-blue-100 shadow-lg shadow-blue-50">
                                <div className="md:col-span-3 space-y-3">
                                    <Label className="text-[14px] font-black text-blue-700 uppercase tracking-widest">Serviço / Produto</Label>
                                    <Select value={currentServiceId} onValueChange={handleServiceChange}>
                                        <SelectTrigger className="bg-white h-20 text-2xl px-6 font-bold border-blue-200">
                                            <SelectValue placeholder="Escolha um item do catálogo..." />
                                        </SelectTrigger>
                                        <SelectContent className="text-xl">
                                            {services.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="text-xl py-3">{s.name} - R${Number(s.price).toFixed(2)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[14px] font-black text-blue-700 uppercase tracking-widest">Qtd</Label>
                                    <Input
                                        type="number"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                                        className="bg-white h-20 text-3xl text-center font-black border-blue-200"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[14px] font-black text-blue-700 uppercase tracking-widest">Valor Un.</Label>
                                    <Input
                                        type="number"
                                        value={currentPrice}
                                        onChange={(e) => setCurrentPrice(Number(e.target.value))}
                                        className="bg-white h-20 text-3xl text-right font-black border-blue-200 pr-6"
                                    />
                                </div>
                                <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 font-black h-20 text-xl shadow-xl shadow-blue-100 uppercase tracking-widest">
                                    <Plus className="h-8 w-8 mr-2" /> INCLUIR
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="w-full lg:w-[500px] bg-slate-100 border-l-2 border-slate-200 flex flex-col">
                        <div className="p-8 bg-slate-900 text-white font-black flex items-center justify-between shrink-0 shadow-lg">
                            <span className="flex items-center text-2xl uppercase tracking-tighter"><Calculator className="h-8 w-8 mr-4 text-blue-400" /> Resumo</span>
                            <span className="bg-blue-600 px-4 py-1 rounded-full text-base">{items.length} itens</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.length > 0 ? items.map(item => (
                                <div key={item.id} className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm group relative">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute -top-3 -right-3 bg-red-600 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10 hover:scale-110"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <div className="text-lg font-black text-slate-800 truncate mb-3">{item.serviceName}</div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.quantity}x R$ {Number(item.pricePerSession).toFixed(2)}</span>
                                        <span className="text-2xl font-black text-blue-600">R$ {Number(item.totalPrice).toFixed(2)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                    <DollarSign className="h-12 w-12 opacity-20 mb-2" />
                                    <p className="text-sm">Nenhum item adicionado</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white border-t-2 border-slate-200 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-end mb-8">
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total do Orçamento</span>
                                <span className="text-6xl font-black text-slate-900 tracking-tighter">R$ {totalBudget.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <Button variant="outline" onClick={onClose} className="font-black h-20 border-2 border-slate-300 text-slate-600 text-xl uppercase tracking-widest hover:bg-slate-50">
                                    CANCELAR
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 font-black h-20 text-xl shadow-xl shadow-emerald-100 uppercase tracking-widest">
                                    {loading ? "SALVANDO..." : "FINALIZAR ORÇAMENTO"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
