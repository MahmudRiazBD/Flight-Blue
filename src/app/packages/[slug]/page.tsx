"use client"

import { useState, useEffect } from 'react';
import { Package } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import PackageDetailClient from "./PackageDetailClient";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function PackageDetailPage() {
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined); // undefined: loading, null: not found
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    const fetchPackage = async () => {
        if (!slug) return;
        const db = getFirestore(getFirebaseApp());
        const packagesRef = collection(db, 'packages');
        const q = query(packagesRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setPkg({ id: doc.id, ...doc.data() } as Package);
        } else {
            setPkg(null);
        }
    };
    
    fetchPackage();
    
  }, [slug]);

  if (pkg === undefined) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <div className="container mx-auto grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-8 w-1/3 mt-8" />
                    <Skeleton className="h-12 w-full" />
                     <Skeleton className="h-12 w-full" />
                </div>
                <div className="col-span-1 space-y-4">
                     <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (pkg === null) {
    notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
