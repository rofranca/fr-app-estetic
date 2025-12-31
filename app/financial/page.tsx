import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getFinancialSummary, getRecentTransactions } from "../actions/financial-actions";

export default async function FinancialPage() {
    const summary = await getFinancialSummary();
    const transactions = await getRecentTransactions();

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Financeiro</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader>
                        <CardTitle>Entradas (Mês)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.income)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle>Saídas (Mês)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.expense)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle>Saldo Líquido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma transação encontrada</TableCell>
                                </TableRow>
                            ) : transactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.status === 'PAID' ? 'default' : 'secondary'}>
                                            {t.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {t.type === 'INCOME' ? '+' : ''} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
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
