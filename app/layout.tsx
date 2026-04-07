import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "flex9pag — Gestão de Pagamentos MEI",
  description: "Registre seus serviços, cobre seus clientes e emita notas fiscais em 3 toques.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
