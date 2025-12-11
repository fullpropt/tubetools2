import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { apiPost } from "@/lib/api-client";
import Layout from "@/components/Layout";

export default function WithdrawBankDetails() {
  const navigate = useNavigate();
  const { withdrawalId } = useParams();
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
    if (!withdrawalId) {
      setError("Withdrawal ID is missing. Please start over.");
    }
  }, [navigate, withdrawalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!holderName || !bankName || !accountNumber || !routingNumber) {
      setError("All fields are required.");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost("/api/withdrawals/bank-details", {
        withdrawalId,
        holderName,
        bankName,
        accountNumber,
        routingNumber,
      });
      navigate(`/withdraw/confirm-fee/${withdrawalId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit bank details");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8">
        <h1 className="text-3xl font-bold mb-6">Bank Account Details</h1>
        <p className="text-muted-foreground mb-8">Please provide your US bank account information to receive the funds.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="holderName" className="font-medium">Account Holder Name</label>
            <input id="holderName" value={holderName} onChange={(e) => setHolderName(e.target.value)} className="w-full p-2 border rounded" placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <label htmlFor="bankName" className="font-medium">Bank Name</label>
            <input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., Bank of America" />
          </div>

          <div className="space-y-2">
            <label htmlFor="accountNumber" className="font-medium">Account Number</label>
            <input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="123456789" />
          </div>

          <div className="space-y-2">
            <label htmlFor="routingNumber" className="font-medium">Routing Number (ACH)</label>
            <input id="routingNumber" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="012345678" />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {submitting ? "Submitting..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
