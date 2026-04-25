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
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm flex flex-col">
      {/* Main Navigation */}
      <div className="container mx-auto flex h-[80px] items-center px-4 md:px-6 gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu Categorias</span>
        </Button>

        <Link
          to="/"
          className="flex items-center gap-2 mr-4 md:mr-8 hover:opacity-90 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="BR Mangueiras Logo"
            className="h-12 md:h-14 w-auto object-contain"
          />
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

      {/* Accent lines matching the brand identity */}
      <div className="h-1.5 w-full bg-secondary" />
      <div className="h-1.5 w-full bg-accent" />
    </header>
  )
}
