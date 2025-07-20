
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextCursorInput, Link as LinkIcon, Home, Trash2, PlusCircle, Youtube, Facebook, Twitter, Instagram, Linkedin, Pilcrow } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MediaPicker from "@/components/admin/MediaPicker";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Define a type for home page settings
type HomePageSettings = {
    heroImageUrl: string;
    heroTitle: string;
    heroSubtitle: string;
    heroButtonLabel: string;
    heroButtonLink: string;
};

type SocialLink = {
    id: string;
    platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';
    url: string;
};

type FooterLink = {
    id: string;
    label: string;
    url: string;
}

type FooterSettings = {
    description: string;
    column1: {
        title: string;
        links: FooterLink[];
    };
    column2: {
        title: string;
        links: FooterLink[];
    }
}

const SocialIcon = ({ platform }: { platform: SocialLink['platform'] }) => {
    switch (platform) {
        case 'twitter': return <Twitter className="h-5 w-5" />;
        case 'facebook': return <Facebook className="h-5 w-5" />;
        case 'instagram': return <Instagram className="h-5 w-5" />;
        case 'linkedin': return <Linkedin className="h-5 w-5" />;
        case 'youtube': return <Youtube className="h-5 w-5" />;
        default: return null;
    }
};

export default function AdminSettingsPage() {
    const { toast } = useToast();

    // General settings states
    const [siteTitle, setSiteTitle] = useState("Flight Blu");
    const [logoUrl, setLogoUrl] = useState("/logo.svg");
    const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");
    
    // Theme settings states
    const [primaryColor, setPrimaryColor] = useState("211 100% 50%");
    const [backgroundColor, setBackgroundColor] = useState("0 0% 100%");
    const [accentColor, setAccentColor] = useState("195 100% 50%");

    // Permalink settings states
    const [packagePermalink, setPackagePermalink] = useState("/packages/%postname%");
    const [mediaPermalink, setMediaPermalink] = useState("/uploads/%filename%");

    // Social and map settings
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [googleMapUrl, setGoogleMapUrl] = useState('');
    
    // Home Page settings states
    const [homePageSettings, setHomePageSettings] = useState<HomePageSettings>({
        heroImageUrl: "https://placehold.co/1920x1080.png",
        heroTitle: "Your Adventure Awaits",
        heroSubtitle: "Discover breathtaking destinations and create unforgettable memories with Flight Blu.",
        heroButtonLabel: "Explore Packages",
        heroButtonLink: "/packages",
    });
    
    // Footer settings states
    const [footerSettings, setFooterSettings] = useState<FooterSettings>({
        description: "Your adventure starts here. Discover breathtaking destinations with us.",
        column1: {
            title: "Quick Links",
            links: [
                { id: "fl1-1", label: "About Us", url: "/about" },
                { id: "fl1-2", label: "Packages", url: "/packages" },
                { id: "fl1-3", label: "Blog", url: "/blog" },
                { id: "fl1-4", label: "Contact", url: "/contact" },
            ]
        },
        column2: {
            title: "Support",
            links: [
                { id: "fl2-1", label: "FAQ", url: "/faq" },
                { id: "fl2-2", label: "Terms of Service", url: "/terms" },
                { id: "fl2-3", label: "Privacy Policy", url: "/privacy" },
            ]
        }
    });

    // Load all settings from localStorage on component mount
    useEffect(() => {
        const savedHomePageSettings = localStorage.getItem('homePageSettings');
        if (savedHomePageSettings) setHomePageSettings(JSON.parse(savedHomePageSettings));

        const savedSocialLinks = localStorage.getItem('socialLinks');
        if (savedSocialLinks) setSocialLinks(JSON.parse(savedSocialLinks));

        const savedMapUrl = localStorage.getItem('googleMapUrl');
        if (savedMapUrl) setGoogleMapUrl(savedMapUrl);

        const savedFooterSettings = localStorage.getItem('footerSettings');
        if(savedFooterSettings) setFooterSettings(JSON.parse(savedFooterSettings));
    }, []);

    const handleHomePageSettingsChange = (field: keyof HomePageSettings, value: string) => {
        setHomePageSettings(prev => ({...prev, [field]: value}));
    }

    const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        const newLinks = [...socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value as any };
        setSocialLinks(newLinks);
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, { id: `soc-${Date.now()}`, platform: 'twitter', url: '' }]);
    };

    const removeSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const handleFooterChange = (field: keyof FooterSettings, value: string) => {
        setFooterSettings(prev => ({ ...prev, [field]: value }));
    }
    
    const handleFooterColumnChange = (columnIndex: 'column1' | 'column2', field: 'title', value: string) => {
        setFooterSettings(prev => ({
            ...prev,
            [columnIndex]: {
                ...prev[columnIndex],
                [field]: value
            }
        }));
    }
    
    const handleFooterLinkChange = (columnIndex: 'column1' | 'column2', linkIndex: number, field: 'label' | 'url', value: string) => {
        setFooterSettings(prev => {
            const newLinks = [...prev[columnIndex].links];
            newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
            return {
                ...prev,
                [columnIndex]: {
                    ...prev[columnIndex],
                    links: newLinks
                }
            }
        });
    }

    const addFooterLink = (columnIndex: 'column1' | 'column2') => {
        setFooterSettings(prev => {
            const newLinks = [...prev[columnIndex].links, { id: `fl-${Date.now()}`, label: 'New Link', url: '/' }];
            return {
                ...prev,
                [columnIndex]: {
                    ...prev[columnIndex],
                    links: newLinks
                }
            }
        });
    }

    const removeFooterLink = (columnIndex: 'column1' | 'column2', linkIndex: number) => {
        setFooterSettings(prev => {
            const newLinks = prev[columnIndex].links.filter((_, i) => i !== linkIndex);
             return {
                ...prev,
                [columnIndex]: {
                    ...prev[columnIndex],
                    links: newLinks
                }
            }
        });
    }


    const handleSaveChanges = () => {
        // Here you would typically send the data to your backend to save in a database
        // For this demo, we use localStorage.
        
        // Save Home Page Settings
        localStorage.setItem('homePageSettings', JSON.stringify(homePageSettings));
        localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
        localStorage.setItem('googleMapUrl', googleMapUrl);
        localStorage.setItem('footerSettings', JSON.stringify(footerSettings));

        // This is a simulation. In a real app, you'd apply these styles globally.
        // For example, by updating a CSS file or injecting a <style> tag.
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--background', backgroundColor);
        document.documentElement.style.setProperty('--accent', accentColor);


        toast({
            title: "Settings Saved!",
            description: "Your changes have been saved successfully.",
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Manage your global site settings from here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general"><TextCursorInput className="mr-2"/>General</TabsTrigger>
                <TabsTrigger value="homepage"><Home className="mr-2"/>Home Page</TabsTrigger>
                <TabsTrigger value="footer"><Pilcrow className="mr-2"/>Footer</TabsTrigger>
                <TabsTrigger value="permalinks"><LinkIcon className="mr-2"/>Permalinks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="pt-6">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Site Identity</h3>
                         <div>
                            <Label htmlFor="siteTitle">Site Title</Label>
                            <Input 
                                id="siteTitle" 
                                value={siteTitle} 
                                onChange={(e) => setSiteTitle(e.target.value)}
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
                                value={logoUrl} 
                                onChange={(e) => setLogoUrl(e.target.value)}
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
                                value={faviconUrl} 
                                onChange={(e) => setFaviconUrl(e.target.value)}
                                placeholder="https://example.com/favicon.ico"
                            />
                             <p className="text-sm text-muted-foreground mt-2">
                                Enter the full URL for your site's favicon (the little icon in the browser tab).
                            </p>
                        </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Theme Customization</h3>
                        <p className="text-sm text-muted-foreground">
                            Customize the look and feel of your site. Colors are defined using HSL values (Hue Saturation Lightness), e.g., <code className="bg-muted px-1 py-0.5 rounded">211 100% 50%</code>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="primaryColor">Primary Color</Label>
                                <Input 
                                    id="primaryColor" 
                                    value={primaryColor} 
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="backgroundColor">Background Color</Label>
                                <Input 
                                    id="backgroundColor" 
                                    value={backgroundColor} 
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="accentColor">Accent Color</Label>
                                <Input 
                                    id="accentColor" 
                                    value={accentColor} 
                                    onChange={(e) => setAccentColor(e.target.value)}
                                />
                            </div>
                        </div>
                         <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: `hsl(${primaryColor})`}}></div>
                            <div className="w-12 h-12 rounded-lg border" style={{ backgroundColor: `hsl(${backgroundColor})`}}></div>
                            <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: `hsl(${accentColor})`}}></div>
                        </div>
                    </div>
                </div>
            </TabsContent>

             <TabsContent value="homepage" className="pt-6">
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Hero Section</h3>
                    <div className="space-y-2">
                        <Label>Hero Image</Label>
                        <MediaPicker 
                            imageUrl={homePageSettings.heroImageUrl} 
                            onImageUrlChange={(url) => handleHomePageSettingsChange('heroImageUrl', url)}
                        />
                        <p className="text-sm text-muted-foreground">Recommended size: 1920x1080px. This will be the main background image.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroTitle">Hero Title</Label>
                        <Input 
                            id="heroTitle" 
                            value={homePageSettings.heroTitle}
                            onChange={(e) => handleHomePageSettingsChange('heroTitle', e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                        <Textarea 
                            id="heroSubtitle" 
                            value={homePageSettings.heroSubtitle}
                            onChange={(e) => handleHomePageSettingsChange('heroSubtitle', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="heroButtonLabel">Button Label</Label>
                            <Input 
                                id="heroButtonLabel" 
                                value={homePageSettings.heroButtonLabel}
                                onChange={(e) => handleHomePageSettingsChange('heroButtonLabel', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroButtonLink">Button Link</Label>
                            <Input 
                                id="heroButtonLink" 
                                value={homePageSettings.heroButtonLink}
                                onChange={(e) => handleHomePageSettingsChange('heroButtonLink', e.target.value)}
                                placeholder="/packages"
                            />
                        </div>
                    </div>
                </div>
            </TabsContent>

             <TabsContent value="footer" className="pt-6">
                <div className="space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Footer Description</h3>
                        <div>
                            <Label htmlFor="footerDescription">Text under logo</Label>
                            <Textarea 
                                id="footerDescription" 
                                value={footerSettings.description} 
                                onChange={(e) => handleFooterChange('description', e.target.value)}
                                placeholder="Your adventure starts here..."
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium">Footer Column 1 (e.g., Quick Links)</h3>
                         <div>
                            <Label>Column Title</Label>
                            <Input 
                                value={footerSettings.column1.title} 
                                onChange={(e) => handleFooterColumnChange('column1', 'title', e.target.value)}
                            />
                         </div>
                         <Label>Links</Label>
                         <div className="space-y-2">
                            {footerSettings.column1.links.map((link, index) => (
                                <div key={link.id} className="flex items-center gap-2">
                                    <Input placeholder="Label" value={link.label} onChange={(e) => handleFooterLinkChange('column1', index, 'label', e.target.value)} />
                                    <Input placeholder="URL" value={link.url} onChange={(e) => handleFooterLinkChange('column1', index, 'url', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => removeFooterLink('column1', index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                         </div>
                         <Button variant="outline" size="sm" onClick={() => addFooterLink('column1')}><PlusCircle className="mr-2"/> Add Link</Button>
                    </div>
                    
                    <Separator />

                     <div className="space-y-4">
                         <h3 className="text-lg font-medium">Footer Column 2 (e.g., Support)</h3>
                          <div>
                            <Label>Column Title</Label>
                            <Input 
                                value={footerSettings.column2.title} 
                                onChange={(e) => handleFooterColumnChange('column2', 'title', e.target.value)}
                            />
                         </div>
                         <Label>Links</Label>
                         <div className="space-y-2">
                            {footerSettings.column2.links.map((link, index) => (
                                <div key={link.id} className="flex items-center gap-2">
                                    <Input placeholder="Label" value={link.label} onChange={(e) => handleFooterLinkChange('column2', index, 'label', e.target.value)} />
                                    <Input placeholder="URL" value={link.url} onChange={(e) => handleFooterLinkChange('column2', index, 'url', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => removeFooterLink('column2', index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                         </div>
                         <Button variant="outline" size="sm" onClick={() => addFooterLink('column2')}><PlusCircle className="mr-2"/> Add Link</Button>
                    </div>

                    <Separator/>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Social Media & Location</h3>
                        <p className="text-sm text-muted-foreground">Add links to your social media profiles. The first four will be shown in the footer.</p>
                        <div className="space-y-3">
                            {socialLinks.map((link, index) => (
                                <div key={link.id} className="flex items-end gap-2">
                                    <div className="flex-grow grid grid-cols-3 gap-2">
                                         <select
                                            value={link.platform}
                                            onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="twitter">Twitter</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="youtube">YouTube</option>
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
                         <div className="pt-4">
                            <Label htmlFor="googleMapUrl">Google Maps Embed Code</Label>
                            <Textarea 
                                id="googleMapUrl" 
                                value={googleMapUrl} 
                                onChange={(e) => setGoogleMapUrl(e.target.value)}
                                placeholder='Go to Google Maps, find your location, click "Share", then "Embed a map", and copy the entire <iframe> code here.'
                                rows={4}
                            />
                             <p className="text-sm text-muted-foreground mt-2">
                                This will display a map in your site's footer.
                            </p>
                        </div>
                    </div>
                </div>
             </TabsContent>

            <TabsContent value="permalinks" className="pt-6">
                <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Customize the URL structure for your content. Changes can affect your SEO, so be careful. Available tags: <code className="bg-muted px-1 py-0.5 rounded">%postname%</code>, <code className="bg-muted px-1 py-0.5 rounded">%post_id%</code>, <code className="bg-muted px-1 py-0.5 rounded">%category%</code>, <code className="bg-muted px-1 py-0.5 rounded">%filename%</code>.
                    </p>
                    <div className="space-y-4">
                        <h4 className="font-semibold">Packages Permalink Base</h4>
                        <RadioGroup defaultValue={packagePermalink} onValueChange={setPackagePermalink} className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="/packages/%postname%" id="p-default" />
                                <Label htmlFor="p-default" className="font-normal">Default: <code className="bg-muted px-1 py-0.5 rounded">/packages/%postname%</code></Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="/tours/%postname%" id="p-tours" />
                                <Label htmlFor="p-tours" className="font-normal">Tour base: <code className="bg-muted px-1 py-0.5 rounded">/tours/%postname%</code></Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="p-custom" />
                                <Label htmlFor="p-custom" className="font-normal">Custom Structure:</Label>
                                <Input
                                    className="max-w-xs"
                                    placeholder="/your-base/%postname%"
                                    disabled={packagePermalink !== "custom"}
                                    onChange={(e) => {
                                        // This is a bit of a hack to make the input work with the radio group.
                                        // In a real app, state management would be more robust.
                                        setPackagePermalink(e.target.value);
                                    }}
                                />
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Media Permalink Base</h4>
                         <RadioGroup defaultValue={mediaPermalink} onValueChange={setMediaPermalink} className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="/uploads/%filename%" id="m-default" />
                                <Label htmlFor="m-default" className="font-normal">Default: <code className="bg-muted px-1 py-0.5 rounded">/uploads/%filename%</code></Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="/media/%postname%" id="m-postname" />
                                <Label htmlFor="m-postname" className="font-normal">Post name: <code className="bg-muted px-1 py-0.5 rounded">/media/%postname%</code> (Uses a slug from the filename)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Blog Permalink Base</h4>
                         <p className="text-sm text-muted-foreground">
                            Blog permalink settings will be available when the blog module is active.
                        </p>
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
