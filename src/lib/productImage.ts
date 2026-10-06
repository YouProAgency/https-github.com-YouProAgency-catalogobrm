import balflexForzaDueImg from '@/assets/forzadue-2-2ed92.jpeg'
import balflexForzaUnoImg from '@/assets/forzauno-1-4bb26.png'
import balflexTexmasterImg from '@/assets/balflex-texmaster-504b4.ts'
import balflexR6MultipurposeImg from '@/assets/multipurpose-2-f77a3.jpeg'
import koraxKobra2Img from '@/assets/korax-kobra2.ts'

export const DEFAULT_PRODUCT_PLACEHOLDER =
  'https://img.usecurling.com/p/800/800?q=hydraulic%20hose&color=black'
export const BALFLEX_FORZA_DUE_IMAGE = balflexForzaDueImg
export const BALFLEX_FORZA_UNO_IMAGE = balflexForzaUnoImg
export const BALFLEX_TEXMASTER_IMAGE = balflexTexmasterImg
export const BALFLEX_R6_MULTIPURPOSE_IMAGE = balflexR6MultipurposeImg
export const KORAX_KOBRA2_IMAGE = koraxKobra2Img

export interface ProductImageSubject {
  name?: string | null
  description?: string | null
  shortDescription?: string | null
  longDescription?: string | null
  brand?: string | null
  images?: string[] | null
  image?: string | null
}

function getSubjectCombinedText(product: ProductImageSubject | null | undefined): string {
  if (!product) return ''
  return [
    product.name || '',
    product.description || '',
    product.shortDescription || '',
    product.longDescription || '',
  ].join(' ')
}

/**
 * Checa se o produto pertence à marca Balflex (pelo campo brand ou pelo texto do nome/descrição).
 */
export function isBalflexBrand(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  if (product.brand && /\bbalflex\b/i.test(product.brand)) {
    return true
  }
  const text = getSubjectCombinedText(product)
  return /\bbalflex\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Uno.
 * Regra: nome ou descrição contém "FORZA UNO" (case-insensitive e com limite de palavra).
 * Não deve casar com "FORZA DUE".
 */
export function isBalflexForzaUno(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\bforza\s+uno\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Due.
 * Regra: nome ou descrição contém "FORZA DUE" (case-insensitive e com limite de palavra).
 * Não deve casar com "FORZA UNO".
 */
export function isBalflexForzaDue(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\bforza\s+due\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira da linha Balflex Texmaster.
 * Regra: nome ou descrição contém "TEXMASTER" (aceitando variações como TEXMASTER, TEXMASTER 1, TEXMASTER 2, TEXMASTER 3).
 * Não deve casar com produtos da linha R6 Multipurpose.
 */
export function isBalflexTexmaster(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\btexmaster(?:\s*\d+)?\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira da linha Balflex R6 Multipurpose.
 * Regra: o produto precisa ser da marca Balflex E conter "R6" e/ou "MULTIPURPOSE" com limites de palavra.
 * Não deve capturar indevidamente produtos de outras linhas (ex.: Texmaster R6 é tratado como Texmaster).
 */
export function isBalflexR6Multipurpose(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  // Se for explicitamente Texmaster, a linha Texmaster tem sua própria foto dedicada
  if (isBalflexTexmaster(product)) {
    return false
  }

  // Precisa ser da marca Balflex
  if (!isBalflexBrand(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)
  const hasR6 = /\br6\b/i.test(text)
  const hasMultipurpose = /\bmultipurpose\b/i.test(text)

  return hasR6 || hasMultipurpose
}

/**
 * Checa se o produto é uma mangueira da linha Kobra 2 (modelo Korax).
 * Regra: nome ou descrição contém o termo "Kobra 2" (case-insensitive com limites de palavra tipo `\bkobra\s*2\b`),
 * independente da marca no campo brand (a foto é da mangueira Kobra 2 High Performance / Korax).
 */
export function isKoraxKobra2(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\bkobra\s*2\b/i.test(text)
}

/**
 * Retorna a imagem mais apropriada para exibição do produto:
 * 1. Imagem própria do produto (se já cadastrada no PocketBase ou na lista de images)
 * 2. Se for da linha Balflex Forza Uno, retorna a imagem oficial anexada (BALFLEX_FORZA_UNO_IMAGE)
 * 3. Se for da linha Balflex Forza Due, retorna a imagem oficial anexada (BALFLEX_FORZA_DUE_IMAGE)
 * 4. Se for da linha Balflex Texmaster, retorna a imagem oficial anexada (BALFLEX_TEXMASTER_IMAGE)
 * 5. Se for da linha Balflex R6 Multipurpose, retorna a imagem oficial anexada (BALFLEX_R6_MULTIPURPOSE_IMAGE)
 * 6. Se for da linha Kobra 2 (Korax), retorna a imagem oficial anexada (KORAX_KOBRA2_IMAGE)
 * 7. Fallback: placeholder genérico de produto
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

  // Avaliação não ambígua de linhas oficiais
  if (isBalflexForzaUno(product)) {
    return BALFLEX_FORZA_UNO_IMAGE
  }

  if (isBalflexForzaDue(product)) {
    return BALFLEX_FORZA_DUE_IMAGE
  }

  if (isBalflexTexmaster(product)) {
    return BALFLEX_TEXMASTER_IMAGE
  }

  if (isBalflexR6Multipurpose(product)) {
    return BALFLEX_R6_MULTIPURPOSE_IMAGE
  }

  if (isKoraxKobra2(product)) {
    return KORAX_KOBRA2_IMAGE
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
 * - Se for Texmaster, retorna [BALFLEX_TEXMASTER_IMAGE].
 * - Se for R6 Multipurpose, retorna [BALFLEX_R6_MULTIPURPOSE_IMAGE].
 * - Se for Kobra 2 (Korax), retorna [KORAX_KOBRA2_IMAGE].
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

  if (isBalflexTexmaster(product)) {
    return [BALFLEX_TEXMASTER_IMAGE]
  }

  if (isBalflexR6Multipurpose(product)) {
    return [BALFLEX_R6_MULTIPURPOSE_IMAGE]
  }

  if (isKoraxKobra2(product)) {
    return [KORAX_KOBRA2_IMAGE]
  }

  return [fallbackUrl]
}
