import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api-client";
import { clearAuth } from "@/lib/auth";
import { DeleteAccountResponse } from "@shared/api";
import {
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isConfirmationValid = confirmation === "DELETE";

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isConfirmationValid) {
        setError("Please type DELETE to confirm");
        setLoading(false);
        return;
      }

      const response = await apiPost<DeleteAccountResponse>("/api/auth/delete-account", {
        password,
        confirmation,
      });

      if (response.success) {
        // Clear auth and redirect to onboarding
        clearAuth();
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmation("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-950 rounded-full p-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-2">Delete Account</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          This action is permanent and cannot be undone. All your data will be permanently deleted.
        </p>

        {/* Warning Box */}
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm mb-2">
            What will be deleted:
          </h3>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
            <li>• Your account and profile information</li>
            <li>• All your voting history</li>
            <li>• All your transactions</li>
            <li>• Your current balance (${"{balance}"} will be lost)</li>
            <li>• Any pending withdrawals</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Enter your password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
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
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Type <span className="text-red-600 font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
              placeholder="DELETE"
              className={`w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                confirmation && !isConfirmationValid 
                  ? "border-red-500 focus:ring-red-500" 
                  : isConfirmationValid 
                    ? "border-green-500 focus:ring-green-500" 
                    : "border-border focus:ring-red-500"
              }`}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isConfirmationValid || !password}
              className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </>
              )}
            </button>
          </div>
        </form>

        {/* LGPD Notice */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          In accordance with LGPD (Lei Geral de Proteção de Dados), you have the right to request deletion of your personal data.
        </p>
      </div>
    </div>
  );
}
