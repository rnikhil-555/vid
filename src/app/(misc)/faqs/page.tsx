import { Metadata } from "next";
import { WEBSITE_NAME } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: `FAQs - ${WEBSITE_NAME}`,
  description: `Frequently asked questions about ${WEBSITE_NAME}. Find answers to common questions about our streaming service.`,
};

const faqs = [
  {
    question: "Is it legal to watch movies on Vidbox ?",
    answer: "Absolutely, Watching is totally legal. We also do not host the movies, we link to them.",
  },
  {
    question: "I can't find my favorite movies, what can I do?",
    answer: "You can try using our search feature with different keywords or check our different servers. If you still can't find what you're looking for, you can request the movie through our support channels.",
  },
  {
    question: "What are the differences between Premium and other servers?",
    answer: "Premium servers typically offer higher quality streams, faster loading times, and more reliable connections. They may also have fewer ads and a broader selection of content.",
  },
  {
    question: "How to change quality of the movie i am watching ?",
    answer: "Most of movies have some quality options (1080p, 720p, 480p, 360p). You can choose which you want. Some of them just have 720p and 360p.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 pt-20 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        
        <p className="text-muted-foreground text-lg text-center mb-8">
          Find answers to common questions about using {WEBSITE_NAME}
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}