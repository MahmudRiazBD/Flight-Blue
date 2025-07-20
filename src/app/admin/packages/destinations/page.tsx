
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { destinations as initialDestinations, Destination } from "@/lib/data";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import MediaPicker from "@/components/admin/MediaPicker";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [currentDestination, setCurrentDestination] = useState<Partial<Destination>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDestinations = localStorage.getItem('destinations');
      if (storedDestinations) {
        setDestinations(JSON.parse(storedDestinations));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('destinations', JSON.stringify(destinations));
    }
  }, [destinations]);
  
  const handleAddNew = () => {
    setEditingDestination(null);
    setCurrentDestination({
      name: "",
      imageUrl: "https://placehold.co/600x400.png"
    });
    setIsDialogOpen(true);
  }

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setCurrentDestination(destination);
    setIsDialogOpen(true);
  }

  const handleDelete = (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id));
    toast({
        title: "Destination Deleted",
        description: "The destination has been successfully deleted.",
        variant: "destructive"
    });
  }

  const handleSave = () => {
    if (!currentDestination.name?.trim()) {
      toast({
        title: "Error",
        description: "Destination name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (editingDestination) {
      // Editing existing destination
      setDestinations(destinations.map(d => 
        d.id === editingDestination.id ? { ...editingDestination, ...currentDestination } : d
      ));
      toast({
        title: "Destination Updated",
        description: "The destination has been successfully updated.",
      });
    } else {
      // Adding new destination
      const newDestination: Destination = {
        id: `dest-${new Date().getTime()}`,
        name: currentDestination.name,
        imageUrl: currentDestination.imageUrl || "https://placehold.co/600x400.png"
      };
      setDestinations([...destinations, newDestination]);
      toast({
        title: "Destination Added",
        description: `"${currentDestination.name}" has been added.`,
      });
    }

    setIsDialogOpen(false);
    setCurrentDestination({});
    setEditingDestination(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Destinations</CardTitle>
            <CardDescription>Manage your package destinations.</CardDescription>
        </div>
        <Button size="sm" className="gap-1" onClick={handleAddNew}>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Destination
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Destination Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.map((dest) => (
              <TableRow key={dest.id}>
                <TableCell>
                  <Image 
                    src={dest.imageUrl} 
                    alt={dest.name} 
                    width={64} 
                    height={48} 
                    className="rounded-md object-cover aspect-[4/3]"
                  />
                </TableCell>
                <TableCell className="font-medium">{dest.name}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(dest)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(dest.id)} className="text-destructive">
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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDestination ? "Edit Destination" : "Add New Destination"}</DialogTitle>
              <DialogDescription>
                {editingDestination ? "Update the details of the destination." : "Enter the details for the new destination."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                        id="name" 
                        value={currentDestination.name || ""}
                        onChange={(e) => setCurrentDestination(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g., London, UK"
                    />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <MediaPicker 
                    imageUrl={currentDestination.imageUrl || ""}
                    onImageUrlChange={(url) => setCurrentDestination(prev => ({...prev, imageUrl: url}))}
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
