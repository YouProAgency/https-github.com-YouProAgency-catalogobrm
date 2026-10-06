import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  Loader2,
  Search,
  RotateCcw,
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
import {
  CatalogFilters,
  BitolaOption,
  BrandOption,
  CategoryOption,
} from '@/components/CatalogFilters'
import { extractBitola, getAvailableBitolasWithCount } from '@/lib/bitola'
import { isExcludedProduct } from '@/services/products'
import { resetDefaultSeo } from '@/lib/seo'

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, loading } = useProducts()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')

  // URL search params sync
  const queryParam = searchParams.get('q') || ''
  const categoryParam = searchParams.get('category') || 'all'
  const brandParam = searchParams.get('brand') || 'all'
  const bitolaParam = searchParams.get('bitola') || 'all'
  const subcategory = searchParams.get('sub')
  const featuredOnly = searchParams.get('featured') === 'true'

  // Local state for search input to ensure instant typing responsiveness
  const [searchInput, setSearchInput] = useState(queryParam)

  // Keep local search input synchronized if URL changes externally (e.g. via header search bar)
  useEffect(() => {
    setSearchInput(queryParam)
  }, [queryParam])

  // Strict public catalog hygiene: ensure no "conforme amostra" or "Eletrodiesel"
  const cleanProducts = useMemo(() => {
    return products.filter((p) => !isExcludedProduct(p))
  }, [products])

  // Extract available bitolas from products that are not excluded
  const availableBitolas: BitolaOption[] = useMemo(() => {
    return getAvailableBitolasWithCount(cleanProducts).map((b) => ({
      bitola: b.bitola,
      count: b.count,
    }))
  }, [cleanProducts])

  // Extract available brands with count
  const availableBrands: BrandOption[] = useMemo(() => {
    const counts = new Map<string, number>()
    cleanProducts.forEach((p) => {
      const b = (p.brand || '').trim()
      if (b) {
        counts.set(b, (counts.get(b) || 0) + 1)
      }
    })
    return Array.from(counts.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand))
  }, [cleanProducts])

  // Extract available categories with count
  const availableCategories: CategoryOption[] = useMemo(() => {
    const counts = new Map<string, number>()
    cleanProducts.forEach((p) => {
      const c = (p.category || '').trim()
      if (c) {
        counts.set(c, (counts.get(c) || 0) + 1)
      }
    })
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category))
  }, [cleanProducts])

  // Update search param helper
  const updateFilterParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    updateFilterParam('q', val.trim())
  }

  const handleBitolaChange = (val: string) => {
    updateFilterParam('bitola', val)
  }

  const handleBrandChange = (val: string) => {
    updateFilterParam('brand', val)
  }

  const handleCategoryChange = (val: string) => {
    updateFilterParam('category', val)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    const next = new URLSearchParams()
    if (featuredOnly) {
      next.set('featured', 'true')
    }
    setSearchParams(next, { replace: true })
  }

  const hasActiveFilters = Boolean(
    queryParam.trim() ||
    (bitolaParam && bitolaParam !== 'all') ||
    (brandParam && brandParam !== 'all') ||
    (categoryParam && categoryParam !== 'all') ||
    subcategory,
  )

  // In-memory combined filtering with AND logic
  const filteredProducts = useMemo(() => {
    let result = cleanProducts

    // 1. Text Search: name, sku, brand, description
    const normalizedQuery = searchInput.trim().toLowerCase()
    if (normalizedQuery) {
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(normalizedQuery)
        const skuMatch = p.sku.toLowerCase().includes(normalizedQuery)
        const brandMatch = (p.brand || '').toLowerCase().includes(normalizedQuery)
        const shortDescMatch = (p.shortDescription || '').toLowerCase().includes(normalizedQuery)
        const longDescMatch = (p.longDescription || '').toLowerCase().includes(normalizedQuery)
        return nameMatch || skuMatch || brandMatch || shortDescMatch || longDescMatch
      })
    }

    // 2. Bitola Filter: matches extracted bitola or substring in name
    if (bitolaParam && bitolaParam !== 'all') {
      result = result.filter((p) => {
        const extracted = extractBitola(p.name)
        if (extracted === bitolaParam) return true
        // Fallback: name contains bitola string directly
        return p.name.includes(bitolaParam)
      })
    }

    // 3. Brand Filter
    if (brandParam && brandParam !== 'all') {
      result = result.filter(
        (p) => (p.brand || '').trim().toLowerCase() === brandParam.trim().toLowerCase(),
      )
    }

    // 4. Category Filter
    if (categoryParam && categoryParam !== 'all') {
      result = result.filter(
        (p) => (p.category || '').trim().toLowerCase() === categoryParam.trim().toLowerCase(),
      )
    }

    // 5. Subcategory
    if (subcategory) {
      result = result.filter((p) => p.subcategory === subcategory)
    }

    // 6. Featured
    if (featuredOnly) {
      result = result.filter((p) => p.featured)
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name)
      if (sortBy === 'za') return b.name.localeCompare(a.name)
      if (sortBy === 'price_asc') {
        const pa = a.price && a.price > 0 ? a.price : Infinity
        const pb = b.price && b.price > 0 ? b.price : Infinity
        return pa - pb
      }
      if (sortBy === 'price_desc') {
        const pa = a.price && a.price > 0 ? a.price : -Infinity
        const pb = b.price && b.price > 0 ? b.price : -Infinity
        return pb - pa
      }
      return 0
    })
  }, [
    cleanProducts,
    searchInput,
    bitolaParam,
    brandParam,
    categoryParam,
    subcategory,
    featuredOnly,
    sortBy,
  ])

  useEffect(() => {
    resetDefaultSeo()
  }, [])

  const showHero =
    !queryParam &&
    (!categoryParam || categoryParam === 'all') &&
    !featuredOnly &&
    !bitolaParam &&
    !brandParam

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

      <div
        id="produtos"
        className="container mx-auto px-4 md:px-6 space-y-6 sm:space-y-8 scroll-mt-24"
      >
        {/* Info Section / About */}
        {showHero && (
          <div id="sobre" className="grid md:grid-cols-3 gap-6 mb-8 scroll-mt-24">
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

        {/* BRM Unified Filter Panel */}
        <CatalogFilters
          searchQuery={searchInput}
          onSearchChange={handleSearchChange}
          selectedBitola={bitolaParam}
          onBitolaChange={handleBitolaChange}
          availableBitolas={availableBitolas}
          selectedBrand={brandParam}
          onBrandChange={handleBrandChange}
          availableBrands={availableBrands}
          selectedCategory={categoryParam}
          onCategoryChange={handleCategoryChange}
          availableCategories={availableCategories}
          totalResults={filteredProducts.length}
          totalCatalog={cleanProducts.length}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* View Mode & Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-secondary tracking-tight">
              {queryParam
                ? `Resultados para "${queryParam}"`
                : bitolaParam && bitolaParam !== 'all'
                  ? `Mangueiras com bitola ${bitolaParam}`
                  : brandParam && brandParam !== 'all'
                    ? `Mangueiras ${brandParam}`
                    : categoryParam && categoryParam !== 'all'
                      ? `${categoryParam} ${subcategory ? `> ${subcategory}` : ''}`
                      : featuredOnly
                        ? 'Produtos em Destaque'
                        : 'Catálogo de Produtos'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
              {filteredProducts.length === 0
                ? 'Nenhum item atende aos filtros atuais'
                : `Exibindo ${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'itens'}`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[170px] bg-muted/30 h-10 text-xs sm:text-sm">
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

            {/* Grid vs List toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as any)}
              className="border rounded-sm bg-muted/30 shrink-0"
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

        {/* Grid or List of Products */}
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
          <div className="py-16 sm:py-24 text-center bg-white rounded-sm border border-dashed border-border flex flex-col items-center px-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">Nenhuma mangueira encontrada</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Não encontramos nenhum produto correspondente aos filtros combinados (
              {queryParam ? `busca: "${queryParam}", ` : ''}
              {bitolaParam && bitolaParam !== 'all' ? `bitola: ${bitolaParam}, ` : ''}
              {brandParam && brandParam !== 'all' ? `marca: ${brandParam}, ` : ''}
              {categoryParam && categoryParam !== 'all' ? `categoria: ${categoryParam}` : ''}
              ).
            </p>
            <Button
              variant="default"
              className="mt-6 rounded-sm font-bold bg-primary hover:bg-primary/90 gap-2"
              onClick={handleClearFilters}
            >
              <RotateCcw className="h-4 w-4" />
              Limpar Todos os Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
