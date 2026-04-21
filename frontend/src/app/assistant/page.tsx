"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { sendAIQuery, getRecommendations } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { Bot, Send, Zap, TrendingUp, PiggyBank, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTED_QUERIES = [
  "How much did I spend this week?",
  "Where can I save money?",
  "Compare last week vs this week",
  "What are my top spending categories?",
  "Am I within my budget?",
  "What's my daily average spend?",
];

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  source?: "rule" | "llm";
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Hi! I'm Fintrixia AI 👋 I can answer questions about your spending, budgets, and financial patterns. Try asking me something!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: recs = [] } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => getRecommendations().then((r) => r.data),
  });

  const queryMutation = useMutation({
    mutationFn: (q: string) => sendAIQuery(q).then((r) => r.data),
    onMutate: (q) => {
      const userMsg: Message = { id: Date.now().toString(), role: "user", text: q };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: Date.now().toString() + "_ai",
        role: "ai",
        text: data.response,
        source: data.source,
      };
      setMessages((prev) => [...prev, aiMsg]);
    },
    onError: () => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", text: "Sorry, I couldn't process that right now. Please try again." },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    queryMutation.mutate(text);
  };

  return (
    <AppShell>
      <Header title="AI Assistant" subtitle="Ask me anything about your finances" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-80px)]">
        {/* Chat Panel */}
        <div className="lg:col-span-2 flex flex-col glass rounded-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ai-gradient flex items-center justify-center pulse-glow">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Fintrixia AI</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-ai-gradient flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-white rounded-tr-sm"
                        : "bg-surface-2 text-slate-200 rounded-tl-sm border border-white/5"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.source && (
                      <span className="text-xs opacity-50 mt-1 block">
                        {msg.source === "rule" ? "⚡ instant" : "🤖 AI"}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  key="typing"
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-ai-gradient flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-surface-2 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Suggested Queries */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-3">
              <input
                id="ai-query-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about your finances…"
                className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || queryMutation.isPending}
                className="btn-gradient px-4 py-3 disabled:opacity-50"
                id="send-ai-btn"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Recommendations Panel */}
        <div className="space-y-4 overflow-y-auto">
          <h2 className="font-semibold text-slate-200 text-sm">💡 Recommendations</h2>
          {recs.length === 0 ? (
            <GlassCard className="text-center text-sm text-slate-500 py-8">
              Add transactions to get personalized recommendations
            </GlassCard>
          ) : (
            recs.map((rec: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-4 space-y-2 rounded-2xl border border-accent/10"
              >
                <div className="flex items-start gap-2">
                  <span className="text-accent mt-0.5"><TrendingUp size={14} /></span>
                  <p className="text-sm font-medium text-slate-200">{rec.action}</p>
                </div>
                <p className="text-xs text-slate-400 pl-5">{rec.impact}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-5 inline-block font-medium ${
                  rec.priority === "high" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                }`}>{rec.priority} priority</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
