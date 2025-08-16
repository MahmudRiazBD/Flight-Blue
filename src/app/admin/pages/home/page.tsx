
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import { Textarea } from "@/components/ui/textarea";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { HomePageSettings } from "@/lib/data";


export default function AdminHomePageSettings() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<HomePageSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const db = getFirestore(getFirebaseApp());
                const settingsDoc = await getDoc(doc(db, "settings", "homePage"));
                if (settingsDoc.exists()) {
                    setSettings(settingsDoc.data() as HomePageSettings);
                } else {
                    // Initialize with default values if not found
                    setSettings({
                        heroImageUrl: "https://placehold.co/1920x1080.png",
                        heroTitle: "Your Adventure Awaits",
                        heroSubtitle: "Discover breathtaking destinations and create unforgettable memories with Flight Blu.",
                        heroButtonLabel: "Explore Packages",
                        heroButtonLink: "/packages",
                    });
                }
            } catch (error) {
                console.error("Error fetching homepage settings:", error);
                toast({ title: "Error", description: "Could not load homepage settings.", variant: "destructive"});
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);
    
    const handleSettingsChange = (field: keyof HomePageSettings, value: any) => {
        setSettings(prev => prev ? ({...prev, [field]: value}) : null);
    }
    
    const handleSaveChanges = async () => {
        if (!settings) return;
        const db = getFirestore(getFirebaseApp());
        const settingsRef = doc(db, "settings", "homePage");
        try {
            await setDoc(settingsRef, settings, { merge: true });
            toast({
                title: "Settings Saved!",
                description: "Your homepage settings have been updated.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
    };
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Home Page Settings</CardTitle>
                    <CardDescription>Manage the content of your site's home page.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }
    
    if (!settings) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not load home page settings. Please try again later.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Settings</CardTitle>
        <CardDescription>Manage the content of your site's home page from here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Hero Section</h3>
            <div className="space-y-2">
                <Label>Hero Image</Label>
                <MediaPicker 
                    imageUrl={settings.heroImageUrl} 
                    onImageUrlChange={(url) => handleSettingsChange('heroImageUrl', url)}
                />
                <p className="text-sm text-muted-foreground">Recommended size: 1920x1080px. This will be the main background image.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input 
                    id="heroTitle" 
                    value={settings.heroTitle}
                    onChange={(e) => handleSettingsChange('heroTitle', e.target.value)}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Textarea 
                    id="heroSubtitle" 
                    value={settings.heroSubtitle}
                    onChange={(e) => handleSettingsChange('heroSubtitle', e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="heroButtonLabel">Button Label</Label>
                    <Input 
                        id="heroButtonLabel" 
                        value={settings.heroButtonLabel}
                        onChange={(e) => handleSettingsChange('heroButtonLabel', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="heroButtonLink">Button Link</Label>
                    <Input 
                        id="heroButtonLink" 
                        value={settings.heroButtonLink}
                        onChange={(e) => handleSettingsChange('heroButtonLink', e.target.value)}
                        placeholder="/packages"
                    />
                </div>
            </div>
        </div>
        
        <div className="mt-8 pt-6 border-t flex justify-end">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
