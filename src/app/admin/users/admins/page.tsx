
"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/users";

function getInitials(name: string | null = ""): string {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminAdminsPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // In a real app, you would fetch users from your database
    // For now, we use mock data filtered for admins and superadmins
    const adminUsers = mockUsers.filter(u => u.role === 'admin' || u.role === 'superadmin');
    setUsers(adminUsers);
  }, []);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>View and manage site administrators.</CardDescription>
        </div>
        <Button size="sm" className="gap-1" disabled>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Admin
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
                            <Badge variant={user.role === 'superadmin' ? "destructive" : "default"}>{user.role}</Badge>
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
                                <DropdownMenuItem disabled>
                                    <ShieldAlert className="mr-2 h-4 w-4"/>
                                    Manage Permissions
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
