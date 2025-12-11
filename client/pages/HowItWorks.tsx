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
              Browse through our curated collection of videos. Click on any video that interests you and start watching. The longer you watch, the more you earn!
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
              After watching, vote on the video. Your vote counts and helps us understand what content you like. Each vote earns you rewards!
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
              Your earnings accumulate in your balance. Check your profile anytime to see how much you've earned. No minimum watch time required!
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
              Once you have enough balance, request a withdrawal. Add your bank details and pay the transaction fee to receive your earnings!
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Tips</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Watch videos in full to maximize your earnings</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Vote honestly to help us improve our content recommendations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Check your balance regularly to track your progress</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Withdrawals are processed within 24-48 hours</span>
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
