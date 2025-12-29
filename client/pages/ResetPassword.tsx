import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiPost } from "@/lib/api-client";
import { ResetPasswordRequest, ResetPasswordResponse } from "@shared/api";
import { Play, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordRequirements = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Recovery token not found. Please request a new link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid recovery token");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload: ResetPasswordRequest = { token, newPassword };
      
      console.log("Sending reset password request");
      const response = await apiPost<ResetPasswordResponse>("/api/auth/reset-password", payload);

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/onboarding");
        }, 3000);
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
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
                <h2 className="text-xl font-bold mb-2">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      required
                      disabled={loading || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {newPassword && (
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

                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      required
                      disabled={loading || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {passwordsMatch ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-700">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-red-600" />
                          <span className="text-xs text-red-600">Passwords do not match</span>
                        </>
                      )}
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
                  disabled={loading || !token || !isPasswordValid || !passwordsMatch}
                  className="w-full px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Reset Password"}
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
              
              <h3 className="text-lg font-bold">Password Reset!</h3>
              
              <p className="text-sm text-muted-foreground">
                Your password has been successfully reset. You will be redirected to the login page in a few seconds...
              </p>

              <button
                onClick={() => navigate("/onboarding")}
                className="w-full btn-outline mt-4"
              >
                Go to Login Now
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/onboarding")}
              className="text-red-600 hover:underline font-semibold"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
