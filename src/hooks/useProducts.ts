import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { products as mockProducts } from '@/data/products'
import { Product } from '@/types'

// Helper to normalize Supabase row to App Product
function mapDbProductToAppProduct(p: any): Product {
  return {
    id: p.id?.toString() || '',
    sku: p.sku || '',
    name: p.name || '',
    shortDescription: p.short_description || p.shortDescription || '',
    longDescription: p.long_description || p.longDescription || '',
    images: Array.isArray(p.images) ? p.images : typeof p.images === 'string' ? [p.images] : [],
    category: p.category || '',
    subcategory: p.subcategory || '',
    specs: p.specs || {},
    featured: p.featured || false,
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*')
        if (error) throw error
        if (data && data.length > 0) {
          setProducts(data.map(mapDbProductToAppProduct))
        } else {
          setProducts(mockProducts)
        }
      } catch (err) {
        console.error('Database connection failed, using mock data.', err)
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
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
        if (error) throw error
        if (data) {
          setProduct(mapDbProductToAppProduct(data))
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
