import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-lg text-slate-900 tracking-tight">Catálogo BRM</span>
            <p className="text-sm text-muted-foreground mt-1 text-center md:text-left">
              Soluções completas para ambientes corporativos de alta performance.
            </p>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Produtos
            </Link>
            <Link to="/orcamento" className="hover:text-primary transition-colors">
              Orçamentos
            </Link>
            <a href="#" className="hover:text-primary transition-colors">
              Contato
            </a>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="rounded-full shadow-subtle hover:shadow-elevation transition-all"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Voltar ao topo</span>
          </Button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} BRM. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
