
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { Post, posts as initialPosts } from "@/lib/data";
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// A simple Markdown to HTML converter
const Markdown = ({ content }: { content: string }) => {
    // This is a very basic implementation for demonstration purposes.
    // For a real app, use a robust library like 'react-markdown' or 'marked'.
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

  useEffect(() => {
    if (slug) {
        const storedPosts = localStorage.getItem('posts');
        const posts: Post[] = storedPosts ? JSON.parse(storedPosts) : initialPosts;
        const foundPost = posts.find((p) => p.slug === slug);
        setPost(foundPost || null);
    }
  }, [slug]);

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

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">{post.title}</h1>
        <div className="flex justify-center items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <time dateTime={post.publishedAt}>
              {format(new Date(post.publishedAt), 'PPP')}
            </time>
          </div>
        </div>
      </header>

      <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-12 shadow-lg">
        <Image
          src={post.imageUrl}
          alt={post.title}
          layout="fill"
          objectFit="cover"
          data-ai-hint={post.imageHint}
        />
      </div>

      <div className="prose prose-lg max-w-none mx-auto text-foreground/80">
        <Markdown content={post.content} />
      </div>
    </article>
  );
}
