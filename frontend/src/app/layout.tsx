import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Acme Salary Management",
  description: "HR salary management for 10,000 employees across multiple countries",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
