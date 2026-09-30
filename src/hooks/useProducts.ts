import { useState, useEffect } from 'react'
import { products as mockProducts } from '@/data/products'
import { Product } from '@/types'
import { fetchAllProducts, fetchProductById } from '@/services/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const dbProducts = await fetchAllProducts()
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts)
        } else {
          setProducts(mockProducts)
        }
      } catch (err) {
        console.error('Erro ao conectar ao PocketBase, usando dados fallback.', err)
        setProducts(mockProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return { products, loading }
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchProduct() {
      try {
        const dbProduct = await fetchProductById(id)
        if (dbProduct) {
          setProduct(dbProduct)
        } else {
          setProduct(mockProducts.find((p) => p.id === id) || null)
        }
      } catch (err) {
        setProduct(mockProducts.find((p) => p.id === id) || null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  return { product, loading }
}
