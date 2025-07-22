
"use client";

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import type { GlobalSettings } from '@/app/admin/settings/page';


// Default settings as a fallback
const defaultSettings: GlobalSettings = {
    siteTitle: "Flight Blu",
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.ico",
    heroImageUrl: "https://placehold.co/1920x1080.png",
    heroTitle: "Your Adventure Awaits",
    heroSubtitle: "Discover breathtaking destinations and create unforgettable memories with Flight Blu.",
    heroButtonLabel: "Explore Packages",
    heroButtonLink: "/packages",
    footerDescription: "Your adventure starts here. Discover breathtaking destinations with us.",
    quickLinks: {
        title: "Quick Links",
        links: []
    },
    supportLinks: {
        title: "Support",
        links: []
    },
    socialLinks: [],
    googleMapEmbedCode: ''
};

interface AppContextType {
  isContactFormOpen: boolean;
  setContactFormOpen: Dispatch<SetStateAction<boolean>>;
  settings: GlobalSettings | null;
  setSettings: Dispatch<SetStateAction<GlobalSettings | null>>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isContactFormOpen, setContactFormOpen] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const db = getFirestore(getFirebaseApp());
            const settingsDoc = await getDoc(doc(db, "settings", "global"));
            if (settingsDoc.exists()) {
                setSettings(settingsDoc.data() as GlobalSettings);
            } else {
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error("Error fetching global settings:", error);
            setSettings(defaultSettings); // Fallback on error
        } finally {
            setLoading(false);
        }
    };
    
    fetchSettings();
  }, []);

  return (
    <AppContext.Provider value={{ isContactFormOpen, setContactFormOpen, settings, setSettings, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
