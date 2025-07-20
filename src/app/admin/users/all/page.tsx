
"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/users"; // Using mock data for now
import UserProfileModal from "@/components/admin/UserProfileModal";
import { getInitials } from "@/lib/utils";

const roleColors: Record<UserRole, "default" | "secondary" | "destructive"> = {
  customer: "secondary",
  staff: "default",
  admin: "default",
  superadmin: "destructive",
};

export default function AdminAllUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch users from your database
    // For now, we use mock data and store/retrieve from localStorage to see changes across pages
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(mockUsers);
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    }
  }, []);

  useEffect(() => {
    // Update localStorage whenever users state changes
    if (users.length > 0) {
        localStorage.setItem('mockUsers', JSON.stringify(users));
    }
  }, [users]);


  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prevUsers =>
      prevUsers.map(user => (user.uid === userId ? { ...user, role: newRole } : user))
    );
    const user = users.find(u => u.uid === userId);
    toast({
        title: "Role Updated",
        description: `${user?.firstName}'s role has been changed to ${newRole}.`
    })
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.uid === userId);
    setUsers(prevUsers => prevUsers.filter(user => user.uid !== userId));
     toast({
        title: "User Deleted",
        description: `User ${user?.firstName} has been removed.`,
        variant: "destructive"
    })
  }

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }

  const handleSaveUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => user.uid === updatedUser.uid ? updatedUser : user));
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
                                      <AvatarImage src={user.photoURL || undefined} alt={`${user.firstName} ${user.lastName}`} />
                                      <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{user.firstName} {user.lastName}</span>
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
                                  <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
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
