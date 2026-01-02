'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Save, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateOrganization } from "@/app/actions/settings-actions";

export function SettingsForm({ organization }: { organization: any }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: organization.name || "",
        cnpj: organization.cnpj || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: organization.address || "",
        slotDuration: organization.slotDuration || 30,
        startTime: organization.startTime || "08:00",
        endTime: organization.endTime || "20:00"
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

                    <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4 flex items-center text-slate-800">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            Configuração da Agenda
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="slotDuration">Duração do Agendamento</Label>
                                <Select
                                    value={String(formData.slotDuration)}
                                    onValueChange={(val) => setFormData({ ...formData, slotDuration: Number(val) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 minutos</SelectItem>
                                        <SelectItem value="10">10 minutos</SelectItem>
                                        <SelectItem value="15">15 minutos</SelectItem>
                                        <SelectItem value="20">20 minutos</SelectItem>
                                        <SelectItem value="30">30 minutos</SelectItem>
                                        <SelectItem value="45">45 minutos</SelectItem>
                                        <SelectItem value="60">1 hora</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Início do Expediente</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Fim do Expediente</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                />
                            </div>
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
