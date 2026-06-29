import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ACME Salary Management",
  description: "HR salary management for 10,000 employees across multiple countries",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
          </div>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
