
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/data';
import { User as UserData } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, Calendar, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';

function PostCard({ post, author }: { post: Post, author?: UserData }) {
  const getAuthorName = () => {
    if (!author) return "Unknown Author";
    const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim();
    return fullName || "Unknown Author";
  };

  return (
    <Card className="overflow-hidden group">
      <CardHeader className="p-0">
        <Link href={`/blog/${post.slug}`} className="block relative h-60 w-full">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={post.featuredImageHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{getAuthorName()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(post.publishedAt), 'PPP')}</span>
          </div>
        </div>
        <h2 className="text-2xl font-headline font-bold mb-3">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h2>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {post.content}
        </p>
        <Link href={`/blog/${post.slug}`} className="font-semibold text-primary inline-flex items-center gap-1">
          Read More <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const db = getFirestore(getFirebaseApp());
      
      const postsCollection = collection(db, 'posts');
      const postsQuery = query(postsCollection, orderBy("publishedAt", "desc"));
      const postsSnapshot = await getDocs(postsQuery);
      const postsList = postsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post));
      setPosts(postsList);
      
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserData));
      setUsers(usersList);

      setLoading(false);
    };
    fetchData();
  }, []);
  
  const findAuthor = (authorId?: string) => users.find(user => user.uid === authorId);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Blog</h1>
        <p className="text-lg text-muted-foreground mt-2">Travel stories, tips, and insights from the Flight Blu team.</p>
      </header>
      
      <main>
        {loading ? (
           <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <PostCard key={post.id} post={post} author={findAuthor(post.authorId)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-headline font-semibold">No Posts Yet</h2>
            <p className="text-muted-foreground mt-2">Check back soon for our latest articles.</p>
          </div>
        )}
      </main>
    </div>
  );
}
