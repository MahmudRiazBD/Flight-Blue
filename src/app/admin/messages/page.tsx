
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ContactMessage, contactMessages as initialMessages } from "@/lib/data";
import { format, formatDistanceToNow } from "date-fns";
import { Mail, MailOpen, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  const loadMessages = () => {
    const storedMessages = localStorage.getItem('contactMessages');
    const allMessages: ContactMessage[] = storedMessages ? JSON.parse(storedMessages) : initialMessages;
    allMessages.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setMessages(allMessages);
  };

  useEffect(() => {
    loadMessages();
    window.addEventListener('storage', loadMessages);
    return () => {
      window.removeEventListener('storage', loadMessages);
    };
  }, []);

  const handleRowClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id, true);
    }
  };

  const markAsRead = (messageId: string, isRead: boolean) => {
    const updatedMessages = messages.map(m => m.id === messageId ? { ...m, isRead } : m);
    setMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
  };
  
  const deleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(m => m.id !== messageId);
    setMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    toast({
        title: "Message Deleted",
        description: "The message has been successfully removed.",
        variant: "destructive"
    });
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
              {messages.length > 0 ? messages.map((message) => (
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
                        <span>{formatDistanceToNow(new Date(message.submittedAt), { addSuffix: true })}</span>
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
