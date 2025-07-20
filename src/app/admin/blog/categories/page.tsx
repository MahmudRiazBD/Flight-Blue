
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categories as initialCategories, Category } from "@/lib/data";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        localStorage.setItem('categories', JSON.stringify(initialCategories));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);
  
  const handleAddNew = () => {
    setEditingCategory(null);
    setCurrentCategory({ name: "" });
    setIsDialogOpen(true);
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCurrentCategory(category);
    setIsDialogOpen(true);
  }

  const handleDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({
        title: "Category Deleted",
        description: "The category has been successfully deleted.",
        variant: "destructive"
    });
  }

  const handleSave = () => {
    if (!currentCategory.name?.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? { ...editingCategory, ...currentCategory } : c
      ));
      toast({
        title: "Category Updated",
        description: "The category has been successfully updated.",
      });
    } else {
      const newCategory: Category = {
        id: `cat-${new Date().getTime()}`,
        name: currentCategory.name,
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "Category Added",
        description: `"${currentCategory.name}" has been added.`,
      });
    }

    setIsDialogOpen(false);
    setCurrentCategory({});
    setEditingCategory(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Blog Categories</CardTitle>
            <CardDescription>Manage your blog post categories.</CardDescription>
        </div>
        <Button size="sm" className="gap-1" onClick={handleAddNew}>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Category
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(cat)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(cat.id)} className="text-destructive">
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
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update the name of the category." : "Enter the name for the new category."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                        id="name" 
                        value={currentCategory.name || ""}
                        onChange={(e) => setCurrentCategory(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g., Travel Tips"
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
