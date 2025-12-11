import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { Withdrawal } from "@shared/api";
import Layout from "@/components/Layout";
import { CheckCircle2 } from "lucide-react";

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
        const withdrawals = await apiGet<Withdrawal[]>("/api/withdrawals");
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
    return <Layout><div className="text-red-500 text-center p-8">{error}</div></Layout>;
  }

  if (!withdrawal) {
    return <Layout><div className="text-center p-8">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Withdrawal in Progress</h1>
        <p className="text-muted-foreground mb-8">
          The payment will be duly processed and confirmed within up to 7 business days, and once completed, it will be transferred to the bank account provided.
        </p>

        {withdrawal.bankDetails && (
          <div className="border rounded-lg p-6 text-left space-y-4 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">Bank Details Provided</h2>
            <div>
              <p className="text-sm text-muted-foreground">Account Holder</p>
              <p className="font-medium">{withdrawal.bankDetails.holderName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Name</p>
              <p className="font-medium">{withdrawal.bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">**** **** **** {withdrawal.bankDetails.accountNumber.slice(-4)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Routing Number</p>
              <p className="font-medium">{withdrawal.bankDetails.routingNumber}</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button onClick={() => navigate('/profile')} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Back to Profile
          </button>
        </div>
      </div>
    </Layout>
  );
}
