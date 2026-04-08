import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

/**
 * Material Symbols — só os ícones realmente usados no app.
 * Cortar a font de ~30KB → ~3KB elimina o blocking de paint.
 *
 * IMPORTANTE: ao adicionar um novo `<Icon name="..." />`, inclua o
 * nome aqui também, senão ele renderiza como texto literal.
 */
const MATERIAL_ICON_NAMES = [
  // Navegação
  'dashboard', 'home', 'receipt_long', 'group', 'history_edu', 'settings', 'menu',
  // Ações
  'add', 'search', 'send_money', 'assignment_add', 'open_in_new', 'chevron_right',
  // Status
  'check_circle', 'warning', 'schedule', 'verified', 'trending_up', 'trending_down',
  // Header / pessoa
  'notifications', 'help', 'person', 'badge', 'qr_code_2', 'payments', 'account_balance',
  'more_horiz',
  // Datas
  'calendar_today', 'calendar_month',
  // Categorias de serviço (lib/service-icons.ts)
  'local_shipping', 'electric_bolt', 'plumbing', 'brush', 'construction',
  'cleaning_services', 'agriculture', 'handyman',
].join(',')

const MATERIAL_SYMBOLS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' +
  `&icon_names=${MATERIAL_ICON_NAMES}` +
  '&display=block'

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "flex9pag — Gestão de Pagamentos MEI",
  description:
    "Registre seus serviços, cobre seus clientes e emita notas fiscais em 3 toques.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect ao CDN das fontes — economiza ~150ms na 1ª request */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols Outlined — sub-set apenas com os ícones usados
            (~3KB em vez de ~30KB). display=block é seguro porque a font
            é pequena o suficiente para não bloquear paint perceptível. */}
        <link rel="stylesheet" href={MATERIAL_SYMBOLS_URL} />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
