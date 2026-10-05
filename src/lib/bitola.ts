/**
 * Helper para extração e ordenação de bitolas a partir do nome/descrição dos produtos.
 *
 * Suporta formatos típicos do mercado brasileiro de mangueiras industriais:
 * - Frações simples: 1/8", 3/16", 1/4", 5/16", 3/8", 1/2", 5/8", 3/4", 7/8"
 * - Frações compostas: 1.1/4", 1.1/2", 2.1/2", 1 1/4", 1-1/2"
 * - Inteiros em polegadas: 1", 2", 3", 4", 5", 6"
 * - Métricas: 6mm, 8mm, 10mm, 12mm, etc.
 */

export interface BitolaInfo {
  /** Valor padronizado para exibição e filtro (ex: 1/2", 1.1/4", 2", 8mm) */
  normalized: string
  /** Valor numérico aproximado em polegadas para ordenação lógica */
  numericInches: number
  /** Tipo da medida */
  unit: 'inch' | 'mm'
}

/**
 * Converte uma fração ou string de medida em valor decimal em polegadas.
 */
function parseInchValue(wholeStr?: string, numStr?: string, denStr?: string): number {
  const whole = wholeStr ? parseFloat(wholeStr.replace(',', '.')) : 0
  const num = numStr ? parseFloat(numStr) : 0
  const den = denStr ? parseFloat(denStr) : 0
  const fraction = den > 0 ? num / den : 0
  return whole + fraction
}

/**
 * Extrai a bitola do nome do produto.
 * Retorna o valor padronizado (ex: `1/2"`, `1.1/4"`, `2"`, `8mm`) ou null se não identificada.
 */
export function extractBitola(productName?: string | null): string | null {
  if (!productName) return null

  const text = productName.trim()

  // 1. Frações compostas com aspas ou indicador explícito (ex: 1.1/4", 1.1/2", 2.1/2", 1 1/4")
  const compFractionWithUnit = text.match(
    /\b([1-9]\d*)[.,\s]+([1-9]\d*)\/([1-9]\d*)\s*(?:["”]|pol(?:egadas?)?)/i,
  )
  if (compFractionWithUnit) {
    const whole = compFractionWithUnit[1]
    const num = compFractionWithUnit[2]
    const den = compFractionWithUnit[3]
    return `${whole}.${num}/${den}"`
  }

  // 2. Frações simples com aspas ou indicador explícito (ex: 1/2", 3/4", 1/4", 3/8", 5/8", 3/16", 5/16", 7/8", 1/8")
  const simpleFractionWithUnit = text.match(/\b([1-9]\d*)\/([1-9]\d*)\s*(?:["”]|pol(?:egadas?)?)/i)
  if (simpleFractionWithUnit) {
    const num = parseInt(simpleFractionWithUnit[1], 10)
    const den = parseInt(simpleFractionWithUnit[2], 10)
    if ([2, 4, 8, 16, 32, 64].includes(den) && num < den) {
      return `${num}/${den}"`
    }
  }

  // 3. Inteiros com aspas ou indicador explícito de polegada (ex: 1", 2", 3", 4", 5", 6")
  // Cuidado: não capturar números de pressão (ex: 270 PSI) ou metros (ex: 4,0 METROS)
  const integerInchMatch = text.match(/\b([1-9]\d*)\s*(?:["”]|pol(?:egadas?)?)\b/i)
  if (integerInchMatch) {
    const val = parseInt(integerInchMatch[1], 10)
    if (val >= 1 && val <= 24) {
      return `${val}"`
    }
  }

  // 4. Medidas métricas em mm (ex: 6mm, 8mm, 10mm, 12mm, 19mm, 25mm, 32mm)
  const mmMatch = text.match(/\b([1-9]\d*(?:[.,]\d+)?)\s*mm\b/i)
  if (mmMatch) {
    const val = parseFloat(mmMatch[1].replace(',', '.'))
    if (val >= 2 && val <= 500) {
      return `${val.toString().replace('.', ',')}mm`
    }
  }

  // 5. Fallback para frações compostas sem aspas explícitas (ex: 1.1/4 ou 1.1/2) se den for usual
  const compFractionBare = text.match(/\b([1-9]\d*)[.,]([1-9]\d*)\/([1-9]\d*)\b/)
  if (compFractionBare) {
    const whole = compFractionBare[1]
    const num = compFractionBare[2]
    const den = parseInt(compFractionBare[3], 10)
    if ([2, 4, 8, 16].includes(den)) {
      return `${whole}.${num}/${den}"`
    }
  }

  // 6. Fallback para frações simples sem aspas se denominador for padrão industrial (ex: 1/2, 3/4)
  const simpleFractionBare = text.match(/\b([1-9]\d*)\/([1-9]\d*)\b/)
  if (simpleFractionBare) {
    const num = parseInt(simpleFractionBare[1], 10)
    const den = parseInt(simpleFractionBare[2], 10)
    if ([2, 4, 8, 16, 32].includes(den) && num < den) {
      return `${num}/${den}"`
    }
  }

  return null
}

/**
 * Converte uma bitola padronizada (ex: `1/2"`, `1.1/4"`, `2"`, `8mm`) para seu valor decimal
 * em polegadas para fins de ordenação estritamente matemática.
 */
export function getBitolaNumericValue(bitola: string): number {
  if (!bitola) return 0

  const clean = bitola.trim()

  // Métrica (mm) -> converte para polegadas (1 pol = 25.4 mm)
  if (clean.toLowerCase().endsWith('mm')) {
    const num = parseFloat(clean.toLowerCase().replace('mm', '').replace(',', '.'))
    return isNaN(num) ? 0 : num / 25.4
  }

  // Composta (ex: 1.1/4" ou 1,1/4")
  const compMatch = clean.match(/^([1-9]\d*)[.,]([1-9]\d*)\/([1-9]\d*)"?$/)
  if (compMatch) {
    return parseInchValue(compMatch[1], compMatch[2], compMatch[3])
  }

  // Simples (ex: 1/2", 3/4")
  const simpleMatch = clean.match(/^([1-9]\d*)\/([1-9]\d*)"?$/)
  if (simpleMatch) {
    return parseInchValue('0', simpleMatch[1], simpleMatch[2])
  }

  // Inteiro (ex: 1", 2")
  const intMatch = clean.match(/^([1-9]\d*)"?$/)
  if (intMatch) {
    return parseInt(intMatch[1], 10)
  }

  return 0
}

/**
 * Ordena uma lista de bitolas da menor para a maior numericamente.
 */
export function sortBitolas(bitolas: string[]): string[] {
  return [...bitolas].sort((a, b) => {
    const valA = getBitolaNumericValue(a)
    const valB = getBitolaNumericValue(b)
    if (valA !== valB) {
      return valA - valB
    }
    return a.localeCompare(b)
  })
}

/**
 * Extrai todas as bitolas únicas presentes em uma lista de produtos,
 * retornando-as ordenadas da menor para a maior com a contagem de produtos em cada uma.
 */
export function getAvailableBitolasWithCount(
  products: Array<{ name: string }>,
): Array<{ bitola: string; count: number; numericValue: number }> {
  const counts = new Map<string, number>()

  for (const product of products) {
    const b = extractBitola(product.name)
    if (b) {
      counts.set(b, (counts.get(b) || 0) + 1)
    }
  }

  const result: Array<{ bitola: string; count: number; numericValue: number }> = []
  counts.forEach((count, bitola) => {
    result.push({
      bitola,
      count,
      numericValue: getBitolaNumericValue(bitola),
    })
  })

  return result.sort((a, b) => {
    if (a.numericValue !== b.numericValue) {
      return a.numericValue - b.numericValue
    }
    return a.bitola.localeCompare(b.bitola)
  })
}
