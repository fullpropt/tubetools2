import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api-client";
import { ForgotPasswordRequest, ForgotPasswordResponse } from "@shared/api";
import { Play, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const payload: ForgotPasswordRequest = { email: normalizedEmail };
      
      console.log("Sending forgot password request for:", normalizedEmail);
      const response = await apiPost<ForgotPasswordResponse>("/api/auth/forgot-password", payload);

      if (response.success) {
        setSuccess(true);
        if (response.resetToken) {
          setResetToken(response.resetToken);
        }
      } else {
        setError(response.message || "Failed to process request");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReset = () => {
    if (resetToken) {
      navigate(`/reset-password?token=${resetToken}`);
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
                Watch. Vote. Earn.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card-base">
          {!success ? (
            <>
              <div className="mb-6">
                <button
                  onClick={() => navigate("/onboarding")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>
                <h2 className="text-xl font-bold mb-2">Forgot your password?</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Send Recovery Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h3 className="text-lg font-bold">Email Sent!</h3>
              
              <p className="text-sm text-muted-foreground">
                If an account exists with <strong>{email}</strong>, you will receive a link to reset your password.
              </p>

              {resetToken && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 mb-3">
                    <strong>Development Mode:</strong> In production, you would receive an email. For now, use the button below:
                  </p>
                  <button
                    onClick={handleGoToReset}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-semibold"
                  >
                    Go to Password Reset
                  </button>
                </div>
              )}

              <button
                onClick={() => navigate("/onboarding")}
                className="w-full btn-outline mt-4"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/onboarding")}
            className="text-red-600 hover:underline font-semibold"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
