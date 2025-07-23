
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { SitePagesSettings } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import Head from "next/head";

// A simple Markdown to HTML converter
const Markdown = ({ content }: { content: string }) => {
    const htmlContent = content
        .split('\n\n')
        .map(p => `<p class="mb-6 leading-relaxed text-lg">${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')}</p>`)
        .join('');
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default function AboutUsPage() {
    const [pageContent, setPageContent] = useState<SitePagesSettings['aboutUs'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const db = getFirestore(getFirebaseApp());
                const settingsDoc = await getDoc(doc(db, "settings", "sitePages"));
                if (settingsDoc.exists()) {
                    const data = settingsDoc.data() as SitePagesSettings;
                    setPageContent(data.aboutUs);
                }
            } catch (error) {
                console.error("Error fetching 'About Us' content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                 <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
                 <Skeleton className="h-6 w-1/2 mx-auto mb-12" />
                 <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                </div>
            </div>
        );
    }
    
    if (!pageContent) {
        return <div className="text-center py-20">Content not found.</div>;
    }

    const pageDescription = pageContent.content.substring(0, 160);

    return (
        <>
        <Head>
            <title>{pageContent.title}</title>
            <meta name="description" content={pageDescription} />
        </Head>
        <div className="bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
                        {pageContent.title}
                    </h1>
                </header>
                <article className="prose prose-lg max-w-none mx-auto text-foreground/80">
                   <Markdown content={pageContent.content} />
                </article>
            </div>
        </div>
        </>
    );
}
