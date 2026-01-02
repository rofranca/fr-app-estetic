'use server';

import { getFinancialSummary, getBirthdaysToday } from "./actions/report-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cake, DollarSign, Users } from "lucide-react";

export default async function DashboardStandard() {
  const [summary, birthdays] = await Promise.all([
    getFinancialSummary(),
    getBirthdaysToday()
  ]);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Padrão</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Vendas do Mês</CardTitle>
            <DollarSign className="h-6 w-6 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">R$ {summary.revenue.toLocaleString()}</div>
            <p className="text-sm opacity-80 mt-1">Total acumulado em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Aniversariantes de Hoje</CardTitle>
            <Cake className="h-6 w-6 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{birthdays.length}</div>
            <p className="text-sm opacity-80 mt-1">Clientes celebrando hoje!</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Cake className="mr-2 h-5 w-5 text-pink-500" />
            Lista de Aniversariantes do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {birthdays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                    Nenhum aniversariante hoje.
                  </TableCell>
                </TableRow>
              ) : birthdays.map((client: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold">{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
