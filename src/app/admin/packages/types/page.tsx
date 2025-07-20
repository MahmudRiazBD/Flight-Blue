
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tag } from "lucide-react";

export default function AdminPackageTypesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Types</CardTitle>
        <CardDescription>Create and manage package types (e.g., Tour, Hajj, Umrah).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
          <Tag className="h-16 w-16 mb-4" />
          <h3 className="text-2xl font-headline font-semibold">Package Type Management Coming Soon</h3>
          <p>This section will allow you to add, edit, and delete package types.</p>
        </div>
      </CardContent>
    </Card>
  );
}
