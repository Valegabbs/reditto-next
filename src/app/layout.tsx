import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reditto",
  description: "Plataforma de correção de redações",
  icons: {
    icon: [
      { url: '/logo reditto.png?v=2', type: 'image/png' },
    ],
    shortcut: ['/logo reditto.png?v=2'],
    apple: ['/logo reditto.png?v=2'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
