import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const AIChatbot = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chatbot", {
        body: { messages: newMessages },
      });
      if (error) throw error;
      setMessages([...newMessages, { role: "assistant", content: data.reply || "Sorry, I couldn't process that request." }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again or contact us directly at contact@edurushacademy.com"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground premium-shadow flex items-center justify-center hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-card border border-border rounded-2xl premium-shadow overflow-hidden flex flex-col"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary-foreground">{t("chatbot.title")}</h3>
                <p className="text-xs text-primary-foreground/60">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Greeting */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
                    <p className="text-sm text-foreground leading-relaxed">{t("chatbot.greeting")}</p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-accent/10" : "bg-accent/10"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-accent" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}>
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("chatbot.placeholder")}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
