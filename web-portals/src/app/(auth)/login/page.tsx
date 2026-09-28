"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, ArrowRight } from "lucide-react";

// Initialize Supabase Client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Dynamic Content Configuration
const roleContent = {
  dispatcher: {
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop",
    tagline: "CONNECTED RETAIL LOGISTICS",
    title: "Every delivery,\nright on time.",
    desc: "Plan allocations, defer overflow, and track live routes from one unified command center.",
    email: "dispatch@waypoint.com",
  },
  loader: {
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070&auto=format&fit=crop",
    tagline: "WAREHOUSE OPERATIONS",
    title: "Load sequences,\nperfectly ordered.",
    desc: "Manage trip queues, enforce reverse-stop loading, and dispatch vehicles efficiently.",
    email: "load@waypoint.com",
  },
  manager: {
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=2000&auto=format&fit=crop",
    tagline: "STORE MANAGEMENT",
    title: "Total visibility\nfor your store.",
    desc: "Monitor incoming deliveries, review exception alerts, and manage receiving dashboards.",
    email: "store@waypoint.com",
  }
};

type RoleKey = keyof typeof roleContent;

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<RoleKey>("dispatcher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const destination = activeRole === "loader" 
        ? "/trip-queue" 
        : activeRole === "manager" 
        ? "/overview" 
        : "/command-center";
      router.push(destination);
      router.refresh();
    }
  };

  const handleRoleSelect = (role: RoleKey) => {
    setActiveRole(role);
    setEmail(roleContent[role].email);
    setPassword("Waypoint@2026");
    setError("");
  };

  const currentTheme = roleContent[activeRole];

  return (
    <div className="min-h-screen flex font-sans bg-waypoint-bg">
      {/* LEFT COLUMN: Dynamic Hero Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden transition-all duration-500">
        <div 
          className="absolute inset-0 z-0 opacity-50 bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url('${currentTheme.image}')` }}
        />
        <div className="absolute inset-0 z-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="Waypoint Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-2xl text-white tracking-tight">Waypoint</span>
        </div>

        {/* Dynamic Center Marketing Text */}
        <div className="relative z-10 max-w-md mt-20 transition-all duration-500">
          <p className="text-white/80 text-xs font-bold tracking-widest uppercase mb-4">
            {currentTheme.tagline}
          </p>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6 whitespace-pre-line">
            {currentTheme.title}
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            {currentTheme.desc}
          </p>
        </div>

        {/* Compact Bottom KPI Card */}
        <div className="relative z-10 mt-auto pt-20">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex gap-8 w-max">
            <div>
              <p className="text-xl font-bold mb-0.5 text-white">98.6%</p>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">On-time delivery</p>
            </div>
            <div>
              <p className="text-xl font-bold mb-0.5 text-white">24/7</p>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Live tracking</p>
            </div>
            <div>
              <p className="text-xl font-bold mb-0.5 text-white">1 platform</p>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">End-to-end control</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Light Theme Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-waypoint-bg">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <p className="text-waypoint-orange text-[11px] font-bold tracking-widest uppercase mb-2">
              Welcome Back
            </p>
            <h2 className="text-3xl font-bold text-waypoint-text mb-3">
              Sign in to Waypoint
            </h2>
            <p className="text-waypoint-secondary text-sm">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-waypoint-text block">
                Work email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-black font-medium text-sm focus:outline-none focus:ring-2 focus:ring-waypoint-yellow focus:border-transparent transition-all"
                  placeholder="name@waypoint.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-waypoint-text block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-black font-bold text-sm focus:outline-none focus:ring-2 focus:ring-waypoint-yellow focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-waypoint-yellow border-gray-300 rounded focus:ring-waypoint-yellow accent-waypoint-yellow" 
                  defaultChecked 
                />
                <span className="text-sm text-waypoint-text font-medium">Keep me signed in</span>
              </label>
              <a href="#" className="text-sm text-waypoint-text font-bold hover:text-waypoint-orange transition-colors">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Solid Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-waypoint-yellow text-waypoint-text font-bold text-base py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#F0B92B] transition-colors disabled:opacity-50 mt-2 shadow-sm"
            >
              {loading ? "Signing in..." : "Sign in to Waypoint"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-4">
              <div className="grow border-t border-gray-200"></div>
              <span className="shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
              <div className="grow border-t border-gray-200"></div>
            </div>

            {/* Judge Quick Access Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-waypoint-secondary text-[11px] font-bold uppercase tracking-widest mb-4">
                Judge Quick Access
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("dispatcher")}
                  className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    activeRole === 'dispatcher' ? 'bg-waypoint-yellow text-waypoint-text shadow-sm' : 'bg-transparent text-waypoint-secondary hover:bg-gray-50 border border-transparent hover:border-gray-200'
                  }`}
                >
                  Dispatcher
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("loader")}
                  className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    activeRole === 'loader' ? 'bg-waypoint-yellow text-waypoint-text shadow-sm' : 'bg-transparent text-waypoint-secondary hover:bg-gray-50 border border-transparent hover:border-gray-200'
                  }`}
                >
                  Loader
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("manager")}
                  className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    activeRole === 'manager' ? 'bg-waypoint-yellow text-waypoint-text shadow-sm' : 'bg-transparent text-waypoint-secondary hover:bg-gray-50 border border-transparent hover:border-gray-200'
                  }`}
                >
                  Manager
                </button>
              </div>

              {/* Direct Tablet Prototype Jump */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
                <a
                  href="/trip-queue?preview=true"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-waypoint-orange hover:text-amber-600 bg-yellow-50 hover:bg-yellow-100/80 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  <span>⚡ Directly Launch Loader Tablet Prototype</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-waypoint-secondary">
              New to the depot? <a href="#" className="font-bold text-waypoint-text hover:text-waypoint-orange">Request access</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}