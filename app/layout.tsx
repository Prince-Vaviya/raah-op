import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from "../components/DashboardLayout";
import { DataProvider } from "../providers/DataProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Raah - Intelligent Transit Operations",
  description: "Next-generation live map & mission control for urban bus networks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-100 text-slate-900" suppressHydrationWarning>
        <DataProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </DataProvider>
      </body>
    </html>
  );
}

