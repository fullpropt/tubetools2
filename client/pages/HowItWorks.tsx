import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { ArrowLeft, Play, ThumbsUp, Wallet, CreditCard } from "lucide-react";
import Layout from "@/components/Layout";

export default function HowItWorks() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  return (
    <Layout hideNav={!authenticated}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-lg text-gray-600">
            Learn how to earn money on TubeTools in just a few simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Step 1 */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-600 rounded-full p-3 flex-shrink-0">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
              <h2 className="text-2xl font-bold">1. Watch Videos</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Browse through our curated collection of videos. Click on any video that interests you and start watching. The more videos you watch, the more you earn!
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-600 rounded-full p-3 flex-shrink-0">
                <ThumbsUp className="h-6 w-6 text-white fill-white" />
              </div>
              <h2 className="text-2xl font-bold">2. Vote & Earn</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              After watching the video, vote on it to register your earnings.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-600 rounded-full p-3 flex-shrink-0">
                <Wallet className="h-6 w-6 text-white fill-white" />
              </div>
              <h2 className="text-2xl font-bold">3. Accumulate Balance</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Your earnings accumulate in your balance, which you can track by accessing the 'Balance' tab in the upper left.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-600 rounded-full p-3 flex-shrink-0">
                <CreditCard className="h-6 w-6 text-white fill-white" />
              </div>
              <h2 className="text-2xl font-bold">4. Withdraw Earnings</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Once your balance reaches $3,500.00, you can submit your withdrawal request in the 'Balance' section by providing your bank details for the transfer.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Relevant Information</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Watch the videos until the end to enable the voting option.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Your “like” or “dislike” vote does not affect your earnings, but it helps advertisers measure the performance of their ads.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>You are allowed to vote on only 10 videos per day.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Important:</strong> Your balance will be reset to $0.00 if you skip more than one day without voting. You can skip one day, but if you miss two consecutive days, you will lose all your accumulated balance and progress.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Withdrawals are only allowed when your balance reaches $3,500.00. After making a withdrawal, you can request another one once your balance reaches the minimum again.</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        {authenticated ? (
          <div className="text-center">
            <button
              onClick={() => navigate("/feed")}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Start Earning Now
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Sign Up to Get Started
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
