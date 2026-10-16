/**
 * Utilitários para normalização e resolução canônica de categorias de produtos no catálogo BRM Mangueiras.
 *
 * Regras aprovadas:
 * 1. A categoria crua "MANGUEIRA HIDRAULICA" do banco de dados deve ser exibida e filtrada como "Hidráulicas".
 * 2. Qualquer produto cujo NOME contenha a designação de série hidráulica R com dígitos (token isolado \bR\d+\b,
 *    case-insensitive: ex.: R1, R2, R3, R4, R5, R6, R7, R8, R9, R12, R13, R14, R15, R16, R17, R19...)
 *    também é classificado como "Hidráulicas", MESMO que o campo category esteja vazio ou com outro valor.
 * 3. O filtro "Hidráulicas" retorna a união dos produtos:
 *    (category crua é "MANGUEIRA HIDRAULICA") OU (nome contém \bR\d+\b).
 * 4. Demais categorias seguem com seu texto original (não renomeia outras categorias nesta fase).
 */

export const CANONICAL_HYDRAULIC_CATEGORY = 'Hidráulicas'

/**
 * Regex para detectar tokens isolados de série R com dígitos no nome do produto.
 * Ex.: R1, R2, R6, R7, R12, R13, R14, R15, R16, R17...
 * Evita falsos positivos como:
 * - "FORZA", "KORAX", "TROPIC", "AR", "BAR", "PARABRISA"
 * - Bitolas tipo "1/4", "3/8"
 * - Códigos tipo "PT-250", "9K"
 */
const R_SERIES_REGEX = /\bR\d+\b/i

/**
 * Normaliza uma string de categoria crua para chave de comparação (sem acento, minúscula, trim).
 */
export function normalizeCategoryKey(rawCategory?: string | null): string {
  if (!rawCategory) return ''
  return rawCategory
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Verifica se um nome de produto contém uma designação de série hidráulica R com dígitos.
 */
export function hasRSeriesDesignation(name?: string | null): boolean {
  if (!name) return false
  return R_SERIES_REGEX.test(name)
}

/**
 * Verifica se uma categoria crua corresponde a mangueira hidráulica no banco de dados.
 */
export function isRawHydraulicCategory(rawCategory?: string | null): boolean {
  const key = normalizeCategoryKey(rawCategory)
  return key === 'mangueira hidraulica' || key === 'hidraulica' || key === 'hidraulicas'
}

/**
 * Determina se um item (produto ou linha de dados) pertence à categoria "Hidráulicas".
 * União:
 * a) Categoria crua "MANGUEIRA HIDRAULICA" (ou variações diretas)
 * b) Nome do produto contém token \bR\d+\b isolado (R1, R2, R6, R7, R12, R14, etc.)
 */
export function isHydraulicProduct(item: {
  name?: string | null
  category?: string | null
}): boolean {
  if (isRawHydraulicCategory(item.category)) {
    return true
  }
  return hasRSeriesDesignation(item.name)
}

/**
 * Retorna a categoria canônica de exibição para um produto.
 * Se o produto pertencer à série hidráulica (pela category crua ou pelo nome com \bR\d+\b),
 * retorna "Hidráulicas". Caso contrário, retorna a categoria original preservando o valor.
 */
export function getProductDisplayCategory(item: {
  name?: string | null
  category?: string | null
}): string {
  if (isHydraulicProduct(item)) {
    return CANONICAL_HYDRAULIC_CATEGORY
  }
  return (item.category || '').trim()
}

/**
 * Verifica se um produto atende ao filtro de categoria selecionado pelo usuário.
 * Se o filtro for CANONICAL_HYDRAULIC_CATEGORY ("Hidráulicas") ou a forma crua "MANGUEIRA HIDRAULICA",
 * verifica se o item é produto hidráulico (união de category crua + \bR\d+\b no nome).
 * Para outras categorias, compara por igualdade ignorando maiúsculas/minúsculas e acentos.
 */
export function matchesCategoryFilter(
  item: { name?: string | null; category?: string | null },
  filterCategory?: string | null,
): boolean {
  if (!filterCategory || filterCategory === 'all') {
    return true
  }

  const normalizedFilter = normalizeCategoryKey(filterCategory)
  if (
    normalizedFilter === normalizeCategoryKey(CANONICAL_HYDRAULIC_CATEGORY) ||
    normalizedFilter === 'mangueira hidraulica' ||
    normalizedFilter === 'hidraulica' ||
    normalizedFilter === 'hidraulicas'
  ) {
    return isHydraulicProduct(item)
  }

  const itemCategoryKey = normalizeCategoryKey(item.category)
  return itemCategoryKey === normalizedFilter
}
