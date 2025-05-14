import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart-context";
import ClientCartButtonWrapper from "./ClientCartButtonWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feria Americana Valeria",
  description: "Venta de ropa nueva y usada.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <div className="relative min-h-screen">
            <div className="fixed top-4 right-4 z-50">
              <ClientCartButtonWrapper />
            </div>
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
