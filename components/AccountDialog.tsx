'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAccount, updateAccount } from "@/app/actions/financial-actions";
import { Wallet, Save, Building2, Banknote, DollarSign } from "lucide-react";

interface AccountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    account?: any;
    onSave: (account: any) => void;
}

export function AccountDialog({ isOpen, onClose, account, onSave }: AccountDialogProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState("BANK");
    const [balance, setBalance] = useState("0");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (account) {
                setName(account.name);
                setType(account.type || "BANK");
                setBalance(account.balance?.toString() || "0");
            } else {
                setName("");
                setType("BANK");
                setBalance("0");
            }
        }
    }, [isOpen, account]);

    const handleSubmit = async () => {
        if (!name) return toast.error("Informe o nome da conta");

        setLoading(true);
        const data = {
            name,
            type,
            balance: parseFloat(balance)
        };

        try {
            let result;
            if (account) {
                result = await updateAccount(account.id, data);
            } else {
                result = await createAccount(data);
            }

            if (result.success) {
                toast.success(account ? "Conta atualizada!" : "Conta criada!");
                onSave(result.account);
                onClose();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao salvar conta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="bg-slate-900 p-6 text-white shrink-0">
                    <DialogTitle className="flex items-center text-xl font-bold tracking-tight">
                        <Wallet className="mr-3 h-6 w-6 text-emerald-400" />
                        {account ? "Editar Conta" : "Nova Conta"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-8 bg-white overflow-y-auto">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nome da Conta / Banco</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Itaú, Santander, Caixa Interno..."
                            className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-slate-50/50 rounded-xl transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Tipo de Conta</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-xl border-slate-100">
                                    <SelectItem value="BANK" className="font-bold text-blue-600">
                                        <div className="flex items-center">
                                            <Building2 className="mr-2 h-4 w-4" /> BANCO
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="CASH" className="font-bold text-amber-600">
                                        <div className="flex items-center">
                                            <Banknote className="mr-2 h-4 w-4" /> CAIXA FÍSICO
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Saldo Inicial</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="number"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    placeholder="0,00"
                                    className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-slate-50/50 rounded-xl pl-9 transition-all font-black text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sm:justify-end gap-3 shrink-0">
                    <Button variant="ghost" type="button" onClick={onClose} className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">
                        CANCELAR
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="h-12 px-10 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-xs">
                        {loading ? "PROCESSANDO..." : account ? "ATUALIZAR CONTA" : "CONFIRMAR CADASTRO"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
