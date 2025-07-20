
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { packageTypes as initialPackageTypes, PackageType } from "@/lib/data";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import MediaPicker from "@/components/admin/MediaPicker";

export default function AdminPackageTypesPage() {
  const [packageTypes, setPackageTypes] = useState<PackageType[]>(initialPackageTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PackageType | null>(null);
  const [currentType, setCurrentType] = useState<Partial<PackageType>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTypes = localStorage.getItem('packageTypes');
      if (storedTypes) {
        setPackageTypes(JSON.parse(storedTypes));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('packageTypes', JSON.stringify(packageTypes));
    }
  }, [packageTypes]);
  
  const handleAddNew = () => {
    setEditingType(null);
    setCurrentType({
      name: "",
      imageUrl: "https://placehold.co/600x400.png"
    });
    setIsDialogOpen(true);
  }

  const handleEdit = (type: PackageType) => {
    setEditingType(type);
    setCurrentType(type);
    setIsDialogOpen(true);
  }

  const handleDelete = (id: string) => {
    setPackageTypes(packageTypes.filter(d => d.id !== id));
    toast({
        title: "Package Type Deleted",
        description: "The package type has been successfully deleted.",
        variant: "destructive"
    });
  }

  const handleSave = () => {
    if (!currentType.name?.trim()) {
      toast({
        title: "Error",
        description: "Package type name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (editingType) {
      // Editing existing type
      setPackageTypes(packageTypes.map(t => 
        t.id === editingType.id ? { ...editingType, ...currentType } : t
      ));
      toast({
        title: "Package Type Updated",
        description: "The package type has been successfully updated.",
      });
    } else {
      // Adding new type
      const newPackageType: PackageType = {
        id: `type-${new Date().getTime()}`,
        name: currentType.name,
        imageUrl: currentType.imageUrl || "https://placehold.co/600x400.png"
      };
      setPackageTypes([...packageTypes, newPackageType]);
      toast({
        title: "Package Type Added",
        description: `"${currentType.name}" has been added.`,
      });
    }

    setIsDialogOpen(false);
    setCurrentType({});
    setEditingType(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Package Types</CardTitle>
            <CardDescription>Manage package types (e.g., Tour, Hajj, Umrah).</CardDescription>
        </div>
        <Button size="sm" className="gap-1" onClick={handleAddNew}>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Package Type
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Type Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packageTypes.map((type) => (
              <TableRow key={type.id}>
                 <TableCell>
                  <Image 
                    src={type.imageUrl} 
                    alt={type.name} 
                    width={64} 
                    height={48} 
                    className="rounded-md object-cover aspect-[4/3]"
                  />
                </TableCell>
                <TableCell className="font-medium">{type.name}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(type)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(type.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingType ? "Edit Package Type" : "Add New Package Type"}</DialogTitle>
              <DialogDescription>
                {editingType ? "Update the details of the package type." : "Enter the details for the new package type."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                        id="name" 
                        value={currentType.name || ""}
                        onChange={(e) => setCurrentType(prev => ({...prev, name: e.target.value}))}
                        className="col-span-3"
                        placeholder="e.g., Special Tour"
                    />
                </div>
                 <div className="space-y-2">
                  <Label>Image</Label>
                  <MediaPicker 
                    imageUrl={currentType.imageUrl || ""}
                    onImageUrlChange={(url) => setCurrentType(prev => ({...prev, imageUrl: url}))}
                  />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                 <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
    </Card>
  );
}
