'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createTransaction } from "@/app/actions/financial-actions";
import { FileText, Save, DollarSign, Calendar, Tag, Wallet, CreditCard, PenTool } from "lucide-react";

interface TransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    categories: any[];
    accounts: any[];
    paymentMethods: any[];
    onSave: (transaction: any) => void;
}

export function TransactionDialog({
    isOpen,
    onClose,
    categories,
    accounts,
    paymentMethods,
    onSave
}: TransactionDialogProps) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("EXPENSE");
    const [categoryId, setCategoryId] = useState("");
    const [accountId, setAccountId] = useState("");
    const [paymentMethodId, setPaymentMethodId] = useState("");
    const [status, setStatus] = useState("PENDING");
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");

    const handleSubmit = async () => {
        if (!description || !amount) return toast.error("Preencha descrição e valor");

        setLoading(true);
        try {
            const result = await createTransaction({
                description,
                amount: parseFloat(amount),
                type,
                categoryId: categoryId || undefined,
                accountId: accountId || undefined,
                paymentMethodId: paymentMethodId || undefined,
                status,
                notes,
                paidAt: status === 'PAID' ? new Date() : undefined,
                dueDate: new Date()
            });

            if (result.success) {
                toast.success("Lançamento registrado!");
                onSave(result.transaction);
                onClose();
                // Reset form
                setDescription("");
                setAmount("");
                setCategoryId("");
                setAccountId("");
                setPaymentMethodId("");
                setNotes("");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao salvar lançamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                <DialogHeader className="bg-slate-900 p-8 text-white shrink-0">
                    <DialogTitle className="flex items-center text-2xl font-black tracking-tight">
                        <FileText className="mr-3 h-7 w-7 text-blue-400" />
                        Novo Lançamento
                    </DialogTitle>
                </DialogHeader>

                <div className="p-10 space-y-8 bg-white overflow-y-auto max-h-[75vh]">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Descrição do Lançamento</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Compra de materiais, Aluguel, Venda de serviço..."
                            className="h-14 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl transition-all font-bold text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Tipo de Fluxo</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-14 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl transition-all font-black text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-2xl border-slate-100">
                                    <SelectItem value="INCOME" className="font-black text-emerald-600">RECEITA / ENTRADA</SelectItem>
                                    <SelectItem value="EXPENSE" className="font-black text-rose-600">DESPESA / SAÍDA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Valor do Título</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="h-14 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl pl-11 transition-all font-black text-slate-700 text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Categoria</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger className="h-14 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl transition-all font-bold text-slate-700">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-2xl border-slate-100">
                                    {categories.filter(c => c.type === type).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Status Atual</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-14 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl transition-all font-black text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-2xl border-slate-100">
                                    <SelectItem value="PENDING" className="text-amber-600 font-bold">PENDENTE / PREVISTO</SelectItem>
                                    <SelectItem value="PAID" className="text-emerald-600 font-bold">PAGO / EFETIVADO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {status === 'PAID' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Conta de Destino/Origem</Label>
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger className="h-14 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl transition-all font-bold text-slate-700">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200] rounded-2xl border-slate-100">
                                        {accounts.map(a => (
                                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Forma de Pagamento</Label>
                                <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                                    <SelectTrigger className="h-14 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl transition-all font-bold text-slate-700">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200] rounded-2xl border-slate-100">
                                        {paymentMethods.map(pm => (
                                            <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 pt-4">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
                            Observações Internas
                        </Label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full min-h-[100px] p-4 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-2xl transition-all font-medium text-slate-600 resize-none outline-none text-sm placeholder:text-slate-300"
                            placeholder="Anote detalhes importantes sobre este lançamento..."
                        />
                    </div>
                </div>

                <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 sm:justify-end gap-3 shrink-0">
                    <Button variant="ghost" type="button" onClick={onClose} className="h-14 px-8 rounded-2xl font-black text-slate-400 hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]">
                        DESCARTAR
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="h-14 px-12 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all uppercase tracking-[0.2em] text-xs">
                        {loading ? "PROCESSANDO..." : "REGISTRAR AGORA"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
