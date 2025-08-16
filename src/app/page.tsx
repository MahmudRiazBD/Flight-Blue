
"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Users, Loader2, Calendar, User as UserIcon } from "lucide-react";
import PackageCard from "@/components/PackageCard";
import { Package, Post, HomePageSettings } from "@/lib/data";
import { User as UserData } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';

function BlogCard({ post, author }: { post: Post, author?: UserData }) {
    const getAuthorName = () => {
        if (!author) return "Unknown Author";
        const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim();
        if (fullName.length > 15) {
            return `${fullName.substring(0, 15)}...`;
        }
        return fullName || "Unknown Author";
    };
    
    const imageUrl = post.featuredImageUrl || "https://placehold.co/1200x600.png";

  return (
    <Card className="overflow-hidden group flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/blog/${post.slug}`} className="block relative h-52 w-full">
          <Image
            src={imageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={post.featuredImageHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="truncate">{getAuthorName()}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.publishedAt), 'PPP')}</span>
            </div>
        </div>
        <h3 className="text-xl font-headline font-bold mb-3 flex-grow">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>
        <Link href={`/blog/${post.slug}`} className="font-semibold text-primary inline-flex items-center gap-1 mt-auto">
          Read More <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}


export default function Home() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [homeSettings, setHomeSettings] = useState<HomePageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { setContactFormOpen } = useAppContext();

  useEffect(() => {
    const fetchFeaturedData = async () => {
      setLoading(true);
      try {
        const db = getFirestore(getFirebaseApp());

        // Fetch homepage settings
        const homeSettingsDoc = await getDoc(doc(db, "settings", "homePage"));
        if (homeSettingsDoc.exists()) {
          setHomeSettings(homeSettingsDoc.data() as HomePageSettings);
        }

        // Fetch featured packages
        const packagesQuery = query(collection(db, 'packages'), limit(3));
        const packagesSnapshot = await getDocs(packagesQuery);
        setPackages(packagesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Package)));

        // Fetch featured posts
        const postsQuery = query(collection(db, 'posts'), orderBy('publishedAt', 'desc'), limit(3));
        const postsSnapshot = await getDocs(postsQuery);
        setPosts(postsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post)));
        
        // Fetch all users to map author names
        const usersSnapshot = await getDocs(collection(db, "users"));
        setUsers(usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData)));

      } catch (error) {
        console.error("Error fetching featured data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedData();
  }, []);
  
  const findAuthor = (authorId?: string) => users.find(user => user.uid === authorId);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white bg-black">
          {loading || !homeSettings ? (
             <Loader2 className="h-12 w-12 animate-spin text-white" />
          ) : (
            <>
              <Image
                src={homeSettings.heroImageUrl}
                alt="Exotic travel destination"
                layout="fill"
                objectFit="cover"
                className="absolute z-0 brightness-50"
                data-ai-hint="exotic travel destination"
                key={homeSettings.heroImageUrl} 
              />
              <div className="relative z-10 p-4">
                <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
                  {homeSettings.heroTitle}
                </h1>
                <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                  {homeSettings.heroSubtitle}
                </p>
                <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={homeSettings.heroButtonLink}>
                    {homeSettings.heroButtonLabel} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </section>

        <section id="featured-packages" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              Featured Tours & Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array.from({length: 3}).map((_, i) => <Card key={i}><CardContent className="p-6"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></CardContent></Card>)
              ) : (
                packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))
              )}
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
              Why Choose TripMate?
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

        <section id="featured-blog" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              From Our Blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array.from({length: 3}).map((_, i) => <Card key={i}><CardContent className="p-6"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></CardContent></Card>)
              ) : (
                posts.map((post) => (
                  <BlogCard key={post.id} post={post} author={findAuthor(post.authorId)} />
                ))
              )}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline">
                <Link href="/blog">View All Posts</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-background">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Ready to Start Your Journey?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Let us help you plan the trip of a lifetime. Our travel experts are here to assist you every step of the way.
              </p>
              <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setContactFormOpen(true)}>
                    Contact Us Today
              </Button>
           </div>
        </section>

      </main>
    </div>
  );
}
