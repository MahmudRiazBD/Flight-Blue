
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
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth.tsx"
import { useState } from "react"
import { cn } from "@/lib/utils"

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
  const { logout } = useAuth();
  const [openState, setOpenState] = useState({
    packages: pathname.startsWith('/admin/packages'),
    users: pathname.startsWith('/admin/users'),
    blog: pathname.startsWith('/admin/blog'),
  });

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

  return (
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
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
