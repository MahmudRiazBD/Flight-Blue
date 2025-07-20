
"use client"

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, Library } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaFile } from '@/app/admin/media/page'; // Reuse type from media page

type MediaPickerProps = {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
};

// Simplified version of MediaGrid for the picker
const LibraryGrid = ({ onSelectFile }: { onSelectFile: (file: MediaFile) => void }) => {
    // In a real app, this would be a fetch call. We'll use localStorage for this demo.
    const [files, setFiles] = useState<MediaFile[]>([]);
    
    useState(() => {
        if(typeof window !== 'undefined'){
            const storedMedia = localStorage.getItem('mediaFiles');
            if(storedMedia){
                setFiles(JSON.parse(storedMedia).filter((f: MediaFile) => f.type === 'image'));
            }
        }
    });

    if (files.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No images found in library.</div>
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 max-h-[50vh] overflow-y-auto">
            {files.map(file => (
                <div key={file.id} className="cursor-pointer group" onClick={() => onSelectFile(file)}>
                    <div className="aspect-square relative rounded-md overflow-hidden ring-2 ring-transparent group-hover:ring-primary">
                        <Image 
                            src={file.url}
                            alt={file.altText || file.name}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}


export default function MediaPicker({ imageUrl, onImageUrlChange }: MediaPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUrlConfirm = () => {
    if (urlInput && urlInput.startsWith('http')) {
      onImageUrlChange(urlInput);
      toast({ title: "Image URL set" });
    } else {
      toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const tempUrl = URL.createObjectURL(file);
      onImageUrlChange(tempUrl);
      toast({ title: "Image Uploaded", description: "This is a temporary preview. The file should be uploaded to a permanent location upon saving."});
    } else {
        toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
    }
    // Reset file input
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSelectFromLibrary = (file: MediaFile) => {
    onImageUrlChange(file.url);
    setModalOpen(false);
    toast({ title: "Image Selected", description: `Selected ${file.name} from library.` });
  }

  return (
    <div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden" 
            accept="image/*"
        />
        <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-muted rounded-md flex-shrink-0 relative overflow-hidden">
                {imageUrl && <Image src={imageUrl} alt="Preview" layout="fill" objectFit="cover" />}
            </div>
            <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                    <Library className="mr-2 h-4 w-4" />
                    Select or Upload
                </Button>
            </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Select Media</DialogTitle>
                    <DialogDescription>Choose an image from your library, upload a new one, or enter a URL.</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="library" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="library"><Library className="mr-2"/>From Library</TabsTrigger>
                        <TabsTrigger value="upload"><Upload className="mr-2"/>Upload New</TabsTrigger>
                        <TabsTrigger value="url"><Link className="mr-2"/>From URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="library">
                        <LibraryGrid onSelectFile={handleSelectFromLibrary} />
                    </TabsContent>
                    <TabsContent value="upload">
                        <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-md">
                            <Upload className="h-12 w-12 text-muted-foreground mb-4"/>
                            <h3 className="text-lg font-medium">Click to upload a file</h3>
                            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                            <Button type="button" size="sm" className="mt-4" onClick={handleUploadClick}>Browse Files</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="url">
                         <div className="py-12 flex flex-col items-center justify-center gap-4">
                            <div className="w-full max-w-md">
                                <Label htmlFor="imageUrlInput" className="sr-only">Image URL</Label>
                                <Input 
                                    id="imageUrlInput"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                            </div>
                            <Button type="button" onClick={handleUrlConfirm}>Set Image from URL</Button>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogClose asChild>
                    <Button type="button" variant="secondary" className="mt-4">Close</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    </div>
  );
}
