
"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import Chatbot from "@/components/chatbot/Chatbot";
import { AuthProvider } from "@/hooks/use-auth.tsx";
import { usePathname } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import { AppProvider } from "@/context/AppContext";

// Metadata cannot be exported from a "use client" file, 
// so we define it here and then use it in the component.
export const metadataConfig: Metadata = {
  title: "Flight Blu",
  description: "Your adventure starts here.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{String(metadataConfig.title)}</title>
        <meta name="description" content={String(metadataConfig.description)} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
      >
        <AuthProvider>
          <AppProvider>
            {isAdminRoute ? (
              <div className="relative flex min-h-screen flex-col">
                {children}
              </div>
            ) : (
              <>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Chatbot />
              </>
            )}
            <Toaster />
            <ContactForm />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
