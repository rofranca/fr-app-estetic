"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { createRoom, deleteRoom, getRooms } from "@/app/actions/room-actions";

export function RoomsManager() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [newRoomName, setNewRoomName] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchRooms = async () => {
        const result = await getRooms();
        if (result.success) {
            setRooms(result.rooms || []);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAddRoom = async () => {
        if (!newRoomName.trim()) return;
        setLoading(true);
        try {
            const result = await createRoom({ name: newRoomName });
            if (result.success) {
                toast.success("Sala criada com sucesso!");
                setNewRoomName("");
                fetchRooms();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao criar sala");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta sala?")) return;
        try {
            const result = await deleteRoom(id);
            if (result.success) {
                toast.success("Sala removida!");
                fetchRooms();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao remover sala");
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm mt-6">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-slate-800">
                    <DoorOpen className="w-5 h-5 mr-2 text-blue-500" />
                    Gerenciamento de Salas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Label htmlFor="roomName" className="sr-only">Nome da Sala</Label>
                        <Input
                            id="roomName"
                            placeholder="Nome da Sala (ex: Sala Laser, Sala 01)"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddRoom} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome da Sala</TableHead>
                                <TableHead className="w-[100px] text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                                        Nenhuma sala cadastrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteRoom(room.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
