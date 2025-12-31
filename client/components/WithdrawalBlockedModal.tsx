import { X, Shield, Clock, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";

interface WithdrawalBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  requiredStreak: number;
}

export default function WithdrawalBlockedModal({
  isOpen,
  onClose,
  currentStreak,
  requiredStreak,
}: WithdrawalBlockedModalProps) {
  if (!isOpen) return null;

  const daysRemaining = requiredStreak - currentStreak;
  const progressPercent = (currentStreak / requiredStreak) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 rounded-full p-2">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Withdrawal Protection</h2>
          </div>
          <p className="text-blue-100 text-sm">
            Your funds are secure and will be available soon
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Message */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                  Withdrawal Not Yet Available
                </p>
                <p className="text-amber-800 dark:text-amber-300 text-xs mt-1">
                  To ensure platform security and prevent fraud, withdrawals require {requiredStreak} consecutive days of activity.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {currentStreak} / {requiredStreak} days
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              {/* Progress markers */}
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">0</span>
                <span className="text-xs text-gray-500">{requiredStreak}</span>
              </div>
            </div>

            {/* Days Remaining */}
            <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{daysRemaining}</span>
                {" "}day{daysRemaining !== 1 ? "s" : ""} remaining
              </span>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Why this requirement?</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Fraud Prevention:</span> Protects our community from malicious actors
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Account Security:</span> Ensures your account is legitimate and active
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Guaranteed Payments:</span> All verified withdrawals are processed within 24-48 hours
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            I Understand
          </button>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Keep voting daily to unlock your withdrawal! Your balance is safe and waiting for you.
          </p>
        </div>
      </div>
    </div>
  );
}
