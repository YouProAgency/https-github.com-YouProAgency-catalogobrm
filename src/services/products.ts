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

/**
 * Verifica se um produto ou linha de dados é da marca "Eletrodiesel"
 * (mangueiras personalizáveis vendidas exclusivamente em loja física que não devem ir para o catálogo público).
 * A checagem é insensível a maiúsculas/minúsculas com trim.
 */
export function isEletrodiesel(item: { brand?: string | null }): boolean {
  return (item.brand || '').trim().toLowerCase() === 'eletrodiesel'
}

/**
 * Verifica se um produto ou linha de dados é classificado como "conforme amostra"
 * (item personalizado vendido somente na loja física que não deve ir para o catálogo público).
 * A checagem é insensível a maiúsculas/minúsculas.
 */
export function isConformeAmostra(item: {
  name?: string | null
  description?: string | null
  unit?: string | null
}): boolean {
  const target = 'conforme amostra'
  const nameStr = (item.name || '').toLowerCase()
  const descStr = (item.description || '').toLowerCase()
  const unitStr = (item.unit || '').toLowerCase()

  return nameStr.includes(target) || descStr.includes(target) || unitStr.includes(target)
}

/**
 * Checagem abrangente se o produto deve ser excluído do catálogo público:
 * - Produtos "conforme amostra"
 * - Mangueiras da marca "Eletrodiesel"
 */
export function isExcludedProduct(item: {
  name?: string | null
  description?: string | null
  unit?: string | null
  brand?: string | null
}): boolean {
  return isConformeAmostra(item) || isEletrodiesel(item)
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
    // Filtro estrito: remove qualquer produto com 'conforme amostra' ou da marca 'Eletrodiesel'
    return records.filter((record) => !isExcludedProduct(record)).map(mapPocketBaseToProduct)
  } catch (error) {
    console.error('Erro ao buscar produtos do PocketBase:', error)
    return []
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const record = await pb.collection('products').getOne<DbProductRecord>(id)
    // Se o produto for "conforme amostra" ou marca "Eletrodiesel", bloqueia o acesso na página de detalhes
    if (isExcludedProduct(record)) {
      return null
    }
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

export interface ImportProgressStats {
  imported: number
  updated: number
  failed: number
  retrying?: boolean
  retryCount?: number
  currentStatusText?: string
}

export interface IgnoredRowDetail {
  rowNumber: number
  sku?: string
  name?: string
  reason: string
}

export interface ImportResult {
  totalRows: number
  importedCount: number
  updatedCount: number
  skippedCount: number
  failedCount: number
  errors: string[]
  retriedBatchesCount?: number
  ignoredDetails?: IgnoredRowDetail[]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRateLimitError(err: any): boolean {
  if (!err) return false
  const status = err?.status || err?.statusCode || err?.response?.status
  if (status === 429) return true

  const msg = String(err?.data?.message || err?.message || err?.error || '').toLowerCase()
  return msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('429')
}

function extractRetryAfterMs(err: any, fallbackMs: number): number {
  try {
    const headers = err?.response?.headers || err?.headers
    if (headers) {
      const retryAfter =
        typeof headers.get === 'function'
          ? headers.get('Retry-After')
          : headers['retry-after'] || headers['Retry-After']

      if (retryAfter) {
        const seconds = parseFloat(retryAfter)
        if (!isNaN(seconds) && seconds > 0) {
          return Math.ceil(seconds * 1000)
        }
      }
    }
  } catch (_) {
    // Header indisponível ou inacessível no navegador por CORS
  }
  return fallbackMs
}

export async function upsertProductBatch(
  products: ParsedProductRow[],
  onProgress?: (processed: number, total: number, currentStats: ImportProgressStats) => void,
): Promise<ImportResult> {
  const result: ImportResult = {
    totalRows: products.length,
    importedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    errors: [],
    retriedBatchesCount: 0,
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

  // Lotes de 4 itens a cada 1.150ms:
  // ~3.5 requisições por segundo, bem dentro da taxa limite do PocketBase (~20 requisições a cada 5 segundos)
  const BATCH_SIZE = 4
  const BATCH_DELAY_MS = 1150
  const MAX_BATCH_RETRIES = 5

  let totalRetriedBatches = 0

  // Defensivamente filtra itens "conforme amostra" ou marca "Eletrodiesel" que possam ter sido passados
  const sanitizedProducts = products.filter((row) => {
    if (isExcludedProduct({ name: row.name, unit: row.unit, brand: row.brand })) {
      result.skippedCount++
      return false
    }
    return true
  })

  for (let i = 0; i < sanitizedProducts.length; i += BATCH_SIZE) {
    const chunk = sanitizedProducts.slice(i, i + BATCH_SIZE)
    let batchAttempt = 0
    let batchSuccess = false

    while (!batchSuccess && batchAttempt <= MAX_BATCH_RETRIES) {
      let rateLimitHitInBatch: any = null

      const batchResults = await Promise.all(
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
              return { type: 'updated' as const, sku: cleanSku, id: existingId }
            } else {
              const created = await pb.collection('products').create(payload)
              existingBySku.set(cleanSku, created.id)
              return { type: 'imported' as const, sku: cleanSku, id: created.id }
            }
          } catch (err: any) {
            return { type: 'error' as const, sku: cleanSku, error: err }
          }
        }),
      )

      // Verifica se algum item do lote sofreu rate limit (HTTP 429)
      for (const res of batchResults) {
        if (res.type === 'error' && isRateLimitError(res.error)) {
          rateLimitHitInBatch = res.error
          break
        }
      }

      if (rateLimitHitInBatch) {
        batchAttempt++
        totalRetriedBatches++
        result.retriedBatchesCount = totalRetriedBatches

        if (batchAttempt <= MAX_BATCH_RETRIES) {
          // Exponential backoff: 2s, 4s, 8s, 16s...
          const baseBackoff = Math.pow(2, batchAttempt) * 1000
          const delayTime = extractRetryAfterMs(rateLimitHitInBatch, baseBackoff)

          const waitSeconds = Math.ceil(delayTime / 1000)
          console.warn(
            `[PocketBase 429] Rate limit atingido no lote ${Math.floor(i / BATCH_SIZE) + 1}. Tentativa ${batchAttempt}/${MAX_BATCH_RETRIES}. Aguardando ${waitSeconds}s antes de reprocessar...`,
          )

          if (onProgress) {
            onProgress(i, sanitizedProducts.length, {
              imported: result.importedCount,
              updated: result.updatedCount,
              failed: result.failedCount,
              retrying: true,
              retryCount: batchAttempt,
              currentStatusText: `Limite temporário de requisições detectado. Aguardando ${waitSeconds}s e repetindo lote (tentativa ${batchAttempt}/${MAX_BATCH_RETRIES})...`,
            })
          }

          await sleep(delayTime)
          continue // Repete o mesmo chunk sem avançar o índice
        }
      }

      // Se não deu 429 ou esgotou retentativas, processa os resultados do lote
      for (const res of batchResults) {
        if (res.type === 'imported') {
          result.importedCount++
        } else if (res.type === 'updated') {
          result.updatedCount++
        } else if (res.type === 'error') {
          result.failedCount++
          const msg = res.error?.data?.message || res.error?.message || 'Falha desconhecida'
          result.errors.push(`SKU ${res.sku}: ${msg}`)
        }
      }

      batchSuccess = true
    }

    const processed = Math.min(i + BATCH_SIZE, sanitizedProducts.length)
    if (onProgress) {
      onProgress(processed, sanitizedProducts.length, {
        imported: result.importedCount,
        updated: result.updatedCount,
        failed: result.failedCount,
        retrying: false,
        retryCount: 0,
        currentStatusText: `Processado lote ${Math.min(processed, sanitizedProducts.length)} de ${sanitizedProducts.length}...`,
      })
    }

    // Pausa controlada entre lotes sucessivos para respeitar o rate limit do PocketBase
    if (i + BATCH_SIZE < sanitizedProducts.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  return result
}
