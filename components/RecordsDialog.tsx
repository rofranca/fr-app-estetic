'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createRecord, getClientRecords, deleteRecord } from "@/app/actions/record-actions";
import { ClipboardList, Plus, Trash2, Camera, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecordsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    client: { id: string, name: string };
}

export function RecordsDialog({ isOpen, onClose, client }: RecordsDialogProps) {
    const [records, setRecords] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && client.id) {
            loadRecords();
        }
    }, [isOpen, client.id]);

    const loadRecords = async () => {
        const data = await getClientRecords(client.id);
        setRecords(data);
    };

    const handleSubmit = async () => {
        if (!content) return toast.error("Escreva a evolução do paciente.");
        setLoading(true);
        const res = await createRecord({
            clientId: client.id,
            content,
            photos: [] // Placeholder for photos
        });
        setLoading(false);
        if (res.success) {
            toast.success("Prontuário salvo!");
            setContent("");
            setIsAdding(false);
            loadRecords();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja excluir este registro?")) return;
        const res = await deleteRecord(id);
        if (res.success) {
            toast.success("Registro excluído.");
            loadRecords();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <ClipboardList className="mr-2 h-5 w-5 text-blue-500" />
                        Prontuário Digital - {client.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
                    {isAdding ? (
                        <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                            <Label className="text-blue-800 font-semibold text-sm">Nova Evolução / Procedimento</Label>
                            <Textarea
                                placeholder="Descreva o tratamento realizado hoje, produtos usados, reações, etc..."
                                className="min-h-[120px] bg-white"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" className="text-xs">
                                    <Camera className="h-4 w-4 mr-2" /> Adicionar Fotos (Breve)
                                </Button>
                                <div className="space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
                                    <Button size="sm" onClick={handleSubmit} disabled={loading} className="bg-blue-600">
                                        {loading ? "Salvando..." : "Salvar Registro"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Button
                            className="w-full border-dashed border-2 h-16 text-blue-600 bg-blue-50/30 hover:bg-blue-50"
                            variant="outline"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Novo Registro de Evolução
                        </Button>
                    )}

                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Histórico de Evoluções</h3>
                        {records.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-lg">
                                <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Nenhum histórico registrado para este cliente.</p>
                            </div>
                        ) : records.map((record) => (
                            <div key={record.id} className="p-4 border rounded-lg space-y-3 hover:border-blue-200 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {format(new Date(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(record.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {record.content}
                                </p>
                                {record.photos && record.photos.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 pt-2">
                                        {record.photos.map((url: string, i: number) => (
                                            <img key={i} src={url} className="rounded aspect-square object-cover border" alt={`Foto ${i + 1}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
