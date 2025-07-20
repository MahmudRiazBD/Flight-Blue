
"use client";

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

interface AppContextType {
  isContactFormOpen: boolean;
  setContactFormOpen: Dispatch<SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isContactFormOpen, setContactFormOpen] = useState(false);

  return (
    <AppContext.Provider value={{ isContactFormOpen, setContactFormOpen }}>
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
