
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { Post } from "@/lib/data";
import { User as UserData } from '@/hooks/use-auth';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getEmbedUrl } from "@/lib/utils";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from '@/lib/firebase';
import Head from 'next/head';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


// A simple Markdown to HTML converter
const Markdown = ({ content }: { content: string }) => {
    const htmlContent = content
        .split('\n\n') // Split by paragraphs
        .map(p => `<p class="mb-4 leading-relaxed">${p}</p>`)
        .join('')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>'); // Links

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};


export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [author, setAuthor] = useState<UserData | null>(null);
  
  const embedUrl = post?.videoUrl ? getEmbedUrl(post.videoUrl) : null;

  useEffect(() => {
    const fetchPostAndAuthor = async () => {
      if (!slug) return;
      const db = getFirestore(getFirebaseApp());
      
      // Fetch Post
      const postsRef = collection(db, "posts");
      const q = query(postsRef, where("slug", "==", slug));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setPost(null);
        return;
      }
      
      const postDoc = querySnapshot.docs[0];
      const postData = { id: postDoc.id, ...postDoc.data() } as Post;
      setPost(postData);

      // Fetch Author if authorId exists
      if (postData.authorId) {
        const authorRef = doc(db, "users", postData.authorId);
        const authorSnap = await getDoc(authorRef);
        if (authorSnap.exists()) {
          setAuthor(authorSnap.data() as UserData);
        }
      }
    };

    if (slug) {
      fetchPostAndAuthor();
    }
  }, [slug]);

  const getAuthorName = () => {
    if (!author) return "Unknown Author";
    const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim();
    return fullName || "Unknown Author";
  };


  if (post === undefined) {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
            <Skeleton className="h-96 w-full rounded-lg mb-8" />
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

  if (post === null) {
    notFound();
  }
  
  const pageTitle = post.title;
  const pageDescription = post.content.substring(0, 160);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{post.title}</h1>
          <div className="flex justify-center items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{getAuthorName()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <time dateTime={post.publishedAt}>
                {format(new Date(post.publishedAt), 'PPP')}
              </time>
            </div>
          </div>
        </header>
        
         <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                data-ai-hint={post.featuredImageHint}
              />
         </div>

        {post.galleryImages && post.galleryImages.length > 0 && (
            <div className="my-12">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {post.galleryImages.map((image, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                         <Image
                                            src={image.url}
                                            alt={`Gallery image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={image.hint}
                                        />
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        )}


        <div className="prose prose-lg max-w-none mx-auto text-foreground/80">
          <Markdown content={post.content} />

           {embedUrl && (
            <div className="mt-12 not-prose">
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title="Post Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
