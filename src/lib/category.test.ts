import {
  CANONICAL_HYDRAULIC_CATEGORY,
  CANONICAL_AIR_AND_WATER_SUBCATEGORY,
  CANONICAL_SUCTION_DISCHARGE_SUBCATEGORY,
  hasRSeriesDesignation,
  isHydraulicProduct,
  isSuctionAndDischargeProduct,
  isAirAndWaterProduct,
  isAirAndWaterUnifiedProduct,
  isGardenProduct,
  getProductDisplayCategory,
  matchesCategoryFilter,
  matchesSubcategoryFilter,
  matchesHierarchyFilter,
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

  // 9. Subcategoria "Hidráulicas" pelo caminho de hierarquia pai -> filho ("Mangueiras Industriais" > "Hidráulicas")
  // Deve retornar exatamente o conjunto hidráulico (categoria crua MANGUEIRA HIDRAULICA OU padrão série R)
  const hierarchyHydraulicResults = sampleProducts.filter((p) =>
    matchesHierarchyFilter(p, 'Mangueiras Industriais', 'Hidráulicas'),
  )
  if (hierarchyHydraulicResults.length !== 3) {
    throw new Error(
      `matchesHierarchyFilter("Mangueiras Industriais", "Hidráulicas") esperava 3 itens, retornou ${hierarchyHydraulicResults.length}`,
    )
  }
  const hierarchyNames = hierarchyHydraulicResults.map((p) => p.name)
  if (
    !hierarchyNames.includes('MANGUEIRA R1 1/2"') ||
    !hierarchyNames.includes('MANGUEIRA R2 3/4"') ||
    !hierarchyNames.includes('MANGUEIRA 4SP 1/2"')
  ) {
    throw new Error(
      `matchesHierarchyFilter não retornou todos os produtos hidráulicos esperados: ${JSON.stringify(hierarchyNames)}`,
    )
  }

  // 10. Subcategoria "Ar e Água" e "Sucção e Descarga" funcionando no caminho do menu lateral
  // NOTA: "Ar e Água" agora unifica os produtos de Ar e Água + produtos de Jardim no mesmo menu.
  const industrialCatalog = [
    { name: 'MANGUEIRA AR E AGUA 300 PSI 1/2"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA AR E ÁGUA 200 LBS 3/4"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇÃO E DESCARGA PESADA 2"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCCAO LARANJA 3"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA VACUO AR SVE PRATA 1.1/2"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ENTRADA 3/8" X 1,20 MT CINZA VAL 14FIOS', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA R2 1/2"', category: 'MANGUEIRA HIDRAULICA' },
    { name: 'MANGUEIRA CRISTAL LISA 1/2"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 AZUL/PRETO', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA JARDIM 3/4" X 2.5MM PT200 AMARELA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA CHUVEIRO 5/16" X 1,3MM PVC BRANCA', category: 'MANGUEIRAS' },
  ]

  const airWaterResults = industrialCatalog.filter((p) =>
    matchesHierarchyFilter(p, 'Mangueiras Industriais', 'Ar e Água'),
  )
  // Unificado: 2 de ar e água + 2 de jardim = 4 itens
  if (airWaterResults.length !== 4) {
    throw new Error(
      `matchesHierarchyFilter("Mangueiras Industriais", "Ar e Água") esperava 4 itens (unificado com Jardim), retornou ${airWaterResults.length}`,
    )
  }

  const suctionResults = industrialCatalog.filter((p) =>
    matchesHierarchyFilter(p, 'Mangueiras Industriais', 'Sucção e Descarga'),
  )
  // Devem entrar: SUCÇÃO E DESCARGA, SUCCAO LARANJA, VACUO AR, ENTRADA, SAIDA DRENAGEM, SAIDA CORRUGADA = 6 itens
  if (suctionResults.length !== 6) {
    throw new Error(
      `matchesHierarchyFilter("Mangueiras Industriais", "Sucção e Descarga") esperava 6 itens, retornou ${suctionResults.length}`,
    )
  }

  // 11. matchesSubcategoryFilter isolado
  if (
    !matchesSubcategoryFilter(
      { name: 'MANGUEIRA R1 1/2"', category: 'MANGUEIRA HIDRAULICA' },
      'Hidráulicas',
    )
  ) {
    throw new Error('matchesSubcategoryFilter falhou para R1 com subcategoria Hidráulicas')
  }
  if (
    !matchesSubcategoryFilter(
      { name: 'MANGUEIRA 4SP 1/2"', category: 'MANGUEIRA HIDRAULICA' },
      'Hidráulicas',
    )
  ) {
    throw new Error('matchesSubcategoryFilter falhou para 4SP com subcategoria Hidráulicas')
  }
  if (
    !matchesSubcategoryFilter(
      { name: 'MANGUEIRA AR E AGUA 300 PSI', category: 'MANGUEIRAS' },
      'Ar e Água',
    )
  ) {
    throw new Error('matchesSubcategoryFilter falhou para Ar e Água')
  }
  // Jardim também deve responder afirmativamente à subcategoria unificada "Ar e Água"
  if (
    !matchesSubcategoryFilter(
      { name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 AZUL/PRETO', category: 'MANGUEIRAS' },
      'Ar e Água',
    )
  ) {
    throw new Error('matchesSubcategoryFilter("Ar e Água") falhou para mangueira Jardim unificada')
  }
  // Link legado ?sub=Jardim deve redirecionar/casar coerentemente com o conjunto unificado
  if (
    !matchesSubcategoryFilter(
      { name: 'MANGUEIRA AR E AGUA 300 PSI', category: 'MANGUEIRAS' },
      'Jardim',
    )
  ) {
    throw new Error('matchesSubcategoryFilter("Jardim") legado falhou para Ar e Água')
  }
  if (
    !matchesSubcategoryFilter(
      { name: 'MANGUEIRA SUCÇÃO LARANJA 2"', category: 'MANGUEIRAS' },
      'Sucção e Descarga',
    )
  ) {
    throw new Error('matchesSubcategoryFilter falhou para Sucção e Descarga')
  }
  if (
    matchesSubcategoryFilter(
      { name: 'MANGUEIRA CRISTAL LISA 1/2"', category: 'MANGUEIRAS' },
      'Hidráulicas',
    )
  ) {
    throw new Error('matchesSubcategoryFilter aceitou Cristal indevidamente em Hidráulicas')
  }

  // 12. Bateria de testes detalhada para subcategoria "Sucção e Descarga" (Positivos reais do banco e Negativos)
  const positiveSuctionCases = [
    // Sucção variantes de cor/material
    { name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇÃO LARANJA 3"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇAO 1" ISAL TRANSPARENTE C/ ESPIRAL AZUL', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇAO 3" AZUL', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇAO 1" ISAM ATOXICA ARAME METAL', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇAO 1.1/4" KKE TRANSPARENTE C/ ESPIRAL VERDE', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SUCÇAO 1" KA ATOXICA TRANSPARENTE ESPIRAL BRANCO', category: 'MANGUEIRAS' },
    // Vácuo ar
    { name: 'MANGUEIRA VACUO AR 1.1/4" SVE PRATA CONTINENTAL', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA VACUO AR 1" IVCL CINZA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SP PRETA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA VACUO AR 1.3/4" KV CINZA REFORÇADA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA VACUO AR 2" KEV AZUL REFORÇADA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA VACUO AR 2" IVPU PU-C TRANSPARENTE COBREADA', category: 'MANGUEIRAS' },
    // Entrada de máquina (6 SKUs reais)
    { name: 'MANGUEIRA ENTRADA 3/8" X 1,20 MT CINZA VAL 14FIOS', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ENTRADA 3/8" X 1,40 MT CINZA VAL 14FIOS', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ENTRADA 3/8" X 1,80 MT CINZA VAL 14FIOS', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ENTRADA 3/8" X 2,00 MT CINZA VAL 14FIOS', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ENTRADA 3/8" X 3,0M CINZA VAL 14FIOS', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ENTRADA 3/8" X 5,00 MT CINZA VAL 14FIOS', category: 'MANGUEIRAS' },
    // Saída de máquina / drenagem / corrugada / tanquinho
    { name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SAIDA DRENAGEM 2,00M CINZA BOCAL CURVO', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SAÍDA CORRUGADA 2,0M 3/4" BRANCA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA SAIDA TANQUINHO 1,5M', category: 'MANGUEIRAS' },
    // Termos de descarga e aspiração
    { name: 'MANGUEIRA DE DESCARGA PESADA 4"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ASPIRAÇÃO E DESCARGA 2"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA ASPIRACAO INDUSTRIAL 3"', category: 'MANGUEIRAS' },
  ]

  for (const item of positiveSuctionCases) {
    if (!isSuctionAndDischargeProduct(item)) {
      throw new Error(`isSuctionAndDischargeProduct falhou para caso positivo: "${item.name}"`)
    }
    if (!matchesSubcategoryFilter(item, 'Sucção e Descarga')) {
      throw new Error(`matchesSubcategoryFilter("Sucção e Descarga") falhou para: "${item.name}"`)
    }
    if (!matchesSubcategoryFilter(item, CANONICAL_SUCTION_DISCHARGE_SUBCATEGORY)) {
      throw new Error(
        `matchesSubcategoryFilter("${CANONICAL_SUCTION_DISCHARGE_SUBCATEGORY}") falhou para: "${item.name}"`,
      )
    }
    if (!matchesHierarchyFilter(item, 'Mangueiras Industriais', 'Sucção e Descarga')) {
      throw new Error(
        `matchesHierarchyFilter("Mangueiras Industriais", "Sucção e Descarga") falhou para: "${item.name}"`,
      )
    }
  }

  // 13. Casos negativos estritos (Precedência: Hidráulica, Ar e Água, Jardim, Chuveiro, etc.)
  const negativeSuctionCases = [
    // Hidráulicas com menção a sucção/ar/água (ex: R6 Multipurpose OLEO/SOLVENTE/AR/AGUA, R4 sucção de óleo hidráulico)
    {
      name: 'MANGUEIRA R6 1" MULTIPURPOSE OLEO/SOLVENTE/AR/AGUA',
      category: 'MANGUEIRA HIDRAULICA',
    },
    { name: 'MANGUEIRA R4 SUCÇÃO HIDRÁULICA 1.1/2"', category: 'MANGUEIRA HIDRAULICA' },
    { name: 'MANGUEIRA R1 1/2" FORZA UNO', category: 'MANGUEIRA HIDRAULICA' },
    { name: 'MANGUEIRA R2 3/4" FORZA DUE', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA R14 TEFLON 1/2"', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA 4SP 1/2" BALMASTER', category: 'MANGUEIRA HIDRAULICA' },
    // Ar e Água (permanece exclusivo na subcategoria Ar e Água)
    { name: 'MANGUEIRA AR E AGUA 1/2" PT300 PRETA', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA AR E ÁGUA 3/4" PT500', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA AR E AGUA 1" PT300 PRETA', category: 'MANGUEIRAS' },
    // Jardim
    { name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 AZUL/PRETO', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA JARDIM 3/4" X 2.5MM PT200 AMARELA', category: 'MANGUEIRAS' },
    // Chuveiro (SKU 2234: PVC branca, não é saída nem sucção)
    { name: 'MANGUEIRA CHUVEIRO 5/16" X 1,3MM PVC BRANCA', category: 'MANGUEIRAS' },
    // Outras mangueiras comuns
    { name: 'MANGUEIRA LAVA AUTO 1/2" 1000 PSI', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA CRISTAL LISA 1/2" X 2.0MM', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA CRISTAL TRANÇADA 3/4" PT250', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 0,6 METRO', category: 'MANGUEIRAS' },
    { name: 'MANGUEIRA DUPLA SOLDA 5/16" OXIG/ACET 300 PSI', category: 'MANGUEIRAS' },
  ]

  for (const item of negativeSuctionCases) {
    if (isSuctionAndDischargeProduct(item)) {
      throw new Error(
        `isSuctionAndDischargeProduct aceitou indevidamente caso negativo: "${item.name}"`,
      )
    }
    if (matchesSubcategoryFilter(item, 'Sucção e Descarga')) {
      throw new Error(
        `matchesSubcategoryFilter("Sucção e Descarga") aceitou indevidamente: "${item.name}"`,
      )
    }
    if (matchesHierarchyFilter(item, 'Mangueiras Industriais', 'Sucção e Descarga')) {
      throw new Error(
        `matchesHierarchyFilter("Mangueiras Industriais", "Sucção e Descarga") aceitou indevidamente: "${item.name}"`,
      )
    }
  }

  // 14. Garantir que nenhuma mangueira caia em "Hidráulicas", "Ar e Água" e "Sucção e Descarga" simultaneamente
  const allSubcategories = ['Hidráulicas', 'Ar e Água', 'Sucção e Descarga']
  const crossCheckList = [...positiveSuctionCases, ...negativeSuctionCases, ...industrialCatalog]

  for (const item of crossCheckList) {
    const matchedSubs = allSubcategories.filter((sub) => matchesSubcategoryFilter(item, sub))
    if (matchedSubs.length > 1) {
      throw new Error(
        `Conflito de subcategorias: item "${item.name}" caiu em múltiplas subcategorias: ${matchedSubs.join(', ')}`,
      )
    }
  }

  // 15. Checagem direta de isAirAndWaterUnifiedProduct
  if (!isAirAndWaterUnifiedProduct({ name: 'MANGUEIRA AR E AGUA 1/2" PT300 PRETA' })) {
    throw new Error('isAirAndWaterUnifiedProduct falhou para Ar e Água puro')
  }
  if (!isAirAndWaterUnifiedProduct({ name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 AZUL/PRETO' })) {
    throw new Error('isAirAndWaterUnifiedProduct falhou para Jardim')
  }
  // Hidráulicas com menção a ar/água NUNCA entram em Ar e Água
  if (
    isAirAndWaterUnifiedProduct({
      name: 'MANGUEIRA R6 1" MULTIPURPOSE AR E AGUA',
      category: 'MANGUEIRA HIDRAULICA',
    })
  ) {
    throw new Error('isAirAndWaterUnifiedProduct aceitou indevidamente produto Hidráulico R6')
  }
  // Sucção nunca entra em Ar e Água
  if (
    isAirAndWaterUnifiedProduct({ name: 'MANGUEIRA SUCÇÃO 2" LARANJA', category: 'MANGUEIRAS' })
  ) {
    throw new Error('isAirAndWaterUnifiedProduct aceitou indevidamente produto de Sucção')
  }

  return true
}

runCategoryNormalizationSelfCheck()
