import {
  isKoraxBrand,
  isKoraxKobra1,
  isKoraxKobra2,
  isCristalTrancada,
  isCristal,
  isSaidaDrenagem,
  isSuccaoLaranja,
  isSuccaoCinzaOuVacuoArCinza,
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
  CRISTAL_TRANCADA_IMAGE,
  CRISTAL_IMAGE,
  SAIDA_DRENAGEM_IMAGE,
  SUCCAO_LARANJA_IMAGE,
  VACUO_AR_CINZA_IMAGE,
  DEFAULT_PRODUCT_PLACEHOLDER,
} from './productImage'

/**
 * Validação em tempo de compilação e execução para as regras de linhas de imagens,
 * incluindo Kobra 1, Kobra 2, Cristal Trançada, Cristal, Saída Drenagem, Sucção Laranja / Sucção Pesada
 * e proteção de precedência das 14 linhas anteriores.
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

  // --- Validação da Linha Cristal Trançada ---
  // Casos positivos reais do banco e variações (com e sem acento/cedilha, case-insensitive):
  const cristalTrancadaPositiveCases = [
    { sku: '3687', name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250', brand: 'IBIRÁ' },
    { sku: '1571', name: 'MANGUEIRA CRISTAL TRANÇADA 1.1/4" PT275', brand: 'IBIRÁ' },
    { sku: '1456', name: 'MANGUEIRA CRISTAL TRANÇADA 1.1/2" PT150', brand: 'IBIRÁ' },
    { sku: '2012', name: 'MANGUEIRA CRISTAL TRANÇADA 3/4" PT250', brand: 'IBIRÁ' },
    { sku: '1085', name: 'MANGUEIRA CRISTAL TRANÇADA 1/2" PT250', brand: 'IBIRÁ' },
    { sku: '9149', name: 'MANGUEIRA CRISTAL TRANÇADA 1/4" PT250', brand: 'IBIRÁ' },
    { sku: '1483', name: 'MANGUEIRA CRISTAL TRANÇADA 2" PT150', brand: 'IBIRÁ' },
    { sku: '7489', name: 'MANGUEIRA CRISTAL TRANÇADA 5/16" PT250', brand: 'IBIRÁ' },
    { sku: '3322', name: 'MANGUEIRA CRISTAL TRANÇADA 5/8" PT250', brand: 'IBIRÁ' },
    { sku: '2124', name: 'MANGUEIRA CRISTAL TRANÇADA 3/8" PT250', brand: 'IBIRÁ' },
    { sku: '1414', name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250', brand: 'KANAFLEX' },
    // Variações sem acento / cedilha / minúsculo:
    { sku: '8001', name: 'mangueira cristal trancada 1/2"', brand: '' },
    { sku: '8002', name: 'MANGUEIRA CRISTAL TRANCADA 3/4"', brand: 'GENERICA' },
    { sku: '8003', name: 'CRISTAL TRANÇADA SILICONE', brand: 'OUTRA' },
  ]

  for (const item of cristalTrancadaPositiveCases) {
    if (!isCristalTrancada(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isCristalTrancada`)
    }
    // Também casa com isCristal genérica, mas a precedência deve entregar a foto da trançada!
    if (!isCristal(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) também deveria casar com isCristal genérica`)
    }
    if (getProductImage(item) !== CRISTAL_TRANCADA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou CRISTAL_TRANCADA_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== CRISTAL_TRANCADA_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [CRISTAL_TRANCADA_IMAGE]`)
    }
  }

  // --- Validação da Linha Cristal (Liso) ---
  // Casos positivos de cristal liso (NÃO devem ser capturados por Cristal Trançada)
  const cristalLisoPositiveCases = [
    { sku: '6980', name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS', brand: 'IBIRA' },
    { sku: '10033', name: 'MANGUEIRA CRISTAL LISA 3/8" X 1,5MM', brand: 'IBIRA' },
    { sku: '300', name: 'MANGUEIRA CRISTAL LISA 1" X 2,0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '4236', name: 'MANGUEIRA CRISTAL LISA 1" X 2,0MM 50 LBS', brand: 'IBIRA' },
    { sku: '3525', name: 'MANGUEIRA CRISTAL LISA 5/16" X 2.0MM 50 LBS', brand: 'IBIRA' },
    { sku: '8765', name: 'MANGUEIRA CRISTAL LISA 3/8" X 1.0MM', brand: 'IBIRA' },
    { sku: '1790', name: 'MANGUEIRA CRISTAL LISA 5/16" X 1.0MM E 1.5MM', brand: 'IBIRA' },
    { sku: '1495', name: 'MANGUEIRA CRISTAL LISA 1/2" X 2.0MM', brand: 'IBIRÁ' },
    { sku: '7589', name: 'MANGUEIRA CRISTAL LISA 1/4" X 1,0MM', brand: 'IBIRÁ' },
    { sku: '1620', name: 'MANGUEIRA CRISTAL LISA 1/8" X 2.0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '3810', name: 'MANGUEIRA CRISTAL LISA 3/16" X 1.0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '870', name: 'MANGUEIRA CRISTAL LISA 3/16" X 2.0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '1498', name: 'MANGUEIRA CRISTAL LISA 3/8" X 2.0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '1367', name: 'MANGUEIRA CRISTAL LISA 5/8" X 2,0MM', brand: 'IBIRÁ' },
    { sku: '527', name: 'MANGUEIRA CRISTAL LISA 3/4" X 2,0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '350', name: 'MANGUEIRA CRISTAL LISA 7/8" X 2,0 MM', brand: 'IBIRÁ' },
    { sku: '7001', name: 'mangueira cristal lisa 5/16"', brand: 'GENERICA' },
    { sku: '7002', name: 'TUBO CRISTAL FLEXÍVEL', brand: '' },
    { sku: '7003', name: 'MANGUEIRA CRISTAL', brand: 'OUTRA' },
  ]

  for (const item of cristalLisoPositiveCases) {
    if (isCristalTrancada(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isCristalTrancada`)
    }
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

  // Precedência de imagem própria do produto (não-placeholder) para ambas
  const customImgTrancada = {
    sku: '7005',
    name: 'MANGUEIRA CRISTAL TRANÇADA 1/2"',
    image: 'https://exemplo.com/minha-foto-trancada.jpg',
  }
  if (getProductImage(customImgTrancada) !== 'https://exemplo.com/minha-foto-trancada.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre CRISTAL_TRANCADA_IMAGE')
  }

  const customImgProduct = {
    sku: '7004',
    name: 'MANGUEIRA CRISTAL LISA 1/2"',
    image: 'https://exemplo.com/minha-foto-propria.jpg',
  }
  if (getProductImage(customImgProduct) !== 'https://exemplo.com/minha-foto-propria.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre CRISTAL_IMAGE')
  }

  // Casos negativos para Cristal Trançada e Cristal:
  // 1) Trançada SEM "CRISTAL" (ex.: "MANGUEIRA 5/16\" TRANÇADA ATOXICA" - sku 6135 do banco)
  const trancadaSemCristal = {
    sku: '6135',
    name: 'MANGUEIRA 5/16" TRANÇADA ATOXICA',
    brand: '',
  }
  if (isCristalTrancada(trancadaSemCristal)) {
    throw new Error('Produto trançado sem palavra CRISTAL NÃO deve casar com isCristalTrancada')
  }
  if (isCristal(trancadaSemCristal)) {
    throw new Error('Produto sem palavra CRISTAL NÃO deve casar com isCristal')
  }

  // 2) Produtos genéricos sem "CRISTAL" nem "TRANÇADA"
  const cristalNegativeCases = [
    { sku: '9001', name: 'MANGUEIRA HIDRAULICA 1/2 2 TRAMAS', brand: 'BALFLEX' },
    { sku: '9002', name: 'ABRACADEIRA TIPO INCA', brand: 'SUPORTE' },
    { sku: '9003', name: 'ENGATE RAPIDO HIDRAULICO', brand: 'GENERICA' },
  ]

  for (const item of cristalNegativeCases) {
    if (isCristalTrancada(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isCristalTrancada`)
    }
    if (isCristal(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isCristal`)
    }
    if (isSaidaDrenagem(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSaidaDrenagem`)
    }
  }

  // --- Validação da Linha Saída Drenagem ---
  // Casos positivos reais do banco e variações (com e sem acento, case-insensitive, com e sem marca):
  const saidaDrenagemPositiveCases = [
    { sku: '8885', name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM', brand: 'IBIRÁ' },
    { sku: '7813', name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 28MM', brand: 'IBIRÁ' },
    { sku: '8887', name: 'MANGUEIRA SAIDA DRENAGEM 1,80M CINZA BOCAL RETO 28MM', brand: 'IBIRÁ' },
    { sku: '8892', name: 'MANGUEIRA SAIDA DRENAGEM 2,00M CINZA BOCAL CURVO', brand: 'IBIRÁ' },
    { sku: '8886', name: 'MANGUEIRA SAIDA DRENAGEM 2,00M CINZA BOCAL RETO 22MM', brand: 'IBIRÁ' },
    { sku: '8890', name: 'MANGUEIRA SAIDA DRENAGEM 3,00M CINZA BOCAL CURVO', brand: 'IBIRÁ' },
    { sku: '8891', name: 'MANGUEIRA SAIDA DRENAGEM 1,60M CINZA BOCAL CURVO 21MM', brand: '' },
    { sku: '8893', name: 'MANGUEIRA SAIDA DRENAGEM 1,85M CINZA BOCAL CURVO 28MM', brand: '' },
    { sku: '8888', name: 'MANGUEIRA SAIDA DRENAGEM 2,00M CINZA BOCAL RETO 29MM', brand: '' },
    { sku: '8889', name: 'MANGUEIRA SAIDA DRENAGEM 2,50M CINZA BOCAL RETO 29MM', brand: '' },
    // Variações com acento (SAÍDA), minúsculo e formatos alternativos:
    { sku: '8896', name: 'MANGUEIRA SAÍDA DRENAGEM 2M MAQUINA DE LAVAR', brand: 'IBIRÁ' },
    { sku: '8897', name: 'mangueira saida drenagem 1,5m cinza', brand: '' },
    { sku: '8898', name: 'mangueira saída drenagem bocal curvo', brand: 'GENERICA' },
  ]

  for (const item of saidaDrenagemPositiveCases) {
    if (!isSaidaDrenagem(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isSaidaDrenagem`)
    }
    if (getProductImage(item) !== SAIDA_DRENAGEM_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou SAIDA_DRENAGEM_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== SAIDA_DRENAGEM_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [SAIDA_DRENAGEM_IMAGE]`)
    }
  }

  // Casos negativos cruciais para Saída Drenagem:
  // SKUs 8894, 8895 ("MANGUEIRA SAIDA CORRUGADA") e SKU 4523 ("MANGUEIRA SAIDA TANQUINHO") NÃO devem receber a imagem!
  const saidaDrenagemNegativeCases = [
    { sku: '8894', name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA', brand: '' },
    { sku: '8895', name: 'MANGUEIRA SAIDA CORRUGADA 2,0M 3/4" BRANCA', brand: '' },
    { sku: '4523', name: 'MANGUEIRA SAIDA 1,27M TANQUINHO', brand: '' },
    { sku: '4524', name: 'MANGUEIRA SAIDA MAQUINA TANQUINHO 1,5M', brand: 'IBIRA' },
    { sku: '4525', name: 'TUBO DRENAGEM PEAD CORRUGADO 100MM', brand: 'TIGRE' }, // Drenagem SEM saída
  ]

  for (const item of saidaDrenagemNegativeCases) {
    if (isSaidaDrenagem(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSaidaDrenagem`)
    }
    if (getProductImage(item) === SAIDA_DRENAGEM_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar SAIDA_DRENAGEM_IMAGE`)
    }
  }

  // Precedência de imagem própria do produto sobre SAIDA_DRENAGEM_IMAGE
  const customImgSaida = {
    sku: '8885',
    name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM',
    image: 'https://exemplo.com/foto-especifica-drenagem.jpg',
  }
  if (getProductImage(customImgSaida) !== 'https://exemplo.com/foto-especifica-drenagem.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre SAIDA_DRENAGEM_IMAGE')
  }

  // --- Validação da Linha Sucção Laranja / Sucção Pesada ---
  // Casos positivos reais do banco e variações (tolerância a acentuação e cedilha: SUCÇÃO, SUCCÃO, SUCÇAO, SUCCAO):
  const succaoLaranjaPositiveCases = [
    { sku: '2745', name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA', brand: 'IBIRÁ' },
    { sku: '2746', name: 'MANGUEIRA SUCÇAO 2.1/2" ISLP LARANJA', brand: 'IBIRÁ' },
    { sku: '9072', name: 'MANGUEIRA SUCÇAO 4" ISLP LARANJA', brand: 'IBIRÁ' },
    { sku: '8212', name: 'MANGUEIRA SUCÇAO 6" ISLP LARANJA', brand: 'IBIRÁ' },
    { sku: '2383', name: 'MANGUEIRA SUCÇÃO LARANJA 3"', brand: '' },
    // Variações de grafia e casos com PESADA:
    { sku: '9501', name: 'MANGUEIRA SUCÇAO 4 BAR ISLP LARANJA', brand: 'IBIRÁ' },
    { sku: '9502', name: 'MANGUEIRA SUCÇÃO PESADA', brand: 'KANAFLEX' },
    { sku: '9503', name: 'MANGUEIRA SUCÇÃO PESADA LARANJA', brand: 'IBIRA' },
    { sku: '9504', name: 'mangueira sucção laranja 2"', brand: '' },
    { sku: '9505', name: 'MANGUEIRA SUCCAO LARANJA 3"', brand: 'IBIRÁ' },
    { sku: '9506', name: 'MANGUEIRA SUCCÃO PESADA 4"', brand: '' },
  ]

  for (const item of succaoLaranjaPositiveCases) {
    if (!isSuccaoLaranja(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isSuccaoLaranja`)
    }
    if (getProductImage(item) !== SUCCAO_LARANJA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou SUCCAO_LARANJA_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== SUCCAO_LARANJA_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [SUCCAO_LARANJA_IMAGE]`)
    }
  }

  // Casos negativos para Sucção Laranja:
  // 1) Sucções transparentes com espiral azul/verde do banco (SKUs 2212, 2208, 7305, 1688, 6763, etc.)
  // 2) Sucções atóxicas com arame metal (SKUs 8449, 8448, 8679, 7815)
  // 3) Produtos com LARANJA mas SEM SUCÇÃO (SKU 6285 Balflex R7 laranja, SKU 1335 chata flat laranja, SKU 3075 jardim laranja)
  // 4) Mangueiras genéricas sem sucção nem laranja/pesada
  const succaoLaranjaNegativeCases = [
    { sku: '2212', name: 'MANGUEIRA SUCÇAO 1" ISAL TRANSPARENTE C/ ESPIRAL AZUL', brand: 'IBIRÁ' },
    {
      sku: '2208',
      name: 'MANGUEIRA SUCÇAO 1.1/4" ISAL TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'IBIRÁ',
    },
    {
      sku: '7305',
      name: 'MANGUEIRA SUCÇAO 1.1/4" KKE TRANSPARENTE C/ ESPIRAL VERDE',
      brand: 'KANAFLEX',
    },
    {
      sku: '1688',
      name: 'MANGUEIRA SUCÇAO 2" KKM TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'KANAFLEX',
    },
    { sku: '8449', name: 'MANGUEIRA SUCÇAO 1" ISAM ATOXICA ARAME METAL', brand: 'IBIRÁ' },
    { sku: '8448', name: 'MANGUEIRA SUCÇAO 1.1/2" ISAM ATOXICA ARAME METAL', brand: 'IBIRÁ' },
    {
      sku: '8675',
      name: 'MANGUEIRA SUCÇAO 1" KA ATOXICA TRANSPARENTE ESPIRAL BRANCO',
      brand: 'KANAFLEX',
    },
    { sku: '2747', name: 'MANGUEIRA SUCÇAO 3" AZUL', brand: 'KANAFLEX' },
    { sku: '6285', name: 'MANGUEIRA R7 1/4" NON CONDUTIVE LARANJA', brand: 'BALFLEX' },
    {
      sku: '1335',
      name: 'MANGUEIRA CHATA FLAT 2" KORFLEX LARANJA 5 BAR CONDUÇAO DE AGUA',
      brand: 'KORAX',
    },
    { sku: '3075', name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 LARANJA/ROSA', brand: 'SUNFLEX' },
    { sku: '2891', name: 'MANGUEIRA FLEXIVEL 2" PVC LARANJA / TRANSPARENTE', brand: 'KANAFLEX' },
  ]

  for (const item of succaoLaranjaNegativeCases) {
    if (isSuccaoLaranja(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoLaranja`)
    }
    if (getProductImage(item) === SUCCAO_LARANJA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar SUCCAO_LARANJA_IMAGE`)
    }
  }

  // Precedência de imagem própria do produto sobre SUCCAO_LARANJA_IMAGE
  const customImgSuccao = {
    sku: '2745',
    name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA',
    image: 'https://exemplo.com/foto-especifica-succao-laranja.jpg',
  }
  if (
    getProductImage(customImgSuccao) !== 'https://exemplo.com/foto-especifica-succao-laranja.jpg'
  ) {
    throw new Error('Imagem própria do produto deve ter precedência sobre SUCCAO_LARANJA_IMAGE')
  }

  // --- Validação da Linha Sucção Cinza / Vácuo Ar Cinza (16ª linha fotografada) ---
  // Casos positivos reais do banco cobrindo IVCL, KEL-SC, KV e variações com "CINZA" e sem acento:
  const vacuoArCinzaPositiveCases = [
    // Ibirá IVCL Cinza:
    { sku: '2210', name: 'MANGUEIRA VACUO AR 1" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '2209', name: 'MANGUEIRA VACUO AR 1.1/4" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '2751', name: 'MANGUEIRA VACUO AR 1.1/2" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '2752', name: 'MANGUEIRA VACUO AR 2" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '5533', name: 'MANGUEIRA VACUO AR 2.1/2" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '7519', name: 'MANGUEIRA VACUO AR 3" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '3040', name: 'MANGUEIRA VACUO AR 4" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '7031', name: 'MANGUEIRA VACUO AR 5" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '5240', name: 'MANGUEIRA VACUO AR 6" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '8649', name: 'MANGUEIRA VACUO AR 8" IVCL CINZA', brand: 'IBIRÁ' },

    // Kanaflex KEL-SC Cinza:
    { sku: '1624', name: 'MANGUEIRA VACUO AR 1" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '2748', name: 'MANGUEIRA VACUO AR 1.1/4" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '4278', name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '1880', name: 'MANGUEIRA VACUO AR 2" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '5241', name: 'MANGUEIRA VACUO AR 2.1/2" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '2753', name: 'MANGUEIRA VACUO AR 3" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '2420', name: 'MANGUEIRA VACUO AR 4" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '4504', name: 'MANGUEIRA VACUO AR 6" KEL-SC CINZA', brand: 'KANAFLEX' },

    // Kanaflex KV Cinza:
    { sku: '4003', name: 'MANGUEIRA VACUO AR 1.3/4" KV CINZA REFORÇADA', brand: 'KANAFLEX' },
    { sku: '5090', name: 'MANGUEIRA VACUO AR 2" KV CINZA REFORÇADA', brand: 'KANAFLEX' },
    { sku: '4715', name: 'MANGUEIRA VACUO AR 4" KV CINZA REFORÇADA', brand: 'KANAFLEX' },
    { sku: '10018', name: 'MANGUEIRA VACUO AR 8" KV CINZA REFORÇADA', brand: 'KANAFLEX' },

    // Casos hipotéticos/sem a palavra "CINZA" explícita, mas com os modelos cinza (IVCL, KEL-SC, KV):
    { sku: '9101', name: 'MANGUEIRA VACUO AR 2" IVCL', brand: 'IBIRA' },
    { sku: '9102', name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SC', brand: 'KANAFLEX' },
    { sku: '9103', name: 'MANGUEIRA VACUO AR 3" KV REFORÇADA', brand: 'KANAFLEX' },

    // Variações de sucção cinza (SUCÇÃO, SUCCÃO, SUCÇAO, SUCCAO + CINZA):
    { sku: '9104', name: 'MANGUEIRA SUCÇÃO CINZA 2"', brand: '' },
    { sku: '9105', name: 'MANGUEIRA SUCÇAO 3" CINZA', brand: 'IBIRÁ' },
    { sku: '9106', name: 'MANGUEIRA SUCCAO 2" CINZA LEVE', brand: 'KANAFLEX' },
    { sku: '9107', name: 'MANGUEIRA VÁCUO AR CINZA 1.1/2"', brand: '' },
    { sku: '9108', name: 'mangueira vacuo ar cinza 2"', brand: '' },
  ]

  for (const item of vacuoArCinzaPositiveCases) {
    if (!isSuccaoCinzaOuVacuoArCinza(item)) {
      throw new Error(
        `Item ${item.sku} (${item.name}) deveria casar com isSuccaoCinzaOuVacuoArCinza`,
      )
    }
    if (getProductImage(item) !== VACUO_AR_CINZA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou VACUO_AR_CINZA_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== VACUO_AR_CINZA_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [VACUO_AR_CINZA_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre VACUO_AR_CINZA_IMAGE
  const customImgVacuo = {
    sku: '2751',
    name: 'MANGUEIRA VACUO AR 1.1/2" IVCL CINZA',
    image: 'https://exemplo.com/foto-especifica-vacuo-cinza.jpg',
  }
  if (getProductImage(customImgVacuo) !== 'https://exemplo.com/foto-especifica-vacuo-cinza.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre VACUO_AR_CINZA_IMAGE')
  }

  // Casos negativos estritos para Sucção Cinza / Vácuo Ar Cinza:
  const vacuoArCinzaNegativeCases = [
    // 1) Sucção Laranja / Pesada (devem ir para SUCCAO_LARANJA_IMAGE, nunca VACUO_AR_CINZA_IMAGE)
    { sku: '2745', name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA', brand: 'IBIRÁ' },
    { sku: '2383', name: 'MANGUEIRA SUCÇÃO LARANJA 3"', brand: '' },
    { sku: '9502', name: 'MANGUEIRA SUCÇÃO PESADA', brand: 'KANAFLEX' },

    // 2) Vácuo Ar Azul (KEV, KEL-S)
    { sku: '9023', name: 'MANGUEIRA VACUO AR 12" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '8093', name: 'MANGUEIRA VACUO AR 2" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '3064', name: 'MANGUEIRA VACUO AR 2.1/2" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '2977', name: 'MANGUEIRA VACUO AR 2.1/2" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '5177', name: 'MANGUEIRA VACUO AR 4" KEL-S AZUL ESCURO', brand: 'KANAFLEX' },
    { sku: '2717', name: 'MANGUEIRA VACUO AR 5" KEL-S AZUL ESCURO', brand: 'KANAFLEX' },

    // 3) Sucção Azul
    { sku: '2747', name: 'MANGUEIRA SUCÇAO 3" AZUL', brand: 'KANAFLEX' },

    // 4) Vácuo Ar Preta (KEL-SP, KPU-BOR)
    { sku: '6293', name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '8483', name: 'MANGUEIRA VACUO AR 1.1/4" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '5596', name: 'MANGUEIRA VACUO AR 2" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '9044', name: 'MANGUEIRA VACUO AR 4" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '3168', name: 'MANGUEIRA VACUO AR 4" KPU-BOR PRETA', brand: 'KANAFLEX' },
    { sku: '6281', name: 'MANGUEIRA VACUO AR 4" KPU-BOR PRETA', brand: 'KANAFLEX' },

    // 5) Vácuo Ar Transparente Cobreada (IVPU)
    {
      sku: '9276',
      name: 'MANGUEIRA VACUO AR 1.1/2" IVPU PU-C TRANSPARENTE COBREADA',
      brand: 'IBIRÁ',
    },
    { sku: '9974', name: 'MANGUEIRA VACUO AR 2" IVPU PU-C TRANSPARENTE COBREADA', brand: 'IBIRÁ' },
    { sku: '9227', name: 'MANGUEIRA VACUO AR 3" IVPU PU-C TRANSPARENTE COBREADA', brand: 'IBIRÁ' },
    {
      sku: '2846',
      name: 'MANGUEIRA VACUO AR 2.1/2" IVPU PU-C TRANSPARENTE COBREADA',
      brand: 'IBIRÁ',
    },
    { sku: '9071', name: 'MANGUEIRA VACUO AR 4" IVPU PU-C TRANSPARENTE COBREADA', brand: 'IBIRÁ' },
    { sku: '2963', name: 'MANGUEIRA VACUO AR 5" IVPU PU-C TRANSPARENTE COBREADA', brand: 'IBIRÁ' },

    // 6) Vácuo Ar Prata (SVE Continental)
    { sku: '4108', name: 'MANGUEIRA VACUO AR 1.1/4" SVE PRATA CONTINENTAL', brand: 'CONTINENTAL' },
    { sku: '4109', name: 'MANGUEIRA VACUO AR 1.1/4" SVE PRATA CONTINENTAL', brand: 'CONTINENTAL' },

    // 7) Sucções transparentes com espiral e atóxicas
    { sku: '2212', name: 'MANGUEIRA SUCÇAO 1" ISAL TRANSPARENTE C/ ESPIRAL AZUL', brand: 'IBIRÁ' },
    { sku: '8449', name: 'MANGUEIRA SUCÇAO 1" ISAM ATOXICA ARAME METAL', brand: 'IBIRÁ' },

    // 8) Produtos com CINZA mas SEM sucção nem vácuo ar (devem ir para suas fotos ou default)
    // Ex: Saída Drenagem cinza (sku 8885)
    { sku: '8885', name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM', brand: 'IBIRÁ' },
    // Ex: Mangueira entrada cinza (sku 4711)
    { sku: '4711', name: 'MANGUEIRA ENTRADA 3/8" X 1,20 MT CINZA VAL 14FIOS', brand: '' },
  ]

  for (const item of vacuoArCinzaNegativeCases) {
    if (isSuccaoCinzaOuVacuoArCinza(item)) {
      throw new Error(
        `Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoCinzaOuVacuoArCinza`,
      )
    }
    if (getProductImage(item) === VACUO_AR_CINZA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar VACUO_AR_CINZA_IMAGE`)
    }
  }

  // Garantir que as 15 linhas anteriores continuam intactas e NÃO pegam VACUO_AR_CINZA_IMAGE
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
    {
      name: 'Cristal Trançada',
      product: { sku: '3687', name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250', brand: 'IBIRÁ' },
      expectedImg: CRISTAL_TRANCADA_IMAGE,
    },
    {
      name: 'Cristal',
      product: { sku: '6980', name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS', brand: 'IBIRA' },
      expectedImg: CRISTAL_IMAGE,
    },
    {
      name: 'Saída Drenagem',
      product: {
        sku: '8885',
        name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM',
        brand: 'IBIRÁ',
      },
      expectedImg: SAIDA_DRENAGEM_IMAGE,
    },
    {
      name: 'Sucção Laranja / Pesada',
      product: {
        sku: '2745',
        name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA',
        brand: 'IBIRÁ',
      },
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
  ]

  for (const line of priorLines) {
    const res = getProductImage(line.product)
    if (res !== line.expectedImg) {
      throw new Error(`Linha anterior ${line.name} retornou imagem errada: ${res}`)
    }
    if (res === CRISTAL_IMAGE && line.name !== 'Cristal') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou CRISTAL_IMAGE`)
    }
    if (res === CRISTAL_TRANCADA_IMAGE && line.name !== 'Cristal Trançada') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou CRISTAL_TRANCADA_IMAGE`)
    }
    if (res === SAIDA_DRENAGEM_IMAGE && line.name !== 'Saída Drenagem') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou SAIDA_DRENAGEM_IMAGE`)
    }
    if (res === SUCCAO_LARANJA_IMAGE && line.name !== 'Sucção Laranja / Pesada') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou SUCCAO_LARANJA_IMAGE`)
    }
    if (res === VACUO_AR_CINZA_IMAGE) {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou VACUO_AR_CINZA_IMAGE`)
    }
  }

  return true
}

// Execução imediata no carregamento do módulo durante build/test
runProductImageSelfCheck()
