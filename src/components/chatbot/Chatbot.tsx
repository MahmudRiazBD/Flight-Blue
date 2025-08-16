
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Loader, MessageSquare, Send, User, Plane, Globe } from "lucide-react";
import { handleTravelChat, handleCulturalAdvice } from "@/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { settings } = useAppContext();

  const handleSendMessage = async (e: React.FormEvent, type: "travel" | "cultural") => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (type === 'cultural' && !destination.trim()) {
        toast({
            title: "Destination Required",
            description: "Please enter a destination for cultural advice.",
            variant: "destructive",
        })
        return;
    }


    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let botResponseContent = "";
      if (type === "travel") {
        botResponseContent = await handleTravelChat(messages, input);
      } else {
        botResponseContent = await handleCulturalAdvice(destination, input);
      }
      const botMessage: Message = { role: "bot", content: botResponseContent };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { role: "bot", content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl"
          size="icon"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 md:w-96 p-0 rounded-lg overflow-hidden">
        <div className="flex flex-col h-[60vh]">
          <header className="p-4 bg-primary text-primary-foreground font-bold font-headline text-lg text-center">
            {settings?.siteTitle || 'TripMate'} Assistant
          </header>
          
          <Tabs defaultValue="travel" className="w-full flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none">
              <TabsTrigger value="travel"><Plane className="mr-2 h-4 w-4"/>Travel Help</TabsTrigger>
              <TabsTrigger value="cultural"><Globe className="mr-2 h-4 w-4"/>Cultural Advice</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-grow p-4 bg-background">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "bot" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      )}
                    >
                      {message.content}
                    </div>
                     {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary rounded-lg px-3 py-2 flex items-center">
                            <Loader className="h-5 w-5 animate-spin"/>
                        </div>
                    </div>
                 )}
              </div>
            </ScrollArea>
            
            <TabsContent value="travel" className="m-0 border-t">
              <form onSubmit={(e) => handleSendMessage(e, 'travel')} className="p-4 flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about packages..."
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="cultural" className="m-0 border-t">
               <div className="p-4 space-y-2">
                  <Input 
                     value={destination}
                     onChange={(e) => setDestination(e.target.value)}
                     placeholder="Enter destination (e.g. Japan)"
                     disabled={isLoading}
                  />
                  <form onSubmit={(e) => handleSendMessage(e, 'cultural')} className="flex items-center gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about customs, tips..."
                        disabled={isLoading}
                      />
                      <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                      </Button>
                   </form>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
