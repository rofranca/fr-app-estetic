"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createCalendarBlock } from "@/app/actions/appointment-actions";

interface BlockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    defaultDate: Date | null;
}

export function BlockDialog({ isOpen, onClose, defaultDate }: BlockDialogProps) {
    const [startTime, setStartTime] = useState(defaultDate ? defaultDate.toISOString().slice(0, 16) : "");
    const [endTime, setEndTime] = useState(defaultDate ? new Date(defaultDate.getTime() + 60 * 60000).toISOString().slice(0, 16) : "");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!startTime || !endTime) {
            toast.error("Preencha os horários");
            return;
        }

        setLoading(true);
        try {
            const result = await createCalendarBlock({
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                reason
            });

            if (result.success) {
                toast.success("Bloqueio criado com sucesso!");
                onClose();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao criar bloqueio");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bloquear Horário</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right">
                            Início
                        </Label>
                        <Input
                            id="start"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right">
                            Fim
                        </Label>
                        <Input
                            id="end"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                            Motivo
                        </Label>
                        <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Feriado, Manutenção"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading} variant="destructive">
                        {loading ? "Bloqueando..." : "Bloquear"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
