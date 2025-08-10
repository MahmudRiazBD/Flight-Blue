
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/lib/data";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<Booking['status'], "default" | "secondary" | "destructive"> = {
  Pending: "secondary",
  Confirmed: "default",
  Cancelled: "destructive",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const db = getFirestore(getFirebaseApp());
  const router = useRouter();

  const loadBookings = async () => {
    setLoading(true);
    try {
      const bookingsCollection = collection(db, "bookings");
      const q = query(bookingsCollection, orderBy("bookingDate", "desc"));
      const snapshot = await getDocs(q);
      const allBookings = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Booking));
      setBookings(allBookings);
    } catch (e) {
      console.error("Error fetching bookings:", e);
      toast({ title: "Error", description: "Failed to load bookings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status });
      toast({
        title: "Booking Status Updated",
        description: `Booking has been marked as ${status}.`
      });
      loadBookings();
    } catch(e) {
       toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  }

  const deleteBooking = async (bookingId: string) => {
    try {
     await deleteDoc(doc(db, "bookings", bookingId));
     toast({
        title: "Booking Deleted",
        description: "The booking has been successfully removed.",
        variant: "destructive"
     });
     loadBookings();
    } catch(e) {
        toast({ title: "Error", description: "Failed to delete booking.", variant: "destructive" });
    }
  }
  
  const handleEdit = (bookingId: string) => {
    router.push(`/admin/bookings/edit/${bookingId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>View and manage all customer bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Booked On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : bookings.length > 0 ? bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="font-medium">{booking.customerName}</div>
                  <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                </TableCell>
                <TableCell>{booking.packageName}</TableCell>
                <TableCell>{format(new Date(booking.departureDate), "PPP")}</TableCell>
                <TableCell>{format(new Date(booking.bookingDate), "PPP")}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(booking.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup value={booking.status} onValueChange={(status) => updateBookingStatus(booking.id, status as Booking['status'])}>
                                  <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Confirmed">Confirmed</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Cancelled">Cancelled</DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem className="text-destructive" asChild>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <button
                                    onSelect={(e) => e.preventDefault()}
                                    className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Delete Booking
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this booking. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBooking(booking.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
