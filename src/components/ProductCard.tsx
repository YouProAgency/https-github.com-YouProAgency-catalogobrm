import { Link } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  return (
    <Card className="overflow-hidden flex flex-col group shadow-subtle hover:shadow-elevation transition-all duration-300 border-slate-200">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-amber-500 hover:bg-amber-600 border-none text-white shadow-sm">
            Destaque
          </Badge>
        )}
        <Link to={`/produto/${product.id}`} className="block h-full w-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-apple"
            loading="lazy"
          />
        </Link>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-muted-foreground mb-1 font-medium">{product.sku}</div>
        <Link to={`/produto/${product.id}`} className="hover:underline">
          <h3 className="font-semibold text-base leading-tight text-slate-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 line-clamp-2 mt-auto">{product.shortDescription}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="w-full bg-white hover:bg-slate-50 text-slate-700"
          asChild
        >
          <Link to={`/produto/${product.id}`}>
            <Eye className="mr-2 h-4 w-4" /> Detalhes
          </Link>
        </Button>
        <Button
          onClick={() => addToCart(product)}
          className="w-full shadow-sm hover:scale-[1.02] transition-transform"
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </CardFooter>
    </Card>
  )
}
