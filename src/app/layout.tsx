import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- INI WAJIB ADA! (Pastikan titiknya satu: ./)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuperPDF - All in One Tool",
  description: "Manage your PDF files easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}