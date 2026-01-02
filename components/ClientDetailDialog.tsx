'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateClient, deleteClient } from "@/app/actions/client-actions";
import { Trash2, Save, X, RotateCcw } from "lucide-react";

interface ClientDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    client: any;
}

export function ClientDetailDialog({ isOpen, onClose, client }: ClientDetailDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (client) {
            setFormData({
                ...client,
                birthDate: client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : ""
            });
        }
    }, [client]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCepBlur = async () => {
        const cep = formData.cep?.replace(/\D/g, "");
        if (cep?.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData((prev: any) => ({
                        ...prev,
                        address: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (err) {
                console.error("CEP fetch error:", err);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const dataToSave = {
            ...formData,
            birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
            clientCredit: Number(formData.clientCredit) || 0
        };

        // Remove calculated or unwanted fields
        delete dataToSave.id;
        delete dataToSave.createdAt;
        delete dataToSave.updatedAt;
        delete dataToSave.appointments;
        delete dataToSave.records;
        delete dataToSave.contracts;
        delete dataToSave.transactions;
        delete dataToSave.packages;

        const res = await updateClient(client.id, dataToSave);
        setLoading(false);

        if (res.success) {
            toast.success("Dados do cliente atualizados!");
            onClose();
            window.location.reload();
        } else {
            toast.error(res.error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Deseja realmente excluir o cadastro de ${client.name}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        setLoading(true);
        const res = await deleteClient(client.id);
        setLoading(false);

        if (res.success) {
            toast.success("Cliente excluído com sucesso.");
            onClose();
            window.location.reload();
        } else {
            toast.error(res.error);
        }
    };


    if (!formData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle>Editar Cliente: {client.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input name="name" value={formData.name || ""} onChange={handleInput} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select name="status" value={formData.status || "ATIVO"} onChange={handleInput} className="w-full border rounded-md p-2 text-sm bg-white">
                                <option value="ATIVO">Ativo</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>CPF / CNPJ</Label>
                            <Input name="cpf" value={formData.cpf || ""} onChange={handleInput} />
                        </div>
                        <div className="space-y-2">
                            <Label>RG</Label>
                            <Input name="rg" value={formData.rg || ""} onChange={handleInput} />
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Nascimento</Label>
                            <Input name="birthDate" type="date" value={formData.birthDate || ""} onChange={handleInput} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Celular (WhatsApp)</Label>
                            <Input name="phone" value={formData.phone || ""} onChange={handleInput} />
                        </div>
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input name="email" type="email" value={formData.email || ""} onChange={handleInput} />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-sm text-slate-500 uppercase">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>CEP</Label>
                                <Input name="cep" value={formData.cep || ""} onChange={handleInput} onBlur={handleCepBlur} />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Rua / Logradouro</Label>
                                <Input name="address" value={formData.address || ""} onChange={handleInput} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Número</Label>
                                <Input name="number" value={formData.number || ""} onChange={handleInput} />
                            </div>
                            <div className="space-y-2">
                                <Label>Complemento</Label>
                                <Input name="complement" value={formData.complement || ""} onChange={handleInput} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bairro</Label>
                                <Input name="neighborhood" value={formData.neighborhood || ""} onChange={handleInput} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cidade</Label>
                                <Input name="city" value={formData.city || ""} onChange={handleInput} />
                            </div>
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Input name="state" value={formData.state || ""} onChange={handleInput} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Ponto de Referência</Label>
                            <Input name="referencePoint" value={formData.referencePoint || ""} onChange={handleInput} />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-sm text-slate-500 uppercase">Informações Adicionais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Como nos Conheceu?</Label>
                                <select name="referralSource" value={formData.referralSource || "NAO_INFORMADO"} onChange={handleInput} className="w-full border rounded-md p-2 text-sm bg-white">
                                    <option value="NAO_INFORMADO">Não Informado</option>
                                    <option value="AMIGOS">Amigos</option>
                                    <option value="INSTAGRAM">Instagram</option>
                                    <option value="GOOGLE">Google</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="FOLDER">Folder</option>
                                    <option value="PASSANTE">Passante</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Crédito Atual (R$)</Label>
                                <Input name="clientCredit" type="number" step="0.01" value={formData.clientCredit || 0} onChange={handleInput} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Observações sobre Crédito</Label>
                            <Input name="creditNotes" value={formData.creditNotes || ""} onChange={handleInput} />
                        </div>
                        <div className="space-y-2">
                            <Label>Observações Gerais</Label>
                            <textarea name="notes" value={formData.notes || ""} onChange={handleInput} className="w-full border rounded-md p-2 text-sm min-h-[80px]" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border-t pt-6">
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={loading}>
                            <Save className="mr-2 h-4 w-4" /> {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete} disabled={loading}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir Cadastro
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
