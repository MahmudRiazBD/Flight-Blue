
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "../icons/Logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
];

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn, role, logout } = useAuth();
  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold font-headline text-xl">Flight Blu</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center justify-end space-x-2">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={isAdmin ? "/admin" : "/dashboard"}>Dashboard</Link>
              </Button>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col p-6">
                <Link href="/" className="flex items-center gap-2 mb-8">
                  <Logo className="h-8 w-8 text-primary" />
                  <span className="font-bold font-headline text-xl">Flight Blu</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-lg",
                        pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 pt-4 border-t border-border flex flex-col space-y-2">
                    {isLoggedIn ? (
                       <>
                          <Button asChild><Link href={isAdmin ? "/admin" : "/dashboard"}>Dashboard</Link></Button>
                          <Button variant="outline" onClick={logout}>Logout</Button>
                       </>
                    ) : (
                        <>
                            <Button variant="outline" asChild><Link href="/login">Login</Link></Button>
                            <Button asChild><Link href="/signup">Sign Up</Link></Button>
                        </>
                    )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
