import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-16">
        {/* Grid de conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Coluna 1: Logo e Descrição */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-600 rounded p-1.5 flex-shrink-0">
                <Play className="h-5 w-5 text-white fill-white" />
              </div>
              <h3 className="text-white font-bold text-lg">TubeTools</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Earn money by watching and voting on videos. The platform that rewards your time.
            </p>
          </div>

          {/* Coluna 2: Information */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wide">Information</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Policies */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wide">Policies</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Account */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/change-password" className="text-gray-400 hover:text-white transition-colors">
                  Change Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-800 pt-8">
          {/* Rodapé inferior */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} TubeTools. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
