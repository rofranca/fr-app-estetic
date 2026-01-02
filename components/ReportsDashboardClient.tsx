'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Cake
} from "lucide-react";

interface ReportsDashboardProps {
    summary: {
        revenue: number;
        expenses: number;
        balance: number;
        pending: number;
    };
    chartData: any[];
    birthdays: any[];
}

export default function ReportsDashboardClient({ summary, chartData, birthdays }: ReportsDashboardProps) {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
            </div>

            {/* Upper Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">Receita Mensal</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">R$ {summary.revenue.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600">Entradas confirmadas</p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Despesas</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">R$ {summary.expenses.toLocaleString()}</div>
                        <p className="text-xs text-red-600">Saídas registradas</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Saldo Atual</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">R$ {summary.balance.toLocaleString()}</div>
                        <p className="text-xs text-blue-600">Lucro líquido do mês</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">A Receber</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700">R$ {summary.pending.toLocaleString()}</div>
                        <p className="text-xs text-amber-600">Cobranças pendentes</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evolução de Faturamento</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => `R$ ${value}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Birthdays Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Aniversariantes do Mês</CardTitle>
                        <Cake className="h-5 w-5 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {birthdays.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">Nenhum aniversariante este mês.</p>
                            ) : birthdays.map((client, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{client.name}</p>
                                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-pink-600">
                                            {new Date(client.birthDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
