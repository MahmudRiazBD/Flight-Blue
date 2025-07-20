
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { destinations as initialDestinations, Destination } from "@/lib/data";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [newDestinationName, setNewDestinationName] = useState("");
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
    setNewDestinationName("");
    setIsDialogOpen(true);
  }

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setNewDestinationName(destination.name);
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
    if (!newDestinationName.trim()) {
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
        d.id === editingDestination.id ? { ...d, name: newDestinationName } : d
      ));
      toast({
        title: "Destination Updated",
        description: "The destination has been successfully updated.",
      });
    } else {
      // Adding new destination
      const newDestination: Destination = {
        id: `dest-${new Date().getTime()}`,
        name: newDestinationName,
      };
      setDestinations([...destinations, newDestination]);
      toast({
        title: "Destination Added",
        description: `"${newDestinationName}" has been added.`,
      });
    }

    setIsDialogOpen(false);
    setNewDestinationName("");
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
              <TableHead>Destination Name</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.map((dest) => (
              <TableRow key={dest.id}>
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDestination ? "Edit Destination" : "Add New Destination"}</DialogTitle>
              <DialogDescription>
                {editingDestination ? "Update the name of the destination." : "Enter the name for the new destination."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        Name
                    </Label>
                    <Input 
                        id="name" 
                        value={newDestinationName}
                        onChange={(e) => setNewDestinationName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., London, UK"
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
