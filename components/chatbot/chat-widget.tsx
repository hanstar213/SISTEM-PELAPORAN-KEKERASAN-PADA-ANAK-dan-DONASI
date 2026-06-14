"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Message = {
  role: "user" | "model";
  text: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "model", 
      text: "Halo! Saya asisten virtual PeduliAnak. Ada yang bisa saya bantu? Anda dapat mengakses menu cepat berikut:\n- [LINK: Laporkan Kekerasan | /report]\n- [LINK: Donasi Sekarang | /donate]\n- [LINK: Lihat Transparansi | /transparency]" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Render message content with rich buttons for links
  const renderMessageContent = (msg: Message) => {
    if (msg.role === "user") {
      return msg.text;
    }

    const linkRegex = /\[LINK:\s*([^\]|]+)\|\s*([^\]]+)\]/g;
    
    if (!linkRegex.test(msg.text)) {
      return msg.text;
    }

    linkRegex.lastIndex = 0;

    const parts: React.ReactNode[] = [];
    const buttons: { label: string; path: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(msg.text)) !== null) {
      const matchIndex = match.index;
      const label = match[1].trim();
      const path = match[2].trim();

      if (matchIndex > lastIndex) {
        parts.push(msg.text.substring(lastIndex, matchIndex));
      }

      parts.push(
        <span key={matchIndex} className="font-semibold text-teal-600">
          {label}
        </span>
      );

      buttons.push({ label, path });
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < msg.text.length) {
      parts.push(msg.text.substring(lastIndex));
    }

    return (
      <div className="space-y-3">
        <div>{parts}</div>
        <div className="flex flex-col gap-2 mt-1">
          {buttons.map((btn, index) => (
            <Link
              key={index}
              href={btn.path}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-all shadow-sm active:scale-[0.98] group"
            >
              <span>{btn.label}</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Optimistic UI update
    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg,
          history: messages.slice(1) // exclude initial greeting from history or keep it. Let's exclude to save tokens if needed, but it's fine to keep. Actually, history expects previous exchanges.
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        const details = errData.details ? JSON.stringify(errData.details) : "";
        throw new Error(`Gagal merespons: ${details}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "model", text: `Maaf, terjadi kesalahan: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-warm-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-navy-800 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="bg-teal-500 p-2 rounded-full">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm">Asisten PeduliAnak</h3>
                <p className="text-xs text-teal-200">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-50">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-teal-600 text-white" : "bg-white border border-warm-200 text-teal-600"}`}>
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-teal-600 text-white rounded-tr-sm" 
                    : "bg-white text-navy-800 border border-warm-200 rounded-tl-sm shadow-sm"
                }`}>
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 flex-row">
                <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-warm-200 text-teal-600 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-warm-200 text-navy-800 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-teal-500" />
                  <span className="text-xs text-navy-800/60">Mengetik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-warm-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 bg-warm-50 border border-warm-200 rounded-full px-4 py-2.5 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="accent" 
                className="rounded-full shrink-0 w-10 h-10"
                disabled={isLoading || !input.trim()}
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${
          isOpen ? "bg-coral-500 text-white rotate-90" : "bg-teal-600 text-white hover:bg-teal-500"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
