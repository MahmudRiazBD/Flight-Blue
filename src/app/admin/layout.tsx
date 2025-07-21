
"use client"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import Logo from "@/components/icons/Logo"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  BookCopy,
  Users,
  FileText,
  LogOut,
  Settings,
  Image,
  ChevronDown,
  Mail,
  User as UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useAuth, User } from "@/hooks/use-auth.tsx"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import UserProfileModal from "@/components/admin/UserProfileModal";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { 
    label: "Packages", 
    icon: Package,
    subItems: [
        { href: "/admin/packages/all", label: "All Packages" },
        { href: "/admin/packages/destinations", label: "Destinations" },
        { href: "/admin/packages/types", label: "Types" },
    ]
  },
  { href: "/admin/bookings", label: "Bookings", icon: BookCopy },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  {
    label: "Users",
    icon: Users,
    subItems: [
      { href: "/admin/users/all", label: "All Users" },
      { href: "/admin/users/admins", label: "Admins" },
      { href: "/admin/users/staff", label: "Staff" },
      { href: "/admin/users/customers", label: "Customers" },
    ]
  },
  { 
    label: "Blog", 
    icon: FileText,
    subItems: [
        { href: "/admin/blog/posts", label: "All Posts" },
        { href: "/admin/blog/categories", label: "Categories" },
    ]
  },
  { href: "/admin/media", label: "Media", icon: Image },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [openState, setOpenState] = useState({
    packages: pathname.startsWith('/admin/packages'),
    users: pathname.startsWith('/admin/users'),
    blog: pathname.startsWith('/admin/blog'),
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenChange = (key: keyof typeof openState) => (isOpen: boolean) => {
    setOpenState(prev => ({...prev, [key]: isOpen }));
  }

  const getOpenStatus = (label: string): boolean => {
      if(label === 'Packages') return openState.packages;
      if(label === 'Users') return openState.users;
      if(label === 'Blog') return openState.blog;
      return false;
  }
  
  const getOpenChangeHandler = (label: string) => {
      if(label === 'Packages') return handleOpenChange('packages');
      if(label === 'Users') return handleOpenChange('users');
      if(label === 'Blog') return handleOpenChange('blog');
      return () => {};
  }
  
  const getIsActive = (label: string) => {
      if(label === 'Packages') return pathname.startsWith('/admin/packages');
      if(label === 'Users') return pathname.startsWith('/admin/users');
      if(label === 'Blog') return pathname.startsWith('/admin/blog');
      return false;
  }

  const handleSaveProfile = async (updatedUser: User) => {
     try {
        const db = getFirestore(getFirebaseApp());
        const userRef = doc(db, "users", updatedUser.uid);
        const { uid, ...dataToSave } = updatedUser;
        await updateDoc(userRef, dataToSave);
        setIsProfileModalOpen(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated. Changes will be reflected on next login."
        });
    } catch (error) {
        console.error("Error saving profile:", error);
        toast({ title: "Error", description: "Failed to save your profile.", variant: "destructive" });
    }
  }

  return (
    <>
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="size-8 text-sidebar-primary" />
            <span className="text-xl font-headline font-semibold text-sidebar-foreground">
              Flight Blu
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              item.subItems ? (
                 <Collapsible 
                    key={item.label} 
                    open={getOpenStatus(item.label)} 
                    onOpenChange={getOpenChangeHandler(item.label)}
                 >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                       <SidebarMenuButton
                        className="justify-between"
                        isActive={getIsActive(item.label)}
                        tooltip={item.label}
                      >
                         <div className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.label}</span>
                         </div>
                         <ChevronDown className={cn("size-4 transition-transform", getOpenStatus(item.label) && "rotate-180")} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.subItems.map(subItem => (
                            <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                    <Link href={subItem.href}>
                                        <span>{subItem.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                 </Collapsible>
              ) : (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href!}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/admin/settings"} tooltip="Settings">
                <Link href="/admin/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Logout" onClick={logout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-2 px-2">
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                     <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                     <span className="text-xs text-muted-foreground">{user.role}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                   <UserIcon className="mr-2 h-4 w-4" />
                   <span>My Profile</span>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link href="/">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>View Site</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                   <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
    {user && (
        <UserProfileModal 
            user={user}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleSaveProfile}
            isEditingSelf={true}
        />
      )}
    </>
  )
}
