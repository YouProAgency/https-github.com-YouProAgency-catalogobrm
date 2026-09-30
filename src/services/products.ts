import pb from '@/lib/pocketbase/client'
import { Product } from '@/types'

export interface DbProductRecord {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  brand?: string
  unit?: string
  price?: number
  price1?: number
  price2?: number
  price3?: number
  image?: string
  created?: string
  updated?: string
}

export function mapPocketBaseToProduct(record: DbProductRecord): Product {
  const imageUrl = record.image ? pb.files.getURL(record as any, record.image) : ''

  // Preço de venda público oficial: o campo price da coleção guarda o Preço Venda.
  // Caso não esteja setado diretamente no campo price, usa price1 como fallback.
  const salePrice = record.price ?? record.price1 ?? null

  return {
    id: record.id,
    sku: record.sku || '',
    name: record.name || '',
    shortDescription:
      record.description ||
      (record.brand
        ? `Marca: ${record.brand}${record.unit ? ` | Unidade: ${record.unit}` : ''}`
        : ''),
    longDescription: record.description || '',
    images: imageUrl ? [imageUrl] : [],
    category: record.category || 'Geral',
    subcategory: '',
    brand: record.brand || '',
    unit: record.unit || '',
    price: salePrice,
    price1: record.price1 ?? null,
    price2: record.price2 ?? null,
    price3: record.price3 ?? null,
    specs: {
      ...(record.brand ? { Marca: record.brand } : {}),
      ...(record.unit ? { Unidade: record.unit } : {}),
    },
    featured: false,
  }
}

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const records = await pb.collection('products').getFullList<DbProductRecord>({
      sort: '-created',
    })
    return records.map(mapPocketBaseToProduct)
  } catch (error) {
    console.error('Erro ao buscar produtos do PocketBase:', error)
    return []
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const record = await pb.collection('products').getOne<DbProductRecord>(id)
    return mapPocketBaseToProduct(record)
  } catch (error) {
    console.error(`Erro ao buscar produto ${id} do PocketBase:`, error)
    return null
  }
}

export interface ParsedProductRow {
  sku: string
  name: string
  unit: string
  category: string
  brand: string
  price: number | null // Preço Venda oficial destinado ao catálogo e consumidor final
  price1: number | null
  price2: number | null
  price3: number | null
  rawRowNumber: number
}

export interface ImportResult {
  totalRows: number
  importedCount: number
  updatedCount: number
  skippedCount: number
  failedCount: number
  errors: string[]
}

export async function upsertProductBatch(
  products: ParsedProductRow[],
  onProgress?: (
    processed: number,
    total: number,
    currentStats: { imported: number; updated: number; failed: number },
  ) => void,
): Promise<ImportResult> {
  const result: ImportResult = {
    totalRows: products.length,
    importedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    errors: [],
  }

  // Pre-fetch existing products by SKU in memory for fast lookup
  const existingBySku = new Map<string, string>() // sku -> id
  try {
    const existing = await pb.collection('products').getFullList<DbProductRecord>({
      fields: 'id,sku',
    })
    for (const item of existing) {
      if (item.sku) {
        existingBySku.set(item.sku.trim(), item.id)
      }
    }
  } catch (err) {
    console.warn('Não foi possível carregar SKUs existentes em lote, buscando sob demanda:', err)
  }

  const BATCH_SIZE = 10
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const chunk = products.slice(i, i + BATCH_SIZE)

    await Promise.all(
      chunk.map(async (row) => {
        const cleanSku = row.sku.trim()
        // Se price estiver definido explicitamente, usa-o. Caso contrário, usa price1 como fallback.
        const salePrice = row.price !== undefined ? row.price : (row.price1 ?? null)

        const payload: Record<string, any> = {
          sku: cleanSku,
          name: row.name.trim(),
          unit: row.unit.trim(),
          category: row.category.trim(),
          brand: row.brand.trim(),
          price: salePrice,
          price1: row.price1 ?? null,
          price2: row.price2 ?? null,
          price3: row.price3 ?? null,
        }

        try {
          const existingId = existingBySku.get(cleanSku)
          if (existingId) {
            await pb.collection('products').update(existingId, payload)
            result.updatedCount++
          } else {
            const created = await pb.collection('products').create(payload)
            existingBySku.set(cleanSku, created.id)
            result.importedCount++
          }
        } catch (err: any) {
          result.failedCount++
          const msg = err?.data?.message || err?.message || 'Falha desconhecida'
          result.errors.push(`SKU ${cleanSku}: ${msg}`)
        }
      }),
    )

    const processed = Math.min(i + BATCH_SIZE, products.length)
    if (onProgress) {
      onProgress(processed, products.length, {
        imported: result.importedCount,
        updated: result.updatedCount,
        failed: result.failedCount,
      })
    }
  }

  return result
}
