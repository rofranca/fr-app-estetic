'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticate } from '@/app/lib/actions';
import { toast } from 'sonner';
import { useState } from 'react';

export default function LoginForm() {
    const [errorMessage, setErrorMessage] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        setErrorMessage('');
        try {
            const result = await authenticate(undefined, formData);
            if (result) {
                setErrorMessage(result);
                toast.error(result);
            }
        } catch (e) {
            toast.error("Erro inesperado. Tente novamente.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="******"
                    required
                    minLength={6}
                />
            </div>
            {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
            )}
            <Button type="submit" className="w-full" aria-disabled={isPending}>
                {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
        </form>
    );
}
