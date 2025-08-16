
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Page } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";


const pageSchema = z.object({
  title: z.string().min(1, "Title is required."),
  slug: z.string().min(1, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with no spaces."),
  content: z.string().min(10, "Content must be at least 10 characters long."),
  status: z.enum(["published", "draft"]),
  showInMenu: z.boolean().default(false),
  menuOrder: z.coerce.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  const { toast } = useToast();
  const [page, setPage] = useState<Page | null | undefined>(undefined);
  
  const db = getFirestore(getFirebaseApp());

  const form = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
  });

  useEffect(() => {
    const loadPage = async () => {
      if (!pageId) return;
      const pageRef = doc(db, "pages", pageId);
      const docSnap = await getDoc(pageRef);
      
      if (docSnap.exists()) {
        const pageData = { id: docSnap.id, ...docSnap.data() } as Page;
        setPage(pageData);
        form.reset(pageData);
      } else {
        setPage(null);
      }
    };
    loadPage();
  }, [pageId, db, form]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  const onSubmit = async (data: z.infer<typeof pageSchema>) => {
    if (!page) return;
    try {
      const pageRef = doc(db, "pages", page.id);
      await updateDoc(pageRef, { ...data });
      toast({
        title: "Page Updated!",
        description: "Your page has been successfully updated.",
      });
      router.push("/admin/pages/all");
    } catch(e) {
      toast({ title: "Error", description: "Failed to update page.", variant: "destructive"});
    }
  };

  if (page === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
           <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (page === null) {
      notFound();
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Page</CardTitle>
        <CardDescription>Make changes to your page below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Page Title</Label>
                        <Input 
                            id="title" 
                            {...form.register("title")} 
                            placeholder="Your page title"
                            onChange={(e) => {
                                form.setValue('slug', generateSlug(e.target.value));
                                form.setValue('title', e.target.value);
                            }}
                        />
                        {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input id="slug" {...form.register("slug")} />
                        <p className="text-sm text-muted-foreground">The unique URL for the page. e.g., /about-us</p>
                        {form.formState.errors.slug && <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Page Content (Markdown Supported)</Label>
                        <Textarea id="content" {...form.register("content")} placeholder="Write your page content here..." rows={15} />
                        <p className="text-sm text-muted-foreground">
                        You can use Markdown for formatting, like **bold**, *italic*, and [links](https://example.com).
                        </p>
                        {form.formState.errors.content && <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Publish</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Controller
                                    name="status"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                             <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => router.push('/admin/pages/all')}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Menu Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center space-x-2">
                                <Controller
                                    name="showInMenu"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Switch
                                            id="showInMenu"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="showInMenu">Show in Main Menu</Label>
                             </div>
                             {form.watch('showInMenu') && (
                                <div className="space-y-2">
                                    <Label htmlFor="menuOrder">Menu Position</Label>
                                    <Input id="menuOrder" type="number" {...form.register("menuOrder")} />
                                    <p className="text-sm text-muted-foreground">Lower numbers appear first.</p>
                                </div>
                             )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                            <CardDescription>Settings for search engine optimization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="seoTitle">SEO Title</Label>
                                <Input id="seoTitle" {...form.register("seoTitle")} placeholder="Custom title for search results" />
                                <p className="text-sm text-muted-foreground">If empty, the page title will be used.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="seoDescription">SEO Description</Label>
                                <Textarea id="seoDescription" {...form.register("seoDescription")} placeholder="A short description for search results" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
