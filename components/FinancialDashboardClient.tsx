'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Landmark } from "lucide-react";

interface FinancialDashboardClientProps {
    summary: {
        revenue: number;
        expenses: number;
        balance: number;
        pending: number;
    };
    dailyFlow: any[];
}

export default function FinancialDashboardClient({ summary, dailyFlow }: FinancialDashboardClientProps) {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">A Receber (Mês)</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">R$ {summary.pending.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">A Pagar (Mês)</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">R$ {summary.expenses.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Fluxo Mensal</CardTitle>
                        <Landmark className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {summary.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-80">Saldo Estimado</CardTitle>
                        <Wallet className="h-4 w-4 opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {summary.balance.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Fluxo de Caixa Diário (Entradas vs Saídas)</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyFlow}>
                            <defs>
                                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="entradas" stroke="#10b981" fillOpacity={1} fill="url(#colorEntradas)" />
                            <Area type="monotone" dataKey="saidas" stroke="#ef4444" fillOpacity={1} fill="url(#colorSaidas)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
