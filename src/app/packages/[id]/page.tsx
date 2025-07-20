
"use client"

import { useState, useEffect } from 'react';
import { packages as initialPackages, Package } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import PackageDetailClient from "./PackageDetailClient";

// Although the page is a client component, the props are passed from the server-side router.
// We'll use the useParams hook for client-side parameter access to be safe.
export default function PackageDetailPage() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined); // undefined: loading, null: not found
  const params = useParams();
  const packageId = params.id as string;

  useEffect(() => {
    // Load packages from localStorage on the client side
    const storedPackages = localStorage.getItem('packages');
    let currentPackages = initialPackages;
    if (storedPackages) {
      try {
        currentPackages = JSON.parse(storedPackages);
      } catch (e) {
        console.error("Failed to parse packages from localStorage", e);
      }
    }
    setPackages(currentPackages);
    
    // Find the specific package
    const foundPkg = currentPackages.find((p) => p.id === packageId);
    setPkg(foundPkg || null); // Set to null if not found
    
  }, [packageId]); // Rerun effect if packageId changes

  if (pkg === undefined) {
    // A better implementation would show a loading skeleton here
    return <div>Loading...</div>;
  }

  if (pkg === null) {
    // If we've finished loading and pkg is still null, then it's not found.
    notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
