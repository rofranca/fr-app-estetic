"use client";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ClientSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (clientId: string) => void;
    clients: { id: string, name: string }[];
    selectedId?: string;
}

export function ClientSearchDialog({ isOpen, onClose, onSelect, clients, selectedId }: ClientSearchDialogProps) {
    return (
        <CommandDialog open={isOpen} onOpenChange={onClose}>
            <CommandInput placeholder="Digite o nome do cliente..." />
            <CommandList>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup heading="Clientes">
                    {clients.map((client) => (
                        <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                                onSelect(client.id);
                                onClose();
                            }}
                        >
                            <User className="mr-2 h-4 w-4 opacity-50" />
                            <span>{client.name}</span>
                            {selectedId === client.id && (
                                <Check className="ml-auto h-4 w-4" />
                            )}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
