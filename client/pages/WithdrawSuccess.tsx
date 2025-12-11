import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { Withdrawal } from "@shared/api";
import Layout from "@/components/Layout";
import { CheckCircle2, DollarSign, Building2, User, CreditCard } from "lucide-react";

export default function WithdrawSuccess() {
  const navigate = useNavigate();
  const { withdrawalId } = useParams();
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }

    const fetchWithdrawal = async () => {
      try {
        const withdrawals = await apiGet<Withdrawal[]>("/withdrawals");
        const currentWithdrawal = withdrawals.find(w => w.id === withdrawalId);
        if (currentWithdrawal) {
          setWithdrawal(currentWithdrawal);
        } else {
          setError("Withdrawal not found.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch withdrawal details");
      }
    };

    if (withdrawalId) {
      fetchWithdrawal();
    }
  }, [navigate, withdrawalId]);

  if (error) {
    return (
      <Layout>
        <div className="text-red-500 text-center p-8">{error}</div>
      </Layout>
    );
  }

  if (!withdrawal) {
    return (
      <Layout>
        <div className="text-center p-8">Loading...</div>
      </Layout>
    );
  }

  // Converter amount para número se for string
  const withdrawalAmount =
    typeof withdrawal.amount === "string"
      ? parseFloat(withdrawal.amount)
      : withdrawal.amount;

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Withdrawal in Progress</h1>
          <p className="text-muted-foreground mb-8">
            The payment will be duly processed and confirmed within up to 7 business days, and once completed, it will be transferred to the bank account provided.
          </p>
        </div>

        {/* Withdrawal Amount Card */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            <p className="text-sm font-semibold text-muted-foreground uppercase">Withdrawal Amount</p>
          </div>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            ${withdrawalAmount.toFixed(2)}
          </p>
        </div>

        {/* Bank Details Card */}
        {withdrawal.bankDetails && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 mb-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Details Confirmation
            </h2>

            <div className="space-y-4">
              {/* Account Holder */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Account Holder
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {withdrawal.bankDetails.holderName}
                  </p>
                </div>
              </div>

              {/* Bank Name */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Building2 className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Bank Name
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {withdrawal.bankDetails.bankName}
                  </p>
                </div>
              </div>

              {/* Account Number */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <CreditCard className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Account Number
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono">
                    **** **** **** {withdrawal.bankDetails.accountNumber.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Routing Number */}
              <div className="flex items-start gap-4">
                <CreditCard className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Routing Number
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono">
                    {withdrawal.bankDetails.routingNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <span className="font-semibold">Note:</span> Your withdrawal request has been submitted successfully. You will receive a confirmation email once the transfer is completed.
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </Layout>
  );
}
