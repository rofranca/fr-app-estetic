'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateOrganization } from "@/app/actions/settings-actions";

export function SettingsForm({ organization }: { organization: any }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: organization.name || "",
        cnpj: organization.cnpj || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: organization.address || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateOrganization(formData);
            if (result.success) {
                toast.success("Dados atualizados com sucesso!");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao salvar dados");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-slate-800">
                    <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                    Dados da Empresa
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Clínica</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Contato</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone / WhatsApp</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Endereço Completo</Label>
                            <Input id="address" value={formData.address} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - UF" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
