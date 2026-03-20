import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight } from 'lucide-react'

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
    <Card className="overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 border-border bg-white rounded-sm hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted/20 p-4 flex items-center justify-center">
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
            src={product.images[0] || 'https://img.usecurling.com/p/400/400?q=placeholder'}
            alt={product.name}
            className="object-contain max-h-full w-full group-hover:scale-105 transition-transform duration-500 ease-in-out mix-blend-multiply drop-shadow-sm"
            loading="lazy"
          />
        </Link>
      </div>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] text-primary font-bold mb-1 uppercase tracking-widest">
          {product.sku}
        </div>
        <Link to={`/produto/${product.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-extrabold text-lg leading-tight text-secondary mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-auto leading-relaxed">
          {product.shortDescription}
        </p>
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
