import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Acme Salary Management",
  description: "HR salary management for 10,000 employees across multiple countries",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-svh overflow-hidden`}
      suppressHydrationWarning
    >
      <body className="antialiased fixed inset-0 h-svh w-full overflow-hidden flex flex-col overscroll-none">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <NextTopLoader showSpinner={false} zIndex={99999} />
            <SidebarProvider className="flex-1 min-h-0 overflow-hidden">
              <AppSidebar />
              <SidebarInset className="min-h-0">
                <SiteHeader />
                <div className="flex flex-col flex-1 min-w-0 min-h-0 bg-background h-full">
                  <main className="flex-1 overflow-y-auto flex flex-col min-w-0 min-h-0 relative">
                    {children}
                  </main>
                </div>
              </SidebarInset>
              <Toaster />
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
