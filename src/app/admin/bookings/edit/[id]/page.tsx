
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Booking, Package } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required."),
  customerEmail: z.string().email("A valid email is required."),
  customerPhone: z.string().min(1, "Phone number is required."),
  travelers: z.coerce.number().min(1, "Must be at least one traveler."),
  departureDate: z.date({ required_error: "Departure date is required."}),
  status: z.enum(["Pending", "Confirmed", "Cancelled"]),
  packageId: z.string().min(1, "A package must be selected."),
  packageName: z.string().min(1, "Package name is required."),
});

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
  const [packages, setPackages] = useState<Package[]>([]);
  
  const db = getFirestore(getFirebaseApp());

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    const loadPackages = async () => {
        try {
            const pkgSnapshot = await getDocs(collection(db, "packages"));
            setPackages(pkgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Package)));
        } catch (e) {
            toast({ title: "Error", description: "Could not load packages." });
        }
    }
    loadPackages();
  }, [db, toast]);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      const bookingRef = doc(db, "bookings", bookingId);
      const docSnap = await getDoc(bookingRef);
      
      if (docSnap.exists()) {
        const bookingData = { id: docSnap.id, ...docSnap.data() } as Booking;
        setBooking(bookingData);
        form.reset({
          ...bookingData,
          departureDate: new Date(bookingData.departureDate), // Convert string to Date
        });
      } else {
        setBooking(null);
      }
    };
    loadBooking();
  }, [bookingId, db, form]);

  const onSubmit = async (data: z.infer<typeof bookingSchema>) => {
    if (!booking) return;

    try {
      const bookingRef = doc(db, "bookings", booking.id);
      
      // Find the selected package to update the name, just in case
      const selectedPackage = packages.find(p => p.id === data.packageId);
      const finalData = {
          ...data,
          departureDate: data.departureDate.toISOString(),
          packageName: selectedPackage?.title || data.packageName // Fallback to existing name
      };

      await updateDoc(bookingRef, finalData);
      toast({
        title: "Booking Updated!",
        description: "The booking details have been successfully updated.",
      });
      router.push("/admin/bookings");
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Failed to update booking.", variant: "destructive" });
    }
  };
  
  if (booking === undefined) {
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

  if (booking === null) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Booking</CardTitle>
        <CardDescription>Make changes to the booking below. Booking ID: {booking.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" {...form.register("customerName")} />
              {form.formState.errors.customerName && <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input id="customerEmail" type="email" {...form.register("customerEmail")} />
              {form.formState.errors.customerEmail && <p className="text-sm text-destructive">{form.formState.errors.customerEmail.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input id="customerPhone" {...form.register("customerPhone")} />
              {form.formState.errors.customerPhone && <p className="text-sm text-destructive">{form.formState.errors.customerPhone.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="travelers">Number of Travelers</Label>
              <Input id="travelers" type="number" {...form.register("travelers")} />
              {form.formState.errors.travelers && <p className="text-sm text-destructive">{form.formState.errors.travelers.message}</p>}
            </div>
          </div>
          
           <div className="space-y-2">
            <Label>Package</Label>
              <Controller
                name="packageId"
                control={form.control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => {
                        const selectedPkg = packages.find(p => p.id === value);
                        field.onChange(value);
                        form.setValue('packageName', selectedPkg?.title || '');
                    }} 
                    value={field.value}
                  >
                    <SelectTrigger><SelectValue placeholder="Select a package" /></SelectTrigger>
                    <SelectContent>
                      {packages.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              <Input type="hidden" {...form.register("packageName")} />
               {form.formState.errors.packageId && <p className="text-sm text-destructive">{form.formState.errors.packageId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Controller
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                 {form.formState.errors.departureDate && <p className="text-sm text-destructive">{form.formState.errors.departureDate.message}</p>}
              </div>

            <div className="space-y-2">
              <Label>Booking Status</Label>
               <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/bookings')}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
