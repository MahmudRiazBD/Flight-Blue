
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookCopy, Heart, UserCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <header className="mb-8">
            <h1 className="text-4xl font-headline font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, happy traveler!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1">
                <CardHeader>
                    <UserCircle className="h-10 w-10 mb-4 text-primary" />
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>View and edit your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="text-center py-8 text-muted-foreground">
                        <p>Profile section coming soon.</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                 <CardHeader>
                    <BookCopy className="h-10 w-10 mb-4 text-primary" />
                    <CardTitle>My Bookings</CardTitle>
                    <CardDescription>View your past and upcoming trips.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>You have no upcoming bookings.</p>
                        <a href="/packages" className="text-primary hover:underline">Explore packages</a>
                    </div>
                </CardContent>
            </Card>
            <Card className="md:col-span-3">
                 <CardHeader>
                    <Heart className="h-10 w-10 mb-4 text-primary" />
                    <CardTitle>My Wishlist</CardTitle>
                    <CardDescription>Packages you've saved for later.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Your wishlist is empty.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
