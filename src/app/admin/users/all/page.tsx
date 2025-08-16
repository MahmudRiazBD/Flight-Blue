
"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, UserRole, useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import UserProfileModal from "@/components/admin/UserProfileModal";
import AddUserModal from "@/components/admin/AddUserModal";
import { getInitials, cn } from "@/lib/utils";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteUser } from "@/lib/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const roleColors: Record<UserRole, "default" | "secondary" | "destructive"> = {
  customer: "secondary",
  staff: "default",
  admin: "default",
  superadmin: "destructive",
};

export default function AdminAllUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { signup } = useAuth();

  const loadUsers = async () => {
    setLoading(true);
    try {
        const db = getFirestore(getFirebaseApp());
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
        setUsers(usersList);
    } catch (error) {
        console.error("Error fetching users:", error);
        toast({
            title: "Error loading users",
            description: "Could not fetch user data from the database.",
            variant: "destructive"
        });
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const userToUpdate = users.find(u => u.uid === userId);
    if (!userToUpdate || userToUpdate.role === 'superadmin') {
      toast({ title: "Operation not allowed", variant: "destructive" });
      return;
    }
    
    try {
      const db = getFirestore(getFirebaseApp());
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
      setUsers(prevUsers => prevUsers.map(user => (user.uid === userId ? { ...user, role: newRole } : user)));
      
      toast({
          title: "Role Updated",
          description: `${userToUpdate.firstName}'s role has been changed to ${newRole}.`
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.uid === userId);
    if (!userToDelete || userToDelete.role === 'superadmin') {
      toast({ title: "Operation not allowed", description: "Super admin cannot be deleted.", variant: "destructive"});
      return;
    }
    
    const result = await deleteUser(userId);

    if (result.success) {
        setUsers(prevUsers => prevUsers.filter(u => u.uid !== userId));
        toast({
            title: "User Deleted",
            description: `User ${userToDelete.firstName} has been removed from Authentication and Firestore.`,
            variant: "destructive"
        });
    } else {
        toast({ title: "Error Deleting User", description: result.message, variant: "destructive" });
    }
  }
  
  const handleAddUser = async (newUser: Omit<User, 'uid'>) => {
    try {
      await signup(newUser);
      toast({
        title: "User Added",
        description: `User ${newUser.firstName} has been created.`
      });
      setIsAddModalOpen(false);
      loadUsers(); // Refresh the user list
    } catch (error: any) {
        console.error("Failed to add user:", error);
        toast({
            title: "Error adding user",
            description: error.message || "Could not create the new user.",
            variant: "destructive"
        });
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  }

  const handleSaveUser = async (updatedUser: User) => {
    try {
        const db = getFirestore(getFirebaseApp());
        const userRef = doc(db, "users", updatedUser.uid);
        
        const { uid, password, ...dataToSave } = updatedUser;
        
        await updateDoc(userRef, dataToSave);
        setUsers(prevUsers => prevUsers.map(user => user.uid === updatedUser.uid ? updatedUser : user));
        setIsProfileModalOpen(false);
        toast({
        title: "User Updated",
        description: `${updatedUser.firstName}'s profile has been saved.`
        });
    } catch (error) {
        console.error("Error saving user:", error);
        toast({ title: "Error", description: "Failed to save user details.", variant: "destructive" });
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage all registered users.</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              Add User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {loading ? (
                     Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                     ))
                  ) : (
                    users.map((user) => (
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
                            <TableCell>{user.username}</TableCell>
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
                                        <DropdownMenuSubTrigger disabled={user.role === 'superadmin'}>Change Role</DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuRadioGroup value={user.role} onValueChange={(role) => handleRoleChange(user.uid, role as UserRole)}>
                                                <DropdownMenuRadioItem value="customer">Customer</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="staff">Staff</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button className={cn("relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive", user.role === 'superadmin' && "opacity-50 cursor-not-allowed")}
                                             disabled={user.role === 'superadmin'}>
                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                Delete User
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the user account and all associated data. This action cannot be undone.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                  )}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedUser && (
        <UserProfileModal 
            user={selectedUser}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleSaveUser}
        />
      )}
       <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUser}
        defaultRole="customer"
      />
    </>
  );
}
