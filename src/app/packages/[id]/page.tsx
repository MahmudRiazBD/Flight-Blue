
"use client"

import { useState, useEffect } from 'react';
import { packages as initialPackages, Package } from "@/lib/data";
import { notFound } from "next/navigation";
import PackageDetailClient from "./PackageDetailClient";

type Props = {
  params: { id: string };
};

export default function PackageDetailPage({ params }: Props) {
  const [packages, setPackages] = useState<Package[]>(initialPackages);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        setPackages(JSON.parse(storedPackages));
      }
    }
  }, []);

  const pkg = packages.find((p) => p.id === params.id);

  if (!pkg) {
    // We need to wait for the state to be updated
    // A loading state would be better, but for now, we'll just return null
    // until the package is found or we're sure it doesn't exist.
    if (typeof window === 'undefined') {
       return null; // Don't call notFound on server, wait for client
    }
    // A better implementation would show a loading skeleton here
    return <div>Loading...</div>;
  }
  
  if (!pkg && typeof window !== 'undefined' && localStorage.getItem('packages')) {
      notFound();
  }


  return <PackageDetailClient pkg={pkg} />;
}
