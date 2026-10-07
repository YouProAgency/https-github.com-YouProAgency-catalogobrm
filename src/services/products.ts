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
 * Valida e normaliza o valor da unidade de produto:
 * - Unidades legítimas são curtas (ex.: MT, PC, UN, KG, L, CJ, CX, M).
 * - Se a unidade informada for longa (> 6 caracteres), ou idêntica ao nome/descrição,
 *   ou um texto que duplique o produto, ela é descartada.
 * - Caso a unidade original seja inválida e o produto for uma mangueira vendida a metro,
 *   deriva defensivamente para 'MT'. Se for adaptador/conexão/outros, retorna string vazia.
 */
export function sanitizeProductUnit(
  unitVal?: string | null,
  productName?: string | null,
  description?: string | null,
): string {
  const cleanUnit = (unitVal || '').trim()
  const cleanName = (productName || '').trim()
  const cleanDesc = (description || '').trim()

  // Se a unidade for idêntica ao nome ou à descrição (ignorando case), ou tiver mais de 6 caracteres
  const isInvalidUnit =
    !cleanUnit ||
    cleanUnit.length > 6 ||
    (cleanName.length > 0 && cleanUnit.toLowerCase() === cleanName.toLowerCase()) ||
    (cleanDesc.length > 0 && cleanUnit.toLowerCase() === cleanDesc.toLowerCase()) ||
    (cleanName.toLowerCase().startsWith(cleanUnit.toLowerCase()) && cleanUnit.length > 6)

  if (isInvalidUnit) {
    // Se for mangueira (grande maioria do catálogo da BR Mangueiras / ADV_Produtos_Mangueiras),
    // a unidade de venda padrão é MT (metro).
    if (cleanName.toLowerCase().includes('mangueira')) {
      return 'MT'
    }
    // Conexões, adaptadores ou outros produtos sem unidade definida ficam vazios
    return ''
  }

  // Se a unidade for válida e curta, normaliza em maiúsculas se for texto comum (ex: mt -> MT, pc -> PC, un -> UN)
  return cleanUnit.toUpperCase()
}

/**
 * Lista de SKUs com exclusão permanente do catálogo BR Mangueiras.
 * O SKU 2713 ("mangueira 1 supersteam 270PSI W.P 2700PSI B.P Vermelha")
 * foi removido por solicitação de negócio e não deve reaparecer nem por reimportação.
 */
export const EXCLUDED_SKUS: ReadonlySet<string> = new Set(['2713'])

/**
 * Verifica se um SKU específico está na lista de exclusão permanente.
 */
export function isExcludedSku(sku?: string | null): boolean {
  if (!sku) return false
  return EXCLUDED_SKUS.has(sku.trim())
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
 * - SKUs bloqueados permanentemente (ex.: SKU 2713)
 * - Produtos "conforme amostra"
 * - Mangueiras da marca "Eletrodiesel"
 */
export function isExcludedProduct(item: {
  sku?: string | null
  name?: string | null
  description?: string | null
  unit?: string | null
  brand?: string | null
}): boolean {
  return isExcludedSku(item.sku) || isConformeAmostra(item) || isEletrodiesel(item)
}

export function mapPocketBaseToProduct(record: DbProductRecord): Product {
  const imageUrl = record.image ? pb.files.getURL(record as any, record.image) : ''

  // Preço de venda público oficial: o campo price da coleção guarda o Preço Venda.
  // Caso não esteja setado diretamente no campo price, usa price1 como fallback.
  const salePrice = record.price ?? record.price1 ?? null
  const cleanUnit = sanitizeProductUnit(record.unit, record.name, record.description)

  return {
    id: record.id,
    sku: record.sku || '',
    name: record.name || '',
    shortDescription:
      record.description ||
      (record.brand ? `Marca: ${record.brand}${cleanUnit ? ` | Unidade: ${cleanUnit}` : ''}` : ''),
    longDescription: record.description || '',
    images: imageUrl ? [imageUrl] : [],
    category: record.category || 'Geral',
    subcategory: '',
    brand: record.brand || '',
    unit: cleanUnit,
    price: salePrice,
    price1: record.price1 ?? null,
    price2: record.price2 ?? null,
    price3: record.price3 ?? null,
    specs: {
      ...(record.brand ? { Marca: record.brand } : {}),
      ...(cleanUnit ? { Unidade: cleanUnit } : {}),
    },
    featured: false,
  }
}

export async function fetchAllProducts(retries = 2, delayMs = 600): Promise<Product[]> {
  let attempt = 0
  let lastError: any = null

  while (attempt <= retries) {
    try {
      const records = await pb.collection('products').getFullList<DbProductRecord>({
        sort: '-created',
      })
      // Filtro estrito: remove qualquer produto com 'conforme amostra' ou da marca 'Eletrodiesel'
      return records.filter((record) => !isExcludedProduct(record)).map(mapPocketBaseToProduct)
    } catch (error) {
      lastError = error
      attempt++
      if (attempt <= retries) {
        const wait = delayMs * Math.pow(2, attempt - 1)
        console.warn(
          `[fetchAllProducts] Falha na tentativa ${attempt}/${retries + 1}. Tentando novamente em ${wait}ms...`,
          error,
        )
        await sleep(wait)
      }
    }
  }

  console.error('Erro ao buscar produtos do PocketBase após tentativas:', lastError)
  throw lastError || new Error('Não foi possível carregar os produtos do catálogo.')
}

export async function fetchProductById(
  id: string,
  retries = 2,
  delayMs = 500,
): Promise<Product | null> {
  let attempt = 0
  let lastError: any = null

  while (attempt <= retries) {
    try {
      const record = await pb.collection('products').getOne<DbProductRecord>(id)
      // Se o produto for "conforme amostra" ou marca "Eletrodiesel", bloqueia o acesso na página de detalhes
      if (isExcludedProduct(record)) {
        return null
      }
      return mapPocketBaseToProduct(record)
    } catch (error: any) {
      // Se for 404 (recurso não encontrado), não adianta retentar
      const status = error?.status || error?.statusCode || error?.response?.status
      if (status === 404) {
        return null
      }
      lastError = error
      attempt++
      if (attempt <= retries) {
        const wait = delayMs * Math.pow(2, attempt - 1)
        console.warn(
          `[fetchProductById] Falha na busca do produto ${id} (${attempt}/${retries + 1}). Retentando em ${wait}ms...`,
          error,
        )
        await sleep(wait)
      }
    }
  }

  console.error(`Erro ao buscar produto ${id} do PocketBase após tentativas:`, lastError)
  throw lastError || new Error(`Não foi possível carregar o produto ${id}.`)
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

  // Defensivamente filtra itens excluídos (SKU 2713, "conforme amostra" ou marca "Eletrodiesel") que possam ter sido passados
  const sanitizedProducts = products.filter((row) => {
    if (isExcludedProduct({ sku: row.sku, name: row.name, unit: row.unit, brand: row.brand })) {
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

          const normalizedUnit = sanitizeProductUnit(row.unit, row.name)

          // Caso específico: SKU 7970 possui descrição oficial customizada aprovada
          // ("MANGUEIRA R5 13/32\" BRAKEMASTER 2.100 PSI / 13,8 MPA")
          // Se a planilha contiver a descrição curta antiga ("MANGUEIRA R5 13/32\""),
          // preserva a descrição oficial detalhada para não sobrescrever silenciosamente.
          let resolvedName = row.name.trim()
          let resolvedDescription: string | undefined = undefined

          if (cleanSku === '7970') {
            const officialCustomDesc = 'MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA'
            if (
              !resolvedName ||
              resolvedName.toUpperCase() === 'MANGUEIRA R5 13/32"' ||
              resolvedName.toUpperCase() === officialCustomDesc.toUpperCase()
            ) {
              resolvedName = officialCustomDesc
              resolvedDescription = officialCustomDesc
            }
          }

          const payload: Record<string, any> = {
            sku: cleanSku,
            name: resolvedName,
            ...(resolvedDescription ? { description: resolvedDescription } : {}),
            unit: normalizedUnit,
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
