/**
 * Utilitários para normalização e resolução canônica de marcas/fabricantes de produtos.
 *
 * Garante que variações de caixa (ex: "Korax" vs "KORAX") e de acentuação (ex: "Ibira" vs "Ibirá")
 * sejam unificadas para sua forma canônica aprovada no catálogo BRM Mangueiras:
 * - "IBIRÁ" (maiúsculo, com acento preservado)
 * - "KORAX" (todo em maiúsculas)
 */

/**
 * Remove acentos/diacríticos de uma string e converte para minúsculas.
 * Usado para comparação insensível a acento e caixa.
 */
export function normalizeBrandKey(brand?: string | null): string {
  if (!brand) return ''
  return brand
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Mapeamento canônico explícito para marcas que possuem padrão oficial definido.
 * A chave é a forma normalizada (sem acento, minúscula, trim).
 */
export const CANONICAL_BRANDS: Readonly<Record<string, string>> = Object.freeze({
  ibira: 'IBIRÁ',
  korax: 'KORAX',
  balflex: 'BALFLEX',
  continental: 'CONTINENTAL',
  contuflex: 'CONTUFLEX',
  gates: 'GATES',
  'gtop gbr': 'GTOP GBR',
  hennings: 'HENNINGS',
  kanaflex: 'KANAFLEX',
  sunflex: 'SUNFLEX',
})

/**
 * Normaliza o valor de marca recebido de um produto ou planilha:
 * 1. Remove espaços em excesso (trim).
 * 2. Se a marca case (ignorando acento e caixa) com uma marca do catálogo canônico (ex.: "ibira" -> "IBIRÁ", "Korax" -> "KORAX"),
 *    retorna a forma canônica exata.
 * 3. Se for uma marca desconhecida, preserva o valor com trim.
 */
export function normalizeProductBrand(rawBrand?: string | null): string {
  if (!rawBrand) return ''
  const trimmed = rawBrand.trim()
  if (!trimmed) return ''

  const key = normalizeBrandKey(trimmed)
  if (CANONICAL_BRANDS[key]) {
    return CANONICAL_BRANDS[key]
  }

  return trimmed
}
