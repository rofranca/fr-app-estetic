'use client';

import { useState } from "react";
import {
    FileText,
    Plus,
    Search,
    Filter,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckCircle2,
    Clock,
    MoreVertical,
    Trash2,
    Calendar as CalendarIcon,
    DollarSign,
    Tag,
    Wallet,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { TransactionDialog } from "./TransactionDialog";
import { deleteTransaction } from "@/app/actions/financial-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionsPageClientProps {
    initialTransactions: any[];
    categories: any[];
    accounts: any[];
    paymentMethods: any[];
}

export default function TransactionsPageClient({
    initialTransactions,
    categories,
    accounts,
    paymentMethods
}: TransactionsPageClientProps) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || t.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este lançamento? Se estiver pago, o saldo da conta será revertido.")) return;
        const result = await deleteTransaction(id);
        if (result.success) {
            setTransactions(transactions.filter(t => t.id !== id));
            toast.success("Lançamento excluído!");
        } else {
            toast.error(result.error);
        }
    };

    const handleSave = (item: any) => {
        setTransactions([item, ...transactions]);
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center tracking-tight">
                        <FileText className="mr-3 h-8 w-8 text-blue-600" />
                        Lançamentos Financeiros
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Gestão completa de contas a pagar e receber da clínica.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold text-slate-600 border-slate-200">
                        <Download className="mr-2 h-5 w-5" /> EXPORTAR
                    </Button>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
                    >
                        <Plus className="mr-2 h-5 w-5" /> NOVO LANÇAMENTO
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 p-6 bg-white rounded-3xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Saldo Total (Contas)</p>
                    <p className="text-2xl font-black text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(accounts.reduce((acc, a) => acc + Number(a.balance), 0))}
                    </p>
                </Card>
                <Card className="border-none shadow-xl shadow-emerald-100/30 p-6 bg-white rounded-3xl border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Receitas (Geral)</p>
                    <p className="text-2xl font-black text-emerald-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0))}
                    </p>
                </Card>
                <Card className="border-none shadow-xl shadow-rose-100/30 p-6 bg-white rounded-3xl border-l-4 border-l-rose-500">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Despesas (Geral)</p>
                    <p className="text-2xl font-black text-rose-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0))}
                    </p>
                </Card>
                <Card className="border-none shadow-xl shadow-blue-100/30 p-6 bg-white rounded-3xl border-l-4 border-l-blue-500">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Balanço Calculado</p>
                    <p className="text-2xl font-black text-blue-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0) -
                            transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0)
                        )}
                    </p>
                </Card>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Filtrar por descrição ou cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-14 bg-slate-50 border-none rounded-2xl focus:bg-white transition-all shadow-inner"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={typeFilter === null ? 'default' : 'outline'}
                                onClick={() => setTypeFilter(null)}
                                className="h-14 px-6 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                            >
                                TODOS
                            </Button>
                            <Button
                                variant={typeFilter === 'INCOME' ? 'default' : 'outline'}
                                onClick={() => setTypeFilter('INCOME')}
                                className={`h-14 px-6 rounded-2xl font-bold uppercase text-[10px] tracking-widest ${typeFilter === 'INCOME' ? 'bg-emerald-600' : ''}`}
                            >
                                RECEITAS
                            </Button>
                            <Button
                                variant={typeFilter === 'EXPENSE' ? 'default' : 'outline'}
                                onClick={() => setTypeFilter('EXPENSE')}
                                className={`h-14 px-6 rounded-2xl font-bold uppercase text-[10px] tracking-widest ${typeFilter === 'EXPENSE' ? 'bg-rose-600 text-white' : ''}`}
                            >
                                DESPESAS
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-inner bg-slate-50/20 text-xs">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="pl-8 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Lançamento</TableHead>
                                    <TableHead className="py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Categoria</TableHead>
                                    <TableHead className="py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Conta / Forma</TableHead>
                                    <TableHead className="py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Status</TableHead>
                                    <TableHead className="py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right pr-14">Valor</TableHead>
                                    <TableHead className="py-6 text-right pr-8"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-32 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="h-10 w-10 text-slate-500" />
                                                </div>
                                                <p className="font-black uppercase tracking-[0.3em] text-slate-600">Nenhum Registro</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-slate-50/80 transition-all border-slate-100/50 group">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {t.type === 'INCOME' ? <ArrowUpCircle className="h-6 w-6" /> : <ArrowDownCircle className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm uppercase tracking-tight">{t.description}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                                                            <CalendarIcon className="h-3 w-3" /> {format(new Date(t.createdAt), "dd MMM yyyy", { locale: ptBR })}
                                                        </span>
                                                        {t.client && (
                                                            <span className="text-[10px] text-blue-500 font-black flex items-center gap-1 uppercase">
                                                                <DollarSign className="h-3 w-3" /> {t.client.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            {t.category ? (
                                                <Badge variant="outline" className="border-slate-200 bg-white text-slate-500 font-bold px-4 py-1.5 rounded-xl flex items-center w-fit gap-2">
                                                    <Tag className="h-3 w-3 text-slate-400" /> {t.category.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-300 font-medium italic text-xs">Sem categoria</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase">
                                                    <Wallet className="h-3.5 w-3.5 text-slate-400" /> {t.account?.name || '-'}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">
                                                    {t.paymentMethod?.name || '-'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 text-center">
                                            {t.status === 'PAID' ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black px-4 py-1.5 rounded-xl flex items-center justify-center gap-2 w-fit mx-auto scale-95 uppercase tracking-tighter">
                                                    <CheckCircle2 className="h-4 w-4" /> PAGO
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-600 border border-amber-100 font-black px-4 py-1.5 rounded-xl flex items-center justify-center gap-2 w-fit mx-auto scale-95 uppercase tracking-tighter">
                                                    <Clock className="h-4 w-4" /> PENDENTE
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right pr-14 py-6 font-black text-lg ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'INCOME' ? "+" : "-"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                                        </TableCell>
                                        <TableCell className="text-right pr-8 py-6 opacity-0 group-hover:opacity-100 transition-all">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-100 rounded-xl">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-none">
                                                    <DropdownMenuItem className="p-3 text-sm font-black rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={() => handleDelete(t.id)}>
                                                        <Trash2 className="mr-3 h-4 w-4" /> EXCLUIR
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <TransactionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                categories={categories}
                accounts={accounts}
                paymentMethods={paymentMethods}
                onSave={handleSave}
            />
        </div>
    );
}
