'use client';

import { useState } from "react";
import {
    Wallet,
    Plus,
    Search,
    Edit2,
    Trash2,
    Building2,
    Banknote
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
import { AccountDialog } from "./AccountDialog";
import { deleteAccount } from "@/app/actions/financial-actions";
import { toast } from "sonner";

interface AccountsPageClientProps {
    initialAccounts: any[];
}

export default function AccountsPageClient({ initialAccounts }: AccountsPageClientProps) {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (account: any) => {
        setSelectedAccount(account);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

        const result = await deleteAccount(id);
        if (result.success) {
            setAccounts(accounts.filter(a => a.id !== id));
            toast.success("Conta excluída!");
        } else {
            toast.error(result.error);
        }
    };

    const handleSave = (item: any) => {
        const exists = accounts.find(a => a.id === item.id);
        if (exists) {
            setAccounts(accounts.map(a => a.id === item.id ? item : a));
        } else {
            setAccounts([item, ...accounts]);
        }
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <Wallet className="mr-3 h-8 w-8 text-emerald-600" />
                        Contas Bancárias e Caixas
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as contas onde você recebe e paga seus compromissos.</p>
                </div>
                <Button
                    onClick={() => { setSelectedAccount(null); setIsDialogOpen(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 font-bold h-11 px-6"
                >
                    <Plus className="mr-2 h-5 w-5" /> NOVA CONTA
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Buscar contas pelo nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all text-sm rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest pl-6">Nome da Conta</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest">Tipo</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-right pr-6">Saldo Atual</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-right pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAccounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Wallet className="h-12 w-12 opacity-10 mb-2" />
                                                <p className="text-sm">Nenhuma conta encontrada</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAccounts.map((account) => (
                                    <TableRow key={account.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="font-bold text-slate-700 py-4 pl-6">{account.name}</TableCell>
                                        <TableCell className="py-4">
                                            {account.type === 'BANK' ? (
                                                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border border-blue-100 font-bold px-3">
                                                    <Building2 className="mr-2 h-3.5 w-3.5" /> BANCO
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border border-amber-100 font-bold px-3">
                                                    <Banknote className="mr-2 h-3.5 w-3.5" /> CAIXA FÍSICO
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right font-black py-4 pr-6 ${Number(account.balance) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(account.balance))}
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" onClick={() => handleEdit(account)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" onClick={() => handleDelete(account.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AccountDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                account={selectedAccount}
                onSave={handleSave}
            />
        </div>
    );
}
