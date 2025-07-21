"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "../icons/Logo";
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Loader2 } from "lucide-react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

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
    quickLinks: {
        title: string;
        links: FooterLink[];
    };
    supportLinks: {
        title: string;
        links: FooterLink[];
    }
}

const defaultFooterSettings: FooterSettings = {
    description: "Your adventure starts here. Discover breathtaking destinations with us.",
    quickLinks: {
        title: "Quick Links",
        links: [
            { id: "fl1-1", label: "About Us", url: "/about" },
            { id: "fl1-2", label: "Packages", url: "/packages" },
            { id: "fl1-3", label: "Blog", url: "/blog" },
            { id: "fl1-4", label: "Contact", url: "/contact" },
        ]
    },
    supportLinks: {
        title: "Support",
        links: [
            { id: "fl2-1", label: "FAQ", url: "/faq" },
            { id: "fl2-2", label: "Terms of Service", url: "/terms" },
            { id: "fl2-3", label: "Privacy Policy", url: "/privacy" },
        ]
    }
};

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


export default function Footer() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const db = getFirestore(getFirebaseApp());
            const settingsDoc = await getDoc(doc(db, "settings", "global"));
            if (settingsDoc.exists()) {
                setSettings(settingsDoc.data());
            } else {
                // Fallback to default if no settings found in DB
                setSettings({
                    footerDescription: defaultFooterSettings.description,
                    quickLinks: defaultFooterSettings.quickLinks,
                    supportLinks: defaultFooterSettings.supportLinks,
                    socialLinks: [],
                    googleMapEmbedCode: ''
                });
            }
        } catch (error) {
            console.error("Error fetching footer settings:", error);
            // Fallback on error
             setSettings({
                footerDescription: defaultFooterSettings.description,
                quickLinks: defaultFooterSettings.quickLinks,
                supportLinks: defaultFooterSettings.supportLinks,
                socialLinks: [],
                googleMapEmbedCode: ''
            });
        } finally {
            setLoading(false);
        }
    };
    
    fetchSettings();
  }, []);


  if (loading) {
      return (
          <footer className="bg-secondary text-secondary-foreground">
              <div className="container mx-auto px-4 py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
          </footer>
      )
  }

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo, Description, Socials */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="font-bold font-headline text-xl">{settings?.siteTitle || "Flight Blu"}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{settings?.footerDescription}</p>
             {settings?.socialLinks?.length > 0 && (
                <div className="flex space-x-2">
                    {settings.socialLinks.map((link: SocialLink) => (
                        <Button key={link.id} variant="ghost" size="icon" asChild>
                            <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                <SocialIcon platform={link.platform} />
                            </Link>
                        </Button>
                    ))}
                </div>
            )}
          </div>
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-headline font-semibold mb-4">{settings?.quickLinks?.title}</h3>
            <ul className="space-y-2 text-sm">
               {settings?.quickLinks?.links.map((link: FooterLink) => (
                 <li key={link.id}>
                    <Link href={link.url} className="text-muted-foreground hover:text-primary">
                        {link.label}
                    </Link>
                 </li>
               ))}
            </ul>
          </div>
          {/* Column 3: Support Links */}
          <div>
            <h3 className="font-headline font-semibold mb-4">{settings?.supportLinks?.title}</h3>
            <ul className="space-y-2 text-sm">
               {settings?.supportLinks?.links.map((link: FooterLink) => (
                 <li key={link.id}>
                    <Link href={link.url} className="text-muted-foreground hover:text-primary">
                        {link.label}
                    </Link>
                 </li>
               ))}
            </ul>
          </div>
          {/* Column 4: Map */}
          <div>
            <h3 className="font-headline font-semibold mb-4">Our Location</h3>
            {settings?.googleMapEmbedCode ? (
                 <div className="aspect-video w-full overflow-hidden rounded-md border shadow-md"
                    dangerouslySetInnerHTML={{ __html: settings.googleMapEmbedCode }}
                 />
            ) : (
                <p className="text-sm text-muted-foreground">Location map will be shown here.</p>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {settings?.siteTitle || "Flight Blu"}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
