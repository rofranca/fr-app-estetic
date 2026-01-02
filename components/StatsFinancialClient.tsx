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
    Cell,
    PieChart,
    Pie,
    Legend
} from "recharts";

interface StatsFinancialClientProps {
    summary: {
        revenue: number;
        expenses: number;
        pending: number;
    };
}

export default function StatsFinancialClient({ summary }: StatsFinancialClientProps) {
    const comparisonData = [
        { name: "Contas a Receber", value: summary.pending, color: "#10b981" },
        { name: "Contas a Pagar", value: summary.expenses, color: "#ef4444" },
    ];

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Gráfico do Financeiro</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Comparison Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comparativo: Receber vs Pagar (Mês)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `R$ ${value}`} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {comparisonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Comparison Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Proporção de Fluxo Pendente</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={comparisonData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {comparisonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `R$ ${value}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
