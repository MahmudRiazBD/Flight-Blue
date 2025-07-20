
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
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/media", label: "Media", icon: Image },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { logout } = useAuth();
  const [openPackages, setOpenPackages] = useState(pathname.startsWith('/admin/packages'));
  const [openUsers, setOpenUsers] = useState(pathname.startsWith('/admin/users'));

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
                    open={item.label === 'Packages' ? openPackages : openUsers} 
                    onOpenChange={item.label === 'Packages' ? setOpenPackages : setOpenUsers}
                 >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                       <SidebarMenuButton
                        className="justify-between"
                        isActive={pathname.startsWith(item.label === 'Packages' ? '/admin/packages' : '/admin/users')}
                        tooltip={item.label}
                      >
                         <div className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.label}</span>
                         </div>
                         <ChevronDown className={cn("size-4 transition-transform", (item.label === 'Packages' ? openPackages : openUsers) && "rotate-180")} />
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
