import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'
import { fetchAllProducts, fetchProductById } from '@/services/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dbProducts = await fetchAllProducts()
      setProducts(dbProducts || [])
    } catch (err: any) {
      console.error('Erro ao conectar ao PocketBase e carregar catálogo:', err)
      const errorMsg =
        err?.status === 429
          ? 'Muitas requisições no momento. Por favor, aguarde alguns segundos e tente novamente.'
          : 'Não foi possível carregar o catálogo. Verifique sua conexão e tente novamente.'
      setError(errorMsg)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return { products, loading, error, refetch: loadProducts }
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProduct = useCallback(async () => {
    if (!id) {
      setProduct(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const dbProduct = await fetchProductById(id)
      setProduct(dbProduct)
    } catch (err: any) {
      console.error(`Erro ao carregar produto ${id}:`, err)
      const errorMsg =
        err?.status === 429
          ? 'Muitas requisições no momento. Por favor, aguarde alguns segundos e tente novamente.'
          : 'Não foi possível carregar as informações deste produto.'
      setError(errorMsg)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  return { product, loading, error, refetch: loadProduct }
}
