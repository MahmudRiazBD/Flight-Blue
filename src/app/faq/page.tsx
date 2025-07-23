
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { SitePagesSettings } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import Head from "next/head";

export default function FAQPage() {
    const [pageContent, setPageContent] = useState<SitePagesSettings['faq'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const db = getFirestore(getFirebaseApp());
                const settingsDoc = await getDoc(doc(db, "settings", "sitePages"));
                if (settingsDoc.exists()) {
                    const data = settingsDoc.data() as SitePagesSettings;
                    setPageContent(data.faq);
                }
            } catch (error) {
                console.error("Error fetching FAQ content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return (
             <div className="container mx-auto px-4 py-16 max-w-3xl">
                 <Skeleton className="h-12 w-1/2 mx-auto mb-12" />
                 <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                 </div>
             </div>
        )
    }
    
    if (!pageContent || pageContent.items.length === 0) {
        return <div className="text-center py-20">No frequently asked questions found.</div>;
    }

    const pageDescription = pageContent.items.map(item => item.question).join(' ').substring(0, 160);

    return (
        <>
        <Head>
            <title>{pageContent.title}</title>
            <meta name="description" content={pageDescription} />
        </Head>
        <div className="bg-background">
            <div className="container mx-auto px-4 py-16 max-w-3xl">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
                        {pageContent.title}
                    </h1>
                </header>
                <Accordion type="single" collapsible className="w-full">
                    {pageContent.items.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={item.id}>
                            <AccordionTrigger className="text-xl text-left font-headline hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-lg text-muted-foreground leading-relaxed">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
        </>
    );
}
