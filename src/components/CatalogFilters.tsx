import React from 'react'
import { Search, X, SlidersHorizontal, RotateCcw, Ruler, Building2, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface BitolaOption {
  bitola: string
  count: number
}

export interface BrandOption {
  brand: string
  count: number
}

export interface CategoryOption {
  category: string
  count: number
}

interface CatalogFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedBitola: string
  onBitolaChange: (value: string) => void
  availableBitolas: BitolaOption[]
  selectedBrand: string
  onBrandChange: (value: string) => void
  availableBrands: BrandOption[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
  availableCategories: CategoryOption[]
  totalResults: number
  totalCatalog: number
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function CatalogFilters({
  searchQuery,
  onSearchChange,
  selectedBitola,
  onBitolaChange,
  availableBitolas,
  selectedBrand,
  onBrandChange,
  availableBrands,
  selectedCategory,
  onCategoryChange,
  availableCategories,
  totalResults,
  totalCatalog,
  onClearFilters,
  hasActiveFilters,
}: CatalogFiltersProps) {
  const [mobileExpanded, setMobileExpanded] = React.useState(false)

  return (
    <div className="w-full bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Top Banner / Brand Accent Header */}
      <div className="bg-gradient-to-r from-secondary via-secondary to-slate-900 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-white border-b border-secondary/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-foreground font-black">
            <SlidersHorizontal className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-wide uppercase flex items-center gap-2">
              <span>Filtros do Catálogo</span>
            </h3>
            <p className="text-xs text-slate-300">
              Encontre mangueiras industriais por bitola, marca, descrição ou código
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-white/10 text-white border-white/20 font-bold px-2.5 py-1 text-xs"
          >
            {totalResults === totalCatalog
              ? `${totalCatalog} produtos disponíveis`
              : `${totalResults} de ${totalCatalog} produtos`}
          </Badge>

          {/* Mobile toggle button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMobileExpanded((prev) => !prev)}
            className="md:hidden text-white hover:bg-white/10 h-8 px-2.5 text-xs font-bold gap-1 border border-white/20"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {mobileExpanded ? 'Ocultar' : 'Filtrar'}
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="hidden md:flex bg-primary/20 text-white border-primary/40 hover:bg-primary hover:text-white h-8 text-xs font-bold gap-1.5 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Main Filter Controls */}
      <div
        className={cn('p-4 sm:p-5 space-y-4 md:space-y-4', !mobileExpanded && 'hidden md:block')}
      >
        {/* Row 1: Instant Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por descrição, modelo, código ou tipo de mangueira (ex: R1, 1/2, Gas, Balflex)..."
            className="pl-10 pr-10 h-11 bg-slate-50 border-slate-300 focus:bg-white text-sm font-medium rounded-sm shadow-none focus-visible:ring-primary focus-visible:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Row 2: Select Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Bitola Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5 text-primary" />
              Bitola (Diâmetro)
            </label>
            <Select value={selectedBitola} onValueChange={onBitolaChange}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-300 h-10 rounded-sm text-sm font-medium focus:ring-primary">
                <SelectValue placeholder="Todas as Bitolas" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">
                  <span className="font-semibold">Todas as Bitolas</span>
                </SelectItem>
                {availableBitotasOptions(availableBitolas)}
              </SelectContent>
            </Select>
          </div>

          {/* Fabricante / Marca Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Marca / Fabricante
            </label>
            <Select value={selectedBrand} onValueChange={onBrandChange}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-300 h-10 rounded-sm text-sm font-medium focus:ring-primary">
                <SelectValue placeholder="Todas as Marcas" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">
                  <span className="font-semibold">Todas as Marcas</span>
                </SelectItem>
                {availableBrands.map((b) => (
                  <SelectItem key={b.brand} value={b.brand}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{b.brand}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                        {b.count}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
              Categoria
            </label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-300 h-10 rounded-sm text-sm font-medium focus:ring-primary">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">
                  <span className="font-semibold">Todas as Categorias</span>
                </SelectItem>
                {availableCategories.map((c) => (
                  <SelectItem key={c.category} value={c.category}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{c.category}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.count}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3: Quick Bitola Chips (most common bitolas for 1-click access) */}
        {availableBitolas.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
              Bitolas Rápidas:
            </span>
            <button
              type="button"
              onClick={() => onBitolaChange('all')}
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-sm border transition-all',
                selectedBitola === 'all' || !selectedBitola
                  ? 'bg-secondary text-white border-secondary shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary hover:text-primary',
              )}
            >
              Todas
            </button>
            {availableBitolas.map((item) => {
              const isSelected = selectedBitola === item.bitola
              return (
                <button
                  key={item.bitola}
                  type="button"
                  onClick={() => onBitolaChange(isSelected ? 'all' : item.bitola)}
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-sm border transition-all flex items-center gap-1',
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary',
                  )}
                >
                  <span>{item.bitola}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1 py-0.2 rounded font-bold',
                      isSelected ? 'bg-white/20 text-white' : 'text-slate-400',
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Active Filters Badges Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filtros ativos:</span>

            {searchQuery && (
              <Badge
                variant="secondary"
                className="bg-slate-100 text-secondary hover:bg-slate-200 font-medium text-xs gap-1.5 pl-2.5 pr-1.5 py-1"
              >
                <span>Busca: "{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="hover:text-destructive p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedBitola && selectedBitola !== 'all' && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border border-primary/20 font-bold text-xs gap-1.5 pl-2.5 pr-1.5 py-1"
              >
                <span>Bitola: {selectedBitola}</span>
                <button
                  type="button"
                  onClick={() => onBitolaChange('all')}
                  className="hover:text-destructive p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedBrand && selectedBrand !== 'all' && (
              <Badge
                variant="secondary"
                className="bg-secondary/10 text-secondary border border-secondary/20 font-bold text-xs gap-1.5 pl-2.5 pr-1.5 py-1"
              >
                <span>Marca: {selectedBrand}</span>
                <button
                  type="button"
                  onClick={() => onBrandChange('all')}
                  className="hover:text-destructive p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedCategory && selectedCategory !== 'all' && (
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs gap-1.5 pl-2.5 pr-1.5 py-1"
              >
                <span>Categoria: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => onCategoryChange('all')}
                  className="hover:text-destructive p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-primary font-bold hover:underline p-0 h-auto ml-1"
            >
              Limpar tudo
            </Button>
          </div>
        )}

        {/* Mobile Clear Button */}
        {hasActiveFilters && (
          <div className="pt-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar Todos os Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function availableBitotasOptions(availableBitolas: BitolaOption[]) {
  return availableBitolas.map((b) => (
    <SelectItem key={b.bitola} value={b.bitola}>
      <div className="flex items-center justify-between w-full gap-4">
        <span className="font-bold">{b.bitola}</span>
        <span className="text-[11px] font-semibold text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
          {b.count}
        </span>
      </div>
    </SelectItem>
  ))
}
