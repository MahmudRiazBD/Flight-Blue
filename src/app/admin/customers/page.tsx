import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>View and manage your customer list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
          <Users className="h-16 w-16 mb-4" />
          <h3 className="text-2xl font-headline font-semibold">Customer Management Coming Soon</h3>
          <p>This section will display a list of all registered users.</p>
        </div>
      </CardContent>
    </Card>
  );
}
