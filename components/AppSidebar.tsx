"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Calendar,
    Users,
    FileText,
    DollarSign,
    Settings,
    Scissors,
    LayoutDashboard,
    LogOut,
    Menu,
    ChevronDown,
    ChevronRight,
    PieChart,
    BarChart3,
    Activity,
    Wallet,
    Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { handleSignOut } from "@/app/lib/actions";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
        subItems: [
            { label: "Padrão", href: "/", icon: Activity },
            { label: "Financeiro", href: "/dashboard/financial", icon: Wallet },
            { label: "Agenda/Vendas", href: "/dashboard/stats-agenda", icon: BarChart3 },
            { label: "Financeiro Gráfico", href: "/dashboard/stats-financial", icon: PieChart },
        ]
    },
    {
        label: "Agenda",
        icon: Calendar,
        href: "/agenda",
        color: "text-violet-500",
    },
    {
        label: "Clientes",
        icon: Users,
        href: "/clients",
        color: "text-pink-700",
    },
    {
        label: "Orçamentos",
        icon: Calculator,
        href: "/budgets",
        color: "text-blue-500",
    },
    {
        label: "Serviços",
        icon: Scissors,
        href: "/services",
        color: "text-orange-700",
    },
    {
        label: "Financeiro",
        icon: DollarSign,
        href: "/financial",
        color: "text-emerald-500",
        subItems: [
            { label: "Lançamentos", href: "/financial/transactions", icon: FileText },
            { label: "Meus Caixas", href: "/financial/cash-registers", icon: Wallet },
            { label: "Categorias", href: "/financial/categories", icon: LayoutDashboard },
            { label: "Contas", href: "/financial/accounts", icon: Wallet },
            { label: "Formas de Pagamento", href: "/financial/payment-methods", icon: DollarSign },
        ]
    },
    {
        label: "Relatórios",
        icon: FileText,
        href: "/reports",
        color: "text-blue-400",
    },
    {
        label: "Equipe",
        icon: Settings,
        href: "/team",
        color: "text-gray-500",
    },
];

function SidebarItem({ route, pathname }: { route: any, pathname: string }) {
    const hasSubItems = route.subItems && route.subItems.length > 0;
    const [isOpen, setIsOpen] = useState(false);
    const isActive = pathname === route.href || route.subItems?.some((s: any) => s.href === pathname);

    return (
        <div className="space-y-1">
            <div
                onClick={() => hasSubItems ? setIsOpen(!isOpen) : null}
                className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                    isActive && !hasSubItems ? "text-white bg-white/10" : "text-zinc-400"
                )}
            >
                {hasSubItems ? (
                    <div className="flex items-center flex-1">
                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                        {route.label}
                        {isOpen ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronRight className="h-4 w-4 ml-auto" />}
                    </div>
                ) : (
                    <Link href={route.href} className="flex items-center flex-1">
                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                        {route.label}
                    </Link>
                )}
            </div>
            {hasSubItems && isOpen && (
                <div className="pl-8 space-y-1">
                    {route.subItems?.map((sub: any) => (
                        <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                                "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === sub.href ? "text-white bg-white/10" : "text-zinc-500"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <sub.icon className="h-4 w-4 mr-3" />
                                {sub.label}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Logo placeholder */}
                        <div className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-full w-full h-full animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        Sara Estética
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <SidebarItem key={route.href} route={route} pathname={pathname} />
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <form action={handleSignOut}>
                    <button className="flex items-center w-full p-3 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition text-sm font-medium cursor-pointer">
                        <LogOut className="h-5 w-5 mr-3" />
                        Sair do Sistema
                    </button>
                </form>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#111827]">
                <AppSidebar />
            </SheetContent>
        </Sheet>
    )
}
