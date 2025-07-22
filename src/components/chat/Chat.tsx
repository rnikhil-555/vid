"use client";

import { useState, useRef, useEffect } from "react";
import { X, ArrowRight, RefreshCw, Send } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";

interface MovieResult {
  title: string;
  year: number;
  type: "movie" | "tv";
  overview: string;
}

interface ChatResponse {
  message: string;
  results: MovieResult[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  results?: MovieResult[];
}

const suggestedQuestions = [
  "Best movie of all time?",
  "What's the hottest 2025 flick?",
  "Top thriller movies of the decade",
  "Popular comedy movies of 2000s",
];

export default function Chat() {
  // Move pathname inside useEffect to ensure it runs on client side
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const pathname = window.location.pathname;
    const isHidden = /^\/manga\/[^\/]+\/[^\/]+$/.test(pathname);
    setShouldHide(isHidden);
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
  };

  const handleSuggestedQuestion = async (question: string) => {
    await sendMessage(question);
  };

  const handleReset = () => {
    setMessages([]);
  };

  const sendMessage = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        results: data.results,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-16 right-4 md:bottom-4 md:right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`${isChatOpen ? "hidden" : "flex"
          } items-center justify-center w-10 h-10 rounded-full bg-[#0099ff] hover:bg-[#0099ff]/90 text-white shadow-lg transition-all duration-300`}
      >
        <Image
          src="/chatbot-icon.svg"
          alt="chatbot"
          fill
          className="w-4 h-4 p-2 invert"
        />
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed z-50 flex w-full flex-col border border-gray-900 bg-black shadow-2xl transition-all ease-in-out max-md:inset-x-0 max-md:bottom-16 md:right-4 md:h-[600px] md:w-[400px] md:rounded-2xl md:bottom-4 max-md:h-[calc(100vh-120px)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800/40 px-4 py-3 bg-transparent">
            <div className="flex items-center gap-2">
              <span className="text-gray-200">Chat with</span>
              <span className="font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">VIDBOX</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleReset}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-800/30 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsChatOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800/30 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar bg-black px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <h2 className="mb-2 text-4xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">Wassup!</h2>
                <p className="mb-8 text-center text-sm text-gray-400">
                  I am boxy. Talk to me to find you something interesting!
                </p>
                <div className="grid w-full grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="rounded-xl border border-gray-800/40 bg-gray-900/30 p-4 text-left text-sm text-gray-300 hover:bg-gray-800/40 hover:text-blue-400 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                      } flex-col gap-2`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                          ? "bg-gradient-to-r from-red-500 to-blue-500 text-white ml-auto"
                          : "bg-gray-900/50 border border-gray-800/40 text-gray-200"
                        }`}
                    >
                      {message.content}
                    </div>
                    {message.results && message.results.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {message.results.map((result, idx) => (
                          <Link
                            href={`/search?type=${result.type}&q=${result.title}`}
                            key={idx}
                            className="cursor-pointer transition-all hover:bg-gray-800/40 hover:text-blue-400"
                          >
                            <div className="bg-gray-900/30 border border-gray-800/40 p-4 rounded-lg">
                              <h3 className="font-semibold text-blue-400">
                                {result.title} ({result.year})
                              </h3>
                              <p className="text-gray-300">{result.overview}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2 rounded-2xl bg-gray-900/50 border border-gray-800/40 px-4 py-3">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-800/40 p-4 bg-black/40">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full rounded-xl bg-gray-900/50 border border-gray-800/40 px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-blue-400 hover:bg-gray-800/30 disabled:opacity-50 transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
