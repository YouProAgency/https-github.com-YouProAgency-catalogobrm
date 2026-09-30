import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  Loader2,
  Search,
  Filter,
} from 'lucide-react'

import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HeroCarousel } from '@/components/HeroCarousel'

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, loading } = useProducts()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedBrand, setSelectedBrand] = useState('all')

  const query = searchParams.get('q')?.toLowerCase() || ''
  const category = searchParams.get('category')
  const subcategory = searchParams.get('sub')
  const featuredOnly = searchParams.get('featured') === 'true'

  // Dynamic unique brands and categories from real loaded products
  const availableBrands = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) set.add(p.brand.trim())
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim())
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products

    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(query)),
      )
    }
    if (category) {
      result = result.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
    }
    if (subcategory) result = result.filter((p) => p.subcategory === subcategory)
    if (selectedBrand && selectedBrand !== 'all') {
      result = result.filter((p) => p.brand?.toLowerCase() === selectedBrand.toLowerCase())
    }
    if (featuredOnly) result = result.filter((p) => p.featured)

    return [...result].sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name)
      if (sortBy === 'za') return b.name.localeCompare(a.name)
      if (sortBy === 'price_asc') {
        const pa = a.price1 ?? a.price ?? Infinity
        const pb = b.price1 ?? b.price ?? Infinity
        return pa - pb
      }
      if (sortBy === 'price_desc') {
        const pa = a.price1 ?? a.price ?? -Infinity
        const pb = b.price1 ?? b.price ?? -Infinity
        return pb - pa
      }
      return 0
    })
  }, [products, query, category, subcategory, selectedBrand, featuredOnly, sortBy])

  const showHero = !query && !category && !featuredOnly

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 w-full pb-16">
      {showHero && <HeroCarousel />}

      <div id="produtos" className="container mx-auto px-4 md:px-6 space-y-8 scroll-mt-24">
        {/* Info Section / About */}
        {showHero && (
          <div id="sobre" className="grid md:grid-cols-3 gap-6 mb-12 scroll-mt-24">
            <div className="bg-white p-6 rounded-sm border border-border shadow-sm flex flex-col items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-xl">
                01
              </div>
              <h3 className="font-bold text-secondary text-lg">Qualidade Comprovada</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Produtos fabricados sob rigorosas normas técnicas internacionais, garantindo
                segurança na sua operação.
              </p>
            </div>
            <div className="bg-white p-6 rounded-sm border border-border shadow-sm flex flex-col items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-xl">
                02
              </div>
              <h3 className="font-bold text-secondary text-lg">Pronta Entrega</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Amplo estoque para atender as demandas mais urgentes da indústria em todo o
                território nacional.
              </p>
            </div>
            <div className="bg-white p-6 rounded-sm border border-border shadow-sm flex flex-col items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-xl">
                03
              </div>
              <h3 className="font-bold text-secondary text-lg">Suporte Técnico</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nossa equipe de especialistas está pronta para especificar a melhor solução para o
                seu processo.
              </p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-border">
          <div>
            <h2 className="text-2xl font-extrabold text-secondary tracking-tight">
              {query
                ? `Resultados para "${query}"`
                : category
                  ? `${category} ${subcategory ? `> ${subcategory}` : ''}`
                  : featuredOnly
                    ? 'Produtos em Destaque'
                    : 'Nosso Catálogo'}
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Exibindo {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-full sm:w-[160px] bg-muted/30">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Marcas</SelectItem>
                  {availableBrands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[160px] bg-muted/30">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais Recentes</SelectItem>
                <SelectItem value="az">Nome (A - Z)</SelectItem>
                <SelectItem value="za">Nome (Z - A)</SelectItem>
                <SelectItem value="price_asc">Menor Preço</SelectItem>
                <SelectItem value="price_desc">Maior Preço</SelectItem>
              </SelectContent>
            </Select>

            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as any)}
              className="hidden sm:flex border rounded-sm bg-muted/30"
            >
              <ToggleGroupItem value="grid" aria-label="Grade">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Lista">
                <ListIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Dynamic Category Chips if available */}
        {availableCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              Categorias:
            </span>
            <Button
              variant={!category ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.delete('category')
                setSearchParams(next)
              }}
              className="rounded-full text-xs h-7 font-bold shrink-0"
            >
              Todas
            </Button>
            {availableCategories.map((cat) => {
              const isSelected = category?.toLowerCase() === cat.toLowerCase()
              return (
                <Button
                  key={cat}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    if (isSelected) {
                      next.delete('category')
                    } else {
                      next.set('category', cat)
                    }
                    setSearchParams(next)
                  }}
                  className="rounded-full text-xs h-7 font-bold shrink-0"
                >
                  {cat}
                </Button>
              )
            })}
          </div>
        )}

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-sm border border-dashed border-border flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou busque por outro termo.
            </p>
            <Button variant="outline" className="mt-6 rounded-sm font-bold" asChild>
              <a href="/">Limpar Busca</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
