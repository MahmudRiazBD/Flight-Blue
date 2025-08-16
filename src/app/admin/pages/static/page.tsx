
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { SitePagesSettings, FaqItem } from "@/lib/data";
import { Separator } from "@/components/ui/separator";

export default function AdminStaticPages() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<SitePagesSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const db = getFirestore(getFirebaseApp());
    const settingsRef = doc(db, "settings", "sitePages");

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const settingsDoc = await getDoc(settingsRef);
                if (settingsDoc.exists()) {
                    setSettings(settingsDoc.data() as SitePagesSettings);
                } else {
                    setSettings({
                        aboutUs: { title: "", content: "", status: 'published' },
                        faq: { title: "", items: [], status: 'published' },
                        terms: { title: "", content: "", status: 'published' },
                        privacy: { title: "", content: "", status: 'published' },
                    });
                }
            } catch (error) {
                console.error("Error fetching static page settings:", error);
                toast({ title: "Error", description: "Could not load page settings.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);
    
    const handleSettingsChange = (page: keyof SitePagesSettings, field: string, value: any) => {
        setSettings(prev => prev ? ({
            ...prev,
            [page]: { ...prev[page], [field]: value }
        }) : null);
    }

    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        if (!settings) return;
        const newItems = [...settings.faq.items];
        newItems[index] = { ...newItems[index], [field]: value };
        handleSettingsChange('faq', 'items', newItems);
    }
    
    const addFaqItem = () => {
        if (!settings) return;
        const newItems = [...settings.faq.items, { id: `faq-${Date.now()}`, question: "", answer: "" }];
        handleSettingsChange('faq', 'items', newItems);
    }

    const removeFaqItem = (index: number) => {
        if (!settings) return;
        const newItems = settings.faq.items.filter((_, i) => i !== index);
        handleSettingsChange('faq', 'items', newItems);
    }

    const handleSaveChanges = async () => {
        if (!settings) return;
        try {
            await setDoc(settingsRef, settings, { merge: true });
            toast({
                title: "Settings Saved!",
                description: "Your static page content has been updated.",
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
                    <CardTitle>Static Page Settings</CardTitle>
                    <CardDescription>Manage content for fixed pages like About Us, FAQ, etc.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

  return (
    <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Static Page Settings</CardTitle>
            <CardDescription>Manage content for fixed pages like About Us, FAQ, etc. Click "Save All Changes" at the bottom when you're done.</CardDescription>
          </CardHeader>
        </Card>

        {/* About Us Section */}
        <Card id="about-us">
            <CardHeader>
                <CardTitle>About Us Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="aboutTitle">Page Title</Label>
                    <Input id="aboutTitle" value={settings?.aboutUs?.title || ''} onChange={(e) => handleSettingsChange('aboutUs', 'title', e.target.value)} />
                </div>
                 <div>
                    <Label htmlFor="aboutContent">Page Content (Markdown supported)</Label>
                    <Textarea id="aboutContent" value={settings?.aboutUs?.content || ''} onChange={(e) => handleSettingsChange('aboutUs', 'content', e.target.value)} rows={10} />
                </div>
            </CardContent>
        </Card>
        
        {/* FAQ Section */}
        <Card id="faq">
            <CardHeader>
                <CardTitle>FAQ Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="faqTitle">Page Title</Label>
                    <Input id="faqTitle" value={settings?.faq?.title || ''} onChange={(e) => handleSettingsChange('faq', 'title', e.target.value)} />
                </div>
                <Separator />
                <Label>Questions & Answers</Label>
                {settings?.faq?.items.map((item, index) => (
                    <div key={item.id} className="space-y-2 p-4 border rounded-md relative">
                         <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeFaqItem(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div>
                            <Label htmlFor={`faq-q-${index}`}>Question</Label>
                            <Input id={`faq-q-${index}`} value={item.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor={`faq-a-${index}`}>Answer (Markdown supported)</Label>
                            <Textarea id={`faq-a-${index}`} value={item.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} rows={3} />
                        </div>
                    </div>
                ))}
                 <Button variant="outline" onClick={addFaqItem}><PlusCircle className="mr-2"/> Add FAQ Item</Button>
            </CardContent>
        </Card>
        
        {/* Terms of Service Section */}
         <Card id="terms-of-service">
            <CardHeader>
                <CardTitle>Terms of Service Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="termsTitle">Page Title</Label>
                    <Input id="termsTitle" value={settings?.terms?.title || ''} onChange={(e) => handleSettingsChange('terms', 'title', e.target.value)} />
                </div>
                 <div>
                    <Label htmlFor="termsContent">Page Content (Markdown supported)</Label>
                    <Textarea id="termsContent" value={settings?.terms?.content || ''} onChange={(e) => handleSettingsChange('terms', 'content', e.target.value)} rows={10} />
                </div>
            </CardContent>
        </Card>
        
        {/* Privacy Policy Section */}
        <Card id="privacy-policy">
            <CardHeader>
                <CardTitle>Privacy Policy Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="privacyTitle">Page Title</Label>
                    <Input id="privacyTitle" value={settings?.privacy?.title || ''} onChange={(e) => handleSettingsChange('privacy', 'title', e.target.value)} />
                </div>
                 <div>
                    <Label htmlFor="privacyContent">Page Content (Markdown supported)</Label>
                    <Textarea id="privacyContent" value={settings?.privacy?.content || ''} onChange={(e) => handleSettingsChange('privacy', 'content', e.target.value)} rows={10} />
                </div>
            </CardContent>
        </Card>

        <div className="sticky bottom-6 flex justify-end">
            <Button size="lg" onClick={handleSaveChanges}>Save All Changes</Button>
        </div>
    </div>
  );
}
