import {
  isKoraxBrand,
  isKoraxKobra1,
  isKoraxKobra2,
  isCristal,
  getProductImage,
  getProductImages,
  BALFLEX_FORZA_UNO_TROPIC_IMAGE,
  BALFLEX_FORZA_UNO_IMAGE,
  BALFLEX_FORZA_DUE_TROPIC_IMAGE,
  BALFLEX_FORZA_DUE_IMAGE,
  BALFLEX_TEXMASTER_IMAGE,
  BALFLEX_R6_MULTIPURPOSE_IMAGE,
  BALFLEX_FUEL_PUMP_IMAGE,
  BALFLEX_SUPERSTEAM_IMAGE,
  BLINDADA_GAS_FG_IMAGE,
  KORAX_KOBRA1_IMAGE,
  KORAX_KOBRA2_IMAGE,
  CRISTAL_IMAGE,
  DEFAULT_PRODUCT_PLACEHOLDER,
} from './productImage'

/**
 * Validação em tempo de compilação e execução para as regras de linhas de imagens,
 * incluindo Kobra 1, Kobra 2, Cristal e proteção de precedência das 11 linhas anteriores.
 */
export function runProductImageSelfCheck(): boolean {
  // Testes de marca
  if (!isKoraxBrand({ brand: 'KORAX' })) throw new Error('isKoraxBrand falhou para brand KORAX')
  if (!isKoraxBrand({ brand: 'korax' })) throw new Error('isKoraxBrand falhou para brand minúsculo')
  if (!isKoraxBrand({ name: 'Mangueira KORAX 1/2' }))
    throw new Error('isKoraxBrand falhou no texto do nome')
  if (isKoraxBrand({ brand: 'BALFLEX' })) throw new Error('isKoraxBrand não deve casar com BALFLEX')

  // SKUs citados na tarefa para Kobra 1: 4982, 6368, 6750
  const kobra1List = [
    { sku: '4982', name: 'MANGUEIRA R1 1/2" KOBRA', brand: 'KORAX' },
    { sku: '6368', name: 'MANGUEIRA R1 1/4" KOBRA', brand: 'KORAX' },
    { sku: '6750', name: 'MANGUEIRA R1 3/8" KOBRA', brand: 'KORAX' },
    { sku: '1111', name: 'MANGUEIRA KOBRA 1 1/2"', brand: 'KORAX' },
  ]

  for (const item of kobra1List) {
    if (!isKoraxKobra1(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria ser Kobra 1`)
    }
    if (isKoraxKobra2(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria ser Kobra 2`)
    }
    if (getProductImage(item) !== KORAX_KOBRA1_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou KORAX_KOBRA1_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== KORAX_KOBRA1_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [KORAX_KOBRA1_IMAGE]`)
    }
  }

  // SKUs citados na tarefa para Kobra 2: 4985, 4984, 5084
  const kobra2List = [
    { sku: '4985', name: 'MANGUEIRA R2 1/2" KOBRA', brand: 'KORAX' },
    { sku: '4984', name: 'MANGUEIRA R2 3/8" KOBRA', brand: 'KORAX' },
    { sku: '5084', name: 'MANGUEIRA R2 1/4" KOBRA', brand: 'KORAX' },
    { sku: '2222', name: 'MANGUEIRA KOBRA 2 1/2"', brand: 'KORAX' },
  ]

  for (const item of kobra2List) {
    if (!isKoraxKobra2(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria ser Kobra 2`)
    }
    if (isKoraxKobra1(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria ser Kobra 1`)
    }
    if (getProductImage(item) !== KORAX_KOBRA2_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou KORAX_KOBRA2_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== KORAX_KOBRA2_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [KORAX_KOBRA2_IMAGE]`)
    }
  }

  // Caso de borda: R12 KOBRA NÃO deve casar nem com Kobra 1 nem com Kobra 2 (\bR1\b não deve casar com R12)
  const r12Product = { sku: '9999', name: 'MANGUEIRA R12 3/4" KOBRA', brand: 'KORAX' }
  const r12Hypothetical = { sku: '9998', name: 'R12 1" ALTA PRESSAO KOBRA', brand: 'KORAX' }
  for (const item of [r12Product, r12Hypothetical]) {
    if (isKoraxKobra1(item)) {
      throw new Error(`Produto ${item.name} NÃO pode casar com Kobra 1`)
    }
    if (isKoraxKobra2(item)) {
      throw new Error(`Produto ${item.name} NÃO pode casar com Kobra 2`)
    }
    if (getProductImage(item) !== DEFAULT_PRODUCT_PLACEHOLDER) {
      throw new Error(`Produto ${item.name} deveria retornar placeholder default`)
    }
  }

  // Outros modelos Korax que não devem casar
  const r14Product = { sku: '4592', name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI', brand: 'KORAX' }
  const r17Product = { sku: '6689', name: 'MANGUEIRA R17 1/2" ELITE', brand: 'KORAX' }
  if (isKoraxKobra1(r14Product) || isKoraxKobra2(r14Product)) {
    throw new Error('R14 KORAX não deve casar')
  }
  if (isKoraxKobra1(r17Product) || isKoraxKobra2(r17Product)) {
    throw new Error('R17 KORAX não deve casar')
  }

  // Se não for KORAX, R1 + KOBRA não deve casar Kobra 1
  const outramarca = { sku: '8888', name: 'MANGUEIRA R1 1/2" KOBRA', brand: 'OUTRAMARCA' }
  if (isKoraxKobra1(outramarca)) {
    throw new Error('Marca não KORAX não deve casar com Kobra 1')
  }

  // --- Validação da Linha Cristal ---
  // Casos positivos: produtos reais do banco ou variações com "CRISTAL"
  const cristalPositiveCases = [
    { sku: '6980', name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS', brand: 'IBIRA' },
    { sku: '10033', name: 'MANGUEIRA CRISTAL LISA 3/8" X 1,5MM', brand: 'IBIRA' },
    { sku: '300', name: 'MANGUEIRA CRISTAL LISA 1" X 2,0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '3687', name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250', brand: 'IBIRÁ' },
    { sku: '7001', name: 'mangueira cristal lisa 5/16"', brand: 'GENERICA' },
    { sku: '7002', name: 'TUBO CRISTAL FLEXÍVEL', brand: '' },
    { sku: '7003', name: 'MANGUEIRA CRISTAL', brand: 'OUTRA' },
  ]

  for (const item of cristalPositiveCases) {
    if (!isCristal(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isCristal`)
    }
    if (getProductImage(item) !== CRISTAL_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou CRISTAL_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== CRISTAL_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [CRISTAL_IMAGE]`)
    }
  }

  // Se o produto já possui imagem própria cadastrada (não-placeholder), ela deve prevalecer sobre CRISTAL_IMAGE
  const customImgProduct = {
    sku: '7004',
    name: 'MANGUEIRA CRISTAL LISA 1/2"',
    image: 'https://exemplo.com/minha-foto-propria.jpg',
  }
  if (getProductImage(customImgProduct) !== 'https://exemplo.com/minha-foto-propria.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre CRISTAL_IMAGE')
  }

  // Casos negativos para Cristal: produtos que NÃO contêm a palavra "CRISTAL"
  const cristalNegativeCases = [
    { sku: '9001', name: 'MANGUEIRA HIDRAULICA 1/2 2 TRAMAS', brand: 'BALFLEX' },
    { sku: '9002', name: 'ABRACADEIRA TIPO INCA', brand: 'SUPORTE' },
    { sku: '9003', name: 'ENGATE RAPIDO HIDRAULICO', brand: 'GENERICA' },
  ]

  for (const item of cristalNegativeCases) {
    if (isCristal(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isCristal`)
    }
  }

  // Garantir que as 11 linhas anteriores continuam intactas e NÃO pegam CRISTAL_IMAGE
  const priorLines = [
    {
      name: 'Forza Uno Tropic',
      product: { name: 'MANGUEIRA BALFLEX FORZA UNO TROPIC 1/2"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_FORZA_UNO_TROPIC_IMAGE,
    },
    {
      name: 'Forza Uno',
      product: { name: 'MANGUEIRA BALFLEX FORZA UNO 1/2"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_FORZA_UNO_IMAGE,
    },
    {
      name: 'Forza Due Tropic',
      product: { name: 'MANGUEIRA BALFLEX FORZA DUE TROPIC 3/8"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_FORZA_DUE_TROPIC_IMAGE,
    },
    {
      name: 'Forza Due',
      product: { name: 'MANGUEIRA BALFLEX FORZA DUE 3/8"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_FORZA_DUE_IMAGE,
    },
    {
      name: 'Texmaster',
      product: { name: 'MANGUEIRA BALFLEX TEXMASTER 2 1/2"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_TEXMASTER_IMAGE,
    },
    {
      name: 'R6 Multipurpose',
      product: { name: 'MANGUEIRA BALFLEX R6 MULTIPURPOSE 1/4"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_R6_MULTIPURPOSE_IMAGE,
    },
    {
      name: 'Kobra 1',
      product: { sku: '4982', name: 'MANGUEIRA R1 1/2" KOBRA', brand: 'KORAX' },
      expectedImg: KORAX_KOBRA1_IMAGE,
    },
    {
      name: 'Kobra 2',
      product: { sku: '4985', name: 'MANGUEIRA R2 1/2" KOBRA', brand: 'KORAX' },
      expectedImg: KORAX_KOBRA2_IMAGE,
    },
    {
      name: 'Fuel Pump',
      product: { name: 'MANGUEIRA BALFLEX FUEL PUMP 3/4"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_FUEL_PUMP_IMAGE,
    },
    {
      name: 'Supersteam',
      product: { name: 'MANGUEIRA BALFLEX SUPERSTEAM 1/2"', brand: 'BALFLEX' },
      expectedImg: BALFLEX_SUPERSTEAM_IMAGE,
    },
    {
      name: 'Blindada Gás FG',
      product: { name: 'MANGUEIRA BLINDADA GÁS FG 1/2"', brand: 'CONTUFLEX' },
      expectedImg: BLINDADA_GAS_FG_IMAGE,
    },
  ]

  for (const line of priorLines) {
    const res = getProductImage(line.product)
    if (res !== line.expectedImg) {
      throw new Error(`Linha anterior ${line.name} retornou imagem errada: ${res}`)
    }
    if (res === CRISTAL_IMAGE) {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou CRISTAL_IMAGE`)
    }
  }

  return true
}

// Execução imediata no carregamento do módulo durante build/test
runProductImageSelfCheck()
