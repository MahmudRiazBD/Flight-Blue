
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post, Category } from '@/lib/data';
import { User as UserData } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, Calendar, User as UserIcon, Loader2, Search } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function PostCard({ post, author }: { post: Post, author?: UserData }) {
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
    <Card className="overflow-hidden group">
      <CardHeader className="p-0">
        <Link href={`/blog/${post.slug}`} className="block relative h-60 w-full">
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
      <CardContent className="p-6">
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
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedRange, setSelectedRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const db = getFirestore(getFirebaseApp());
      try {
        const postsCollection = collection(db, 'posts');
        const postsQuery = query(postsCollection, orderBy("publishedAt", "desc"));
        const postsSnapshot = await getDocs(postsQuery);
        const postsList = postsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post));
        setAllPosts(postsList);
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserData));
        setAllUsers(usersList);

        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
        setAllCategories(categoriesList);

      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = allPosts.filter(post => {
      const matchesSearch = searchTerm.trim() === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory;
      const matchesAuthor = selectedAuthor === 'all' || post.authorId === selectedAuthor;
      
      const now = new Date();
      let matchesRange = true;
      if (selectedRange !== 'all') {
        let daysToSubtract = 0;
        if(selectedRange === 'week') daysToSubtract = 7;
        if(selectedRange === 'month') daysToSubtract = 30;
        if(selectedRange === 'year') daysToSubtract = 365;
        const cutoffDate = subDays(now, daysToSubtract);
        matchesRange = isAfter(new Date(post.publishedAt), cutoffDate);
      }

      return matchesSearch && matchesCategory && matchesAuthor && matchesRange;
    });

    switch (sortBy) {
        case 'newest':
            filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            break;
        case 'oldest':
            filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
            break;
        case 'title-asc':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filtered.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    return filtered;
  }, [allPosts, searchTerm, selectedCategory, selectedAuthor, selectedRange, sortBy]);

  const findAuthor = (authorId?: string) => allUsers.find(user => user.uid === authorId);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Blog</h1>
        <p className="text-lg text-muted-foreground mt-2">Travel stories, tips, and insights from our team.</p>
      </header>

      <aside className="mb-12 p-4 md:p-6 bg-secondary rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-2">Search Posts</label>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Input
                        type="text"
                        placeholder="e.g., Paris, Tips..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {allCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger><SelectValue placeholder="All Authors" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Authors</SelectItem>
                        {allUsers.map(user => <SelectItem key={user.uid} value={user.uid}>{user.firstName} {user.lastName}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Filter by Date</label>
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                    <SelectTrigger><SelectValue placeholder="All Time" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger><SelectValue placeholder="Sort..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                        <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </aside>
      
      <main>
        {loading ? (
           <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading posts...</p>
          </div>
        ) : filteredAndSortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedPosts.map(post => (
              <PostCard key={post.id} post={post} author={findAuthor(post.authorId)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-headline font-semibold">No Posts Found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </main>
    </div>
  );
}
