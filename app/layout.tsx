import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/contexts/GlobalContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ontune APM - Application Performance Monitoring",
  description: "Real-time APM monitoring dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <GlobalProvider>
          <NavigationProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar />
              {children}
            </div>
          </NavigationProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}


