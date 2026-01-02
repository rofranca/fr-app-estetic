'use client';

import { useState } from "react";
import {
    ShoppingCart,
    Plus,
    Trash2,
    User,
    CreditCard,
    Check,
    X,
    DollarSign,
    Calendar,
    Wallet,
    Tag,
    AlertCircle,
    Percent,
    Briefcase,
    Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createSale } from "@/app/actions/sales-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { SalesHistory } from "@/components/SalesHistory";

import { NewClientDialog } from "./NewClientDialog";

interface SalesPageClientProps {
    clients: any[];
    services: any[];
    paymentMethods: any[];
    accounts: any[];
    team: any[];
    todaySales: any[];
    todaySummary: any;
    organization: any;
}

interface CartItem {
    id: string;
    serviceId: string;
    serviceName: string;
    quantity: number;
    pricePerSession: number;
    total: number;
}

export default function SalesPageClient({
    clients,
    services,
    paymentMethods,
    accounts,
    team,
    todaySales,
    todaySummary,
    organization
}: SalesPageClientProps) {
    const [selectedClientId, setSelectedClientId] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [currentServiceId, setCurrentServiceId] = useState("");
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [paymentMethodId, setPaymentMethodId] = useState("");
    const [installments, setInstallments] = useState(1);
    const [paidNow, setPaidNow] = useState(false);
    const [accountId, setAccountId] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // New states
    const [sellerId, setSellerId] = useState("");
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<string>("FIXED"); // FIXED or PERCENTAGE
    const [couponCode, setCouponCode] = useState("");

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleServiceChange = (serviceId: string) => {
        setCurrentServiceId(serviceId);
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setCurrentPrice(Number(service.price));
        }
    };

    const addToCart = () => {
        if (!currentServiceId) return toast.error("Selecione um serviço");
        if (currentQuantity <= 0) return toast.error("Quantidade inválida");

        const service = services.find(s => s.id === currentServiceId);
        if (!service) return;

        const newItem: CartItem = {
            id: Math.random().toString(36).substr(2, 9),
            serviceId: currentServiceId,
            serviceName: service.name,
            quantity: currentQuantity,
            pricePerSession: currentPrice,
            total: currentQuantity * currentPrice
        };

        setCart([...cart, newItem]);
        setCurrentServiceId("");
        setCurrentQuantity(1);
        setCurrentPrice(0);
        toast.success("Serviço adicionado ao carrinho!");
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const subTotalAmount = cart.reduce((acc, item) => acc + item.total, 0);

    // Calculate discount amount
    let discountAmount = 0;
    if (discount > 0) {
        if (discountType === 'PERCENTAGE') {
            discountAmount = (subTotalAmount * discount) / 100;
        } else {
            discountAmount = discount;
        }
    }

    const totalAmount = Math.max(0, subTotalAmount - discountAmount);
    const installmentValue = installments > 0 ? totalAmount / installments : 0;

    const handleFinalizeSale = async () => {
        if (!selectedClientId) return toast.error("Selecione um cliente");
        if (cart.length === 0) return toast.error("Adicione pelo menos um serviço");
        if (!paymentMethodId) return toast.error("Selecione a forma de pagamento");
        if (paidNow && !accountId) return toast.error("Selecione a conta de recebimento");

        setLoading(true);
        try {
            const result = await createSale({
                clientId: selectedClientId,
                items: cart.map(item => ({
                    serviceId: item.serviceId,
                    quantity: item.quantity,
                    pricePerSession: item.pricePerSession
                })),
                paymentMethodId,
                installments,
                paidNow,
                accountId: paidNow ? accountId : undefined,
                sellerId: sellerId || undefined,
                discount,
                discountType,
                couponCode: couponCode || undefined
            });

            if (result.success) {
                toast.success(result.message);
                // Reset form
                setSelectedClientId("");
                setCart([]);
                setPaymentMethodId("");
                setInstallments(1);
                setPaidNow(false);
                setAccountId("");
                setSearchTerm("");
                setSellerId("");
                setDiscount(0);
                setDiscountType("FIXED");
                setCouponCode("");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao finalizar venda");
        } finally {
            setLoading(false);
        }
    };

    const clearSale = () => {
        setSelectedClientId("");
        setCart([]);
        setPaymentMethodId("");
        setInstallments(1);
        setPaidNow(false);
        setAccountId("");
        setSearchTerm("");
        setSellerId("");
        setDiscount(0);
        setDiscountType("FIXED");
        setCouponCode("");
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center tracking-tight">
                        <ShoppingCart className="mr-3 h-8 w-8 text-green-600" />
                        Nova Venda
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Registre vendas e gere lançamentos financeiros automaticamente</p>
                </div>
                <div className="flex space-x-3">
                    <SalesHistory sales={todaySales} summary={todaySummary} organization={organization} />
                    <Button variant="outline" onClick={clearSale} className="h-12 px-6 rounded-2xl font-bold border-slate-200">
                        <X className="mr-2 h-5 w-5" /> LIMPAR TUDO
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Client Selection */}
                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-6">
                        <CardTitle className="text-lg flex items-center font-bold">
                            <User className="mr-3 h-5 w-5 text-blue-400" /> Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Buscar Cliente</Label>
                                <NewClientDialog />
                            </div>
                            <Input
                                placeholder="Nome, telefone ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Selecionar</Label>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                    <SelectValue placeholder={searchTerm ? "Selecione na lista..." : "Busque primeiro..."} />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-xl max-h-[300px]">
                                    {filteredClients.length > 0 ? (
                                        filteredClients.slice(0, 50).map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-bold">{client.name}</span>
                                                    <span className="text-xs text-slate-400">{client.phone || client.email || "Sem contato"}</span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-slate-500 text-center">Nenhum cliente encontrado</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedClient && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                <p className="text-xs font-black uppercase text-blue-500 tracking-widest mb-2">Cliente Selecionado</p>
                                <p className="font-bold text-slate-800">{selectedClient.name}</p>
                                {selectedClient.phone && <p className="text-sm text-slate-500">{selectedClient.phone}</p>}
                                {selectedClient.email && <p className="text-sm text-slate-500">{selectedClient.email}</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Column 2: Cart */}
                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-6">
                        <CardTitle className="text-lg flex items-center justify-between font-bold">
                            <span className="flex items-center">
                                <Tag className="mr-3 h-5 w-5 text-green-400" /> Carrinho
                            </span>
                            <Badge className="bg-white/20 text-white px-3 py-1">{cart.length} itens</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-6 space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Serviço</Label>
                                    <Select value={currentServiceId} onValueChange={handleServiceChange}>
                                        <SelectTrigger className="h-10 text-sm border-slate-200 bg-slate-50">
                                            <SelectValue placeholder="Escolha..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200]">
                                            {services.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="text-sm">
                                                    {s.name} - R$ {Number(s.price).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Qtd</Label>
                                    <Input
                                        type="number"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                                        className="h-10 text-sm text-center font-bold border-slate-200 bg-slate-50"
                                    />
                                </div>
                                <div className="col-span-4 space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor</Label>
                                    <Input
                                        type="number"
                                        value={currentPrice}
                                        onChange={(e) => setCurrentPrice(Number(e.target.value))}
                                        className="h-10 text-sm text-right font-bold border-slate-200 bg-slate-50"
                                    />
                                </div>
                            </div>
                            <Button onClick={addToCart} className="w-full h-10 bg-green-600 hover:bg-green-700 font-bold text-sm rounded-xl">
                                <Plus className="mr-2 h-4 w-4" /> ADICIONAR
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                                    <ShoppingCart className="h-16 w-16 opacity-20 mb-3" />
                                    <p className="text-sm font-medium">Carrinho vazio</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 group relative">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="flex flex-col space-y-2">
                                        <p className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">{item.serviceName}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-xs text-slate-500 font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                                                <span>Qtd: {item.quantity}</span>
                                                <span className="mx-1">•</span>
                                                <span>{item.pricePerSession.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                            <span className="text-sm font-black text-green-600">
                                                {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Discount & Seller Section */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                                    <Briefcase className="w-3 h-3 mr-1" /> Vendedor
                                </Label>
                                <Select value={sellerId} onValueChange={setSellerId}>
                                    <SelectTrigger className="h-10 text-sm border-slate-200 bg-slate-50">
                                        <SelectValue placeholder="Selecione o vendedor (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200]">
                                        {team.map(member => (
                                            <SelectItem key={member.id} value={member.id} className="text-sm">
                                                {member.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                                    <Percent className="w-3 h-3 mr-1" /> Desconto
                                </Label>
                                <div className="flex space-x-2">
                                    <Select value={discountType} onValueChange={setDiscountType}>
                                        <SelectTrigger className="w-[100px] h-10 text-sm border-slate-200 bg-slate-50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200]">
                                            <SelectItem value="FIXED">R$ (Fixo)</SelectItem>
                                            <SelectItem value="PERCENTAGE">% (Porc.)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        placeholder="0,00"
                                        value={discount > 0 ? discount : ''}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        className="h-10 text-sm border-slate-200 bg-slate-50 flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center text-slate-400 text-sm mb-1">
                                <span>Subtotal</span>
                                <span>R$ {subTotalAmount.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-rose-500 text-sm mb-2 font-bold">
                                    <span>Desconto</span>
                                    <span>- R$ {discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</span>
                                <span className="text-2xl font-black text-slate-800">
                                    R$ {totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 3: Payment */}
                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-6">
                        <CardTitle className="text-lg flex items-center font-bold">
                            <CreditCard className="mr-3 h-5 w-5 text-emerald-400" /> Pagamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Forma de Pagamento</Label>
                            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                                <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-xl">
                                    {paymentMethods.map(pm => (
                                        <SelectItem key={pm.id} value={pm.id}>
                                            {pm.name} (D+{pm.receiptDays})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Parcelas</Label>
                            <Select value={installments.toString()} onValueChange={(v) => setInstallments(Number(v))}>
                                <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[200] rounded-xl">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                        <SelectItem key={n} value={n.toString()}>
                                            {n}x de R$ {installmentValue.toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <Checkbox
                                id="paidNow"
                                checked={paidNow}
                                onCheckedChange={(checked) => setPaidNow(checked as boolean)}
                            />
                            <Label htmlFor="paidNow" className="text-sm font-bold text-emerald-700 cursor-pointer">
                                Cliente pagou agora
                            </Label>
                        </div>

                        {paidNow && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Conta de Recebimento</Label>
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700">
                                        <SelectValue placeholder="Selecione a conta..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200] rounded-xl">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedPaymentMethod && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-xs font-black uppercase text-blue-500 tracking-widest mb-2">Resumo</p>
                                <div className="space-y-1 text-sm">
                                    <p className="font-bold text-slate-700">
                                        {installments}x de R$ {installmentValue.toFixed(2)}
                                    </p>
                                    <p className="text-slate-500">
                                        Recebimento: D+{selectedPaymentMethod.receiptDays} dias
                                    </p>
                                    {paidNow && (
                                        <p className="text-emerald-600 font-bold flex items-center gap-2 mt-2">
                                            <Check className="h-4 w-4" /> Primeira parcela paga
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleFinalizeSale}
                            disabled={loading || !selectedClientId || cart.length === 0 || !paymentMethodId}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 font-black text-sm rounded-2xl shadow-2xl shadow-emerald-100 uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? "PROCESSANDO..." : "FINALIZAR VENDA"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
