import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth.tsx";
import { AppProvider } from "@/context/AppContext";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import type { Metadata } from 'next';
import SiteLayoutClient from "@/components/layout/SiteLayoutClient";

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
      const data = settingsDoc.data();
      settings = { 
        ...defaultSettings, 
        siteTitle: data.siteTitle || defaultSettings.siteTitle,
        faviconUrl: data.faviconUrl || defaultSettings.faviconUrl,
        searchEngineVisibility: data.searchEngineVisibility ?? defaultSettings.searchEngineVisibility,
      };
    }
  } catch (error) {
    console.error("Could not fetch settings for metadata, using defaults.", error);
  }
  
  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle}`,
    },
    icons: {
      icon: settings.faviconUrl,
    },
    robots: {
      index: settings.searchEngineVisibility,
      follow: settings.searchEngineVisibility,
    }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body>
        <AppProvider>
            <AuthProvider>
                <SiteLayoutClient>
                    {children}
                </SiteLayoutClient>
                <Toaster />
            </AuthProvider>
        </AppProvider>
      </body>
    </html>
  )
}
