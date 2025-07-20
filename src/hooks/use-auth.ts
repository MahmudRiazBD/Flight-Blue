
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'flight-blu-auth';

type AuthState = {
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, isAdmin: false });
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        setAuth(JSON.parse(storedAuth));
      }
    } catch (error) {
        console.error("Failed to read auth state from localStorage", error);
    }
  }, []);

  const login = (isAdmin: boolean) => {
    const authState = { isLoggedIn: true, isAdmin };
    try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
        setAuth(authState);
    } catch (error) {
        console.error("Failed to save auth state to localStorage", error);
    }
  };

  const logout = useCallback(() => {
    const authState = { isLoggedIn: false, isAdmin: false };
    try {
        localStorage.removeItem(AUTH_KEY);
        setAuth(authState);
        router.push('/');
        // We might not need a full refresh if components react to state change
        // but it can help ensure consistency.
        setTimeout(() => router.refresh(), 100);
    } catch (error) {
        console.error("Failed to remove auth state from localStorage", error);
    }
  }, [router]);

  return { ...auth, login, logout };
}
