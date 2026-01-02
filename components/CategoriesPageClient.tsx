'use client';

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Plus,
    Search,
    ArrowUpCircle,
    ArrowDownCircle,
    Edit2,
    Trash2,
    Repeat
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
import { CategoryDialog } from "./CategoryDialog";
import { deleteCategory } from "@/app/actions/financial-actions";
import { toast } from "sonner";

interface CategoriesPageClientProps {
    initialCategories: any[];
}

export default function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (category: any) => {
        setSelectedCategory(category);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

        const result = await deleteCategory(id);
        if (result.success) {
            setCategories(categories.filter(c => c.id !== id));
            toast.success("Categoria excluída!");
        } else {
            toast.error(result.error);
        }
    };

    const handleSave = (item: any) => {
        const exists = categories.find(c => c.id === item.id);
        if (exists) {
            setCategories(categories.map(c => c.id === item.id ? item : c));
        } else {
            setCategories([item, ...categories]);
        }
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <LayoutDashboard className="mr-3 h-8 w-8 text-blue-600" />
                        Categorias Financeiras
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Organize suas receitas e despesas por categorias personalizadas.</p>
                </div>
                <Button
                    onClick={() => { setSelectedCategory(null); setIsDialogOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold h-11 px-6"
                >
                    <Plus className="mr-2 h-5 w-5" /> NOVA CATEGORIA
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Buscar categorias pelo nome..."
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
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest pl-6">Nome da Categoria</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest">Tipo</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-center">Recorrência</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-right">Valor Padrão</TableHead>
                                    <TableHead className="font-bold text-slate-600 py-4 h-auto uppercase text-[10px] tracking-widest text-right pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <LayoutDashboard className="h-12 w-12 opacity-10 mb-2" />
                                                <p className="text-sm">Nenhuma categoria encontrada</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCategories.map((category) => (
                                    <TableRow key={category.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="font-bold text-slate-700 py-4 pl-6">{category.name}</TableCell>
                                        <TableCell className="py-4">
                                            {category.type === 'INCOME' ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 font-bold px-3">
                                                    <ArrowUpCircle className="mr-2 h-3.5 w-3.5" /> RECEITA
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-50 border border-rose-100 font-bold px-3">
                                                    <ArrowDownCircle className="mr-2 h-3.5 w-3.5" /> DESPESA
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            {category.isRecurring ? (
                                                <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 font-bold px-3">
                                                    <Repeat className="mr-2 h-3.5 w-3.5" /> MENSAL (DIA {category.dueDay})
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-300 text-[10px] font-black uppercase tracking-tighter italic">Eventual</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-black text-slate-700 py-4">
                                            {category.defaultAmount
                                                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(category.defaultAmount))
                                                : <span className="text-slate-300">-</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" onClick={() => handleEdit(category)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" onClick={() => handleDelete(category.id)}>
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

            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                category={selectedCategory}
                onSave={handleSave}
            />
        </div>
    );
}
