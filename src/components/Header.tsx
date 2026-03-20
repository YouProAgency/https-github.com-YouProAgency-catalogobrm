import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Menu } from 'lucide-react'
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu Categorias</span>
        </Button>

        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-lg leading-none">B</span>
            </div>
            <span className="hidden sm:inline-block">Catálogo BRM</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar produtos..."
              className="w-full pl-9 bg-slate-100/50 border-slate-200 focus-visible:ring-primary/50 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center">
          <Link to="/orcamento">
            <Button variant="ghost" size="icon" className="relative group hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
              {totalItems > 0 && (
                <span
                  className={cn(
                    'absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-semibold text-white flex items-center justify-center transition-all',
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
