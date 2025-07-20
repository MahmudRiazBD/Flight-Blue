'use server';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";

type Message = {
  role: "user" | "bot";
  content: string;
};

export async function handleTravelChat(history: Message[], query: string): Promise<string> {
  // The current flow doesn't support history, so we just send the new query.
  // A more advanced implementation would pass the history to the prompt.
  const result = await travelChatbot({ query });
  return result.response;
}

export async function handleCulturalAdvice(destination: string, query: string): Promise<string> {
  const result = await getCulturalAdvice({ destination, query });
  return result.advice;
}
