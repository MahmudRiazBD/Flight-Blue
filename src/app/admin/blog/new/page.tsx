
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Post, Category, posts as initialPosts, categories as initialCategories } from "@/lib/data";
import MediaPicker from "@/components/admin/MediaPicker";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(100, "Content must be at least 100 characters long."),
  imageUrl: z.string().url("A valid image URL is required."),
  imageHint: z.string().optional(),
  videoUrl: z.string().url("Must be a valid video URL.").optional().or(z.literal('')),
  categoryId: z.string().optional(),
});

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
    } else {
        setCategories(initialCategories);
    }
  }, []);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "https://placehold.co/1200x600.png",
      imageHint: "",
      videoUrl: "",
    },
  });

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    const storedPosts = localStorage.getItem('posts');
    const posts: Post[] = storedPosts ? JSON.parse(storedPosts) : initialPosts;

    const slug = data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    const newPost: Post = {
      ...data,
      id: `post-${new Date().getTime()}`,
      slug,
      author: "Admin User", // In a real app, this would come from the logged-in user
      publishedAt: new Date().toISOString(),
    };

    const updatedPosts = [...posts, newPost];
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    toast({
      title: "Post Created!",
      description: "Your new blog post has been saved.",
    });

    router.push("/admin/blog/posts");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Blog Post</CardTitle>
        <CardDescription>Fill out the form below to create a new post.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input id="title" {...form.register("title")} placeholder="Your amazing blog post title" />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
             <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="uncategorized">Uncategorized</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
             />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown Supported)</Label>
            <Textarea id="content" {...form.register("content")} placeholder="Write your blog post here..." rows={15} />
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
            <Input id="imageHint" {...form.register("imageHint")} placeholder="e.g. tokyo street night" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL (Optional)</Label>
            <Input id="videoUrl" {...form.register("videoUrl")} placeholder="https://www.youtube.com/watch?v=..." />
            {form.formState.errors.videoUrl && <p className="text-sm text-destructive">{form.formState.errors.videoUrl.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/blog/posts')}>
              Cancel
            </Button>
            <Button type="submit">Save Post</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
