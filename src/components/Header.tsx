import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Menu, Phone, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export default function Header() {
  const { totalItems, isCartAnimating } = useCart()
  const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-sm flex flex-col">
      {/* Top Contact Bar */}
      <div className="bg-secondary text-secondary-foreground py-2 px-4 text-xs font-medium">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 opacity-90">
              <MapPin className="h-3 w-3" /> São Paulo, SP - Atendimento Nacional
            </span>
            <span className="hidden sm:flex items-center gap-1.5 opacity-90">
              <Mail className="h-3 w-3" /> contato@brmangueiras.com.br
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-primary" /> (11) 99999-9999
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto flex h-[72px] items-center px-4 md:px-6 gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu Categorias</span>
        </Button>

        <Link
          to="/"
          className="flex items-center gap-2 mr-4 md:mr-8 hover:opacity-90 transition-opacity"
        >
          <img
            src="https://img.usecurling.com/i?q=brm&shape=fill&color=red"
            alt="BRM Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="hidden lg:flex flex-col ml-1">
            <span className="font-extrabold text-xl tracking-tight uppercase text-secondary leading-none">
              BRM
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-0.5">
              Mangueiras
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-secondary mr-auto">
          <Link to="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <a href="/#produtos" className="hover:text-primary transition-colors">
            Produtos
          </a>
          <a href="/#sobre" className="hover:text-primary transition-colors">
            Sobre Nós
          </a>
          <a href="/#contato" className="hover:text-primary transition-colors">
            Contato
          </a>
        </nav>

        <div className="flex-1 max-w-xs hidden lg:flex items-center mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar no catálogo..."
              className="w-full pl-9 bg-muted/60 border-transparent focus-visible:ring-primary focus-visible:border-primary rounded-full h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/orcamento">
            <Button className="relative group bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-sm px-4 sm:px-6 h-10 shadow-sm transition-transform hover:-translate-y-0.5">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline-block font-bold">Orçamento</span>
              {totalItems > 0 && (
                <span
                  className={cn(
                    'absolute -top-2 -right-2 h-5 w-5 rounded-full bg-secondary text-[10px] font-bold text-white flex items-center justify-center border border-white shadow-sm',
                    isCartAnimating && 'animate-pop bg-emerald-500',
                  )}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
