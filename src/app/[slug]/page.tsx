
"use client"

import { useState, useEffect } from 'react';
import { useParams, notFound } from "next/navigation";
import { Page } from "@/lib/data";
import { Skeleton } from '@/components/ui/skeleton';
import { getFirestore, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { getFirebaseApp } from '@/lib/firebase';
import Head from 'next/head';

// A simple Markdown to HTML converter
const Markdown = ({ content }: { content: string }) => {
    // Basic markdown conversion, can be replaced with a more robust library like 'marked' or 'react-markdown'
    const htmlContent = content
        .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>');

    return <div dangerouslySetInnerHTML={{ __html: `<p class="mb-4 leading-relaxed">${htmlContent}</p>` }} />;
};


export default function CustomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null | undefined>(undefined);
  
  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      const db = getFirestore(getFirebaseApp());
      const pagesRef = collection(db, "pages");
      const q = query(pagesRef, where("slug", "==", slug), where("status", "==", "published"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setPage(null); // Not found
      } else {
        const pageDoc = querySnapshot.docs[0];
        setPage({ id: pageDoc.id, ...pageDoc.data() } as Page);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (page === undefined) {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full mt-4" />
                <Skeleton className="h-5 w-2/3" />
            </div>
        </div>
    )
  }

  if (page === null) {
    notFound();
  }
  
  const pageTitle = page.seoTitle || page.title;
  const pageDescription = page.seoDescription || page.content.substring(0, 160);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {/* Add more SEO tags as needed, like Open Graph tags */}
      </Head>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{page.title}</h1>
        </header>
        
        <div className="prose prose-lg max-w-none mx-auto text-foreground/80">
          <Markdown content={page.content} />
        </div>
      </article>
    </>
  );
}
