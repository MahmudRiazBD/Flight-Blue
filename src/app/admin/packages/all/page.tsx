"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "@/lib/data";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import AddPackageForm from "@/components/admin/AddPackageForm";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAllPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadPackages = async () => {
    setLoading(true);
    try {
      const db = getFirestore(getFirebaseApp());
      const packagesCollection = collection(db, "packages");
      const packagesSnapshot = await getDocs(packagesCollection);
      const packagesList = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Package));
      setPackages(packagesList);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({ title: "Error", description: "Could not fetch packages.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const addPackage = async (newPackageData: Omit<Package, 'id'>) => {
    try {
      const db = getFirestore(getFirebaseApp());
      const packagesCollection = collection(db, "packages");
      await addDoc(packagesCollection, newPackageData);
      toast({
        title: "Package Added!",
        description: `The package "${newPackageData.title}" has been successfully created.`,
      });
      setIsDialogOpen(false);
      loadPackages(); // Refresh the list
    } catch (error) {
      console.error("Error adding package:", error);
      toast({ title: "Error", description: "Failed to add the new package.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>Manage your tour, Hajj, and Umrah packages.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
             <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                Add Package
             </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Package</DialogTitle>
              <DialogDescription>
                Fill in the details of the new package. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <AddPackageForm onSave={addPackage} setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.title}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.type === "Tour" ? "secondary" : "default"}>
                      {pkg.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{pkg.destination}</TableCell>
                  <TableCell>৳{pkg.price.toLocaleString()}</TableCell>
                   <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && packages.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No packages found. Seed the database from the dashboard or add a new package.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
