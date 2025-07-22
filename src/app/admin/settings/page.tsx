

"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextCursorInput, Link as LinkIcon, Pilcrow, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";

export type SocialLinkPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';

export type SocialLink = {
    id: string;
    platform: SocialLinkPlatform;
    url: string;
};

export type FooterLink = {
    id: string;
    label: string;
    url: string;
}

export type GlobalSettings = {
    siteTitle: string;
    logoUrl: string;
    faviconUrl: string;
    footerDescription: string;
    quickLinks: {
        title: string;
        links: FooterLink[];
    };
    supportLinks: {
        title: string;
        links: FooterLink[];
    };
    socialLinks: SocialLink[];
    googleMapEmbedCode: string;
};


const socialPlatforms: { value: SocialLinkPlatform, label: string }[] = [
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' },
];

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const { settings: contextSettings, setSettings: setContextSettings, loading: contextLoading } = useAppContext();
    const [settings, setSettings] = useState<GlobalSettings | null>(contextSettings);

    // Sync local state with context state
    useEffect(() => {
        setSettings(contextSettings);
    }, [contextSettings]);

    const handleSettingsChange = (field: keyof GlobalSettings, value: any) => {
        setSettings(prev => prev ? ({...prev, [field]: value}) : null);
    }
    
    const handleLinkColumnChange = (field: 'quickLinks' | 'supportLinks', subField: 'title' | 'links', value: any) => {
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [field]: {
                    ...prev[field],
                    [subField]: value,
                }
            }
        })
    }
    
    const handleFooterLinkChange = (columnKey: 'quickLinks' | 'supportLinks', linkIndex: number, field: 'label' | 'url', value: string) => {
        setSettings(prev => {
            if (!prev) return null;
            const newLinks = [...prev[columnKey].links];
            newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
            return {
                ...prev,
                [columnKey]: { ...prev[columnKey], links: newLinks }
            };
        });
    }

    const addFooterLink = (columnKey: 'quickLinks' | 'supportLinks') => {
        setSettings(prev => {
            if (!prev) return null;
            const newLinks = [...prev[columnKey].links, { id: `fl-${Date.now()}`, label: 'New Link', url: '/' }];
            return {
                ...prev,
                [columnKey]: { ...prev[columnKey], links: newLinks }
            };
        });
    }

    const removeFooterLink = (columnKey: 'quickLinks' | 'supportLinks', linkIndex: number) => {
        setSettings(prev => {
            if (!prev) return null;
            const newLinks = prev[columnKey].links.filter((_, i) => i !== linkIndex);
             return {
                ...prev,
                [columnKey]: { ...prev[columnKey], links: newLinks }
            };
        });
    }

    const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        if (!settings) return;
        const newLinks = [...settings.socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value as any };
        handleSettingsChange('socialLinks', newLinks);
    };

    const addSocialLink = () => {
        if (!settings) return;
        const newLinks = [...settings.socialLinks, { id: `soc-${Date.now()}`, platform: 'twitter', url: '' }];
        handleSettingsChange('socialLinks', newLinks);
    };

    const removeSocialLink = (index: number) => {
        if (!settings) return;
        const newLinks = settings.socialLinks.filter((_, i) => i !== index);
        handleSettingsChange('socialLinks', newLinks);
    };


    const handleSaveChanges = async () => {
        if (!settings) return;
        const db = getFirestore(getFirebaseApp());
        const settingsRef = doc(db, "settings", "global");
        try {
            await setDoc(settingsRef, settings, { merge: true });
            setContextSettings(settings); // Update global context immediately
            toast({
                title: "Settings Saved!",
                description: "Your changes have been saved to the database.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        }
    };
    
    if (contextLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Global Site Settings</CardTitle>
                    <CardDescription>Manage your global site settings from here.</CardDescription>
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
                    <CardDescription>Could not load site settings. Please try seeding the database from the dashboard or check console for errors.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Site Settings</CardTitle>
        <CardDescription>Manage your global site settings from here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general"><TextCursorInput className="mr-2"/>General</TabsTrigger>
                <TabsTrigger value="footer"><Pilcrow className="mr-2"/>Footer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="pt-6">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Site Identity</h3>
                         <div>
                            <Label htmlFor="siteTitle">Site Title</Label>
                            <Input 
                                id="siteTitle" 
                                value={settings.siteTitle} 
                                onChange={(e) => handleSettingsChange('siteTitle', e.target.value)}
                                placeholder="Your awesome travel agency"
                            />
                             <p className="text-sm text-muted-foreground mt-2">
                                This will appear in the browser tab and search engine results.
                            </p>
                        </div>
                    </div>

                    <Separator />

                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Branding</h3>
                        <div>
                            <Label htmlFor="logoUrl">Site Logo URL</Label>
                            <Input 
                                id="logoUrl" 
                                value={settings.logoUrl} 
                                onChange={(e) => handleSettingsChange('logoUrl', e.target.value)}
                                placeholder="https://example.com/logo.png"
                            />
                             <p className="text-sm text-muted-foreground mt-2">
                                Enter the full URL for your site's logo.
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="faviconUrl">Favicon URL</Label>
                            <Input 
                                id="faviconUrl" 
                                value={settings.faviconUrl} 
                                onChange={(e) => handleSettingsChange('faviconUrl', e.target.value)}
                                placeholder="https://example.com/favicon.ico"
                            />
                             <p className="text-sm text-muted-foreground mt-2">
                                Enter the full URL for your site's favicon (the little icon in the browser tab).
                            </p>
                        </div>
                    </div>
                </div>
            </TabsContent>

             <TabsContent value="footer" className="pt-6">
                <div className="space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Column 1: Description & Socials</h3>
                        <div>
                            <Label htmlFor="footerDescription">Text under logo</Label>
                            <Textarea 
                                id="footerDescription" 
                                value={settings.footerDescription} 
                                onChange={(e) => handleSettingsChange('footerDescription', e.target.value)}
                                placeholder="Your adventure starts here..."
                            />
                        </div>
                        <div className="space-y-3 pt-4">
                            <Label>Social Media Links</Label>
                            {settings.socialLinks.map((link, index) => (
                                <div key={link.id} className="flex items-end gap-2">
                                    <div className="flex-grow grid grid-cols-3 gap-2">
                                         <select
                                            value={link.platform}
                                            onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {socialPlatforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                        </select>
                                        <Input
                                            type="url"
                                            placeholder="https://..."
                                            value={link.url}
                                            onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                            className="col-span-2"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={addSocialLink}>
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Social Link
                        </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium">Column 2: Quick Links</h3>
                         <div>
                            <Label>Column Title</Label>
                            <Input 
                                value={settings.quickLinks.title} 
                                onChange={(e) => handleLinkColumnChange('quickLinks', 'title', e.target.value)}
                            />
                         </div>
                         <Label>Links</Label>
                         <div className="space-y-2">
                            {settings.quickLinks.links.map((link, index) => (
                                <div key={link.id} className="flex items-center gap-2">
                                    <Input placeholder="Label" value={link.label} onChange={(e) => handleFooterLinkChange('quickLinks', index, 'label', e.target.value)} />
                                    <Input placeholder="URL" value={link.url} onChange={(e) => handleFooterLinkChange('quickLinks', index, 'url', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => removeFooterLink('quickLinks', index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                         </div>
                         <Button variant="outline" size="sm" onClick={() => addFooterLink('quickLinks')}><PlusCircle className="mr-2 h-4 w-4"/> Add Link</Button>
                    </div>
                    
                    <Separator />

                     <div className="space-y-4">
                         <h3 className="text-lg font-medium">Column 3: Support Links</h3>
                          <div>
                            <Label>Column Title</Label>
                            <Input 
                                value={settings.supportLinks.title} 
                                onChange={(e) => handleLinkColumnChange('supportLinks', 'title', e.target.value)}
                            />
                         </div>
                         <Label>Links</Label>
                         <div className="space-y-2">
                            {settings.supportLinks.links.map((link, index) => (
                                <div key={link.id} className="flex items-center gap-2">
                                    <Input placeholder="Label" value={link.label} onChange={(e) => handleFooterLinkChange('supportLinks', index, 'label', e.target.value)} />
                                    <Input placeholder="URL" value={link.url} onChange={(e) => handleFooterLinkChange('supportLinks', index, 'url', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => removeFooterLink('supportLinks', index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                         </div>
                         <Button variant="outline" size="sm" onClick={() => addFooterLink('supportLinks')}><PlusCircle className="mr-2 h-4 w-4"/> Add Link</Button>
                    </div>

                    <Separator/>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Column 4: Location Map</h3>
                         <div>
                            <Label htmlFor="googleMapEmbedCode">Google Maps Embed Code</Label>
                            <Textarea 
                                id="googleMapEmbedCode" 
                                value={settings.googleMapEmbedCode} 
                                onChange={(e) => handleSettingsChange('googleMapEmbedCode', e.target.value)}
                                placeholder='Go to Google Maps, find your location, click "Share", then "Embed a map", and copy the HTML here.'
                                rows={4}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                Paste the full `&lt;iframe...&gt;` code from Google Maps here.
                            </p>
                        </div>
                    </div>
                </div>
             </TabsContent>
        </Tabs>
        
        <div className="mt-8 pt-6 border-t flex justify-end">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
