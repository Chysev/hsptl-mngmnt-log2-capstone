import type { Metadata } from "next";

import "../globals.css";
import { Lato } from "next/font/google";
import useToken from "@/hooks/use-token";
import QueryProvider from "@/hooks/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { TokenProvider } from "@/context/TokenProvider";

const lato = Lato({ subsets: ["latin"], weight: "400" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Generated by create next nexus app",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const Token = useToken();
  const { sessionToken } = Token as { sessionToken: string };

  return (
    <html lang="en">
      <body className={`${lato.className}`}>
        <QueryProvider>

          <TokenProvider sessionToken={sessionToken}>
            <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-background">
              <Sidebar />
              <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
              </div>
            </div>
            <Toaster />
          </TokenProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
