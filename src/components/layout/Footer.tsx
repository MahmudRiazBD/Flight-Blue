
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "../icons/Logo";
import { Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

type SocialLink = {
    platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';
    url: string;
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
  const [googleMapCode, setGoogleMapCode] = useState('');

  useEffect(() => {
    const savedSocialLinks = localStorage.getItem('socialLinks');
    if (savedSocialLinks) {
        setSocialLinks(JSON.parse(savedSocialLinks));
    }
    const savedMapCode = localStorage.getItem('googleMapUrl'); // The key is still 'googleMapUrl' from settings
    if(savedMapCode) {
        setGoogleMapCode(savedMapCode);
    }
  }, []);

  const getMapHtml = (embedCode: string) => {
    if (!embedCode.startsWith('<iframe')) return embedCode;

    const modifiedCode = embedCode
        .replace(/width="[^"]*"/, 'width="100%"')
        .replace(/height="[^"]*"/, 'height="100%"');

    return modifiedCode;
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="font-bold font-headline text-xl">Flight Blu</span>
            </Link>
            <p className="text-sm text-muted-foreground">Your adventure starts here. Discover breathtaking destinations with us.</p>
             {socialLinks.length > 0 && (
                <div className="flex space-x-2">
                    {socialLinks.slice(0, 4).map((link, index) => (
                        <Button key={index} variant="ghost" size="icon" asChild>
                            <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                <SocialIcon platform={link.platform} />
                            </Link>
                        </Button>
                    ))}
                </div>
            )}
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/packages" className="text-muted-foreground hover:text-primary">Packages</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Our Location</h3>
            {googleMapCode ? (
                <div className="aspect-video w-full overflow-hidden rounded-md">
                    <iframe
                        srcDoc={getMapHtml(googleMapCode)}
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map Location"
                    ></iframe>
                </div>
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
