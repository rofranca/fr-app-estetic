'use client';

import { useState } from "react";
import {
    Wallet,
    Plus,
    History,
    Lock,
    Unlock,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Calendar,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { openCashRegister, closeCashRegister } from "@/app/actions/financial-actions";
import { toast } from "sonner";

interface CashRegistersPageClientProps {
    initialOpenRegister: any;
    history: any[];
}

export default function CashRegistersPageClient({ initialOpenRegister, history }: CashRegistersPageClientProps) {
    const [openRegister, setOpenRegister] = useState(initialOpenRegister);
    const [openingBalance, setOpeningBalance] = useState("");
    const [closingBalance, setClosingBalance] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        if (!openingBalance) return toast.error("Informe o saldo inicial");
        setLoading(true);
        try {
            const result = await openCashRegister(parseFloat(openingBalance));
            if (result.success) {
                setOpenRegister(result.register);
                toast.success("Caixa aberto com sucesso!");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao abrir caixa");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        if (!closingBalance) return toast.error("Informe o saldo final para conferência");
        setLoading(true);
        try {
            const result = await closeCashRegister(openRegister.id, parseFloat(closingBalance));
            if (result.success) {
                setOpenRegister(null);
                toast.success("Caixa fechado com sucesso!");
                window.location.reload(); // Refresh to update history
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao fechar caixa");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        if (!openRegister || !openRegister.transactions) return { income: 0, expense: 0, balance: 0 };
        const income = openRegister.transactions.filter((t: any) => t.type === 'INCOME').reduce((acc: number, t: any) => acc + Number(t.amount), 0);
        const expense = openRegister.transactions.filter((t: any) => t.type === 'EXPENSE').reduce((acc: number, t: any) => acc + Number(t.amount), 0);
        return {
            income,
            expense,
            balance: Number(openRegister.openingBalance) + income - expense
        };
    };

    const totals = calculateTotals();

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center tracking-tight">
                        <Wallet className="mr-3 h-8 w-8 text-blue-600" />
                        Meus Caixas Diários
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Abra e feche seu movimento financeiro diário com precisão.</p>
                </div>
            </div>

            {!openRegister ? (
                <Card className="border-none bg-white shadow-2xl shadow-blue-100/50 p-16 rounded-[2rem] flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-500">
                        <Unlock className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">O caixa está fechado</h2>
                    <p className="text-slate-400 mt-3 max-w-sm font-medium">Inicie o dia informando o saldo inicial em espécie ou conta para controle.</p>

                    <div className="mt-10 flex flex-col md:flex-row items-center gap-4 w-full max-w-xl bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="relative flex-1 w-full">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">R$</span>
                            <Input
                                type="number"
                                placeholder="Saldo Inicial"
                                value={openingBalance}
                                onChange={(e) => setOpeningBalance(e.target.value)}
                                className="pl-12 h-14 rounded-2xl border-none focus:ring-4 focus:ring-blue-100 text-lg font-black text-slate-700 placeholder:font-medium placeholder:text-slate-300"
                            />
                        </div>
                        <Button onClick={handleOpen} disabled={loading} className="h-14 bg-blue-600 hover:bg-blue-700 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 w-full md:w-auto">
                            ABRIR CAIXA AGORA
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="overflow-hidden border-none shadow-2xl shadow-blue-100/30 rounded-[2rem] bg-white">
                            <CardHeader className="bg-slate-900 text-white p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                            <Unlock className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">Caixa em Operação</CardTitle>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wider">Aberto em {new Date(openRegister.openingDate).toLocaleString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-5 py-2 uppercase tracking-widest text-[10px] font-black">ABERTO</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Entradas (Hoje)</p>
                                    <div className="text-3xl font-black text-emerald-600 flex items-center justify-center gap-2">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.income)}
                                    </div>
                                    <div className="h-1 w-full bg-emerald-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-full animate-pulse opacity-50"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Saídas (Hoje)</p>
                                    <div className="text-3xl font-black text-rose-600 flex items-center justify-center gap-2">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.expense)}
                                    </div>
                                    <div className="h-1 w-full bg-rose-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 w-full animate-pulse opacity-50"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                    <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest">Saldo Esperado</p>
                                    <div className="text-3xl font-black text-blue-700">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.balance)}
                                    </div>
                                    <p className="text-[10px] text-blue-400 font-bold italic">Base: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(openRegister.openingBalance))} inicial</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between px-8 py-5">
                                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                                    <History className="mr-3 h-4 w-4 text-blue-500" /> Movimentação Recente do Caixa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        {(!openRegister.transactions || openRegister.transactions.length === 0) ? (
                                            <TableRow>
                                                <TableCell className="py-24 text-center">
                                                    <div className="flex flex-col items-center opacity-25">
                                                        <History className="h-12 w-12 mb-3" />
                                                        <p className="text-sm font-bold uppercase tracking-widest">Sem movimentos registrados</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : openRegister.transactions.map((t: any) => (
                                            <TableRow key={t.id} className="hover:bg-slate-50/80 transition-all group border-slate-50">
                                                <TableCell className="pl-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {t.type === 'INCOME' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700 text-sm uppercase tracking-tight">{t.description}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" /> {new Date(t.createdAt).toLocaleTimeString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={`text-right pr-8 py-5 font-black text-base ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {t.type === 'INCOME' ? "+" : "-"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card className="border-none shadow-2xl shadow-rose-100/50 bg-white rounded-[2rem] overflow-hidden">
                            <CardHeader className="bg-rose-600 text-white p-6">
                                <CardTitle className="text-lg flex items-center gap-3 font-bold uppercase tracking-tight">
                                    <Lock className="h-5 w-5 text-rose-200" /> Encerrar o Dia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <p className="text-sm text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">"O fechamento de caixa é o momento de conferir o saldo real com o que o sistema registrou."</p>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Saldo Final em Mãos</Label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">R$</span>
                                        <Input
                                            type="number"
                                            value={closingBalance}
                                            onChange={(e) => setClosingBalance(e.target.value)}
                                            className="pl-12 h-14 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-rose-50 font-black text-slate-700 text-lg group-hover:bg-white transition-all shadow-inner"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleClose} disabled={loading} className="w-full h-14 bg-rose-600 hover:bg-rose-700 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    FECHAR CAIXA E SALVAR
                                </Button>
                                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">O histórico será arquivado permanentemente</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden mt-12">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                    <CardTitle className="text-lg flex items-center gap-3 text-slate-800 font-bold uppercase tracking-tight">
                        <History className="h-6 w-6 text-slate-400" /> Histórico de Fechamentos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100">
                                <TableHead className="pl-8 py-5 font-black uppercase text-[10px] text-slate-500 tracking-widest">Período de Abertura</TableHead>
                                <TableHead className="py-5 font-black uppercase text-[10px] text-slate-500 tracking-widest">Encerramento</TableHead>
                                <TableHead className="py-5 font-black uppercase text-[10px] text-slate-500 tracking-widest text-right">Saldo Inicial</TableHead>
                                <TableHead className="py-5 font-black uppercase text-[10px] text-slate-500 tracking-widest text-right">Saldo Final</TableHead>
                                <TableHead className="py-5 font-black uppercase text-[10px] text-slate-500 tracking-widest text-center pr-8">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center opacity-10">
                                            <History className="h-16 w-16 mb-4" />
                                            <p className="font-black uppercase tracking-[0.3em]">Arquivo Vazio</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : history.map((h) => (
                                <TableRow key={h.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                    <TableCell className="pl-8 py-5 font-bold text-slate-700">{new Date(h.openingDate).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell className="text-slate-500 py-5">{h.closingDate ? new Date(h.closingDate).toLocaleString('pt-BR') : <span className="text-emerald-500 font-black animate-pulse">EM ANDAMENTO</span>}</TableCell>
                                    <TableCell className="text-right font-medium py-5 text-slate-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(h.openingBalance))}</TableCell>
                                    <TableCell className="text-right font-black text-slate-800 py-5">{h.closingBalance ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(h.closingBalance)) : "-"}</TableCell>
                                    <TableCell className="text-center py-5 pr-8">
                                        <Badge className={h.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-4 py-1' : 'bg-slate-100 text-slate-400 border-none font-black px-4 py-1'}>
                                            {h.status === 'OPEN' ? 'ABERTO' : 'FECHADO'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
