"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/app/actions/team-actions";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    createdAt: Date;
}

interface TeamPageClientProps {
    initialTeam: any[];
}

const AVAILABLE_PERMISSIONS = [
    { id: "calendar", label: "Agenda" },
    { id: "financial", label: "Financeiro" },
    { id: "clients", label: "Clientes" },
    { id: "sales", label: "Vendas e Orçamentos" },
    { id: "reports", label: "Relatórios" },
    { id: "settings", label: "Configurações" },
];

export default function TeamPageClient({ initialTeam }: TeamPageClientProps) {
    const [team, setTeam] = useState<TeamMember[]>(initialTeam as TeamMember[]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("PROFESSIONAL");
    const [permissions, setPermissions] = useState<string[]>([]);

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("PROFESSIONAL");
        setPermissions([]);
        setEditingMember(null);
    };

    const handleOpenDialog = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setName(member.name);
            setEmail(member.email);
            setRole(member.role);
            setPermissions(member.permissions || []);
            setPassword(""); // Don't show password on edit
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handlePermissionToggle = (permId: string) => {
        setPermissions(current =>
            current.includes(permId)
                ? current.filter(p => p !== permId)
                : [...current, permId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If ADMIN, force all permissions implicitly or explicitly
        // Logic handled in Backend, but for UI consistency let's just send what we have.
        // Actually, if role is ADMIN, backend/sidebar logic grants full access regardless of permissions array.

        if (editingMember) {
            const res = await updateTeamMember(editingMember.id, { name, email, role, permissions });
            if (res.success) {
                setTeam(team.map(m => m.id === editingMember.id ? { ...m, name, email, role, permissions } : m));
                toast.success("Membro atualizado!");
                setIsDialogOpen(false);
            } else {
                toast.error(res.error);
            }
        } else {
            const res = await createTeamMember({ name, email, password, role, permissions });
            if (res.success) {
                toast.success("Membro criado!");
                window.location.reload();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Deseja realmente excluir este membro da equipe?")) {
            const res = await deleteTeamMember(id);
            if (res.success) {
                setTeam(team.filter(m => m.id !== id));
                toast.success("Membro excluído!");
            } else {
                toast.error(res.error);
            }
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Equipe</h2>
                    <p className="text-muted-foreground">Gerencie os profissionais e permissões de acesso.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Membro
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Profissional</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Cargo/Role</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {team.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium flex items-center">
                                        <div className="p-2 bg-slate-100 rounded-full mr-3">
                                            <UserCircle className="h-4 w-4 text-slate-500" />
                                        </div>
                                        {member.name}
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-semibold mr-2">
                                            {member.role === 'ADMIN' ? 'Administrador' :
                                                member.role === 'RECEPTIONIST' ? 'Recepcionista' : 'Profissional'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(member)}>
                                            <Pencil className="h-4 w-4 text-sky-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingMember ? "Editar Membro" : "Novo Membro da Equipe"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Dra. Ana Paula" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email de Acesso</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@estetica.com" required />
                            </div>
                        </div>

                        {!editingMember && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha Inicial</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="role">Cargo</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador (Acesso Total)</SelectItem>
                                    <SelectItem value="PROFESSIONAL">Profissional / Esteticista</SelectItem>
                                    <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {role !== 'ADMIN' && (
                            <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
                                <Label>Permissões de Acesso</Label>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    {AVAILABLE_PERMISSIONS.map((perm) => (
                                        <div key={perm.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`perm-${perm.id}`}
                                                checked={permissions.includes(perm.id)}
                                                onCheckedChange={() => handlePermissionToggle(perm.id)}
                                            />
                                            <Label htmlFor={`perm-${perm.id}`} className="font-normal cursor-pointer">
                                                {perm.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Selecione quais áreas do sistema este usuário poderá acessar no menu lateral.
                                </p>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">{editingMember ? "Salvar Alterações" : "Criar Acesso"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
