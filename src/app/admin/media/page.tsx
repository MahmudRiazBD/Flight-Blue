
"use client"
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UploadCloud, MoreVertical, Copy, Trash2, FileText, Video, ImageIcon, File as FileIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

type MediaType = "image" | "video" | "pdf" | "file";

type MediaFile = {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: string; // e.g., "2.3 MB"
};

const placeholderMedia: MediaFile[] = [
  { id: "1", name: "eiffel-tower.jpg", type: "image", url: "https://placehold.co/600x400.png", size: "1.2 MB" },
  { id: "2", name: "promo-video.mp4", type: "video", url: "https://placehold.co/600x400.png", size: "15.8 MB" },
  { id: "3", name: "travel-guide.pdf", type: "pdf", url: "https://placehold.co/600x400.png", size: "5.4 MB" },
  { id: "4", name: "kaaba-mecca.jpg", type: "image", url: "https://placehold.co/600x400.png", size: "2.1 MB" },
  { id: "5", name: "terms-and-conditions.docx", type: "file", url: "https://placehold.co/600x400.png", size: "87 KB" },
  { id: "6", name: "tokyo-skyline.jpg", type: "image", url: "https://placehold.co/600x400.png", size: "3.5 MB" },
];

const getIconForType = (type: MediaType) => {
    switch (type) {
        case "image": return <ImageIcon className="h-10 w-10 text-muted-foreground" />;
        case "video": return <Video className="h-10 w-10 text-muted-foreground" />;
        case "pdf": return <FileText className="h-10 w-10 text-muted-foreground" />;
        default: return <FileIcon className="h-10 w-10 text-muted-foreground" />;
    }
}

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(placeholderMedia);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(mediaFiles.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectOne = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "The file URL has been copied to your clipboard." });
  };
  
  const handleDelete = (ids: string[]) => {
    // This is a simulation. In a real app, you'd call a server action here.
    setMediaFiles(prev => prev.filter(file => !ids.includes(file.id)));
    setSelectedFiles([]);
    toast({ title: "Files Deleted", description: `${ids.length} file(s) have been deleted.` });
  };

  const isAllSelected = selectedFiles.length > 0 && selectedFiles.length === mediaFiles.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>Manage your uploaded files.</CardDescription>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" disabled={selectedFiles.length === 0} onClick={() => handleDelete(selectedFiles)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedFiles.length})
            </Button>
          <Button>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </CardHeader>
      <CardContent>
         <div className="mb-4">
             <Checkbox 
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                id="select-all"
             />
             <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                Select All
             </label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaFiles.map((file) => (
            <Card key={file.id} className="relative group overflow-hidden">
                <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={(checked) => handleSelectOne(file.id, !!checked)}
                    />
                </div>
                 <div className="absolute top-1 right-1 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleCopyLink(file.url)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete([file.id])}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              <div className="aspect-square bg-muted flex items-center justify-center">
                 {file.type === 'image' ? (
                     <Image src={file.url} alt={file.name} width={200} height={200} className="object-cover h-full w-full" />
                 ) : (
                    getIconForType(file.type)
                 )}
              </div>
              <div className="p-2 text-xs border-t">
                <p className="font-semibold truncate">{file.name}</p>
                <p className="text-muted-foreground">{file.size}</p>
              </div>
            </Card>
          ))}
        </div>
        {mediaFiles.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <UploadCloud className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-xl font-headline font-semibold">Media Library is Empty</h3>
                <p>Upload your first file to get started.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
