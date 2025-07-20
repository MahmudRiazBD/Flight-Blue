
"use client"

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "@/hooks/use-auth";

const addUserSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("A valid email is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.enum(["customer", "staff", "admin"]), // superadmin cannot be added manually
});

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newUser: Omit<User, 'uid'>) => void;
  defaultRole: UserRole;
};

export default function AddUserModal({ isOpen, onClose, onSave, defaultRole }: AddUserModalProps) {
  
  const form = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: defaultRole,
    },
  });

  // Reset form when modal opens with a new default role
  useState(() => {
    form.reset({ role: defaultRole });
  }, [isOpen, defaultRole, form]);

  if (!isOpen) {
    return null;
  }

  const onSubmit = (data: z.infer<typeof addUserSchema>) => {
    // Note: In a real app, you would not handle the password like this.
    // This is a simulation. You would securely send this to your backend
    // to create a user with Firebase Auth.
    const newUser: Omit<User, 'uid' | 'photoURL'> = {
        ...data,
    };
    onSave(newUser);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { form.reset(); onClose(); }}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign a role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...form.register("firstName")} />
                    {form.formState.errors.firstName && <p className="text-destructive text-sm mt-1">{form.formState.errors.firstName.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...form.register("lastName")} />
                     {form.formState.errors.lastName && <p className="text-destructive text-sm mt-1">{form.formState.errors.lastName.message}</p>}
                </div>
            </div>
             <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                 {form.formState.errors.email && <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>}
            </div>
             <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} />
                 {form.formState.errors.password && <p className="text-destructive text-sm mt-1">{form.formState.errors.password.message}</p>}
            </div>
             <div>
                 <Label htmlFor="role">Role</Label>
                 <Controller
                    name="role"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                 />
                 {form.formState.errors.role && <p className="text-destructive text-sm mt-1">{form.formState.errors.role.message}</p>}
            </div>
            
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save User</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
