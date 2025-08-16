
"use client"

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Post, Category } from "@/lib/data";
import { User } from "@/hooks/use-auth";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Home, Trash, RotateCw, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emptyTrash } from "@/lib/actions";

export default function AdminBlogPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [trashedPosts, setTrashedPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const router = useRouter();
  const db = getFirestore(getFirebaseApp());

  const loadData = async () => {
    setLoading(true);
    try {
      const postsSnapshot = await getDocs(collection(db, "posts"));
      const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      postsList.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      setAllPosts(postsList.filter(p => !p.deletedAt));
      setTrashedPosts(postsList.filter(p => !!p.deletedAt));

      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

      const usersSnapshot = await getDocs(collection(db, "users"));
      setUsers(usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));

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

  const handleAction = async (action: 'trash' | 'restore' | 'delete', postId: string) => {
    try {
      if (action === 'trash') {
        await updateDoc(doc(db, 'posts', postId), { deletedAt: serverTimestamp() });
        toast({ title: 'Post moved to trash' });
      } else if (action === 'restore') {
        await updateDoc(doc(db, 'posts', postId), { deletedAt: null });
        toast({ title: 'Post restored' });
      } else if (action === 'delete') {
        await deleteDoc(doc(db, 'posts', postId));
        toast({ title: 'Post permanently deleted', variant: 'destructive' });
      }
      loadData();
    } catch(e) {
      toast({ title: 'Error', description: `Failed to ${action} post.`, variant: 'destructive' });
    }
  };

  const handleEmptyTrash = async () => {
    if (trashedPosts.length === 0) return;
    const result = await emptyTrash('posts');
    if (result.success) {
      toast({ title: 'Trash Emptied', description: `${trashedPosts.length} posts permanently deleted.` });
      loadData();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }

  const currentList = activeTab === 'all' ? allPosts : trashedPosts;

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
         <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Posts ({allPosts.length})</TabsTrigger>
                <TabsTrigger value="trash"><Trash className="mr-2"/>Trash ({trashedPosts.length})</TabsTrigger>
            </TabsList>
            {activeTab === 'trash' && trashedPosts.length > 0 && (
                 <div className="flex items-center justify-between mt-4">
                     <p className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Items in trash are permanently deleted after 30 days.</p>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Empty Trash</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently delete all {trashedPosts.length} posts in the trash. This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleEmptyTrash} className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                 </div>
            )}
            <TabsContent value="all" className="mt-4">
                <PostsTable loading={loading} posts={currentList} isTrash={false} onAction={handleAction} users={users} categories={categories} />
            </TabsContent>
             <TabsContent value="trash" className="mt-4">
                <PostsTable loading={loading} posts={currentList} isTrash={true} onAction={handleAction} users={users} categories={categories} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const PostsTable = ({ loading, posts, isTrash, onAction, users, categories }: { loading: boolean, posts: Post[], isTrash: boolean, onAction: (action: any, id: string) => void, users: User[], categories: Category[] }) => {
    
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
    
    if (loading) {
        return (
            <div className="space-y-4">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 ml-auto" />
                </div>
              ))}
            </div>
        )
    }

    if (posts.length === 0) {
        return <div className="text-center py-16 text-muted-foreground">{isTrash ? "The trash is empty." : "No posts found."}</div>;
    }

    return (
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
                {posts.map((post) => (
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
                          {isTrash ? (
                            <>
                                <DropdownMenuItem onClick={() => onAction('restore', post.id)}>
                                    <RotateCw className="mr-2 h-4 w-4" /> Restore
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4"/> Delete Permanently
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will permanently delete this post. This action cannot be undone.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onAction('delete', post.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                          ) : (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/blog/edit/${post.slug}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => onAction('trash', post.id)}>
                                    <Trash className="mr-2 h-4 w-4" /> Move to Trash
                                </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
    )
}
