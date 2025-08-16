
"use client";

import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chatbot/Chatbot";
import ContactForm from "@/components/ContactForm";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import React from "react";

export default function SiteLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useAppContext();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
      >
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
        <ContactForm />
    </div>
  );
}
