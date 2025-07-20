
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { packages as initialPackages, Package } from "@/lib/data";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import AddPackageForm from "@/components/admin/AddPackageForm";

export default function AdminAllPackagesPage() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addPackage = (newPackage: Package) => {
    const newPackages = [...packages, newPackage];
    setPackages(newPackages);
    // In a real app, you'd also save this to your database
    // For demo purposes, we can use localStorage to persist across refreshes
    if (typeof window !== 'undefined') {
        localStorage.setItem('packages', JSON.stringify(newPackages));
    }
  };

  // This effect will run on the client side to load packages from localStorage
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        setPackages(JSON.parse(storedPackages));
      }
    }
  });


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
            {packages.map((pkg) => (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
