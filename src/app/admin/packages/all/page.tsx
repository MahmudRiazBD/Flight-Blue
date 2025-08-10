
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "@/lib/data";
import { PlusCircle, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import AddPackageForm from "@/components/admin/AddPackageForm";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminAllPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const db = getFirestore(getFirebaseApp());
  const router = useRouter();

  const loadPackages = async () => {
    setLoading(true);
    try {
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
      const packagesCollection = collection(db, "packages");
      await addDoc(packagesCollection, newPackageData);
      toast({
        title: "Package Added!",
        description: `The package "${newPackageData.title}" has been successfully created.`,
      });
      setIsAddDialogOpen(false);
      loadPackages(); // Refresh the list
    } catch (error) {
      console.error("Error adding package:", error);
      toast({ title: "Error", description: "Failed to add the new package.", variant: "destructive" });
    }
  };
  
  const handleDelete = async (packageId: string) => {
    try {
        await deleteDoc(doc(db, "packages", packageId));
        toast({
            title: "Package Deleted",
            description: "The package has been successfully deleted.",
            variant: "destructive"
        });
        loadPackages();
    } catch (e) {
        toast({ title: "Error", description: "Could not delete package.", variant: "destructive"});
    }
  }
  
  const handleEdit = (pkg: Package) => {
     router.push(`/admin/packages/edit/${pkg.id}`);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>Manage your tour, Hajj, and Umrah packages.</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <AddPackageForm onSave={addPackage} setDialogOpen={setIsAddDialogOpen} />
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
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(pkg)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the package "{pkg.title}". This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(pkg.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
