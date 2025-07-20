
"use client";

import { useEffect, useState } from "react";
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
import { Post } from "@/lib/data";
import MediaPicker from "@/components/admin/MediaPicker";
import { posts as initialPosts } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(100, "Content must be at least 100 characters long."),
  imageUrl: z.string().url("A valid image URL is required."),
  imageHint: z.string().optional(),
  slug: z.string().min(1, "Slug is required."),
});

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    const storedPosts = localStorage.getItem('posts');
    const posts: Post[] = storedPosts ? JSON.parse(storedPosts) : initialPosts;
    const postToEdit = posts.find(p => p.slug === slug);
    if (postToEdit) {
      setPost(postToEdit);
      form.reset(postToEdit);
    } else {
      setPost(null); // Not found
    }
  }, [slug, form]);

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    if (!post) return;

    const storedPosts = localStorage.getItem('posts');
    const posts: Post[] = storedPosts ? JSON.parse(storedPosts) : initialPosts;

    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        return { ...p, ...data };
      }
      return p;
    });

    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    toast({
      title: "Post Updated!",
      description: "Your blog post has been successfully updated.",
    });

    router.push("/admin/blog");
  };
  
  if (post === undefined) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    )
  }

  if (post === null) {
    notFound();
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Blog Post</CardTitle>
        <CardDescription>Make changes to your post below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>

           <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register("slug")} />
             <p className="text-sm text-muted-foreground">The unique URL-friendly identifier for the post.</p>
            {form.formState.errors.slug && <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown Supported)</Label>
            <Textarea id="content" {...form.register("content")} rows={15} />
             <p className="text-sm text-muted-foreground">
              You can use Markdown for formatting, like **bold**, *italic*, and [links](https://example.com).
            </p>
            {form.formState.errors.content && <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Featured Image</Label>
            <Controller
              name="imageUrl"
              control={form.control}
              render={({ field }) => (
                <MediaPicker imageUrl={field.value} onImageUrlChange={field.onChange} />
              )}
            />
            {form.formState.errors.imageUrl && <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageHint">Image Hint (for AI)</Label>
            <Input id="imageHint" {...form.register("imageHint")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
