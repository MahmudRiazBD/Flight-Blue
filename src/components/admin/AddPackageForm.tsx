
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Package, Destination, PackageType } from "@/lib/data";
import { destinations as initialDestinations, packageTypes as initialPackageTypes } from "@/lib/data";
import { useState, useEffect } from "react";
import MediaPicker from "./MediaPicker";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  type: z.string().min(1, "Package type is required."),
  destination: z.string().min(1, "Destination is required."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day."),
  price: z.coerce.number().min(1, "Price is required."),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  imageUrl: z.string().url("Must be a valid URL.").default("https://placehold.co/600x400.png"),
  imageHint: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters."),
});

type AddPackageFormProps = {
  onSave: (newPackage: Package) => void;
  setDialogOpen: (open: boolean) => void;
}

export default function AddPackageForm({ onSave, setDialogOpen }: AddPackageFormProps) {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [packageTypes, setPackageTypes] = useState<PackageType[]>(initialPackageTypes);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDestinations = localStorage.getItem('destinations');
      if (storedDestinations) {
        setDestinations(JSON.parse(storedDestinations));
      }
      const storedPackageTypes = localStorage.getItem('packageTypes');
      if (storedPackageTypes) {
        setPackageTypes(JSON.parse(storedPackageTypes));
      }
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "",
      destination: "",
      duration: 7,
      price: 100000,
      rating: 4.5,
      imageUrl: "https://placehold.co/600x400.png",
      imageHint: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newPackage: Package = {
        ...values,
        id: values.title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
        // For this demo, we'll add some placeholder itinerary/inclusions/exclusions
        itinerary: [{ day: "1", title: "Arrival & Welcome", details: "Arrive and check into your accommodation." }],
        inclusions: ["Accommodation", "Daily Breakfast"],
        exclusions: ["Flights", "Visa Fees"],
    }
    
    onSave(newPackage);
    toast({
      title: "Package Added!",
      description: `The package "${values.title}" has been successfully created.`,
    });
    setDialogOpen(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Parisian Dream Tour" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Describe the package in detail..."
                    className="resize-y"
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Package Type</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a package type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {packageTypes.map(type => (
                                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
             )}
            />
            <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Destination</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a destination" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {destinations.map(dest => (
                         <SelectItem key={dest.id} value={dest.name}>{dest.name}</SelectItem>
                       ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Duration (in days)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (BDT)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Package Image</FormLabel>
                <FormControl>
                    <MediaPicker imageUrl={field.value} onImageUrlChange={field.onChange} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <FormField
            control={form.control}
            name="imageHint"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Image Hint (for AI)</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. paris eiffel tower" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end pt-4">
            <Button type="submit">Save Package</Button>
        </div>
      </form>
    </Form>
  );
}
