'use client';

import { useState } from "react";
import {
    CreditCard,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock
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
import { PaymentMethodDialog } from "./PaymentMethodDialog";
import { deletePaymentMethod } from "@/app/actions/financial-actions";
import { toast } from "sonner";

interface PaymentMethodsPageClientProps {
    initialMethods: any[];
}

export default function PaymentMethodsPageClient({ initialMethods }: PaymentMethodsPageClientProps) {
    const [methods, setMethods] = useState(initialMethods);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<any>(null);

    const filteredMethods = methods.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (method: any) => {
        setSelectedMethod(method);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta forma de pagamento?")) return;

        const result = await deletePaymentMethod(id);
        if (result.success) {
            setMethods(methods.filter(m => m.id !== id));
            toast.success("Forma de pagamento excluída!");
        } else {
            toast.error(result.error);
        }
    };

    const handleSave = (item: any) => {
        const exists = methods.find(m => m.id === item.id);
        if (exists) {
            setMethods(methods.map(m => m.id === item.id ? item : m));
        } else {
            setMethods([item, ...methods]);
        }
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <CreditCard className="mr-3 h-8 w-8 text-blue-500" />
                        Formas de Pagamento
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Configure os métodos de recebimento e prazos de compensação.</p>
                </div>
                <Button
                    onClick={() => { setSelectedMethod(null); setIsDialogOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold h-11 px-6"
                >
                    <Plus className="mr-2 h-5 w-5" /> NOVA FORMA
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Buscar formas de pagamento..."
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
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest pl-6">Nome</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest">Tipo</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-center">Prazo Receb.</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-right pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMethods.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <CreditCard className="h-12 w-12 opacity-10 mb-2" />
                                                <p className="text-sm">Nenhuma forma de pagamento cadastrada</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredMethods.map((method) => (
                                    <TableRow key={method.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="font-bold text-slate-700 py-4 pl-6 uppercase text-xs">{method.name}</TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none font-bold px-3">
                                                {method.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge variant="outline" className="text-amber-600 border-amber-100 bg-amber-50 font-bold px-3">
                                                <Clock className="mr-2 h-3.5 w-3.5" /> D + {method.receiptDays} DIAS
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            {method.active ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 font-bold px-3">
                                                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> ATIVA
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-slate-50 text-slate-400 hover:bg-slate-50 border border-slate-100 font-bold px-3">
                                                    <XCircle className="mr-2 h-3.5 w-3.5" /> INATIVA
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" onClick={() => handleEdit(method)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" onClick={() => handleDelete(method.id)}>
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

            <PaymentMethodDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                method={selectedMethod}
                onSave={handleSave}
            />
        </div>
    );
}
