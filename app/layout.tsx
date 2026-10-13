import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090B0D",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "Progressive AutoHub — Admin Panel",
  description: "Admin panel for managing Progressive AutoHub inventory, dealers, finance, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#090B0D] text-white antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
