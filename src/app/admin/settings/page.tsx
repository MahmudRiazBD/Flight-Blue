
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextCursorInput, Pilcrow, Loader2, PlusCircle, Trash2, SearchX, AlertTriangle, Database, Link as LinkIcon, ExternalLink, ShieldAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";
import type { GlobalSettings, SocialLinkPlatform, SocialLink, FooterLink } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { resetApplication } from "@/lib/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";


function ResetApplicationZone() {
    const { toast } = useToast();
    const { logout } = useAuth();
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        setIsResetting(true);
        try {
            const result = await resetApplication();
            if (result.success) {
                toast({
                    title: "Application Reset Successful",
                    description: "The application has been reset to its initial state. You will now be logged out.",
                });
                // Logout and redirect.
                await logout();
                window.location.href = '/'; 
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                title: "Error Resetting Application",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
             setIsResetting(false);
        }
    };

    return (
         <Card className="border-destructive">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle>Danger Zone</CardTitle>
                        <CardDescription>Critical and irreversible actions for the application.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between rounded-lg border border-destructive/50 p-4">
                    <div>
                        <h4 className="font-semibold">Reset Application</h4>
                        <p className="text-sm text-muted-foreground max-w-xl">
                            This will permanently delete all data, including users, packages, posts, and settings, and reset the application to its initial setup state. This does not remove Firestore indexes.
                        </p>
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" className="mt-4 shrink-0 md:mt-0 md:ml-4" disabled={isResetting}>
                                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                {isResetting ? "Resetting..." : "Reset Application"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all data and require you to go through the setup process again.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                                    I understand, reset the application
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

const socialPlatforms: { value: SocialLinkPlatform, label: string }[] = [
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' },
];

function IndexManagementZone() {
    const { user } = useAuth();
    const [indexState, setIndexState] = useState<{ loading: boolean, needsIndex: boolean, creationLink: string }>({
        loading: true,
        needsIndex: false,
        creationLink: ''
    });

    useEffect(() => {
        const checkIndex = async () => {
            if (user?.role !== 'superadmin') {
                setIndexState({ loading: false, needsIndex: false, creationLink: '' });
                return;
            }
            try {
                const response = await fetch('/api/admin/check-firestore-index');
                const data = await response.json();
                setIndexState({
                    loading: false,
                    needsIndex: data.needsIndex,
                    creationLink: data.indexCreationLink
                });
            } catch (error) {
                console.error("Failed to check Firestore index:", error);
                setIndexState(prev => ({ ...prev, loading: false }));
            }
        };

        checkIndex();
    }, [user]);

    if (user?.role !== 'superadmin') {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Database className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Firestore Index Management</CardTitle>
                        <CardDescription>Manage required database indexes for optimal performance.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {indexState.loading ? (
                    <div className="flex items-center gap-4 p-4 border rounded-md">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-48" />
                           <Skeleton className="h-3 w-64" />
                        </div>
                    </div>
                ) : indexState.needsIndex ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Action Required: Create Firestore Index</AlertTitle>
                        <AlertDescription className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <span className="max-w-xl">
                                A required Firestore index for querying media files is missing. This can cause errors in the Media Library.
                            </span>
                             <Button asChild size="sm" className="mt-4 shrink-0 md:mt-0 md:ml-4">
                                <a href={indexState.creationLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4"/> Create Index Now
                                </a>
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert className="border-green-500 text-green-700 [&>svg]:text-green-500">
                        <Database className="h-4 w-4" />
                        <AlertTitle className="text-green-800">All Indexes Are Set Up</AlertTitle>
                        <AlertDescription>
                            Your Firestore database has all the necessary indexes for the application to function correctly.
                        </AlertDescription>
                    </Alert>
                )}
                 <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-secondary/50">
                    <h4 className="font-semibold text-foreground mb-2">Note on Deleting Indexes</h4>
                    <p>
                        The "Reset Application" button does not automatically delete Firestore indexes. This is a manual process. If you need a completely clean slate after a reset, you must go to the Firebase Console, navigate to <code className="bg-muted px-1 py-0.5 rounded text-foreground">Firestore Database &gt; Indexes</code>, and manually delete the indexes.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const { settings: contextSettings, setSettings: setContextSettings, loading: contextLoading } = useAppContext();
    const [settings, setSettings] = useState<GlobalSettings | null>(contextSettings);

    useEffect(() => {
        setSettings(contextSettings);
    }, [contextSettings]);

    const handleSettingsChange = (field: keyof GlobalSettings, value: any) => {
        setSettings(prev => prev ? ({...prev, [field]: value}) : null);
    };
    
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
        });
    };
    
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
    };

    const addFooterLink = (columnKey: 'quickLinks' | 'supportLinks') => {
        setSettings(prev => {
            if (!prev) return null;
            const newLinks = [...prev[columnKey].links, { id: `fl-${Date.now()}`, label: 'New Link', url: '/' }];
            return {
                ...prev,
                [columnKey]: { ...prev[columnKey], links: newLinks }
            };
        });
    };

    const removeFooterLink = (columnKey: 'quickLinks' | 'supportLinks', linkIndex: number) => {
        setSettings(prev => {
            if (!prev) return null;
            const newLinks = prev[columnKey].links.filter((_, i) => i !== linkIndex);
             return {
                ...prev,
                [columnKey]: { ...prev[columnKey], links: newLinks }
            };
        });
    };

    const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        if (!settings) return;
        const newLinks = [...settings.socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value as any };
        handleSettingsChange('socialLinks', newLinks);
    }

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
            setContextSettings(settings); 
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
        );
    }
    
    if (!settings) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not load site settings. Please try seeding the database or check console for errors.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
    <div className="space-y-6">
        <Card>
        <CardHeader>
            <CardTitle>Global Site Settings</CardTitle>
            <CardDescription>Manage your global site settings from here.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general"><TextCursorInput className="mr-2"/>General</TabsTrigger>
                    <TabsTrigger value="footer"><Pilcrow className="mr-2"/>Footer</TabsTrigger>
                    <TabsTrigger value="advanced"><ShieldAlert className="mr-2"/>Advanced</TabsTrigger>
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
                                    placeholder="https://example.com/favicon.svg"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                    Enter the full URL for your site's favicon (the little icon in the browser tab).
                                </p>
                            </div>
                        </div>

                        <Separator />
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Search Engine Visibility</h3>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="searchEngineVisibility"
                                    checked={settings.searchEngineVisibility}
                                    onCheckedChange={(checked) => handleSettingsChange('searchEngineVisibility', checked)}
                                />
                                <Label htmlFor="searchEngineVisibility">Discourage search engines from indexing this site</Label>
                            </div>
                            {settings.searchEngineVisibility === false && (
                                <Alert variant="destructive">
                                    <SearchX className="h-4 w-4" />
                                    <AlertTitle>Visibility Hidden</AlertTitle>
                                    <AlertDescription>
                                    Search engines will be discouraged from showing this site in search results. This does not completely guarantee the site won't be indexed.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <p className="text-sm text-muted-foreground">
                            It is up to search engines to honor this request.
                            </p>
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
                                    {'Paste the full `<iframe...>` code from Google Maps here.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="pt-6 space-y-6">
                    <IndexManagementZone />
                    <ResetApplicationZone />
                </TabsContent>

            </Tabs>
            
            <div className="mt-8 pt-6 border-t flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </CardContent>
        </Card>
    </div>
    );
}
