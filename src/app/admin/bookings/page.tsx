import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookCopy } from "lucide-react";

export default function AdminBookingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>View and manage all customer bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
          <BookCopy className="h-16 w-16 mb-4" />
          <h3 className="text-2xl font-headline font-semibold">Booking Management Coming Soon</h3>
          <p>This section will display a list of all bookings.</p>
        </div>
      </CardContent>
    </Card>
  );
}
