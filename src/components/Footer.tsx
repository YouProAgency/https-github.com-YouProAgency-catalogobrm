import { Link } from 'react-router-dom'
import { ArrowUp, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer
      id="contato"
      className="bg-secondary text-secondary-foreground border-t-4 border-accent mt-auto pt-16 pb-6 relative"
    >
      {/* Decorative accent line matching header */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
      <div className="container px-4 md:px-6 mx-auto mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start mb-12">
          <div className="flex flex-col items-start space-y-4 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10">
            <img
              src="/logo.png"
              alt="BR Mangueiras Logo"
              className="h-14 w-auto drop-shadow-md bg-white px-3 py-2 rounded-sm"
            />
            <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
              Especialistas em fornecer mangueiras industriais, conexões e engates rápidos de alta
              performance. Garantimos a continuidade da sua operação com produtos certificados.
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="font-bold text-lg text-white uppercase tracking-wider">
              Contato / Whatsapp
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Av. Taboão da Serra, 1.560
                  <br />
                  Taboão da Serra, SP
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" /> (11) 9.4708-2171
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" /> vendas@brmangueiras.com.br
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="font-bold text-lg text-white uppercase tracking-wider">Links Rápidos</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-400 font-medium">
              <Link to="/" className="hover:text-primary transition-colors inline-block w-max">
                Página Inicial
              </Link>
              <a
                href="/#produtos"
                className="hover:text-primary transition-colors inline-block w-max"
              >
                Catálogo Completo
              </a>
              <Link
                to="/orcamento"
                className="hover:text-primary transition-colors inline-block w-max"
              >
                Solicitar Orçamento
              </Link>
              <a href="#sobre" className="hover:text-primary transition-colors inline-block w-max">
                Termos e Condições
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500">
          <p>&copy; 2026 Catálogo BR Mangueiras. Todos os direitos reservados.</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToTop}
            className="rounded-full hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Voltar ao topo</span>
          </Button>
        </div>
      </div>
    </footer>
  )
}
