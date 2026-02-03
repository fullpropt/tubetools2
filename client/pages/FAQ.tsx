import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How much can I earn?",
      answer:
        "Your earnings depend on how many videos you watch and vote on. Rewards start higher and gradually adjust as you progress. The more videos you watch, the more you can earn, while respecting the limit of 10 videos per day.",
    },
    {
      id: "2",
      question: "Is there a minimum withdrawal amount?",
      answer:
        "Yes, the minimum withdrawal amount is $3,500.00. Once your balance reaches this amount, you can request a withdrawal.",
    },
    {
      id: "3",
      question: "Do I need to watch videos in full?",
      answer:
        "While you can skip videos, watching them in full ensures you get the maximum reward. We recommend watching videos completely to maximize your earnings.",
    },
    {
      id: "4",
      question: "Is my personal information safe?",
      answer:
        "Yes, we take security very seriously. All your personal and banking information is encrypted and stored securely. We never share your data with third parties.",
    },
    {
      id: "5",
      question: "Can I have multiple accounts?",
      answer:
        "No, each person is allowed only one account. Creating multiple accounts may result in account suspension and forfeiture of earnings.",
    },
  ];

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about TubeTools.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
            >
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-left text-gray-900">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 flex-shrink-0 transition-transform ${
                    expandedId === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === faq.id && (
                <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-gray-700 mb-4">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="mailto:support@tubetools.com"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </Layout>
  );
}
