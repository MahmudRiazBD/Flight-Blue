
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminAdminsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admins</CardTitle>
        <CardDescription>View and manage administrators.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
          <Users className="h-16 w-16 mb-4" />
          <h3 className="text-2xl font-headline font-semibold">Admin User Management Coming Soon</h3>
          <p>This section will display a list of all users with the 'admin' or 'superadmin' role.</p>
        </div>
      </CardContent>
    </Card>
  );
}
