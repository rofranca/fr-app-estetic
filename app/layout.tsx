import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FR APP ESTETIC - Sara Estética",
  description: "Sistema de Gestão para Clínicas de Estética",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="h-full relative">
          <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
            <AppSidebar />
          </div>
          <main className="md:pl-72">
            <Header />
            {children}
            <Toaster />
          </main>
        </div>
      </body>
    </html>
  );
}
