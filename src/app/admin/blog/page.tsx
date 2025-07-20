import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AdminBlogPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog</CardTitle>
        <CardDescription>Create and manage your blog posts.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
          <FileText className="h-16 w-16 mb-4" />
          <h3 className="text-2xl font-headline font-semibold">Blog Management Coming Soon</h3>
          <p>This section will allow you to manage your blog content.</p>
        </div>
      </CardContent>
    </Card>
  );
}
