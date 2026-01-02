'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/app/actions/financial-actions";
import { LayoutDashboard, Save, Calendar, DollarSign } from "lucide-react";

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category?: any;
    onSave: (category: any) => void;
}

export function CategoryDialog({ isOpen, onClose, category, onSave }: CategoryDialogProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState("EXPENSE");
    const [isRecurring, setIsRecurring] = useState("NO");
    const [defaultAmount, setDefaultAmount] = useState("");
    const [dueDay, setDueDay] = useState("5");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setName(category.name);
                setType(category.type || "EXPENSE");
                setIsRecurring(category.isRecurring ? "YES" : "NO");
                setDefaultAmount(category.defaultAmount?.toString() || "");
                setDueDay(category.dueDay?.toString() || "5");
            } else {
                setName("");
                setType("EXPENSE");
                setIsRecurring("NO");
                setDefaultAmount("");
                setDueDay("5");
            }
        }
    }, [isOpen, category]);

    const handleSubmit = async () => {
        if (!name) return toast.error("Informe o nome da categoria");

        setLoading(true);
        const data = {
            name,
            type,
            isRecurring: isRecurring === "YES",
            defaultAmount: defaultAmount ? parseFloat(defaultAmount) : undefined,
            dueDay: isRecurring === "YES" ? parseInt(dueDay) : undefined
        };

        try {
            let result;
            if (category) {
                result = await updateCategory(category.id, data);
            } else {
                result = await createCategory(data);
            }

            if (result.success) {
                toast.success(category ? "Categoria atualizada!" : "Categoria criada!");
                onSave(result.category);
                onClose();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao salvar categoria");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="bg-slate-900 p-6 text-white shrink-0">
                    <DialogTitle className="flex items-center text-xl font-bold tracking-tight">
                        <LayoutDashboard className="mr-3 h-6 w-6 text-blue-400" />
                        {category ? "Editar Categoria" : "Nova Categoria"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-8 bg-white overflow-y-auto max-h-[70vh]">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Identificação da Categoria</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Aluguel, Produtos de Limpeza, Botox..."
                            className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Tipo de Fluxo</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-xl border-slate-100">
                                    <SelectItem value="INCOME" className="font-bold text-emerald-600">RECEITA</SelectItem>
                                    <SelectItem value="EXPENSE" className="font-bold text-rose-600">DESPESA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Valor Sugerido</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="number"
                                    value={defaultAmount}
                                    onChange={(e) => setDefaultAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl pl-9 transition-all font-black text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-50">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Recorrência Mensal</Label>
                            <Select value={isRecurring} onValueChange={setIsRecurring}>
                                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-xl border-slate-100">
                                    <SelectItem value="NO" className="font-medium text-slate-700">Não, lançamento eventual</SelectItem>
                                    <SelectItem value="YES" className="font-bold text-blue-600">Sim, lançamento recorrente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isRecurring === "YES" && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Dia Padrão para Lançamento</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={dueDay}
                                        onChange={(e) => setDueDay(e.target.value)}
                                        className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl pl-9 transition-all font-black text-slate-700"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic">O sistema sugerirá este lançamento automaticamente todo mês neste dia.</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sm:justify-end gap-3 shrink-0">
                    <Button variant="ghost" type="button" onClick={onClose} className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">
                        CANCELAR
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="h-12 px-10 rounded-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all uppercase tracking-widest text-xs">
                        {loading ? "PROCESSANDO..." : category ? "ATUALIZAR CATEGORIA" : "CONFIRMAR CADASTRO"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
