
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paintbrush, Image as ImageIcon, TextCursorInput, Link as LinkIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AdminSettingsPage() {
    const { toast } = useToast();

    // These states would typically be fetched from a database
    const [siteTitle, setSiteTitle] = useState("Flight Blu");
    const [logoUrl, setLogoUrl] = useState("/logo.svg"); // Assuming a default logo
    const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");
    
    // HSL values for theme colors
    const [primaryColor, setPrimaryColor] = useState("211 100% 50%");
    const [backgroundColor, setBackgroundColor] = useState("0 0% 100%");
    const [accentColor, setAccentColor] = useState("195 100% 50%");

    // Permalink settings
    const [packagePermalink, setPackagePermalink] = useState("/packages/%postname%");


    const handleSaveChanges = () => {
        // Here you would typically send the data to your backend to save in a database
        console.log("Saving settings:", {
            siteTitle,
            logoUrl,
            faviconUrl,
            theme: {
                primary: primaryColor,
                background: backgroundColor,
                accent: accentColor,
            },
            permalinks: {
                package: packagePermalink,
            }
        });

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
                <TabsTrigger value="branding"><ImageIcon className="mr-2"/>Branding</TabsTrigger>
                <TabsTrigger value="theme"><Paintbrush className="mr-2"/>Theme</TabsTrigger>
                <TabsTrigger value="permalinks"><LinkIcon className="mr-2"/>Permalinks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="pt-6">
                <div className="space-y-6">
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
            </TabsContent>

            <TabsContent value="branding" className="pt-6">
                 <div className="space-y-6">
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
            </TabsContent>

            <TabsContent value="theme" className="pt-6">
                 <div className="space-y-6">
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
            </TabsContent>

            <TabsContent value="permalinks" className="pt-6">
                <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Customize the URL structure for your content. Changes can affect your SEO, so be careful. Available tags: <code className="bg-muted px-1 py-0.5 rounded">%postname%</code>, <code className="bg-muted px-1 py-0.5 rounded">%post_id%</code>, <code className="bg-muted px-1 py-0.5 rounded">%category%</code>.
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
