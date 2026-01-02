'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/app/actions/client-actions";

export function NewClientDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return toast.error("Nome é obrigatório");

        setLoading(true);
        try {
            // We need a server action for creating a client
            const result = await createClient({ name, phone });

            if (result.success) {
                toast.success("Cliente cadastrado com sucesso!");
                setOpen(false);
                setName("");
                setPhone("");
                router.refresh(); // Refresh server components to get new client list
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao cadastrar cliente");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="h-auto p-0 text-xs font-bold text-blue-500">
                    + Novo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-slate-800">
                        <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
                        Novo Cliente Rápido
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Maria Silva"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ex: (11) 99999-9999"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? "Salvando..." : "Cadastrar Cliente"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
