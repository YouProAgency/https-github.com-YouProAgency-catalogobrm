import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Share2,
  ShoppingCart,
  Info,
  TableProperties,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

import { useProduct, useProducts } from '@/hooks/useProducts'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/ProductCard'
import { useToast } from '@/hooks/use-toast'
import { formatCurrencyBRL, isValidDisplayUnit } from '@/lib/utils'
import { getProductImage, getProductImages } from '@/lib/productImage'
import { applyProductSeo, applyNotFoundSeo, resetDefaultSeo } from '@/lib/seo'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const { product, loading, error, refetch } = useProduct(id)
  const { products: allProducts } = useProducts()

  const [mainImage, setMainImage] = useState('')

  useEffect(() => {
    if (loading) return

    if (product) {
      setMainImage(getProductImage(product))
      applyProductSeo(product)
      window.scrollTo(0, 0)
    } else {
      applyNotFoundSeo('Produto não encontrado — Catálogo BR Mangueiras')
    }

    return () => {
      resetDefaultSeo()
    }
  }, [product, loading])
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Carregando detalhes do produto...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center container mx-auto px-4 max-w-md">
        <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-secondary mb-2">Erro ao carregar produto</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => refetch()}
            className="rounded-sm font-bold bg-primary hover:bg-primary/90 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="rounded-sm font-bold">
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-20 text-center container mx-auto px-4">
        <h2 className="text-2xl font-bold text-secondary">Produto não encontrado no catálogo</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          O produto solicitado pode ter sido descontinuado ou não está disponível para visualização
          pública.
        </p>
        <Button onClick={() => navigate('/')} className="mt-6 rounded-sm font-bold">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({ title: 'Link copiado!', description: 'O link do produto foi copiado com sucesso.' })
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-10 pb-28 md:pb-12">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="-ml-4 text-muted-foreground font-bold hover:bg-muted"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 bg-white p-6 md:p-10 rounded-sm shadow-sm border border-border">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-sm border border-border overflow-hidden bg-white flex items-center justify-center p-6">
            <img
              src={mainImage || getProductImage(product)}
              alt={product.name}
              className="max-w-full max-h-full object-contain drop-shadow-sm"
            />
          </div>
          {(() => {
            const galleryImages = getProductImages(product)
            if (galleryImages.length <= 1) return null
            return (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 shrink-0 rounded-sm border-2 overflow-hidden flex items-center justify-center p-2 bg-white transition-all ${
                      mainImage === img
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Product Information */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-sm">
              {product.category}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 rounded-full border-border"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-secondary leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm text-secondary font-mono bg-muted px-2.5 py-1 rounded-sm font-bold border border-border">
              SKU: {product.sku}
            </span>
            {(product.brand || '').trim() && (
              <span className="inline-flex items-center text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 shadow-xs">
                Marca: {(product.brand || '').trim()}
              </span>
            )}
            {isValidDisplayUnit(product.unit, product.name) && (
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-sm border border-border">
                Unidade: {product.unit}
              </span>
            )}
          </div>

          {/* Pricing Box if available */}
          <div className="mb-6 p-4 rounded-sm bg-muted/20 border border-border">
            {product.price && product.price > 0 ? (
              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-secondary font-mono">
                  {formatCurrencyBRL(product.price)}
                  {isValidDisplayUnit(product.unit, product.name) ? (
                    <span className="text-sm font-sans font-normal text-muted-foreground ml-1.5">
                      / {product.unit}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-secondary flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Preço: Consulte nossa equipe para cotação.
              </div>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-base text-secondary/80 leading-relaxed mb-8">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-auto bg-muted/30 p-6 rounded-sm border border-border flex flex-col gap-5">
            <p className="text-sm text-secondary font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Adicione ao orçamento para receber cotação
              formal com condições comerciais e prazos.
            </p>
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white rounded-sm shadow-md font-bold transition-transform hover:-translate-y-0.5"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Incluir no Orçamento
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="specs" className="w-full">
        <TabsList className="w-full md:w-auto h-12 bg-muted/50 rounded-sm">
          <TabsTrigger
            value="specs"
            className="text-base font-bold rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <TableProperties className="mr-2 h-4 w-4" /> Especificações Técnicas
          </TabsTrigger>
          <TabsTrigger
            value="desc"
            className="text-base font-bold rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Info className="mr-2 h-4 w-4" /> Descrição Completa
          </TabsTrigger>
        </TabsList>
        <div className="bg-white p-6 md:p-8 rounded-sm border border-border mt-2 shadow-sm">
          <TabsContent value="specs" className="mt-0">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              <div className="border border-border rounded-sm overflow-hidden">
                <Table>
                  <TableBody>
                    {Object.entries(product.specs).map(([key, value], idx) => (
                      <TableRow key={key} className={idx % 2 === 0 ? 'bg-muted/20' : 'bg-white'}>
                        <TableCell className="font-bold text-secondary w-1/3 py-4 border-r border-border">
                          {key}
                        </TableCell>
                        <TableCell className="text-secondary/80 py-4 font-medium">
                          {value as string}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Especificações técnicas não cadastradas para este produto.
              </p>
            )}
          </TabsContent>
          <TabsContent value="desc" className="mt-0 prose prose-slate max-w-none text-secondary/80">
            <p className="leading-relaxed text-lg">{product.longDescription}</p>
          </TabsContent>
        </div>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-10">
          <h3 className="text-2xl font-extrabold text-secondary mb-8 uppercase tracking-tight flex items-center">
            <span className="bg-primary w-2 h-6 mr-3 block"></span>
            Produtos Relacionados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button
          size="lg"
          className="w-full text-base h-12 shadow-md bg-primary hover:bg-primary/90 text-white rounded-sm font-bold"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Incluir no Orçamento
        </Button>
      </div>
    </div>
  )
}
