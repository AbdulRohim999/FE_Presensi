import { PageRefresh } from "@/components/PageRefresh";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/contexts/theme-context";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Presensi",
  description: "Sistem Presensi Digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <PageRefresh />
            {children}
            <Toaster richColors position="top-center" closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
