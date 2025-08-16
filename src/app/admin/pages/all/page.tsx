
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Page, SitePagesSettings } from "@/lib/data";
import { PlusCircle, Pencil, Trash2, Home, FileText, Info, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { updatePageStatus } from "@/lib/actions";

// Combined type for any kind of page shown in the list
type DisplayPage = {
    id: string;
    title: string;
    slug: string;
    status: 'published' | 'draft';
    type: 'Dynamic' | 'Static' | 'Home';
};

export default function AdminAllPagesPage() {
  const [pages, setPages] = useState<DisplayPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getFirestore(getFirebaseApp());
      const displayPages: DisplayPage[] = [];

      // 1. Fetch Dynamic Pages
      const pagesSnapshot = await getDocs(collection(db, "pages"));
      pagesSnapshot.forEach(doc => {
          const data = doc.data() as Page;
          if (!data.deletedAt) { // Only show non-trashed pages
              displayPages.push({
                  id: doc.id,
                  title: data.title,
                  slug: `/${data.slug}`,
                  status: data.status,
                  type: 'Dynamic'
              });
          }
      });
      
      // 2. Fetch Static & Home Pages
      const settingsDoc = await getDoc(doc(db, "settings", "sitePages"));
      if (settingsDoc.exists()) {
          const data = settingsDoc.data() as SitePagesSettings;
          displayPages.push({ id: 'about-us', title: 'About Us', slug: '/about-us', status: data.aboutUs.status || 'published', type: 'Static' });
          displayPages.push({ id: 'faq', title: 'FAQ', slug: '/faq', status: data.faq.status || 'published', type: 'Static' });
          displayPages.push({ id: 'terms-of-service', title: 'Terms of Service', slug: '/terms-of-service', status: data.terms.status || 'published', type: 'Static' });
          displayPages.push({ id: 'privacy-policy', title: 'Privacy Policy', slug: '/privacy-policy', status: data.privacy.status || 'published', type: 'Static' });
      }
      const homeSettingsDoc = await getDoc(doc(db, "settings", "homePage"));
       if (homeSettingsDoc.exists()) {
          const homeData = homeSettingsDoc.data()
          displayPages.push({ id: 'home', title: 'Home Page', slug: '/', status: homeData?.status || 'published', type: 'Home' });
       }


      setPages(displayPages);

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

  const handleStatusChange = async (id: string, type: DisplayPage['type'], currentStatus: 'published' | 'draft') => {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const result = await updatePageStatus(id, type, newStatus);

      if (result.success) {
          toast({ title: "Status Updated", description: `Page has been set to ${newStatus}.` });
          // Optimistically update UI
          setPages(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
      }
  };
  
  const handleEdit = (id: string, type: DisplayPage['type']) => {
    if (type === 'Dynamic') {
        router.push(`/admin/pages/edit/${id}`);
    } else if (type === 'Static') {
        router.push(`/admin/pages/static#${id}`);
    } else if (type === 'Home') {
        router.push(`/admin/pages/home`);
    }
  }
  
  const getIconForType = (type: DisplayPage['type']) => {
    switch (type) {
      case 'Home': return <Home className="h-4 w-4 text-muted-foreground" />;
      case 'Static': return <Info className="h-4 w-4 text-muted-foreground" />;
      case 'Dynamic': return <FileText className="h-4 w-4 text-muted-foreground" />;
      default: return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>Manage all dynamic, static, and home pages from one place.</CardDescription>
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
              <TableHead>URL Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                 Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                 ))
            ) : pages.length > 0 ? pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getIconForType(page.type)}
                    {page.title}
                  </TableCell>
                  <TableCell><code className="text-sm bg-muted px-1 py-0.5 rounded">{page.slug}</code></TableCell>
                  <TableCell><Badge variant="outline">{page.type}</Badge></TableCell>
                  <TableCell>
                      <Switch
                        checked={page.status === 'published'}
                        onCheckedChange={() => handleStatusChange(page.id, page.type, page.status)}
                        aria-label="Publish Status"
                      />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(page.id, page.type)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
            )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No pages found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
