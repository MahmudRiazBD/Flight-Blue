
"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Users } from "lucide-react";
import PackageCard from "@/components/PackageCard";
import { packages as initialPackages, Package } from "@/lib/data";

export default function Home() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        setPackages(JSON.parse(storedPackages));
      }
    }
  }, []);

  const featuredPackages = packages.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Exotic travel destination"
            layout="fill"
            objectFit="cover"
            className="absolute z-0 brightness-50"
            data-ai-hint="exotic travel destination"
          />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
              Your Adventure Awaits
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
              Discover breathtaking destinations and create unforgettable memories with Flight Blu.
            </p>
            <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/packages">
                Explore Packages <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="featured-packages" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              Featured Tours & Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline">
                <Link href="/packages">View All Packages</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              Why Choose Flight Blu?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-headline font-semibold">Expertly-Crafted Tours</h3>
                <p className="mt-2 text-muted-foreground">
                  Each itinerary is meticulously planned by our travel experts for a seamless experience.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-headline font-semibold">Trusted Local Guides</h3>
                <p className="mt-2 text-muted-foreground">
                  Connect with the culture through our network of knowledgeable and friendly local guides.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-headline font-semibold">Secure & Simple Booking</h3>
                <p className="mt-2 text-muted-foreground">
                  Book your dream vacation in minutes with our secure and easy-to-use payment system.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-background">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Ready to Start Your Journey?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Let us help you plan the trip of a lifetime. Our travel experts are here to assist you every step of the way.
              </p>
              <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                 <Link href="/packages">
                    Contact Us Today
                 </Link>
              </Button>
           </div>
        </section>

      </main>
    </div>
  );
}
