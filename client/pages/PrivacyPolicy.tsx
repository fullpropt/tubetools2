import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: January 2026</p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto prose prose-sm">
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Introduction</h2>
              <p>
                TubeTools ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Information We Collect</h2>
              <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and banking information</li>
                <li><strong>Account Information:</strong> Username, password, and account preferences</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our platform</li>
                <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Use of Your Information</h2>
              <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Create and manage your account</li>
                <li>Process your withdrawal requests</li>
                <li>Send you promotional communications (with your consent)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect and prevent fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Disclosure of Your Information</h2>
              <p>
                We may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><strong>By Law or to Protect Rights:</strong> If required by law or to protect our legal rights</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with vendors who assist us in operating our website and conducting our business</li>
                <li><strong>Business Transfers:</strong> Your information may be transferred as part of a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to protect your personal information. However, perfect security does not exist on the Internet. We cannot guarantee the absolute security of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> supfullpropt@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by updating the "Last updated" date of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Your Privacy Rights</h2>
              <p>
                Under the LGPD (Lei Geral de Proteção de Dados) and other privacy laws, you have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to request deletion of your information</li>
                <li>The right to opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">9. How to Exercise Your Rights</h2>
              <p>
                To exercise your rights, such as accessing or correcting your data, please contact us at the email address provided above. To delete your account and all associated personal information, you can use the "Delete Account" feature available in your profile settings. This action is irreversible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">11. Children's Privacy</h2>
              <p>
                Our Site is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information and terminate the child's account.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
