import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  setUser,
  setAuthToken,
  setRememberedEmail,
  getRememberedEmail,
} from "@/lib/auth";
import { apiPost } from "@/lib/api-client";
import { AuthResponse, SignupRequest, LoginRequest } from "@shared/api";
import { Play, CheckCircle2, Eye, EyeOff, Users, Star, Shield } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  useEffect(() => {
    // Check for remembered email and auto-fill
    const remembered = getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setMode("login");
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isPasswordValid) {
        setError("Password does not meet requirements");
        setLoading(false);
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const payload: SignupRequest = { name, email: normalizedEmail, password };
      console.log("Sending signup request with payload:", { ...payload, password: "***" });

      const response = await apiPost<AuthResponse>("/api/auth/signup", payload);
      console.log("Signup response received:", response);

      if (!response || !response.token || !response.user) {
        throw new Error("Invalid signup response: missing token or user");
      }

      setUser(response.user);
      setAuthToken(response.token);
      setRememberedEmail(email);

      console.log("Auth state saved, navigating to feed");
      navigate("/feed");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Signup failed";
      console.error("Signup error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const payload: LoginRequest = { email: normalizedEmail, password };
      console.log("Sending login request with payload:", { email: normalizedEmail, password: "***" });
      const response = await apiPost<AuthResponse>("/api/auth/login", payload);

      setUser(response.user);
      setAuthToken(response.token);
      setRememberedEmail(email);

      navigate("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-red-600 rounded-lg p-3">
              <Play className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">TubeTools</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Discover. Engage. Influence.
              </p>
            </div>
          </div>
        </div>

        {/* Value Proposition - Updated */}
        <div className="card-base mb-8">
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Discover Curated Content</p>
                <p className="text-xs text-muted-foreground">
                  Access a library of high-quality, hand-picked videos
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Share Your Feedback</p>
                <p className="text-xs text-muted-foreground">
                  Your opinions help shape content trends and get rewarded
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Join Our Community</p>
                <p className="text-xs text-muted-foreground">
                  Become part of a community that influences what becomes popular
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={mode === "signup" ? handleSignup : handleLogin}
          className="card-base space-y-4"
        >
          <div>
            <h2 className="text-xl font-bold mb-4">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {mode === "login" && (
              <p className="text-xs text-muted-foreground mt-1">
                We'll remember your email
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Requirements - Only show in signup mode */}
            {mode === "signup" && password && (
              <div className="mt-3 space-y-2 p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold text-foreground">Password must contain:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${passwordRequirements.length ? "bg-green-600" : "bg-gray-300"}`} />
                    <span className={`text-xs ${passwordRequirements.length ? "text-green-700" : "text-gray-500"}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${passwordRequirements.uppercase ? "bg-green-600" : "bg-gray-300"}`} />
                    <span className={`text-xs ${passwordRequirements.uppercase ? "text-green-700" : "text-gray-500"}`}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${passwordRequirements.lowercase ? "bg-green-600" : "bg-gray-300"}`} />
                    <span className={`text-xs ${passwordRequirements.lowercase ? "text-green-700" : "text-gray-500"}`}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${passwordRequirements.number ? "bg-green-600" : "bg-gray-300"}`} />
                    <span className={`text-xs ${passwordRequirements.number ? "text-green-700" : "text-gray-500"}`}>
                      One number
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === "signup" && !isPasswordValid)}
            className="w-full px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Loading..."
              : mode === "signup"
                ? "Get Started"
                : "Log In"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setName("");
              setPassword("");
              setShowPassword(false);
              setError("");
            }}
            className="w-full btn-outline"
          >
            {mode === "signup"
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </form>

        {/* Trust Indicators */}
        <div className="mt-6 flex justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="text-xs">400+ Users</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span className="text-xs">Trusted Platform</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Secure</span>
          </div>
        </div>

        {/* Footer with Links */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-red-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-red-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/how-it-works" className="hover:text-foreground hover:underline">
              How It Works
            </Link>
            <Link to="/faq" className="hover:text-foreground hover:underline">
              FAQ
            </Link>
            <a href="mailto:support@youtbviews.online" className="hover:text-foreground hover:underline">
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
