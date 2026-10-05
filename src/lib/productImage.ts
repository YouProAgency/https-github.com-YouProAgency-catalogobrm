import balflexForzaDueImg from '@/assets/balflex-forzadue-dacbb.jpg'
import balflexForzaUnoImg from '@/assets/balflex-forzauno-fc6a1.png'

export const DEFAULT_PRODUCT_PLACEHOLDER =
  'https://img.usecurling.com/p/800/800?q=hydraulic%20hose&color=black'
export const BALFLEX_FORZA_DUE_IMAGE = balflexForzaDueImg
export const BALFLEX_FORZA_UNO_IMAGE = balflexForzaUnoImg

export interface ProductImageSubject {
  name?: string | null
  description?: string | null
  shortDescription?: string | null
  longDescription?: string | null
  brand?: string | null
  images?: string[] | null
  image?: string | null
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Uno.
 * Regra: nome ou descrição contém "FORZA UNO" (case-insensitive e com limite de palavra).
 * Não deve casar com "FORZA DUE".
 */
export function isBalflexForzaUno(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  const text = [
    product.name || '',
    product.description || '',
    product.shortDescription || '',
    product.longDescription || '',
  ].join(' ')

  return /\bforza\s+uno\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Due.
 * Regra: nome ou descrição contém "FORZA DUE" (case-insensitive e com limite de palavra).
 * Não deve casar com "FORZA UNO".
 */
export function isBalflexForzaDue(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  const text = [
    product.name || '',
    product.description || '',
    product.shortDescription || '',
    product.longDescription || '',
  ].join(' ')

  return /\bforza\s+due\b/i.test(text)
}

/**
 * Retorna a imagem mais apropriada para exibição do produto:
 * 1. Imagem própria do produto (se já cadastrada no PocketBase ou na lista de images)
 * 2. Se for da linha Balflex Forza Uno, retorna a imagem oficial anexada (BALFLEX_FORZA_UNO_IMAGE)
 * 3. Se for da linha Balflex Forza Due, retorna a imagem oficial anexada (BALFLEX_FORZA_DUE_IMAGE)
 * 4. Fallback: placeholder genérico de produto
 */
export function getProductImage(
  product: ProductImageSubject | null | undefined,
  fallbackUrl: string = DEFAULT_PRODUCT_PLACEHOLDER,
): string {
  if (!product) return fallbackUrl

  // Se tiver imagem própria preenchida (e não for string vazia ou placeholder genérico)
  const candidate =
    (product.images && product.images.length > 0 && product.images[0]) || product.image || ''

  if (candidate && !candidate.includes('placeholder')) {
    return candidate
  }

  // Avaliação não ambígua: Forza Uno tem prioridade/separação clara de Forza Due
  if (isBalflexForzaUno(product)) {
    return BALFLEX_FORZA_UNO_IMAGE
  }

  // Se for Forza Due, retorna o asset oficial
  if (isBalflexForzaDue(product)) {
    return BALFLEX_FORZA_DUE_IMAGE
  }

  // Se o candidato for uma imagem válida (inclusive placeholder customizado se fornecido)
  if (candidate) {
    return candidate
  }

  return fallbackUrl
}

/**
 * Retorna a lista completa de imagens para a galeria de detalhes:
 * - Se tiver imagens próprias não-placeholder, retorna elas.
 * - Se for Forza Uno, retorna [BALFLEX_FORZA_UNO_IMAGE].
 * - Se for Forza Due, retorna [BALFLEX_FORZA_DUE_IMAGE].
 * - Caso contrário, retorna [fallbackUrl].
 */
export function getProductImages(
  product: ProductImageSubject | null | undefined,
  fallbackUrl: string = DEFAULT_PRODUCT_PLACEHOLDER,
): string[] {
  if (!product) return [fallbackUrl]

  const validImages = (product.images || []).filter(
    (img) => Boolean(img) && !img.includes('placeholder'),
  )

  if (validImages.length > 0) {
    return validImages
  }

  if (product.image && !product.image.includes('placeholder')) {
    return [product.image]
  }

  if (isBalflexForzaUno(product)) {
    return [BALFLEX_FORZA_UNO_IMAGE]
  }

  if (isBalflexForzaDue(product)) {
    return [BALFLEX_FORZA_DUE_IMAGE]
  }

  return [fallbackUrl]
}
