import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatCurrencyBRL, isValidDisplayUnit } from '@/lib/utils'
import { getProductImage } from '@/lib/productImage'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const displayImage = getProductImage(product)
  const hasValidUnit = isValidDisplayUnit(product.unit, product.name)
  const brandName = (product.brand || '').trim()

  return (
    <Card className="overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 border-border bg-white rounded-sm hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-white p-4 flex items-center justify-center border-b border-border/40">
        {product.featured && (
          <Badge className="absolute top-3 left-3 z-10 bg-primary hover:bg-primary text-white font-bold tracking-widest text-[10px] rounded-sm border-none shadow-sm px-2 py-1">
            DESTAQUE
          </Badge>
        )}
        <Link
          to={`/produto/${product.id}`}
          className="block h-full w-full flex items-center justify-center"
        >
          <img
            src={displayImage}
            alt={product.name}
            className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-500 ease-in-out drop-shadow-sm"
            loading="lazy"
          />
        </Link>
      </div>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2 min-h-[22px]">
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest font-mono">
            {product.sku}
          </span>
          {brandName && (
            <span
              title={`Marca: ${brandName}`}
              className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 shadow-xs max-w-[140px] truncate"
            >
              {brandName}
            </span>
          )}
        </div>
        <Link to={`/produto/${product.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-extrabold text-lg leading-tight text-secondary mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          {product.category && (
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-sm">
              {product.category}
            </span>
          )}
          {hasValidUnit && (
            <span className="text-[11px] font-mono text-muted-foreground">/ {product.unit}</span>
          )}
        </div>
        <div className="mt-auto pt-2">
          {product.price && product.price > 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-secondary font-mono">
                {formatCurrencyBRL(product.price)}
              </span>
              {hasValidUnit && (
                <span className="text-xs text-muted-foreground font-sans">/{product.unit}</span>
              )}
            </div>
          ) : (
            <div className="text-xs font-semibold text-muted-foreground italic flex items-center gap-1">
              <span>Consulte</span>
            </div>
          )}
        </div>
        {product.shortDescription && !brandName && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-5 pt-0 flex flex-col gap-2">
        <Button
          onClick={() => addToCart(product)}
          className="w-full shadow-sm bg-secondary hover:bg-secondary/90 text-white rounded-sm h-10 font-bold"
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar
        </Button>
        <Button
          variant="outline"
          className="w-full border-border text-secondary hover:bg-muted rounded-sm h-10 font-bold"
          asChild
        >
          <Link to={`/produto/${product.id}`}>
            Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
