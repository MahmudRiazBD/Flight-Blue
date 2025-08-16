
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import Logo from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or username cannot be empty." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
  rememberMe: z.boolean().default(false).optional(),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();
  const [formLoading, setFormLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true,
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setFormLoading(true);
    try {
      const user = await login(values.identifier, values.password, values.rememberMe);

      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting you...",
      });
      
      const redirectPath = (user.role === "admin" || user.role === "superadmin") ? "/admin" : "/dashboard";
      
      router.push(redirectPath);
      router.refresh();

    } catch (error: any) {
      console.error("Login Failed", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid credentials. Please try again.";
      } else if (error.code === 'auth/configuration-not-found' || error.message.includes("Firebase is not initialized")) {
        errorMessage = "Authentication service is not ready. Please try again in a moment.";
      } else {
        errorMessage = error.message; // Use custom error message from the hook
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  }
  
  const isLoading = formLoading || authLoading;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-secondary">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Username</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com or your_username" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Remember me
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Link
                  href="#"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
