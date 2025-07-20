
"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contactMessages as initialMessages, ContactMessage } from "@/lib/data";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(20, "Message must be at least 20 characters long."),
});

type ContactFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    const storedMessages = localStorage.getItem('contactMessages');
    const messages: ContactMessage[] = storedMessages ? JSON.parse(storedMessages) : initialMessages;
    
    const newMessage: ContactMessage = {
      ...data,
      id: `msg-${new Date().getTime()}`,
      submittedAt: new Date().toISOString(),
      isRead: false,
    };
    
    const updatedMessages = [...messages, newMessage];
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
    });

    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Have a question or feedback? Fill out the form below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form.register("email")} />
                 {form.formState.errors.email && <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>}
            </div>
             <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...form.register("subject")} />
                 {form.formState.errors.subject && <p className="text-destructive text-sm mt-1">{form.formState.errors.subject.message}</p>}
            </div>
             <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" {...form.register("message")} rows={5} />
                 {form.formState.errors.message && <p className="text-destructive text-sm mt-1">{form.formState.errors.message.message}</p>}
            </div>
            
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Send Message</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
