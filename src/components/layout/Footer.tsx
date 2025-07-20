
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "../icons/Logo";
import { Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

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

const defaultFooterSettings: FooterSettings = {
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
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [googleMapEmbedCode, setGoogleMapEmbedCode] = useState('');
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);


  useEffect(() => {
    const savedSocialLinks = localStorage.getItem('socialLinks');
    if (savedSocialLinks) {
        setSocialLinks(JSON.parse(savedSocialLinks));
    }
    const savedMapCode = localStorage.getItem('googleMapEmbedCode');
    if(savedMapCode) {
        setGoogleMapEmbedCode(savedMapCode);
    }
    const savedFooterSettings = localStorage.getItem('footerSettings');
    if(savedFooterSettings) {
        setFooterSettings(JSON.parse(savedFooterSettings));
    }
  }, []);


  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="font-bold font-headline text-xl">Flight Blu</span>
            </Link>
            <p className="text-sm text-muted-foreground">{footerSettings.description}</p>
             {socialLinks.length > 0 && (
                <div className="flex space-x-2">
                    {socialLinks.map((link) => (
                        <Button key={link.id} variant="ghost" size="icon" asChild>
                            <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                <SocialIcon platform={link.platform} />
                            </Link>
                        </Button>
                    ))}
                </div>
            )}
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">{footerSettings.column1.title}</h3>
            <ul className="space-y-2 text-sm">
               {footerSettings.column1.links.map(link => (
                 <li key={link.id}>
                    <Link href={link.url} className="text-muted-foreground hover:text-primary">
                        {link.label}
                    </Link>
                 </li>
               ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">{footerSettings.column2.title}</h3>
            <ul className="space-y-2 text-sm">
               {footerSettings.column2.links.map(link => (
                 <li key={link.id}>
                    <Link href={link.url} className="text-muted-foreground hover:text-primary">
                        {link.label}
                    </Link>
                 </li>
               ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Our Location</h3>
            {googleMapEmbedCode ? (
                 <div className="aspect-video w-full overflow-hidden rounded-md border shadow-md"
                    dangerouslySetInnerHTML={{ __html: googleMapEmbedCode }}
                 />
            ) : (
                <p className="text-sm text-muted-foreground">Location map will be shown here.</p>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Flight Blu. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
