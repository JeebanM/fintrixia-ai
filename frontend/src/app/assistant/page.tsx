"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { sendAIQuery, getRecommendations } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { Bot, Send, Zap, TrendingUp, Sparkles, User, BrainCircuit } from "lucide-react";

const SUGGESTED_QUERIES = [
  "How much did I spend this week?",
  "Where can I save money?",
  "Compare last week vs this week",
  "Top spending categories?",
  "Am I within my budget?",
  "Daily average spend?",
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
      text: "Greetings. I am Fintrixia's Neural Engine. I've analyzed your recent financial trajectories and I'm ready to provide strategic insights. What would you like to explore?",
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
        { id: Date.now().toString(), role: "ai", text: "Protocol interrupted. Neural link unstable. Please retry." },
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
      <Header title="Neural Assistant" subtitle="Interfacing with autonomous financial intelligence" />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-120px)]">
        {/* Chat Panel */}
        <div className="lg:col-span-3 flex flex-col glass-panel overflow-hidden border-white/5">
          {/* Chat Header */}
          <div className="p-5 border-b border-white/5 bg-surface-high/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20">
                <BrainCircuit size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground tracking-tight">Fintrixia Neural V1</p>
                <p className="text-[10px] text-success font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  Synapse Active
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-high/50 border border-white/5">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enhanced Mode</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-surface-low/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-lg ${
                  msg.role === "ai" 
                    ? "bg-gradient-to-br from-primary to-accent text-white" 
                    : "bg-surface-high border border-white/10 text-muted-foreground"
                }`}>
                  {msg.role === "ai" ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div
                  className={`max-w-[75%] px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-xl transition-all duration-300 ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-none hover:bg-primary-hover"
                      : "bg-surface-high/80 text-foreground border border-white/5 rounded-tl-none backdrop-blur-xl"
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                  {msg.source && (
                    <div className="flex items-center gap-2 mt-2 opacity-50">
                      <div className="w-1 h-1 rounded-full bg-current" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {msg.source === "rule" ? "Deterministic Engine" : "LLM Inference"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-4 fade-in">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-surface-high/80 border border-white/5 px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-2 backdrop-blur-xl">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Controls */}
          <div className="p-6 space-y-4 bg-surface-high/30 border-t border-white/5">
            {/* Suggested Queries */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-surface-high border border-white/5 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <input
                  id="ai-query-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Analyze financial flow..."
                  className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-background/80 transition-all duration-300 shadow-inner group-hover:border-white/10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <div className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest hidden md:block">Neural Link Active</div>
                </div>
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || queryMutation.isPending}
                className="w-14 h-14 bg-primary hover:bg-primary-hover disabled:bg-surface-high disabled:text-muted-foreground text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all duration-300"
                id="send-ai-btn"
              >
                <Send size={20} className={queryMutation.isPending ? "animate-pulse" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Panel */}
        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Zap size={14} className="text-primary" /> Strategic Directives
          </h2>
          {recs.length === 0 ? (
            <div className="glass-panel p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-surface-high rounded-2xl flex items-center justify-center mx-auto opacity-50">
                <TrendingUp size={20} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                Synchronize ledger data to generate neural recommendations.
              </p>
            </div>
          ) : (
            recs.map((rec: any, i: number) => (
              <div
                key={i}
                className="glass-panel p-5 space-y-4 border-white/5 fade-in hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                    rec.priority === "high" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                  }`}>
                    {rec.priority} Priority
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{rec.action}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.impact}</p>
                </div>
                
                <button className="w-full py-2 bg-surface-high hover:bg-primary text-foreground hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border border-white/5">
                  Execute Directive
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
