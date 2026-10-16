import {
  CANONICAL_HYDRAULIC_CATEGORY,
  hasRSeriesDesignation,
  isHydraulicProduct,
  getProductDisplayCategory,
  matchesCategoryFilter,
  normalizeCategoryKey,
} from './category'

export function runCategoryNormalizationSelfCheck() {
  // 1. Cobrir casos R1, R2, R6, R7, R12, R13, R15, R17 no nome
  const rSeriesCases = [
    'MANGUEIRA R1 1" FORZA UNO TROPIC 135°C',
    'MANGUEIRA R2 1" FORZA DUE 215 BAR',
    'MANGUEIRA R6 1" MULTIPURPOSE TEXMASTER',
    'MANGUEIRA R7 1/4" NON CONDUTIVE LARANJA',
    'MANGUEIRA R12 1.1/2" BALMASTER',
    'MANGUEIRA R13 1.1/4" POWERSPIR BESTFLEX',
    'MANGUEIRA R15 1" POWERSPIR',
    'MANGUEIRA R17 1/2" BALPAC',
  ]

  for (const name of rSeriesCases) {
    if (!hasRSeriesDesignation(name)) {
      throw new Error(`hasRSeriesDesignation falhou para: "${name}"`)
    }
    // Mesmo com category vazia ou diferente de MANGUEIRA HIDRAULICA, deve ser Hidráulicas
    if (!isHydraulicProduct({ name, category: '' })) {
      throw new Error(`isHydraulicProduct falhou para: "${name}" com category vazia`)
    }
    if (!isHydraulicProduct({ name, category: 'OUTRA' })) {
      throw new Error(`isHydraulicProduct falhou para: "${name}" com category OUTRA`)
    }
    if (getProductDisplayCategory({ name, category: '' }) !== CANONICAL_HYDRAULIC_CATEGORY) {
      throw new Error(`getProductDisplayCategory falhou para: "${name}"`)
    }
    if (!matchesCategoryFilter({ name, category: '' }, CANONICAL_HYDRAULIC_CATEGORY)) {
      throw new Error(
        `matchesCategoryFilter falhou para: "${name}" com filtro "${CANONICAL_HYDRAULIC_CATEGORY}"`,
      )
    }
  }

  // 2. R14 TEFLON / TEFOLN entra
  const r14Cases = [
    'MANGUEIRA R14 5/16" TEFLON 1.520 PSI',
    'MANGUEIRA R14 TEFOLN 1/2"',
    'MANGUEIRA R14 INOX 3/8"',
  ]
  for (const name of r14Cases) {
    if (!hasRSeriesDesignation(name)) {
      throw new Error(`hasRSeriesDesignation falhou para R14: "${name}"`)
    }
    if (!isHydraulicProduct({ name, category: '' })) {
      throw new Error(`isHydraulicProduct falhou para R14: "${name}"`)
    }
  }

  // 3. Produto com category "MANGUEIRA HIDRAULICA" sem R no nome também entra (união)
  const nonRWithHydraulicCat = [
    { name: 'MANGUEIRA 4SP 1/2" BALMASTER BESTFLEX 415 BAR', category: 'MANGUEIRA HIDRAULICA' },
    { name: 'MANGUEIRA 4SH 3/4" BALMASTER', category: 'MANGUEIRA HIDRAULICA' },
    { name: 'MANGUEIRA 1" 210°C SUPERSTEAM 19 BAR', category: 'MANGUEIRA HIDRAULICA' },
    { name: 'MANGUEIRA 1" FUEL PUMP', category: 'MANGUEIRA HIDRAULICA' },
  ]
  for (const item of nonRWithHydraulicCat) {
    if (!isHydraulicProduct(item)) {
      throw new Error(
        `isHydraulicProduct falhou para item com category "MANGUEIRA HIDRAULICA": "${item.name}"`,
      )
    }
    if (getProductDisplayCategory(item) !== CANONICAL_HYDRAULIC_CATEGORY) {
      throw new Error(`getProductDisplayCategory falhou para item: "${item.name}"`)
    }
    if (!matchesCategoryFilter(item, CANONICAL_HYDRAULIC_CATEGORY)) {
      throw new Error(`matchesCategoryFilter falhou para item: "${item.name}"`)
    }
  }

  // 4. Produto de outra linha (ex. "MANGUEIRA LAVA AUTO", "MANGUEIRA CHUVEIRO", "MANGUEIRA SUCÇÃO LARANJA") NÃO entra
  const nonHydraulicCases = [
    { name: 'MANGUEIRA LAVA AUTO 1/2" 1000 PSI', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA CHUVEIRO 5/16" SILICONE', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇÃO LARANJA 2"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 0,6 METRO', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA VACUO AR 1.1/4" SVE PRATA CONTINENTAL', category: 'MANGUEIRAS' },
  ]
  for (const item of nonHydraulicCases) {
    if (hasRSeriesDesignation(item.name)) {
      throw new Error(`hasRSeriesDesignation retornou true indevidamente para: "${item.name}"`)
    }
    if (isHydraulicProduct(item)) {
      throw new Error(`isHydraulicProduct retornou true indevidamente para: "${item.name}"`)
    }
    if (getProductDisplayCategory(item) === CANONICAL_HYDRAULIC_CATEGORY) {
      throw new Error(
        `getProductDisplayCategory retornou "Hidráulicas" indevidamente para: "${item.name}"`,
      )
    }
    if (matchesCategoryFilter(item, CANONICAL_HYDRAULIC_CATEGORY)) {
      throw new Error(`matchesCategoryFilter retornou true indevidamente para: "${item.name}"`)
    }
    // Deve casar com o próprio filtro 'MANGUEIRAS'
    if (!matchesCategoryFilter(item, 'MANGUEIRAS')) {
      throw new Error(`matchesCategoryFilter falhou para categoria original de: "${item.name}"`)
    }
  }

  // 5. Nomes com "R" não-seguido-de-dígitos ou R colado em palavra (ex. "FORZA", "TROPIC", "KORAX", "BAR") não casam
  const nonDigitRCases = [
    'MANGUEIRA FORZA UNO',
    'MANGUEIRA TROPIC 135°C',
    'MANGUEIRA KORAX PREMIUM',
    'MANGUEIRA 100 BAR / 1450 PSI',
    'MANGUEIRA AR E AGUA 300 PSI',
    'MANGUEIRA VACUO AR SVE PRATA',
    'MANGUEIRA LIMPADOR PARABRISA',
    'MANGUEIRA PT-250',
    'MANGUEIRA 9K 1/2',
    'MANGUEIRA 1/4 BITOLA R',
  ]
  for (const name of nonDigitRCases) {
    if (hasRSeriesDesignation(name)) {
      throw new Error(`hasRSeriesDesignation casou indevidamente token sem dígito: "${name}"`)
    }
  }

  // 6. Teste de contagem e união com array simulado
  const sampleProducts = [
    { name: 'MANGUEIRA R1 1/2"', category: 'MANGUEIRA HIDRAULICA' }, // Ambos
    { name: 'MANGUEIRA R2 3/4"', category: '' }, // Somente nome R
    { name: 'MANGUEIRA 4SP 1/2"', category: 'MANGUEIRA HIDRAULICA' }, // Somente category crua
    { name: 'MANGUEIRA CRISTAL 1/2"', category: 'MANGUEIRAS' }, // Outro
    { name: 'MANGUEIRA AR E AGUA', category: 'MANGUEIRAS' }, // Outro
  ]

  const hydraulicCount = sampleProducts.filter((p) =>
    matchesCategoryFilter(p, CANONICAL_HYDRAULIC_CATEGORY),
  ).length
  if (hydraulicCount !== 3) {
    throw new Error(`Contagem da união de Hidráulicas esperava 3, retornou ${hydraulicCount}`)
  }

  const otherCount = sampleProducts.filter((p) => matchesCategoryFilter(p, 'MANGUEIRAS')).length
  if (otherCount !== 2) {
    throw new Error(`Contagem de MANGUEIRAS esperava 2, retornou ${otherCount}`)
  }

  // 7. Filtro 'all' deve aceitar todos
  for (const p of sampleProducts) {
    if (!matchesCategoryFilter(p, 'all')) {
      throw new Error(`matchesCategoryFilter falhou para filtro "all" no item: ${p.name}`)
    }
    if (!matchesCategoryFilter(p, '')) {
      throw new Error(`matchesCategoryFilter falhou para filtro "" no item: ${p.name}`)
    }
  }

  // 8. normalizeCategoryKey
  if (normalizeCategoryKey('Hidráulicas') !== 'hidraulicas')
    throw new Error('Falha normalizeCategoryKey Hidráulicas')
  if (normalizeCategoryKey('MANGUEIRA HIDRAULICA') !== 'mangueira hidraulica') {
    throw new Error('Falha normalizeCategoryKey MANGUEIRA HIDRAULICA')
  }

  return true
}

runCategoryNormalizationSelfCheck()
