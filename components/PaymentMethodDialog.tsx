'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createPaymentMethod, updatePaymentMethod } from "@/app/actions/financial-actions";
import { CreditCard, Save, Clock, CheckCircle2 } from "lucide-react";

interface PaymentMethodDialogProps {
    isOpen: boolean;
    onClose: () => void;
    method?: any;
    onSave: (method: any) => void;
}

export function PaymentMethodDialog({ isOpen, onClose, method, onSave }: PaymentMethodDialogProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState("PIX");
    const [receiptDays, setReceiptDays] = useState("0");
    const [active, setActive] = useState("YES");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (method) {
                setName(method.name);
                setType(method.type || "PIX");
                setReceiptDays(method.receiptDays?.toString() || "0");
                setActive(method.active ? "YES" : "NO");
            } else {
                setName("");
                setType("PIX");
                setReceiptDays("0");
                setActive("YES");
            }
        }
    }, [isOpen, method]);

    const handleSubmit = async () => {
        if (!name) return toast.error("Informe o nome da forma de pagamento");

        setLoading(true);
        const data = {
            name,
            type,
            receiptDays: parseInt(receiptDays),
            active: active === "YES"
        };

        try {
            let result;
            if (method) {
                result = await updatePaymentMethod(method.id, data);
            } else {
                result = await createPaymentMethod(data);
            }

            if (result.success) {
                toast.success(method ? "Forma de pagamento atualizada!" : "Forma de pagamento criada!");
                onSave(result.method);
                onClose();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao salvar forma de pagamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="bg-slate-900 p-6 text-white shrink-0">
                    <DialogTitle className="flex items-center text-xl font-bold tracking-tight">
                        <CreditCard className="mr-3 h-6 w-6 text-blue-400" />
                        {method ? "Editar Forma" : "Nova Forma"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-8 bg-white overflow-y-auto">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nome da Forma (Ex: Cartão de Crédito - 2x)</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Pix, Cartão Visa, Dinheiro..."
                            className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Tipo Base</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-xl border-slate-100">
                                    <SelectItem value="PIX">PIX</SelectItem>
                                    <SelectItem value="CREDIT_CARD">CARTÃO DE CRÉDITO</SelectItem>
                                    <SelectItem value="DEBIT_CARD">CARTÃO DE DÉBITO</SelectItem>
                                    <SelectItem value="BOLETO">BOLETO</SelectItem>
                                    <SelectItem value="DINHEIRO">DINHEIRO</SelectItem>
                                    <SelectItem value="OUTRO">OUTRO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Dias para Receber</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="number"
                                    min="0"
                                    value={receiptDays}
                                    onChange={(e) => setReceiptDays(e.target.value)}
                                    placeholder="0"
                                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl pl-9 transition-all font-black text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status de Uso</Label>
                        <Select value={active} onValueChange={setActive}>
                            <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[200] rounded-xl border-slate-100">
                                <SelectItem value="YES" className="text-emerald-600 font-bold">ATIVA (Disponível nas vendas)</SelectItem>
                                <SelectItem value="NO" className="text-slate-400 font-bold">INATIVA (Ocultar nas vendas)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sm:justify-end gap-3 shrink-0">
                    <Button variant="ghost" type="button" onClick={onClose} className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">
                        CANCELAR
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="h-12 px-10 rounded-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all uppercase tracking-widest text-xs">
                        {loading ? "PROCESSANDO..." : method ? "ATUALIZAR FORMA" : "CONFIRMAR CADASTRO"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
