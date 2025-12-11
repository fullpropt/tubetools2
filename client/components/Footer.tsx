import { Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Grid de conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Coluna 1: Sobre */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <div className="bg-red-600 rounded-lg p-2">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.175h-15.23c-1.697 0-3.076 1.379-3.076 3.075v10.5c0 1.696 1.379 3.075 3.076 3.075h15.23c1.697 0 3.076-1.379 3.076-3.075v-10.5c0-1.696-1.379-3.075-3.076-3.075zm-5.338 9.921t-4.171-2.441v4.882l4.171-2.441z" />
                </svg>
              </div>
              TubeTools
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ganhe dinheiro assistindo e votando em vídeos. A plataforma que recompensa seu tempo.
            </p>
          </div>

          {/* Coluna 2: Links Úteis */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informações</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Políticas */}
          <div>
            <h4 className="text-white font-semibold mb-4">Políticas</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Termos de Serviço
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Denúncias
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-red-600" />
                <a href="mailto:support@tubetools.com" className="hover:text-white transition-colors">
                  support@tubetools.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-red-600" />
                <span>+55 (11) 9999-9999</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-800 pt-8">
          {/* Rodapé inferior */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} TubeTools. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">
                Status
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Documentação
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
