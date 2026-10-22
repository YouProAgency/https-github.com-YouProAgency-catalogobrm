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
export const CANONICAL_AIR_AND_WATER_SUBCATEGORY = 'Ar e Água'
export const CANONICAL_SUCTION_DISCHARGE_SUBCATEGORY = 'Sucção e Descarga'

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
 * Checa se o nome/categoria corresponde a mangueira de jardim.
 */
export function isGardenProduct(item: { name?: string | null; category?: string | null }): boolean {
  const nameNorm = normalizeCategoryKey(item?.name)
  const catNorm = normalizeCategoryKey(item?.category)
  return /\bjardim\b/.test(nameNorm) || /\bjardim\b/.test(catNorm)
}

/**
 * Checa se o nome/categoria corresponde à subcategoria "Ar e Água".
 */
export function isAirAndWaterProduct(item: {
  name?: string | null
  category?: string | null
}): boolean {
  const nameNorm = normalizeCategoryKey(item?.name)
  const catNorm = normalizeCategoryKey(item?.category)
  return /\bar\s+e\s+agua\b/.test(nameNorm) || /\bar\s+e\s+agua\b/.test(catNorm)
}

/**
 * Determina se um item pertence à subcategoria canônica "Sucção e Descarga".
 *
 * Inclusões:
 * 1. "sucção" / "succao" / "sução" / "suc cao" (ex: mangueiras de sucção laranja, azul, cinza, atóxica...)
 * 2. "descarga" (mangueiras de descarga industrial/máquina)
 * 3. "entrada" (ex: MANGUEIRA ENTRADA 3/8" cinza máquina lavadora)
 * 4. "saída" / "saida" (ex: SAÍDA DRENAGEM, SAÍDA CORRUGADA, SAÍDA TANQUINHO)
 * 5. "vácuo ar" / "vacuo ar" (ex: MANGUEIRA VACUO AR IVCL, KEL-SC, KV, SVE, IVPU...)
 * 6. "aspiração" / "aspiracao"
 *
 * Exclusões explícitas com precedência estrita:
 * 1. Produtos hidráulicos (isHydraulicProduct: R1..R19, 4SP, 4SH, MANGUEIRA HIDRAULICA, Texmaster R6, etc.) NUNCA entram.
 * 2. Produtos "Ar e Água" (isAirAndWaterProduct: AR E AGUA) NUNCA entram.
 * 3. Mangueiras de jardim (isGardenProduct: "jardim") NUNCA entram.
 */
export function isSuctionAndDischargeProduct(item: {
  name?: string | null
  category?: string | null
}): boolean {
  if (!item) return false

  // 1. Exclusão estrita: Hidráulicas
  if (isHydraulicProduct(item)) {
    return false
  }

  // 2. Exclusão estrita: Ar e Água
  if (isAirAndWaterProduct(item)) {
    return false
  }

  // 3. Exclusão estrita: Jardim
  if (isGardenProduct(item)) {
    return false
  }

  const nameNorm = normalizeCategoryKey(item.name)
  const catNorm = normalizeCategoryKey(item.category)
  const text = `${catNorm} ${nameNorm}`

  // Termos positivos:
  // a) Sucção
  const hasSuccao = /\bsu[cç][cç]?[aãá]o\b/.test(text) || /\bsuc\s+cao\b/.test(text)
  // b) Descarga
  const hasDescarga = /\bdescarga\b/.test(text)
  // c) Entrada (ex: MANGUEIRA ENTRADA)
  const hasEntrada = /\bentrada\b/.test(text)
  // d) Saída / Saida (ex: SAIDA DRENAGEM, SAIDA CORRUGADA, SAIDA TANQUINHO)
  const hasSaida = /\bsa[ií]da\b/.test(text)
  // e) Vácuo ar / Vacuo ar
  const hasVacuoAr = /\bv[aá]cuo\s+ar\b/.test(text)
  // f) Aspiração / Aspiracao
  const hasAspiracao = /\baspira[cç][aãá]o\b/.test(text) || /\baspira\b/.test(text)

  return hasSuccao || hasDescarga || hasEntrada || hasSaida || hasVacuoAr || hasAspiracao
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

  // Categoria pai "Mangueiras Industriais" / "Mangueira Industrial" / "Mangueiras"
  // Agrupa todas as mangueiras industriais e hidráulicas do catálogo
  if (
    normalizedFilter === 'mangueiras industriais' ||
    normalizedFilter === 'mangueira industrial' ||
    normalizedFilter === 'mangueiras'
  ) {
    return true
  }

  const itemCategoryKey = normalizeCategoryKey(item.category)
  return itemCategoryKey === normalizedFilter
}

/**
 * Determina se um item pertence à subcategoria unificada "Ar e Água"
 * (agrupa produtos de Ar e Água + produtos de Jardim, com exclusão estrita de Hidráulicas).
 */
export function isAirAndWaterUnifiedProduct(item: {
  name?: string | null
  category?: string | null
}): boolean {
  if (!item) return false

  // 1. Precedência estrita: Hidráulicas nunca entram
  if (isHydraulicProduct(item)) {
    return false
  }

  // 2. União de produtos "Ar e Água" ou produtos "Jardim"
  return isAirAndWaterProduct(item) || isGardenProduct(item)
}

/**
 * Checa se um produto atende ao filtro de subcategoria (usado no menu lateral, dropdown da home e URL).
 * Quando a subcategoria é "Hidráulicas", retorna todos os produtos hidráulicos
 * (categoria crua "MANGUEIRA HIDRAULICA" OU nome com série R / modelo hidráulico).
 * Quando a subcategoria é "Ar e Água" (ou legacy "Jardim"), retorna o conjunto unificado
 * (produtos de Ar e Água + produtos de Jardim).
 * Quando a subcategoria é "Sucção e Descarga", retorna produtos com "SUCÇÃO" ou "VÁCUO AR" no nome.
 */
export function matchesSubcategoryFilter(
  item: { name?: string | null; category?: string | null; subcategory?: string | null },
  subcategory?: string | null,
): boolean {
  if (!subcategory || subcategory === 'all') {
    return true
  }

  const normSub = normalizeCategoryKey(subcategory)
  if (normSub === 'hidraulicas' || normSub === 'hidraulica') {
    return isHydraulicProduct(item)
  }

  // "Ar e Água" agrupa unificadamente Ar e Água + Jardim.
  // Também redireciona/trata links legados com "jardim" de forma coerente para o mesmo conjunto.
  if (normSub === 'ar e agua' || normSub === 'jardim') {
    return isAirAndWaterUnifiedProduct(item)
  }

  if (
    normSub === 'succao e descarga' ||
    normSub === 'succao' ||
    normSub === 'descarga' ||
    normSub === 'succao / descarga'
  ) {
    return isSuctionAndDischargeProduct(item)
  }

  // Fallback para campo subcategory preenchido ou busca por nome
  if (item.subcategory && normalizeCategoryKey(item.subcategory) === normSub) {
    return true
  }

  const itemNameNorm = normalizeCategoryKey(item.name)
  return itemNameNorm.includes(normSub)
}

/**
 * Combina o filtro hierárquico de categoria (pai) e subcategoria (filho) do menu lateral ou URL.
 * Se a subcategoria for "Hidráulicas", lista exatamente a união canônica de produtos hidráulicos.
 * Se a categoria-pai for "Mangueiras Industriais", não afunila excluindo os produtos hidráulicos.
 */
export function matchesHierarchyFilter(
  item: { name?: string | null; category?: string | null; subcategory?: string | null },
  categoryParam?: string | null,
  subcategoryParam?: string | null,
): boolean {
  if (subcategoryParam) {
    const normSub = normalizeCategoryKey(subcategoryParam)
    // Se a subcategoria for Hidráulicas, ela comanda o filtro hidráulico canônico integralmente
    if (normSub === 'hidraulicas' || normSub === 'hidraulica') {
      return isHydraulicProduct(item)
    }
    // Se a subcategoria for "Ar e Água" (ou legada "Jardim"), comanda o conjunto unificado
    if (normSub === 'ar e agua' || normSub === 'jardim') {
      return isAirAndWaterUnifiedProduct(item)
    }
    // Para as demais subcategorias, verifica a subcategoria
    if (!matchesSubcategoryFilter(item, subcategoryParam)) {
      return false
    }
    // Se a categoria pai não for um contêiner abrangente como "Mangueiras Industriais" ou "Mangueiras",
    // aplica a checagem da categoria pai também
    const normCat = normalizeCategoryKey(categoryParam)
    if (
      normCat &&
      normCat !== 'all' &&
      normCat !== 'mangueiras industriais' &&
      normCat !== 'mangueira industrial' &&
      normCat !== 'mangueiras'
    ) {
      return matchesCategoryFilter(item, categoryParam)
    }
    return true
  }

  // Se não houver subcategoria selecionada
  return matchesCategoryFilter(item, categoryParam)
}
