
"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/users"; // Using mock data for now

const roleColors: Record<UserRole, "default" | "secondary" | "destructive"> = {
  customer: "secondary",
  staff: "default",
  admin: "default",
  superadmin: "destructive",
};

function getInitials(name: string | null = ""): string {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}


export default function AdminAllUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you would fetch users from your database
    // For now, we use mock data
    setUsers(mockUsers);
  }, []);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // In a real app, you'd call an API to update the user's role in the database.
    setUsers(prevUsers =>
      prevUsers.map(user => (user.uid === userId ? { ...user, role: newRole } : user))
    );
    const user = users.find(u => u.uid === userId);
    toast({
        title: "Role Updated",
        description: `${user?.displayName}'s role has been changed to ${newRole}.`
    })
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.uid === userId);
    setUsers(prevUsers => prevUsers.filter(user => user.uid !== userId));
     toast({
        title: "User Deleted",
        description: `User ${user?.displayName} has been removed.`,
        variant: "destructive"
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
        </div>
        <Button size="sm" className="gap-1" disabled>
            <PlusCircle className="h-3.5 w-3.5" />
            Add User
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.displayName}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={roleColors[user.role]}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
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
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup value={user.role} onValueChange={(role) => handleRoleChange(user.uid, role as UserRole)}>
                                            <DropdownMenuRadioItem value="customer">Customer</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="staff">Staff</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.uid)}>
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Delete User
                                </DropdownMenuItem>
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
