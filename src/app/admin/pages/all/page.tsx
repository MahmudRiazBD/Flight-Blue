
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Page } from "@/lib/data";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Home, Trash, RotateCw, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, where, query } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { emptyTrash } from "@/lib/actions";

export default function AdminPagesPage() {
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [trashedPages, setTrashedPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getFirestore(getFirebaseApp());
      const pagesSnapshot = await getDocs(collection(db, "pages"));
      const pagesList = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
      
      setAllPages(pagesList.filter(p => !p.deletedAt));
      setTrashedPages(pagesList.filter(p => !!p.deletedAt));

    } catch(e) {
      console.error("Error loading pages:", e);
      toast({ title: "Error", description: "Could not fetch pages.", variant: "destructive"});
    } finally {
      setLoading(false);
    }
  };
    
  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (action: 'trash' | 'restore' | 'delete', pageId: string) => {
    const db = getFirestore(getFirebaseApp());
    try {
        if (action === 'trash') {
            await updateDoc(doc(db, 'pages', pageId), { deletedAt: serverTimestamp() });
            toast({ title: 'Page moved to trash' });
        } else if (action === 'restore') {
            await updateDoc(doc(db, 'pages', pageId), { deletedAt: null });
            toast({ title: 'Page restored' });
        } else if (action === 'delete') {
            await deleteDoc(doc(db, 'pages', pageId));
            toast({ title: 'Page permanently deleted', variant: 'destructive' });
        }
        loadData();
    } catch (e) {
      toast({ title: "Error", description: `Could not ${action} page.`, variant: "destructive"});
    }
  };

  const handleEmptyTrash = async () => {
    if (trashedPages.length === 0) return;
    const result = await emptyTrash('pages');
    if (result.success) {
      toast({ title: 'Trash Emptied', description: `${trashedPages.length} pages permanently deleted.` });
      loadData();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }
  
  const currentList = activeTab === 'all' ? allPages : trashedPages;

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
         <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Pages ({allPages.length})</TabsTrigger>
                <TabsTrigger value="trash"><Trash className="mr-2"/>Trash ({trashedPages.length})</TabsTrigger>
            </TabsList>
            {activeTab === 'trash' && trashedPages.length > 0 && (
                 <div className="flex items-center justify-between mt-4">
                     <p className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Items in trash are permanently deleted after 30 days.</p>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Empty Trash</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently delete all {trashedPages.length} pages in the trash. This action cannot be undone.</AlertDialogDescription>
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
                <PagesTable pages={currentList} loading={loading} onAction={handleAction} isTrash={false} />
             </TabsContent>
              <TabsContent value="trash" className="mt-4">
                <PagesTable pages={currentList} loading={loading} onAction={handleAction} isTrash={true} />
             </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


const PagesTable = ({ pages, loading, isTrash, onAction }: { pages: Page[], loading: boolean, isTrash: boolean, onAction: (action: any, id: string) => void}) => {

  const getStatusColor = (status: 'published' | 'draft'): "default" | "secondary" => {
    return status === 'published' ? 'default' : 'secondary';
  }

  if (loading) {
     return (
        <div className="space-y-4 mt-4">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          ))}
        </div>
     )
  }
  
  if (pages.length === 0 && !isTrash) {
     return (
      <div className="text-center h-24 flex items-center justify-center">
        No custom pages found. Add one to get started.
      </div>
     )
  }

  if (pages.length === 0 && isTrash) {
     return (
      <div className="text-center h-24 flex items-center justify-center">
        The trash is empty.
      </div>
     )
  }

  return (
       <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              {!isTrash && <TableHead>Status</TableHead>}
              {!isTrash && <TableHead>Menu Order</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {/* Special case for Home page shown only on the main tab */}
              {!isTrash && (
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
              )}
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  {!isTrash && (
                      <>
                      <TableCell>
                          <Badge variant={getStatusColor(page.status)}>{page.status}</Badge>
                      </TableCell>
                      <TableCell>
                          {page.showInMenu ? page.menuOrder : 'Not in menu'}
                      </TableCell>
                      </>
                  )}
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
                              <DropdownMenuItem onClick={() => onAction('restore', page.id)}>
                                  <RotateCw className="mr-2 h-4 w-4" /> Restore
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete Permanently
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the page.</AlertDialogDescription>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onAction('delete', page.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/pages/edit/${page.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onAction('trash', page.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Move to Trash
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
