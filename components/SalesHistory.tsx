'use client';

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    History,
    Search,
    Printer,
    TrendingUp,
    Users,
    DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateReceipt } from "@/lib/receipt-generator";

interface SalesHistoryProps {
    sales: any[];
    summary: {
        total: number;
        count: number;
        ticket: number;
    };
    organization?: any; // Added prop
}

export function SalesHistory({ sales, summary, organization }: SalesHistoryProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSales = sales.filter(sale =>
        sale.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="h-12 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold rounded-2xl">
                    <History className="mr-2 h-5 w-5" />
                    HISTÓRICO HOJE
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] bg-slate-50 p-0 flex flex-col h-full overflow-hidden">
                <SheetHeader className="p-6 bg-white border-b border-slate-100 flex-shrink-0">
                    <SheetTitle className="flex items-center text-xl font-black text-slate-800">
                        <History className="mr-3 h-6 w-6 text-blue-500" />
                        Vendas de Hoje
                    </SheetTitle>
                    <div className="flex items-center text-sm text-slate-500 font-medium mt-1">
                        {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                </SheetHeader>

                <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                        <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200">
                            <div className="flex items-center text-white/80 mb-1 text-sm font-medium">
                                <DollarSign className="h-4 w-4 mr-1" /> Total
                            </div>
                            <div className="text-2xl font-black">
                                R$ {Number(summary.total).toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-blue-500 text-white p-4 rounded-2xl shadow-lg shadow-blue-200">
                            <div className="flex items-center text-white/80 mb-1 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" /> Ticket Médio
                            </div>
                            <div className="text-2xl font-black">
                                R$ {Number(summary.ticket).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative flex-shrink-0">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar venda..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-11 pl-10 rounded-xl border-slate-200 bg-white"
                        />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <div className="space-y-3 pb-6">
                            {filteredSales.map(sale => (
                                <div key={sale.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-slate-800">{sale.client.name}</p>
                                            <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                                                <Users className="h-3 w-3 mr-1" />
                                                {sale.user.name}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-bold border-0">
                                            R$ {Number(sale.totalAmount).toFixed(2)}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        {sale.items.map((item: any) => (
                                            <div key={item.id} className="text-xs text-slate-500 flex justify-between">
                                                <span>{item.service.name}</span>
                                                <span className="font-bold text-slate-700">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                        <span>{format(new Date(sale.createdAt), "HH:mm")}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 hover:bg-slate-50 text-slate-600 rounded-lg"
                                            onClick={() => generateReceipt(sale, organization)}
                                        >
                                            <Printer className="h-3.5 w-3.5 mr-2" /> Recibo
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {filteredSales.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>Nenhuma venda encontrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
