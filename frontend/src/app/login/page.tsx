"use client";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, Shield, TrendingUp, Bot, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: TrendingUp, text: "Predictive Analytics" },
  { icon: Bot,        text: "Neural Financial Advisory" },
  { icon: Shield,     text: "Quantum-Level Security" },
];

export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await googleLogin(credentialResponse.credential);
      const { access_token, user } = res.data;
      login(user, access_token);
      document.cookie = `fintrixia-auth-token=${access_token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      router.push("/dashboard");
    } catch {
      setError("Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen w-screen bg-background flex items-center justify-center relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-[440px] px-6 fade-in">
        <div className="glass-panel p-10 space-y-10 border-white/10 shadow-2xl shadow-black/50">
          
          {/* Brand Section */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 mx-auto rounded-[24px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] group hover:rotate-12 transition-transform duration-500">
                <Zap size={36} className="text-white fill-white/20" />
              </div>
              <div className="absolute -top-2 -right-2 p-1.5 bg-background border border-white/10 rounded-full shadow-xl">
                <Sparkles size={14} className="text-primary animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Fintrixia <span className="text-primary">AI</span></h1>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Experience the next generation of <br/> autonomous financial intelligence.
              </p>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid gap-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className="flex items-center gap-4 p-3 rounded-2xl bg-surface-high/30 border border-white/5 hover:border-primary/20 transition-all duration-300 group"
                style={{ animationDelay: `${i * 100 + 200}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={18} className="text-primary" />
                </div>
                <span className="text-xs font-bold text-foreground/80 tracking-wide uppercase">{text}</span>
              </div>
            ))}
          </div>

          {/* Authentication Section */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]"><span className="bg-surface-low px-4 text-muted-foreground">Secure Portal</span></div>
            </div>

            <div className="flex flex-col items-center">
              {loading ? (
                 <div className="py-4">
                   <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                 </div>
              ) : (
                 <div className="w-full flex justify-center scale-110">
                   <GoogleLogin
                     onSuccess={handleLoginSuccess}
                     onError={() => setError("Authentication protocol interrupted.")}
                     useOneTap
                     theme="filled_black"
                     size="large"
                     shape="pill"
                     text="continue_with"
                     width="300"
                   />
                 </div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[11px] font-bold text-center animate-fade-in">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <p className="text-center text-[10px] font-medium text-muted-foreground/60 leading-relaxed uppercase tracking-widest">
            Encrypted End-to-End <br/> Powered by Quantum Ledger Technology
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            &copy; 2026 Fintrixia Global Systems
          </p>
        </div>
      </div>
    </div>
  );
}
