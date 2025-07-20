
"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/users"; 
import UserProfileModal from "@/components/admin/UserProfileModal";
import { getInitials } from "@/lib/utils";

export default function AdminCustomersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const loadUsers = () => {
      const storedUsers = localStorage.getItem('mockUsers');
      const currentUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers;
      setAllUsers(currentUsers);
      const customerUsers = currentUsers.filter((u:User) => u.role === 'customer');
      setUsers(customerUsers);
  };
  
  useEffect(() => {
    loadUsers();
     // Listen to storage changes to update if another tab changes the users
    window.addEventListener('storage', loadUsers);
    return () => {
      window.removeEventListener('storage', loadUsers);
    };
  }, []);

  const handleDeleteUser = (userId: string) => {
    const user = allUsers.find(u => u.uid === userId);
    const updatedAllUsers = allUsers.filter(u => u.uid !== userId);
    localStorage.setItem('mockUsers', JSON.stringify(updatedAllUsers));
    loadUsers();
     toast({
        title: "User Deleted",
        description: `User ${user?.firstName} has been removed.`,
        variant: "destructive"
    });
  }

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }

  const handleSaveUser = (updatedUser: User) => {
    const updatedAllUsers = allUsers.map(u => u.uid === updatedUser.uid ? updatedUser : u);
    localStorage.setItem('mockUsers', JSON.stringify(updatedAllUsers));
    loadUsers(); // Reload the filtered list
    setIsModalOpen(false);
    toast({
      title: "User Updated",
      description: `${updatedUser.firstName}'s profile has been saved.`
    })
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>View and manage customer accounts.</CardDescription>
        </div>
         <Button size="sm" className="gap-1" disabled>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Customer
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
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
                                    <AvatarImage src={user.photoURL || undefined} alt={`${user.firstName} ${user.lastName}`} />
                                    <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.firstName} {user.lastName}</span>
                            </div>
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
                                 <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
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
    {selectedUser && (
        <UserProfileModal 
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveUser}
        />
      )}
    </>
  );
}
