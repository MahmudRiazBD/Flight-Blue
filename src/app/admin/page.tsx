"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Package, Users, BookCopy, Database, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const kpiData = [
    { title: "Total Revenue", value: "৳12,543,000", icon: Banknote, change: "+20.1% from last month" },
    { title: "Total Bookings", value: "2350", icon: BookCopy, change: "+180.1% from last month" },
    { title: "Active Packages", value: "6", icon: Package, change: "+2 since last month" },
    { title: "New Customers", value: "124", icon: Users, change: "+15% from last month" },
]

const chartData = [
  { name: 'Jan', bookings: 400 },
  { name: 'Feb', bookings: 300 },
  { name: 'Mar', bookings: 500 },
  { name: 'Apr', bookings: 780 },
  { name: 'May', bookings: 600 },
  { name: 'Jun', bookings: 800 },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDatabase();
      toast({
        title: result.success ? "Database Seeded" : "Seeding Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while seeding.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Quick Actions</CardTitle>
            </div>
            <Button onClick={handleSeedDatabase} disabled={isSeeding}>
                {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                {isSeeding ? "Seeding..." : "Seed Database"}
            </Button>
        </CardHeader>
         <CardContent>
             <p className="text-sm text-muted-foreground">
                If your app is missing data (packages, posts, etc.), click this button to populate the Firestore database with initial demo data. This action is safe to run multiple times.
            </p>
         </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
            <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground">{kpi.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bookings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="hsl(var(--primary))" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
