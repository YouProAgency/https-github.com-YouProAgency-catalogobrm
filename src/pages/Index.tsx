import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, SlidersHorizontal, Loader2, Search } from 'lucide-react'

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
  const [searchParams] = useSearchParams()
  const { products, loading } = useProducts()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')

  const query = searchParams.get('q')?.toLowerCase() || ''
  const category = searchParams.get('category')
  const subcategory = searchParams.get('sub')
  const featuredOnly = searchParams.get('featured') === 'true'

  const filteredProducts = useMemo(() => {
    let result = products

    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(query)),
      )
    }
    if (category) result = result.filter((p) => p.category === category)
    if (subcategory) result = result.filter((p) => p.subcategory === subcategory)
    if (featuredOnly) result = result.filter((p) => p.featured)

    return result.sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name)
      if (sortBy === 'za') return b.name.localeCompare(a.name)
      return 0
    })
  }, [products, query, category, subcategory, featuredOnly, sortBy])

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

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-muted/30">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais Recentes</SelectItem>
                <SelectItem value="az">Nome (A - Z)</SelectItem>
                <SelectItem value="za">Nome (Z - A)</SelectItem>
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
