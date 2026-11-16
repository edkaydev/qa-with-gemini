import type { Metadata } from "next";
import { ChatExperience } from "@/components/solution2/ChatExperience";

export const metadata: Metadata = {
  title: "Conversation mode",
  description:
    "A natural-language course evaluation interview that asks one question at a time and turns the conversation into a Quality Assurance summary.",
};

export default function SolutionTwoPage() {
  return <ChatExperience />;
}
