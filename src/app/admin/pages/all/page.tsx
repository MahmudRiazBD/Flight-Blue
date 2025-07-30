
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Page } from "@/lib/data";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Home } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const db = getFirestore(getFirebaseApp());
        const pagesSnapshot = await getDocs(collection(db, "pages"));
        const pagesList = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
        // Sort pages by menuOrder if it exists, otherwise by title
        pagesList.sort((a, b) => {
          if (a.menuOrder !== undefined && b.menuOrder !== undefined) {
            return a.menuOrder - b.menuOrder;
          }
          return a.title.localeCompare(b.title);
        });
        setPages(pagesList);
      } catch(e) {
        console.error("Error loading pages:", e);
        toast({ title: "Error", description: "Could not fetch pages.", variant: "destructive"});
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  const handleDelete = async (pageId: string) => {
    try {
      const db = getFirestore(getFirebaseApp());
      await deleteDoc(doc(db, "pages", pageId));
      toast({
        title: "Page Deleted",
        description: "The page has been successfully deleted.",
        variant: "destructive"
      });
      // Re-load data after deletion
       const pagesSnapshot = await getDocs(collection(db, "pages"));
        const pagesList = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
        pagesList.sort((a, b) => {
            if (a.menuOrder !== undefined && b.menuOrder !== undefined) {
            return a.menuOrder - b.menuOrder;
            }
            return a.title.localeCompare(b.title);
        });
        setPages(pagesList);

    } catch (e) {
      toast({ title: "Error", description: "Could not delete page.", variant: "destructive"});
    }
  };

  const getStatusColor = (status: 'published' | 'draft'): "default" | "secondary" => {
    return status === 'published' ? 'default' : 'secondary';
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pages</CardTitle>
          <CardDescription>Manage your website's pages.</CardDescription>
        </div>
        <Button size="sm" className="gap-1" asChild>
          <Link href="/admin/pages/new">
            <PlusCircle className="h-3.5 w-3.5" />
            Add New Page
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Menu Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
                <>
                {/* Special case for Home page */}
                <TableRow className="bg-secondary/50">
                    <TableCell className="font-medium flex items-center gap-2"><Home className="h-4 w-4"/> Home Page</TableCell>
                    <TableCell>/</TableCell>
                    <TableCell><Badge>Published</Badge></TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell className="text-right">
                         <Button asChild variant="outline" size="sm">
                             <Link href="/admin/pages/home">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                             </Link>
                         </Button>
                    </TableCell>
                </TableRow>
                {/* Other pages */}
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>/{page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(page.status)}>{page.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {page.showInMenu ? page.menuOrder : 'Not in menu'}
                    </TableCell>
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
                            <Link href={`/admin/pages/edit/${page.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(page.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                </>
            )}
             {!loading && pages.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No custom pages found. Add one to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
