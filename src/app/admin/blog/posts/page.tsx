
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Post, Category } from "@/lib/data";
import { User } from "@/hooks/use-auth";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const db = getFirestore(getFirebaseApp());

  const loadData = async () => {
    setLoading(true);
    try {
      const postsSnapshot = await getDocs(collection(db, "posts"));
      const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      postsList.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setPosts(postsList);
      
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(categoriesList);

      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setUsers(usersList);

    } catch(e) {
      console.error("Error loading blog data:", e);
      toast({ title: "Error", description: "Could not fetch blog posts or categories.", variant: "destructive"});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    return categories.find(c => c.id === categoryId)?.name || "Uncategorized";
  };
  
  const getAuthorName = (authorId?: string) => {
    if (!authorId) return "Unknown Author";
    const user = users.find(u => u.uid === authorId);
    if (!user) return "Unknown Author";
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || "Unknown Author";
  };

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      toast({
        title: "Post Deleted",
        description: "The blog post has been successfully deleted.",
        variant: "destructive"
      });
      loadData();
    } catch (e) {
      toast({ title: "Error", description: "Could not delete post.", variant: "destructive"});
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>Create and manage your blog posts.</CardDescription>
        </div>
        <Button size="sm" className="gap-1" asChild>
          <Link href="/admin/blog/new">
            <PlusCircle className="h-3.5 w-3.5" />
            Add New Post
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="truncate max-w-xs">{getAuthorName(post.authorId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryName(post.categoryId)}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(post.publishedAt), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/blog/edit/${post.slug}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            )}
             {!loading && posts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No posts found. Add one to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
