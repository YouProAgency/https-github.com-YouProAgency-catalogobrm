import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, ZoomIn, ShoppingCart, Info, TableProperties } from 'lucide-react'

import { products } from '@/data/products'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/ProductCard'
import { useToast } from '@/hooks/use-toast'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const product = products.find((p) => p.id === id)
  const [mainImage, setMainImage] = useState(product?.images[0] || '')

  useEffect(() => {
    if (product) {
      setMainImage(product.images[0])
      window.scrollTo(0, 0)
    }
  }, [product])

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Produto não encontrado</h2>
        <Button onClick={() => navigate('/')} className="mt-6">
          Voltar ao Catálogo
        </Button>
      </div>
    )
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: 'Link copiado!',
      description: 'O link do produto foi copiado para a área de transferência.',
    })
  }

  return (
    <div className="space-y-8 pb-20 md:pb-10">
      {/* Breadcrumb / Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="text-slate-500 hover:text-slate-900 -ml-4"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 md:p-8 rounded-2xl shadow-subtle border border-slate-100">
        {/* Gallery */}
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 cursor-zoom-in group">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-5 w-5" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl border-none bg-transparent shadow-none">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-auto rounded-lg object-contain bg-white p-4"
              />
            </DialogContent>
          </Dialog>

          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    mainImage === img
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover mix-blend-multiply bg-slate-50"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="h-8 w-8 rounded-full"
                title="Compartilhar"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2">
            {product.name}
          </h1>
          <p className="text-sm text-slate-500 font-mono mb-6">SKU: {product.sku}</p>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed">{product.shortDescription}</p>

          <Separator className="my-6" />

          {/* Desktop Actions */}
          <div className="mt-auto hidden md:flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Button
              size="lg"
              className="flex-1 text-lg h-14 shadow-md hover:scale-[1.02] transition-transform"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao Orçamento
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Data */}
      <Tabs defaultValue="desc" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-12 bg-white border border-slate-200">
          <TabsTrigger value="desc" className="text-base data-[state=active]:bg-slate-100">
            <Info className="mr-2 h-4 w-4" /> Descrição
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-base data-[state=active]:bg-slate-100">
            <TableProperties className="mr-2 h-4 w-4" /> Especificações
          </TabsTrigger>
        </TabsList>
        <div className="bg-white p-6 md:p-8 rounded-xl rounded-tl-none border border-slate-200 mt-2 shadow-sm">
          <TabsContent value="desc" className="mt-0">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Sobre o Produto</h3>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <p>{product.longDescription}</p>
            </div>
          </TabsContent>
          <TabsContent value="specs" className="mt-0">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Informações Técnicas</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableBody>
                  {Object.entries(product.specs).map(([key, value], idx) => (
                    <TableRow key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                      <TableCell className="font-medium text-slate-700 w-1/3 py-4">{key}</TableCell>
                      <TableCell className="text-slate-600 py-4">{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Produtos Relacionados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40">
        <Button
          size="lg"
          className="w-full text-base h-14 shadow-lg"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao Orçamento
        </Button>
      </div>
    </div>
  )
}
