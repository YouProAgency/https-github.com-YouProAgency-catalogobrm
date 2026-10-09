import { normalizeProductBrand, normalizeBrandKey, CANONICAL_BRANDS } from './brand'

export function runBrandNormalizationSelfCheck() {
  // Testes para Ibirá / Ibira -> "IBIRÁ"
  const ibiraCases = ['Ibirá', 'Ibira', 'ibira', 'IBIRA', 'IBIRÁ', '  Ibirá  ', '  ibira  ']
  for (const item of ibiraCases) {
    const res = normalizeProductBrand(item)
    if (res !== 'IBIRÁ') {
      throw new Error(`normalizeProductBrand("${item}") retornou "${res}", esperado "IBIRÁ"`)
    }
  }

  // Testes para Korax / KORAX -> "KORAX"
  const koraxCases = ['Korax', 'KORAX', 'korax', '  Korax  ', '  KORAX  ']
  for (const item of koraxCases) {
    const res = normalizeProductBrand(item)
    if (res !== 'KORAX') {
      throw new Error(`normalizeProductBrand("${item}") retornou "${res}", esperado "KORAX"`)
    }
  }

  // Testes para outras marcas canônicas
  if (normalizeProductBrand('balflex') !== 'BALFLEX') throw new Error('Falha balflex')
  if (normalizeProductBrand('Balflex') !== 'BALFLEX') throw new Error('Falha Balflex')
  if (normalizeProductBrand('kanaflex') !== 'KANAFLEX') throw new Error('Falha kanaflex')
  if (normalizeProductBrand('Contuflex') !== 'CONTUFLEX') throw new Error('Falha Contuflex')

  // Testes para valores vazios ou nulos
  if (normalizeProductBrand('') !== '') throw new Error('Falha string vazia')
  if (normalizeProductBrand('   ') !== '') throw new Error('Falha espaços')
  if (normalizeProductBrand(null) !== '') throw new Error('Falha null')
  if (normalizeProductBrand(undefined) !== '') throw new Error('Falha undefined')

  // Testes para marcas desconhecidas (preserva com trim)
  if (normalizeProductBrand('  Nova Marca Teste  ') !== 'Nova Marca Teste') {
    throw new Error('Falha marca desconhecida')
  }

  // normalizeBrandKey
  if (normalizeBrandKey('Ibirá') !== 'ibira') throw new Error('Falha normalizeBrandKey Ibirá')
  if (normalizeBrandKey('KORAX') !== 'korax') throw new Error('Falha normalizeBrandKey KORAX')

  return true
}

runBrandNormalizationSelfCheck()
