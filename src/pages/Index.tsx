import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, SlidersHorizontal } from 'lucide-react'

import { products } from '@/data/products'
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

export default function Index() {
  const [searchParams] = useSearchParams()
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
          p.shortDescription.toLowerCase().includes(query),
      )
    }

    if (category) {
      result = result.filter((p) => p.category === category)
    }

    if (subcategory) {
      result = result.filter((p) => p.subcategory === subcategory)
    }

    if (featuredOnly) {
      result = result.filter((p) => p.featured)
    }

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name)
      if (sortBy === 'za') return b.name.localeCompare(a.name)
      return 0 // default 'newest' (assuming array order is newest for mock)
    })
  }, [query, category, subcategory, featuredOnly, sortBy])

  const heroProducts = products.filter((p) => p.featured).slice(0, 3)

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      {!query && !category && !featuredOnly && (
        <section className="mb-8">
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {heroProducts.map((product) => (
                <CarouselItem key={`hero-${product.id}`}>
                  <Card className="border-0 bg-slate-900 text-white overflow-hidden rounded-xl">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 gap-6 p-8 md:p-12 items-center">
                        <div className="space-y-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-blue-300 text-xs font-semibold tracking-wider">
                            EM DESTAQUE
                          </span>
                          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                            {product.name}
                          </h2>
                          <p className="text-slate-300 max-w-md text-lg">
                            {product.shortDescription}
                          </p>
                          <Button
                            size="lg"
                            className="mt-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                            asChild
                          >
                            <a href={`/produto/${product.id}`}>Explorar Detalhes</a>
                          </Button>
                        </div>
                        <div className="aspect-video relative rounded-lg overflow-hidden flex items-center justify-center bg-white/5 backdrop-blur-sm p-6">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-contain max-h-full drop-shadow-2xl"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
            <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
          </Carousel>
        </section>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-subtle border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {query
              ? `Resultados para "${query}"`
              : category
                ? `${category} ${subcategory ? `> ${subcategory}` : ''}`
                : featuredOnly
                  ? 'Produtos em Destaque'
                  : 'Catálogo de Produtos'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Exibindo {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-50">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais Recentes</SelectItem>
                <SelectItem value="az">Nome (A - Z)</SelectItem>
                <SelectItem value="za">Nome (Z - A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as any)}
            className="hidden sm:flex bg-slate-50 p-1 rounded-md"
          >
            <ToggleGroupItem value="grid" aria-label="Visualização em Grade">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Visualização em Lista">
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
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Nenhum produto encontrado</h3>
          <p className="text-slate-500 max-w-sm mt-2">
            Não encontramos resultados para sua busca ou filtros atuais. Tente ajustar os termos ou
            navegue pelas categorias.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <a href="/">Limpar Filtros</a>
          </Button>
        </div>
      )}
    </div>
  )
}
