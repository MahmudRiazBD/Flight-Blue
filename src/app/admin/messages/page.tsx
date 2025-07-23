
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ContactMessage } from "@/lib/data";
import { format, formatDistanceToNow } from "date-fns";
import { Mail, MailOpen, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

function MessageRow({ message, handleRowClick, markAsRead, deleteMessage }: { message: ContactMessage, handleRowClick: (msg: ContactMessage) => void, markAsRead: (id: string, isRead: boolean) => void, deleteMessage: (id: string) => void }) {
    const [receivedAt, setReceivedAt] = useState("");

    useEffect(() => {
        // This ensures formatDistanceToNow is only called on the client
        setReceivedAt(formatDistanceToNow(new Date(message.submittedAt), { addSuffix: true }));
    }, [message.submittedAt]);

    return (
        <TableRow 
            key={message.id} 
            onClick={() => handleRowClick(message)} 
            className={cn("cursor-pointer", !message.isRead && "font-bold")}
        >
            <TableCell className="text-center">
                {message.isRead ? <MailOpen className="h-5 w-5 text-muted-foreground" /> : <Mail className="h-5 w-5 text-primary" />}
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span>{message.name}</span>
                    <span className={cn("text-xs", message.isRead ? "text-muted-foreground" : "")}>{message.email}</span>
                </div>
            </TableCell>
            <TableCell>{message.subject}</TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span>{receivedAt || "..."}</span>
                    <span className={cn("text-xs", message.isRead ? "text-muted-foreground" : "")}>{format(new Date(message.submittedAt), "PPpp")}</span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); markAsRead(message.id, !message.isRead);}}>
                        {message.isRead ? <Mail className="mr-2 h-4 w-4"/> : <MailOpen className="mr-2 h-4 w-4"/>}
                        Mark as {message.isRead ? "Unread" : "Read"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); deleteMessage(message.id)}} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();
  const db = getFirestore(getFirebaseApp());

  const loadMessages = async () => {
    setLoading(true);
    try {
      const messagesCollection = collection(db, "contactMessages");
      const q = query(messagesCollection, orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      const allMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContactMessage));
      setMessages(allMessages);
    } catch(e) {
      console.error("Failed to load messages:", e);
      toast({ title: "Error", description: "Could not fetch messages.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleRowClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id, true);
    }
  };

  const markAsRead = async (messageId: string, isRead: boolean) => {
    try {
        const messageRef = doc(db, "contactMessages", messageId);
        await updateDoc(messageRef, { isRead });
        loadMessages(); // Refresh the list to show style changes
    } catch(e) {
        console.error("Failed to update message status:", e);
    }
  };
  
  const deleteMessage = async (messageId: string) => {
    try {
        await deleteDoc(doc(db, "contactMessages", messageId));
        toast({
            title: "Message Deleted",
            description: "The message has been successfully removed.",
            variant: "destructive"
        });
        loadMessages();
    } catch(e) {
        toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>View and manage messages from your contact form.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                 ))
              ) : messages.length > 0 ? messages.map((message) => (
                <MessageRow 
                    key={message.id}
                    message={message}
                    handleRowClick={handleRowClick}
                    markAsRead={markAsRead}
                    deleteMessage={deleteMessage}
                />
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Your inbox is empty.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                <DialogDescription>
                    From: {selectedMessage?.name} ({selectedMessage?.email})
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 whitespace-pre-wrap text-sm text-muted-foreground max-h-[60vh] overflow-y-auto">
                {selectedMessage?.message}
            </div>
        </DialogContent>
       </Dialog>
    </>
  );
}
