import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Bricolage_Grotesque } from "next/font/google";
// import { PushNotificationSetup } from "@/components/PushNotificationSetup";
import AuthProvider from "@/components/auth-provider";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "PeduliAnak — Lindungi Masa Depan Anak Indonesia",
    template: "%s | PeduliAnak",
  },
  description:
    "Platform donasi dan pelaporan kasus anak terlantar & kekerasan digital. " +
    "Laporkan kasus, donasi untuk program perlindungan anak, dan bantu ciptakan " +
    "lingkungan aman bagi anak Indonesia.",
  keywords: [
    "perlindungan anak",
    "donasi anak",
    "laporan kekerasan anak",
    "anak terlantar",
    "kekerasan digital anak",
    "peduli anak indonesia",
  ],
  authors: [{ name: "PeduliAnak Team" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "PeduliAnak",
    title: "PeduliAnak — Lindungi Masa Depan Anak Indonesia",
    description:
      "Platform donasi dan pelaporan kasus anak terlantar & kekerasan digital.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PeduliAnak — Platform Perlindungan Anak",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PeduliAnak — Lindungi Masa Depan Anak Indonesia",
    description:
      "Platform donasi dan pelaporan kasus anak terlantar & kekerasan digital.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F172A" },
    { media: "(prefers-color-scheme: dark)", color: "#060912" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${bricolage.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <ChatWidget />
        {/* <PushNotificationSetup /> */}
      </body>
    </html>
  );
}
