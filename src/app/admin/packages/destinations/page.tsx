
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function AdminDestinationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Destinations</CardTitle>
        <CardDescription>Create and manage package destinations.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
          <MapPin className="h-16 w-16 mb-4" />
          <h3 className="text-2xl font-headline font-semibold">Destination Management Coming Soon</h3>
          <p>This section will allow you to add, edit, and delete destinations for your packages.</p>
        </div>
      </CardContent>
    </Card>
  );
}
