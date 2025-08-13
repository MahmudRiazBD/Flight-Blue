

import { Inter } from "next/tree/node_modules/@next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import Chatbot from "@/components/chatbot/Chatbot";
import { AuthProvider } from "@/hooks/use-auth.tsx";
import ContactForm from "@/components/ContactForm";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import type { Metadata } from 'next';

const defaultSettings = {
    siteTitle: "TripMate",
    faviconUrl: "/favicon.ico",
    searchEngineVisibility: true,
};

// This function generates metadata dynamically on the server.
export async function generateMetadata(): Promise<Metadata> {
  let settings = defaultSettings;
  try {
    const db = getFirestore(getFirebaseApp());
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    if (settingsDoc.exists()) {
      settings = { ...defaultSettings, ...settingsDoc.data() };
    }
  } catch (error) {
    console.error("Could not fetch settings for metadata, using defaults.", error);
  }
  
  return {
    title: settings.siteTitle,
    icons: {
      icon: settings.faviconUrl,
    },
    robots: {
      index: settings.searchEngineVisibility,
      follow: settings.searchEngineVisibility,
    }
  };
}


const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  const { settings, loading } = useAppContext();

  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  return (
      <html lang="en" suppressHydrationWarning>
      <head>
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
        </AuthProvider>
      </body>
    </html>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <SiteLayout>{children}</SiteLayout>
    </AppProvider>
  )
}
