
"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import UserProfileModal from "@/components/admin/UserProfileModal";
import AddUserModal from "@/components/admin/AddUserModal";
import { getInitials } from "@/lib/utils";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteUser } from "@/lib/actions";

export default function AdminStaffPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const db = getFirestore(getFirebaseApp());
      const usersCollection = collection(db, "users");
      const staffQuery = query(usersCollection, where("role", "==", "staff"));
      const usersSnapshot = await getDocs(staffQuery);
      const staffUsers = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
      setUsers(staffUsers);
    } catch (error) {
      console.error("Error fetching staff users:", error);
      toast({
        title: "Error loading staff",
        description: "Could not fetch user data from the database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.uid === userId);
     if (!userToDelete) return;

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
        title: "Staff Member Added",
        description: `User ${newUser.firstName} has been created.`
      });
      setIsAddModalOpen(false);
      loadUsers(); // Refresh list
    } catch (error: any) {
       console.error("Failed to add staff:", error);
        toast({
            title: "Error adding staff",
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
        loadUsers();
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
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>View and manage staff accounts.</CardDescription>
        </div>
         <Button size="sm" className="gap-1" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Staff
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {loading ? (
                    Array.from({ length: 1 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
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
                                        <UserIcon className="mr-2 h-4 w-4"/>
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
        defaultRole="staff"
      />
    </>
  );
}
