import {
  isKoraxBrand,
  isKoraxKobra1,
  isKoraxKobra2,
  isCristalTrancada,
  isCristal,
  isSaidaDrenagem,
  isSaidaCorrugadaBranca,
  isSaidaTanquinho,
  isSuccaoLaranja,
  isSuccaoCinzaOuVacuoArCinza,
  isBlindadaGasFg,
  isSuccaoAzul,
  isAluminioProtecao,
  isR14Teflon,
  isLisaIrrigacao,
  isVacuoArPreta,
  isGasLonadaPreta,
  isGasPvc,
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
  SAIDA_CORRUGADA_BRANCA_IMAGE,
  SAIDA_DRENAGEM_IMAGE,
  SAIDA_TANQUINHO_IMAGE,
  SUCCAO_LARANJA_IMAGE,
  VACUO_AR_CINZA_IMAGE,
  SUCCAO_AZUL_IMAGE,
  VACUO_AR_PRETA_IMAGE,
  ALUMINIO_PROTECAO_IMAGE,
  R14_TEFLON_IMAGE,
  LISA_IRRIGACAO_IMAGE,
  GAS_LONADA_PRETA_IMAGE,
  GAS_PVC_IMAGE,
  DEFAULT_PRODUCT_PLACEHOLDER,
} from './productImage'
/**
 * Validação em tempo de compilação e execução para as regras de linhas de imagens,
 * incluindo Kobra 1, Kobra 2, Cristal Trançada, Cristal, Saída Drenagem, Saída Corrugada Branca,
 * Sucção Laranja / Sucção Pesada, Sucção Cinza / Vácuo Ar Cinza, Alumínio Proteção,
 * R14 Teflon, Lisa Irrigação e proteção de precedência das linhas anteriores.
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
  // SKUs 8894, 8895 ("MANGUEIRA SAIDA CORRUGADA") e SKU 4523 ("MANGUEIRA SAIDA TANQUINHO") NÃO devem receber a imagem de Saída Drenagem!
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

  // --- Validação da Linha Saída Corrugada Branca (17ª linha) ---
  // Casos positivos reais do banco (SKUs 8894 e 8895) e variações de acentuação/case:
  const saidaCorrugadaBrancaPositiveCases = [
    { sku: '8894', name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA', brand: '' },
    { sku: '8895', name: 'MANGUEIRA SAIDA CORRUGADA 2,0M 3/4" BRANCA', brand: '' },
    { sku: '9896', name: 'mangueira saida corrugada branca', brand: '' },
    { sku: '9897', name: 'MANGUEIRA SAÍDA CORRUGADA BRANCA 3M', brand: 'IBIRÁ' },
    { sku: '9898', name: 'MANGUEIRA SAÍDA DE MÁQUINA CORRUGADA BRANCA', brand: 'GENÉRICA' },
    { sku: '9899', name: 'mangueira saída corrugada branca 1,5m', brand: 'KORAX' },
  ]

  for (const item of saidaCorrugadaBrancaPositiveCases) {
    if (!isSaidaCorrugadaBranca(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isSaidaCorrugadaBranca`)
    }
    // Não pode casar com Saída Drenagem
    if (isSaidaDrenagem(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSaidaDrenagem`)
    }
    if (getProductImage(item) !== SAIDA_CORRUGADA_BRANCA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou SAIDA_CORRUGADA_BRANCA_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== SAIDA_CORRUGADA_BRANCA_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [SAIDA_CORRUGADA_BRANCA_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre SAIDA_CORRUGADA_BRANCA_IMAGE
  const customImgSaidaCorrugada = {
    sku: '8894',
    name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA',
    image: 'https://exemplo.com/foto-especifica-corrugada.jpg',
  }
  if (
    getProductImage(customImgSaidaCorrugada) !== 'https://exemplo.com/foto-especifica-corrugada.jpg'
  ) {
    throw new Error(
      'Imagem própria do produto deve ter precedência sobre SAIDA_CORRUGADA_BRANCA_IMAGE',
    )
  }

  // Casos negativos cruciais para Saída Corrugada Branca:
  // - Saída Drenagem (SKUs 8885 a 8893): mantém a foto própria de Saída Drenagem!
  // - Saída Tanquinho (SKU 4523, SKU 4524): sem foto desta linha (retorna default ou foto de Tanquinho)
  // - Corrugada sem saída ou sem branca
  // - Saída branca sem corrugada
  const saidaCorrugadaBrancaNegativeCases = [
    { sku: '8885', name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM', brand: 'IBIRÁ' },
    { sku: '7813', name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 28MM', brand: 'IBIRÁ' },
    { sku: '8892', name: 'MANGUEIRA SAIDA DRENAGEM 2,00M CINZA BOCAL CURVO', brand: 'IBIRÁ' },
    { sku: '4523', name: 'MANGUEIRA SAIDA 1,27M TANQUINHO', brand: '' },
    { sku: '4524', name: 'MANGUEIRA SAIDA MAQUINA TANQUINHO 1,5M', brand: 'IBIRA' },
    { sku: '9801', name: 'MANGUEIRA CORRUGADA BRANCA 3/4"', brand: '' }, // Sem saída
    { sku: '9802', name: 'MANGUEIRA SAIDA CORRUGADA CINZA 2M', brand: '' }, // Sem branca
    { sku: '9803', name: 'MANGUEIRA SAIDA TANQUINHO BRANCA', brand: '' }, // Sem corrugada
    { sku: '9804', name: 'CONDUITE CORRUGADO BRANCO 3/4"', brand: 'TIGRE' }, // Sem saída
    { sku: '9805', name: 'MANGUEIRA SAIDA DRENAGEM CORRUGADA BRANCA', brand: 'IBIRÁ' }, // Caso hipotético: Saída Drenagem prevalece por precedência!
  ]

  for (const item of saidaCorrugadaBrancaNegativeCases) {
    if (item.sku === '9805') {
      // Caso de sobreposição intencional: getProductImage deve priorizar SAIDA_DRENAGEM_IMAGE
      if (getProductImage(item) !== SAIDA_DRENAGEM_IMAGE) {
        throw new Error(
          `Item ${item.name} deveria priorizar SAIDA_DRENAGEM_IMAGE sobre Saída Corrugada Branca`,
        )
      }
    } else {
      if (isSaidaCorrugadaBranca(item)) {
        throw new Error(
          `Item ${item.sku} (${item.name}) NÃO deveria casar com isSaidaCorrugadaBranca`,
        )
      }
      if (getProductImage(item) === SAIDA_CORRUGADA_BRANCA_IMAGE) {
        throw new Error(
          `Item ${item.sku} (${item.name}) NÃO deve retornar SAIDA_CORRUGADA_BRANCA_IMAGE`,
        )
      }
    }
  }

  // --- Validação da Linha Saída Tanquinho (21ª linha fotografada) ---
  // A regra de imagem isSaidaTanquinho permanece ativa para cobertura de futuros produtos da linha (ex.: novas variações de Saída Tanquinho).
  // Nota: SKU 4523 original foi permanentemente excluído do catálogo a pedido do usuário; validamos o padrão textual do nome "SAÍDA ... TANQUINHO"
  // tanto para SKU histórico 4523 como para variações de formato, acento, ordem de palavras e case:
  const saidaTanquinhoPositiveCases = [
    // Padrão do produto histórico (ordem não contígua: "SAIDA" + "1,27M" + "TANQUINHO")
    { sku: '4523', name: 'MANGUEIRA SAIDA 1,27M TANQUINHO', brand: '' },
    // Variações com acento no SAÍDA
    { sku: '4526', name: 'MANGUEIRA SAÍDA 1,27M TANQUINHO', brand: '' },
    // Minúsculo
    { sku: '4527', name: 'mangueira saida 1,27m tanquinho', brand: '' },
    { sku: '4528', name: 'mangueira saída tanquinho', brand: '' },
    // Ordem diferente / palavras contíguas ou invertidas
    { sku: '4529', name: 'MANGUEIRA SAIDA TANQUINHO 1,5M', brand: '' },
    { sku: '4530', name: 'MANGUEIRA TANQUINHO SAIDA 2,0M', brand: 'IBIRÁ' },
    { sku: '4531', name: 'MANGUEIRA SAIDA MAQUINA TANQUINHO 1,5M', brand: 'IBIRA' },
    { sku: '4532', name: 'MANGUEIRA SAÍDA PARA TANQUINHO BRANCA', brand: 'GENÉRICA' },
  ]

  for (const item of saidaTanquinhoPositiveCases) {
    if (!isSaidaTanquinho(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isSaidaTanquinho`)
    }
    // Não pode casar com Saída Drenagem nem Saída Corrugada Branca (salvo se tiver os termos específicos destas linhas)
    if (isSaidaDrenagem(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSaidaDrenagem`)
    }
    if (getProductImage(item) !== SAIDA_TANQUINHO_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou SAIDA_TANQUINHO_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== SAIDA_TANQUINHO_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [SAIDA_TANQUINHO_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre SAIDA_TANQUINHO_IMAGE
  const customImgTanquinho = {
    sku: '4523',
    name: 'MANGUEIRA SAIDA 1,27M TANQUINHO',
    image: 'https://exemplo.com/foto-especifica-tanquinho.jpg',
  }
  if (getProductImage(customImgTanquinho) !== 'https://exemplo.com/foto-especifica-tanquinho.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre SAIDA_TANQUINHO_IMAGE')
  }

  // Casos negativos cruciais para Saída Tanquinho:
  // - Saída Drenagem (SKUs 8885 a 8893) NÃO devem casar com isSaidaTanquinho nem receber SAIDA_TANQUINHO_IMAGE
  // - Saída Corrugada Branca (SKUs 8894 e 8895) NÃO devem casar com isSaidaTanquinho nem receber SAIDA_TANQUINHO_IMAGE
  // - Tanquinho sem Saída
  // - Saída sem Tanquinho
  const saidaTanquinhoNegativeCases = [
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
    { sku: '8894', name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA', brand: '' },
    { sku: '8895', name: 'MANGUEIRA SAIDA CORRUGADA 2,0M 3/4" BRANCA', brand: '' },
    { sku: '4599', name: 'MANGUEIRA TANQUINHO 1,27M', brand: '' }, // Tanquinho SEM saída
    { sku: '4600', name: 'MANGUEIRA SAIDA MAQUINA DE LAVAR 1,5M', brand: '' }, // Saída sem tanquinho
    { sku: '4601', name: 'MANGUEIRA ENTRADA TANQUINHO 1,20M', brand: '' }, // Entrada sem saída
    { sku: '4602', name: 'BOCAL PARA TANQUINHO 22MM', brand: '' }, // Bocal sem saída
    { sku: '4603', name: 'MANGUEIRA CRISTAL LISA 1/2"', brand: 'IBIRÁ' },
  ]

  for (const item of saidaTanquinhoNegativeCases) {
    if (isSaidaTanquinho(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSaidaTanquinho`)
    }
    if (getProductImage(item) === SAIDA_TANQUINHO_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar SAIDA_TANQUINHO_IMAGE`)
    }
  }

  // Teste de precedência interna entre linhas irmãs de saída se hipoteticamente coexistirem:
  // Saída Drenagem tem precedência sobre Saída Corrugada Branca e Saída Tanquinho
  const hipoteticoDrenagemTanquinho = {
    sku: '4699',
    name: 'MANGUEIRA SAIDA DRENAGEM TANQUINHO 1,5M',
    brand: 'IBIRÁ',
  }
  if (getProductImage(hipoteticoDrenagemTanquinho) !== SAIDA_DRENAGEM_IMAGE) {
    throw new Error('Saída Drenagem deve prevalecer sobre Saída Tanquinho se termos coexistirem')
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

    // Casos sem a palavra "CINZA" e sem código de modelo da linha cinza (produtos do banco vácuo ar padrão cinza):
    // SKU 5022 ("MANGUEIRA VACUO AR 3/4"") - caso reportado pelo usuário
    { sku: '5022', name: 'MANGUEIRA VACUO AR 3/4"', brand: '' },
    // SKU 1599 ("MANGUEIRA VACUO AR 1.1/2"") - Kanaflex sem código de cor
    { sku: '1599', name: 'MANGUEIRA VACUO AR 1.1/2"', brand: 'KANAFLEX' },
    // Caso com acento sem cor explícita:
    { sku: '9100', name: 'MANGUEIRA VÁCUO AR 2"', brand: '' },

    // Casos com os modelos cinza (IVCL, KEL-SC, KV) sem a palavra "CINZA":
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

    // 7) Sucções transparentes com espiral e atóxicas (ISAL, KKM, KKE, ISAM, KA)
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

  // --- Validação da Linha Mangueira Flexível Alumínio Proteção (18ª linha fotografada) ---
  // Casos positivos reais dos 7 produtos no PocketBase:
  const aluminioProtecaoPositiveCases = [
    { sku: '6354', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT', brand: '' },
    { sku: '6355', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 32MM INT', brand: '' },
    { sku: '9001', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 38MM INT', brand: '' },
    { sku: '6356', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 45MM INT', brand: '' },
    { sku: '6357', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 50MM INT', brand: '' },
    { sku: '6358', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 63MM INT', brand: '' },
    { sku: '6359', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 76MM INT', brand: '' },
    // Variações de acentuação, grafia e case:
    { sku: '9201', name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTECAO 50MM', brand: '' },
    { sku: '9202', name: 'mangueira flexivel aluminio proteção', brand: '' },
    { sku: '9203', name: 'mangueira flexível alumínio proteção 32mm', brand: 'GENÉRICA' },
    { sku: '9204', name: 'TUBO ALUMINIO PROTEÇÃO TERMICA', brand: '' },
    { sku: '9205', name: 'ALUMÍNIO PROTEÇÃO CORRUGADA 24MM', brand: '' },
  ]

  for (const item of aluminioProtecaoPositiveCases) {
    if (!isAluminioProtecao(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isAluminioProtecao`)
    }
    if (getProductImage(item) !== ALUMINIO_PROTECAO_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou ALUMINIO_PROTECAO_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== ALUMINIO_PROTECAO_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [ALUMINIO_PROTECAO_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre ALUMINIO_PROTECAO_IMAGE
  const customImgAluminio = {
    sku: '6354',
    name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT',
    image: 'https://exemplo.com/foto-especifica-aluminio.jpg',
  }
  if (getProductImage(customImgAluminio) !== 'https://exemplo.com/foto-especifica-aluminio.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre ALUMINIO_PROTECAO_IMAGE')
  }

  // Casos negativos estritos para Alumínio Proteção:
  // 1) Blindada Gás FG (outros produtos metálicos corrugados): NÃO deve casar com Alumínio Proteção
  // 2) Palavras isoladas sem o par (apenas ALUMINIO sem PROTEÇÃO, ou apenas PROTEÇÃO sem ALUMINIO)
  // 3) Outros produtos do catálogo
  const aluminioProtecaoNegativeCases = [
    // Blindada Gás FG Contuflex (SKUs reais do banco):
    {
      sku: '6757',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 0,6 METRO',
      brand: 'CONTUFLEX',
    },
    {
      sku: '5882',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 1,2 METROS',
      brand: 'CONTUFLEX',
    },
    {
      sku: '5881',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 1,0 METRO',
      brand: 'CONTUFLEX',
    },
    // Apenas alumínio sem proteção:
    { sku: '9301', name: 'MANGUEIRA FLEXIVEL ALUMINIO 50MM', brand: '' },
    { sku: '9302', name: 'CONEXAO DE ALUMINIO 1/2"', brand: '' },
    { sku: '9303', name: 'TUBO DE ALUMÍNIO FLEXÍVEL', brand: '' },
    // Apenas proteção sem alumínio:
    { sku: '9304', name: 'MOLA DE PROTEÇÃO PLASTICA PARA MANGUEIRA', brand: '' },
    { sku: '9305', name: 'CAPA DE PROTECAO TERMICA SILICONE', brand: '' },
    { sku: '9306', name: 'ESPIRAL DE PROTEÇÃO 1/2"', brand: '' },
    // Outras mangueiras hidráulicas ou industriais:
    { sku: '9307', name: 'MANGUEIRA BALFLEX FORZA UNO 1/2"', brand: 'BALFLEX' },
    { sku: '9308', name: 'MANGUEIRA CRISTAL LISA 1/2"', brand: 'IBIRÁ' },
    { sku: '9309', name: 'MANGUEIRA VACUO AR 2" IVCL CINZA', brand: 'IBIRÁ' },
  ]

  for (const item of aluminioProtecaoNegativeCases) {
    if (isAluminioProtecao(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isAluminioProtecao`)
    }
    if (getProductImage(item) === ALUMINIO_PROTECAO_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar ALUMINIO_PROTECAO_IMAGE`)
    }
  }

  // Garantir que as 17 linhas anteriores continuam intactas e NÃO pegam ALUMINIO_PROTECAO_IMAGE
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
    {
      name: 'Saída Corrugada Branca',
      product: {
        sku: '8894',
        name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA',
        brand: '',
      },
      expectedImg: SAIDA_CORRUGADA_BRANCA_IMAGE,
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
    {
      name: 'Sucção Cinza / Vácuo Ar Cinza',
      product: {
        sku: '2210',
        name: 'MANGUEIRA VACUO AR 1" IVCL CINZA',
        brand: 'IBIRÁ',
      },
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      name: 'Alumínio Proteção',
      product: {
        sku: '6354',
        name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT',
        brand: '',
      },
      expectedImg: ALUMINIO_PROTECAO_IMAGE,
    },
    {
      name: 'R14 Teflon',
      product: {
        sku: '4592',
        name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI',
        brand: 'KORAX',
      },
      expectedImg: R14_TEFLON_IMAGE,
    },
    {
      name: 'Saída Tanquinho',
      product: {
        sku: '4529',
        name: 'MANGUEIRA SAIDA TANQUINHO 1,5M',
        brand: '',
      },
      expectedImg: SAIDA_TANQUINHO_IMAGE,
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
    if (res === SAIDA_CORRUGADA_BRANCA_IMAGE && line.name !== 'Saída Corrugada Branca') {
      throw new Error(
        `Linha anterior ${line.name} indevidamente pegou SAIDA_CORRUGADA_BRANCA_IMAGE`,
      )
    }
    if (res === SUCCAO_LARANJA_IMAGE && line.name !== 'Sucção Laranja / Pesada') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou SUCCAO_LARANJA_IMAGE`)
    }
    if (res === VACUO_AR_CINZA_IMAGE && line.name !== 'Sucção Cinza / Vácuo Ar Cinza') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou VACUO_AR_CINZA_IMAGE`)
    }
    if (res === SUCCAO_AZUL_IMAGE) {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou SUCCAO_AZUL_IMAGE`)
    }
    if (res === VACUO_AR_PRETA_IMAGE) {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou VACUO_AR_PRETA_IMAGE`)
    }
    if (res === ALUMINIO_PROTECAO_IMAGE && line.name !== 'Alumínio Proteção') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou ALUMINIO_PROTECAO_IMAGE`)
    }
    if (res === R14_TEFLON_IMAGE && line.name !== 'R14 Teflon') {
      throw new Error(`Linha anterior ${line.name} indevidamente pegou R14_TEFLON_IMAGE`)
    }
    if (res === SAIDA_TANQUINHO_IMAGE && line.name !== 'Saída Tanquinho') {
      throw new Error(`Linha ${line.name} indevidamente pegou SAIDA_TANQUINHO_IMAGE`)
    }
  }

  // --- Validação da Linha Mangueira R14 Teflon Korax (20ª regra / nova linha fotografada) ---
  // Casos positivos reais dos 6 SKUs no PocketBase:
  const r14TeflonPositiveCases = [
    { sku: '2391', name: 'MANGUEIRA R14 3/16" TEFLON 1.520 PSI', brand: 'KORAX' },
    { sku: '5351', name: 'MANGUEIRA R14 1/4" TEFLON 1.520 PSI', brand: 'KORAX' },
    { sku: '3273', name: 'MANGUEIRA R14 5/16" TEFLON 1.520 PSI', brand: 'Korax' },
    { sku: '2390', name: 'MANGUEIRA R14 13/32" TEFLON 1.520 PSI', brand: 'KORAX' },
    { sku: '4592', name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI', brand: 'KORAX' },
    { sku: '352', name: 'MANGUEIRA R14 5/8" TEFLON 1.520 PSI', brand: 'KORAX' },
    // Variações de case, formato e descrição:
    { sku: '9401', name: 'mangueira r14 teflon 1/2"', brand: 'korax' },
    { sku: '9402', name: 'MANGUEIRA TEFLON R14 3/4" 1500 PSI', brand: 'KORAX' },
    { sku: '9403', name: 'TUBO R14 TEFLON INOX', brand: 'Korax' },
    {
      sku: '9404',
      name: 'MANGUEIRA HIDRÁULICA',
      description: 'Mangueira R14 teflon com malha inox korax',
      brand: 'KORAX',
    },
  ]

  for (const item of r14TeflonPositiveCases) {
    if (!isR14Teflon(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isR14Teflon`)
    }
    // Blindada Gás FG e Alumínio Proteção NÃO devem casar com produtos R14
    if (isBlindadaGasFg(item)) {
      throw new Error(`Item R14 ${item.sku} NÃO deve casar com isBlindadaGasFg`)
    }
    if (isAluminioProtecao(item)) {
      throw new Error(`Item R14 ${item.sku} NÃO deve casar com isAluminioProtecao`)
    }
    if (getProductImage(item) !== R14_TEFLON_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou R14_TEFLON_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== R14_TEFLON_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [R14_TEFLON_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre R14_TEFLON_IMAGE
  const customImgR14 = {
    sku: '4592',
    name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI',
    brand: 'KORAX',
    image: 'https://exemplo.com/foto-especifica-r14.jpg',
  }
  if (getProductImage(customImgR14) !== 'https://exemplo.com/foto-especifica-r14.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre R14_TEFLON_IMAGE')
  }

  // Casos negativos estritos para R14 Teflon:
  // 1) R14 de OUTRA marca (ex: Balflex, Ibirá ou sem marca)
  // 2) Korax SEM R14 (ex: R1, R2, R17, Kobra)
  // 3) Korax R14 SEM Teflon
  // 4) Substrings não delimitadas como token (ex: PR14, R140, etc.)
  // 5) Outras mangueiras metálicas (Blindada Gás FG, Alumínio Proteção)
  const r14TeflonNegativeCases = [
    // Outra marca com R14 Teflon:
    {
      sku: '9410',
      name: 'MANGUEIRA R14 1/2" TEFLON',
      brand: 'BALFLEX',
    },
    {
      sku: '9411',
      name: 'MANGUEIRA R14 1/2" TEFLON',
      brand: 'IBIRA',
    },
    {
      sku: '9412',
      name: 'MANGUEIRA R14 1/2" TEFLON',
      brand: '',
    },
    // Korax mas NÃO é R14:
    {
      sku: '4982',
      name: 'MANGUEIRA R1 1/2" KOBRA',
      brand: 'KORAX',
    },
    {
      sku: '4985',
      name: 'MANGUEIRA R2 1/2" KOBRA',
      brand: 'KORAX',
    },
    {
      sku: '6689',
      name: 'MANGUEIRA R17 1/2" ELITE',
      brand: 'KORAX',
    },
    {
      sku: '9413',
      name: 'MANGUEIRA R12 3/4" KOBRA',
      brand: 'KORAX',
    },
    {
      sku: '9414',
      name: 'MANGUEIRA R2 TEFLON 1/2"',
      brand: 'KORAX',
    },
    {
      sku: '9415',
      name: 'MANGUEIRA R1 TEFLON 1/2"',
      brand: 'KORAX',
    },
    // Korax R14 mas SEM Teflon:
    {
      sku: '9416',
      name: 'MANGUEIRA R14 1/2" BORRACHA',
      brand: 'KORAX',
    },
    // Token boundary (não deve casar com R140, PR14):
    {
      sku: '9417',
      name: 'MANGUEIRA PR14 TEFLON 1/2"',
      brand: 'KORAX',
    },
    {
      sku: '9418',
      name: 'MANGUEIRA R140 TEFLON 1/2"',
      brand: 'KORAX',
    },
    // Blindada Gás FG Contuflex:
    {
      sku: '6757',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 0,6 METRO',
      brand: 'CONTUFLEX',
    },
    // Alumínio Proteção:
    {
      sku: '6354',
      name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT',
      brand: '',
    },
  ]

  for (const item of r14TeflonNegativeCases) {
    if (isR14Teflon(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isR14Teflon`)
    }
    if (getProductImage(item) === R14_TEFLON_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar R14_TEFLON_IMAGE`)
    }
  }

  // --- Validação da Linha Sucção Azul / Vácuo Ar Azul (20ª linha fotografada) ---
  // Casos positivos reais dos 7 SKUs no banco de dados e variações de acento/case:
  const succaoAzulPositiveCases = [
    { sku: '2747', name: 'MANGUEIRA SUCÇAO 3" AZUL', brand: 'KANAFLEX' },
    { sku: '9023', name: 'MANGUEIRA VACUO AR 12" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '8093', name: 'MANGUEIRA VACUO AR 2" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '3064', name: 'MANGUEIRA VACUO AR 2.1/2" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '2977', name: 'MANGUEIRA VACUO AR 2.1/2" KEV AZUL REFORÇADA', brand: 'KANAFLEX' },
    { sku: '5177', name: 'MANGUEIRA VACUO AR 4" KEL-S AZUL ESCURO', brand: 'KANAFLEX' },
    { sku: '2717', name: 'MANGUEIRA VACUO AR 5" KEL-S AZUL ESCURO', brand: 'KANAFLEX' },
    // Variações de case, formato e acentuação:
    { sku: '9601', name: 'MANGUEIRA SUCÇÃO 2" AZUL', brand: 'IBIRÁ' },
    { sku: '9602', name: 'mangueira sucção azul 3"', brand: '' },
    { sku: '9603', name: 'MANGUEIRA SUCCAO AZUL 4"', brand: 'GENÉRICA' },
    { sku: '9604', name: 'mangueira vacuo ar azul reforçada', brand: 'KANAFLEX' },
    { sku: '9605', name: 'MANGUEIRA VÁCUO AR AZUL ESCURO 3"', brand: '' },
    { sku: '9606', name: 'MANGUEIRA SUCÇÃO AZUL', brand: '' },
    { sku: '9607', name: 'MANGUEIRA VACUO AR AZUL', brand: '' },
  ]

  for (const item of succaoAzulPositiveCases) {
    if (!isSuccaoAzul(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isSuccaoAzul`)
    }
    // Não pode casar com vácuo ar cinza nem sucção laranja
    if (isSuccaoCinzaOuVacuoArCinza(item)) {
      throw new Error(
        `Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoCinzaOuVacuoArCinza`,
      )
    }
    if (isSuccaoLaranja(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoLaranja`)
    }
    if (getProductImage(item) !== SUCCAO_AZUL_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou SUCCAO_AZUL_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== SUCCAO_AZUL_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [SUCCAO_AZUL_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre SUCCAO_AZUL_IMAGE
  const customImgSuccaoAzul = {
    sku: '2747',
    name: 'MANGUEIRA SUCÇAO 3" AZUL',
    brand: 'KANAFLEX',
    image: 'https://exemplo.com/foto-especifica-azul.jpg',
  }
  if (getProductImage(customImgSuccaoAzul) !== 'https://exemplo.com/foto-especifica-azul.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre SUCCAO_AZUL_IMAGE')
  }

  // Precedência entre regras: Sucção Laranja tem prioridade sobre Azul em caso hipotético
  const hipoteticoLaranjaAzul = {
    sku: '9610',
    name: 'MANGUEIRA SUCÇAO AZUL E LARANJA PESADA',
    brand: 'IBIRA',
  }
  if (isSuccaoAzul(hipoteticoLaranjaAzul)) {
    throw new Error('Item com laranja/pesada não deve casar com isSuccaoAzul')
  }
  if (getProductImage(hipoteticoLaranjaAzul) !== SUCCAO_LARANJA_IMAGE) {
    throw new Error('Sucção Laranja deve prevalecer sobre Sucção Azul')
  }

  // Casos negativos obrigatórios para Sucção Azul:
  // 1) Sucções transparentes com espiral azul (ISAL, KKM, KM)
  // 2) Cinzas (IVCL, KEL-SC, KV e vácuo ar cinza)
  // 3) Laranjas (ISLP, sucção pesada)
  // 4) Pretas (KPU-BOR, KEL-SP), prata (SVE) e cobreada (IVPU)
  // 5) Produtos azuis que NÃO são sucção nem vácuo ar (chata flat, lava auto, jardim, irrigação)
  const succaoAzulNegativeCases = [
    // 1) Transparentes com espiral azul:
    { sku: '2212', name: 'MANGUEIRA SUCÇAO 1" ISAL TRANSPARENTE C/ ESPIRAL AZUL', brand: 'IBIRÁ' },
    {
      sku: '2208',
      name: 'MANGUEIRA SUCÇAO 1.1/4" ISAL TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'IBIRÁ',
    },
    {
      sku: '8450',
      name: 'MANGUEIRA SUCÇAO 1/2" ISAL TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'IBIRÁ',
    },
    { sku: '4202', name: 'MANGUEIRA SUCÇAO 2" ISAL TRANSPARENTE C/ ESPIRAL AZUL', brand: 'IBIRÁ' },
    {
      sku: '6763',
      name: 'MANGUEIRA SUCÇAO 2.1/2" ISAL TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'IBIRÁ',
    },
    { sku: '6469', name: 'MANGUEIRA SUCÇAO 3" ISAL TRANSPARENTE C/ ESPIRAL AZUL', brand: 'IBIRÁ' },
    {
      sku: '5021',
      name: 'MANGUEIRA SUCÇAO 3/4" ISAL TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'IBIRÁ',
    },
    {
      sku: '1688',
      name: 'MANGUEIRA SUCÇAO 2" KKM TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'KANAFLEX',
    },
    {
      sku: '2807',
      name: 'MANGUEIRA SUCÇAO 1.1/4" KKM TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'KANAFLEX',
    },
    {
      sku: '2749',
      name: 'MANGUEIRA SUCÇAO 1.1/2" KKM TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'KANAFLEX',
    },
    { sku: '2735', name: 'MANGUEIRA 1" KM TRANSPARENTE COM ESPIRAL AZUL', brand: 'KANAFLEX' },

    // 2) Cinzas:
    { sku: '2210', name: 'MANGUEIRA VACUO AR 1" IVCL CINZA', brand: 'IBIRÁ' },
    { sku: '1624', name: 'MANGUEIRA VACUO AR 1" KEL-SC CINZA', brand: 'KANAFLEX' },
    { sku: '4003', name: 'MANGUEIRA VACUO AR 1.3/4" KV CINZA REFORÇADA', brand: 'KANAFLEX' },
    { sku: '5022', name: 'MANGUEIRA VACUO AR 3/4"', brand: '' },

    // 3) Laranjas:
    { sku: '2745', name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA', brand: 'IBIRÁ' },
    { sku: '9502', name: 'MANGUEIRA SUCÇÃO PESADA', brand: 'KANAFLEX' },

    // 4) Pretas, prata e cobreada:
    { sku: '6293', name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '3168', name: 'MANGUEIRA VACUO AR 4" KPU-BOR PRETA', brand: 'KANAFLEX' },
    { sku: '4108', name: 'MANGUEIRA VACUO AR 1.1/4" SVE PRATA CONTINENTAL', brand: 'CONTINENTAL' },
    {
      sku: '9276',
      name: 'MANGUEIRA VACUO AR 1.1/2" IVPU PU-C TRANSPARENTE COBREADA',
      brand: 'IBIRÁ',
    },

    // 5) Azuis que NÃO são sucção nem vácuo ar:
    { sku: '4077', name: 'MANGUEIRA CHATA 2" AZUL FLAT', brand: 'IBIRÁ' },
    {
      sku: '6885',
      name: 'MANGUEIRA CHATA FLAT 1.1/2" KORFLEX AZUL 5 BAR CONDUÇAO DE AGUA',
      brand: 'KORAX',
    },
    { sku: '6532', name: 'MANGUEIRA CHATA FLAT 2" KORFLEX AZUL 5 BAR 100M', brand: 'KORAX' },
    { sku: '6534', name: 'MANGUEIRA CHATA FLAT 3" KORFLEX AZUL 5 BAR 100M', brand: 'KORAX' },
    { sku: '8416', name: 'MANGUEIRA CHATA FLAT 4" AZUL 20 BAR CONDUÇAO DE AGUA', brand: 'KORAX' },
    { sku: '529', name: 'MANGUEIRA LAVA AUTO 1/2" KORFLEX AZUL 1000 PSI', brand: 'KORAX' },
    { sku: '2554', name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 AZUL/PRETO', brand: 'SUNFLEX' },
    { sku: '8379', name: 'MANGUEIRA JARDIM 3/4" X 2.5MM PT200 AZUL/PRETO', brand: 'SUNFLEX' },
    { sku: '2497', name: 'MANGUEIRA JARDIM 1/2" X 3,0MM PT300 AZUL LISA', brand: 'SUNFLEX' },
    { sku: '9226', name: 'MANGUEIRA LISA IRRIGAÇÃO 3/4" PAREDE 3,0 MM AZUL 50M', brand: '' },
  ]

  for (const item of succaoAzulNegativeCases) {
    if (isSuccaoAzul(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoAzul`)
    }
    if (getProductImage(item) === SUCCAO_AZUL_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar SUCCAO_AZUL_IMAGE`)
    }
  }

  // --- Validação da Linha Lisa Irrigação (23ª linha fotografada) ---
  // Casos positivos reais dos 9 SKUs no banco de dados e variações de acento/case/ordem:
  const lisaIrrigacaoPositiveCases = [
    { sku: '861', name: 'MANGUEIRA LISA IRRIGAÇÃO 1" PAREDE 3,0 MM VERMELHO 100M', brand: '' },
    { sku: '860', name: 'MANGUEIRA LISA IRRIGAÇÃO 3/4" PAREDE 3,0 MM VERMELHO 100M', brand: '' },
    { sku: '8467', name: 'MANGUEIRA LISA IRRIGAÇÃO 3/4" PAREDE 3,0 MM VERMELHO 50M', brand: '' },
    { sku: '8650', name: 'MANGUEIRA LISA IRRIGAÇÃO 1" PAREDE 3,0 MM VERMELHO 50M', brand: '' },
    { sku: '6684', name: 'MANGUEIRA LISA IRRIGAÇÃO 1/2" PAREDE 3,0 MM VERMELHO 100M', brand: '' },
    { sku: '8468', name: 'MANGUEIRA LISA IRRIGAÇÃO 1/2" PAREDE 3,0 MM 50M', brand: '' },
    { sku: '813', name: 'MANGUEIRA LISA IRRIGAÇÃO 2" PAREDE 3,0 MM', brand: '' },
    { sku: '2784', name: 'MANGUEIRA LISA IRRIGAÇÃO 1.1/2" PAREDE 3,0 MM 50M', brand: '' },
    { sku: '9226', name: 'MANGUEIRA LISA IRRIGAÇÃO 3/4" PAREDE 3,0 MM AZUL 50M', brand: '' },
    // Variações de case, formato, acentuação e ordem:
    { sku: '9301', name: 'mangueira lisa irrigacao 1" 50m', brand: '' },
    { sku: '9302', name: 'MANGUEIRA IRRIGAÇÃO LISA 3/4"', brand: 'GENÉRICA' },
    { sku: '9303', name: 'mangueira irrigacao lisa parede 3mm', brand: '' },
    { sku: '9304', name: 'MANGUEIRA LISA PARA IRRIGAÇÃO AGRÍCOLA', brand: '' },
    {
      sku: '9305',
      name: 'MANGUEIRA AGRÍCOLA 1"',
      description: 'Mangueira lisa irrigação parede reforçada',
      brand: '',
    },
  ]

  for (const item of lisaIrrigacaoPositiveCases) {
    if (!isLisaIrrigacao(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isLisaIrrigacao`)
    }
    // Não deve casar com outras linhas de imagem
    if (isSuccaoAzul(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoAzul`)
    }
    if (isCristal(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isCristal`)
    }
    if (isR14Teflon(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isR14Teflon`)
    }
    if (getProductImage(item) !== LISA_IRRIGACAO_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou LISA_IRRIGACAO_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== LISA_IRRIGACAO_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [LISA_IRRIGACAO_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre LISA_IRRIGACAO_IMAGE
  const customImgLisaIrrigacao = {
    sku: '861',
    name: 'MANGUEIRA LISA IRRIGAÇÃO 1" PAREDE 3,0 MM VERMELHO 100M',
    image: 'https://exemplo.com/foto-especifica-irrigacao.jpg',
  }
  if (
    getProductImage(customImgLisaIrrigacao) !== 'https://exemplo.com/foto-especifica-irrigacao.jpg'
  ) {
    throw new Error('Imagem própria do produto deve ter precedência sobre LISA_IRRIGACAO_IMAGE')
  }

  // Casos negativos obrigatórios para Lisa Irrigação:
  // 1) Produtos que possuem "LISA" mas NÃO são irrigação:
  //    - R17 Balflex Lisa (10017, 5340, 8258)
  //    - Cristal Lisa (6980, 10033, 300, 4236, etc. - já têm foto própria Cristal)
  //    - Jardim Lisa (790 preta, 2497 azul)
  //    - Ar e Água Lisa / Euro (se houver)
  // 2) Produtos que possuem "IRRIGAÇÃO" mas NÃO são lisa (ex.: chata flat irrigação, gotejamento)
  // 3) Amostras das 21 linhas fotografadas anteriormente para garantir não-regressão
  const lisaIrrigacaoNegativeCases = [
    // 1) Tem LISA sem IRRIGAÇÃO:
    {
      sku: '10017',
      name: 'MANGUEIRA R17 1/2" BALPAC 3000 LISA 21 MPA / 3045 PSI / 210BAR',
      brand: 'BALFLEX',
    },
    {
      sku: '5340',
      name: 'MANGUEIRA R17 1/4" BALPAC 3000 LISA 22,5 MPA / 3263 PSI / 225 BAR',
      brand: 'BALFLEX',
    },
    {
      sku: '8258',
      name: 'MANGUEIRA R17 3/8" BALPAC 3000 LISA 21 MPA / 3045 PSI / 210 BAR',
      brand: 'BALFLEX',
    },
    { sku: '6980', name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS', brand: 'IBIRA' },
    { sku: '300', name: 'MANGUEIRA CRISTAL LISA 1" X 2,0MM 50 LBS', brand: 'IBIRÁ' },
    { sku: '790', name: 'MANGUEIRA JARDIM 1/2" X 3,0MM PT300 PRETA LISA', brand: 'SUNFLEX' },
    { sku: '2497', name: 'MANGUEIRA JARDIM 1/2" X 3,0MM PT300 AZUL LISA', brand: 'SUNFLEX' },
    { sku: '9310', name: 'MANGUEIRA AR E ÁGUA 300 5/16 LISA/EURO', brand: 'CONTINENTAL' },
    { sku: '9311', name: 'MANGUEIRA BORRACHA LISA 1/2"', brand: '' },

    // 2) Tem IRRIGAÇÃO sem LISA:
    { sku: '9320', name: 'MANGUEIRA CHATA FLAT IRRIGAÇÃO 2"', brand: 'KORAX' },
    { sku: '9321', name: 'TUBO GOTEJAMENTO IRRIGAÇÃO 16MM', brand: '' },
    { sku: '9322', name: 'MANGUEIRA PARA IRRIGAÇÃO ESPIRALADA 1"', brand: '' },

    // 3) Não-regressão das 21 linhas de catálogo anteriores:
    {
      sku: '4982',
      name: 'MANGUEIRA R1 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA1_IMAGE,
    },
    {
      sku: '4985',
      name: 'MANGUEIRA R2 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA2_IMAGE,
    },
    {
      sku: '3687',
      name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250',
      brand: 'IBIRÁ',
      expectedImg: CRISTAL_TRANCADA_IMAGE,
    },
    {
      sku: '8885',
      name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM',
      brand: 'IBIRÁ',
      expectedImg: SAIDA_DRENAGEM_IMAGE,
    },
    {
      sku: '8894',
      name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA',
      brand: '',
      expectedImg: SAIDA_CORRUGADA_BRANCA_IMAGE,
    },
    {
      sku: '4529',
      name: 'MANGUEIRA SAIDA TANQUINHO 1,5M',
      brand: '',
      expectedImg: SAIDA_TANQUINHO_IMAGE,
    },
    {
      sku: '2745',
      name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA',
      brand: 'IBIRÁ',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
    {
      sku: '2210',
      name: 'MANGUEIRA VACUO AR 1" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2747',
      name: 'MANGUEIRA SUCÇAO 3" AZUL',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '6354',
      name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT',
      brand: '',
      expectedImg: ALUMINIO_PROTECAO_IMAGE,
    },
    {
      sku: '4592',
      name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI',
      brand: 'KORAX',
      expectedImg: R14_TEFLON_IMAGE,
    },
  ]

  for (const item of lisaIrrigacaoNegativeCases) {
    if (isLisaIrrigacao(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isLisaIrrigacao`)
    }
    if (getProductImage(item) === LISA_IRRIGACAO_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar LISA_IRRIGACAO_IMAGE`)
    }
    if ('expectedImg' in item && item.expectedImg) {
      if (getProductImage(item) !== item.expectedImg) {
        throw new Error(
          `Item ${item.sku} (${item.name}) regressão detectada: esperava imagem dedicada`,
        )
      }
    }
  }

  // --- Validação da Linha Vácuo Ar Preta / Mangueira Sucção Preta (24ª linha fotografada) ---
  // Casos positivos reais dos 6 SKUs no banco de dados e variações de acento/case/palavras:
  const vacuoArPretaPositiveCases = [
    { sku: '6293', name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '8483', name: 'MANGUEIRA VACUO AR 1.1/4" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '5596', name: 'MANGUEIRA VACUO AR 2" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '9044', name: 'MANGUEIRA VACUO AR 4" KEL-SP PRETA', brand: 'KANAFLEX' },
    { sku: '3168', name: 'MANGUEIRA VACUO AR 4" KPU-BOR PRETA', brand: 'KANAFLEX' },
    { sku: '6281', name: 'MANGUEIRA VACUO AR 4" KPU-BOR PRETA', brand: 'KANAFLEX' },
    // Variações de case, formato, acentuação e termos "sucção preta":
    { sku: '9701', name: 'mangueira vacuo ar 2" kel-sp preta', brand: 'kanaflex' },
    { sku: '9702', name: 'MANGUEIRA VÁCUO AR PRETA 1.1/2"', brand: '' },
    { sku: '9703', name: 'MANGUEIRA SUCÇÃO PRETA 3"', brand: 'IBIRÁ' },
    { sku: '9704', name: 'MANGUEIRA SUCÇAO PRETO 2"', brand: '' },
    { sku: '9705', name: 'MANGUEIRA SUCCAO PRETA 4"', brand: 'GENÉRICA' },
    { sku: '9706', name: 'mangueira sucção preta', brand: '' },
    { sku: '9707', name: 'MANGUEIRA VACUO AR PRETO INDUSTRIAL', brand: 'OUTRA' },
    {
      sku: '9708',
      name: 'MANGUEIRA INDUSTRIAL 2"',
      description: 'Mangueira sucção preta corrugada para vácuo ar',
      brand: 'KANAFLEX',
    },
  ]

  for (const item of vacuoArPretaPositiveCases) {
    if (!isVacuoArPreta(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isVacuoArPreta`)
    }
    // Não pode casar com vácuo ar cinza, sucção laranja ou sucção azul
    if (isSuccaoCinzaOuVacuoArCinza(item)) {
      throw new Error(
        `Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoCinzaOuVacuoArCinza`,
      )
    }
    if (isSuccaoLaranja(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoLaranja`)
    }
    if (isSuccaoAzul(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isSuccaoAzul`)
    }
    if (getProductImage(item) !== VACUO_AR_PRETA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou VACUO_AR_PRETA_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== VACUO_AR_PRETA_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [VACUO_AR_PRETA_IMAGE]`)
    }
  }

  // Precedência de imagem própria sobre VACUO_AR_PRETA_IMAGE
  const customImgVacuoPreta = {
    sku: '6293',
    name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SP PRETA',
    brand: 'KANAFLEX',
    image: 'https://exemplo.com/foto-especifica-preta.jpg',
  }
  if (getProductImage(customImgVacuoPreta) !== 'https://exemplo.com/foto-especifica-preta.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre VACUO_AR_PRETA_IMAGE')
  }

  // Precedência entre regras: Sucção Laranja, Sucção Cinza e Sucção Azul prevalecem
  const hipoteticoLaranjaPreta = {
    sku: '9710',
    name: 'MANGUEIRA SUCÇÃO LARANJA E PRETA PESADA',
    brand: 'IBIRA',
  }
  if (isVacuoArPreta(hipoteticoLaranjaPreta)) {
    throw new Error('Item com sucção laranja não deve casar com isVacuoArPreta')
  }
  if (getProductImage(hipoteticoLaranjaPreta) !== SUCCAO_LARANJA_IMAGE) {
    throw new Error('Sucção Laranja deve prevalecer sobre Sucção Preta')
  }

  // Casos negativos obrigatórios para Vácuo Ar Preta / Sucção Preta:
  // 1) Mangueiras pretas que NÃO são sucção nem vácuo ar (Ar e Água, Jardim, etc.)
  // 2) Cinzas (IVCL, KEL-SC, KV, sem cor)
  // 3) Laranjas (ISLP, sucção pesada)
  // 4) Azuis (KEV, KEL-S, sucção azul)
  // 5) Transparente cobreada (IVPU) e prata (SVE Continental)
  // 6) Sucções transparentes com espiral e atóxicas (ISAL, KKM, ISAM)
  // 7) Todas as 22 linhas fotografadas anteriores (não-regressão completa)
  const vacuoArPretaNegativeCases = [
    // 1) Ar e Água Preta e Jardim Preta:
    { sku: '2953', name: 'MANGUEIRA AR E AGUA 5/8" PT300 PRETA', brand: 'IBIRA' },
    { sku: '1573', name: 'MANGUEIRA AR E AGUA 2" PRETA PT150', brand: 'IBIRA' },
    { sku: '1570', name: 'MANGUEIRA AR E AGUA 1.1/4" PT300 PRETA', brand: 'IBIRA' },
    { sku: '3842', name: 'MANGUEIRA AR E AGUA 1" PT300 PRETA', brand: 'IBIRÁ' },
    { sku: '3684', name: 'MANGUEIRA AR E AGUA 1/2" PT300 PRETO', brand: 'IBIRÁ' },
    { sku: '1572', name: 'MANGUEIRA AR E AGUA 1.1/2" PT150 PRETA', brand: 'IBIRÁ' },
    { sku: '7551', name: 'MANGUEIRA AR E AGUA 1/2" PT500 PRETA', brand: 'IBIRÁ' },
    { sku: '1415', name: 'MANGUEIRA AR E AGUA 1/4" PT300 PRETA', brand: 'IBIRÁ' },
    { sku: '6812', name: 'MANGUEIRA AR E AGUA 1/4" PT300 PRETA', brand: 'KANAFLEX' },
    { sku: '1639', name: 'MANGUEIRA AR E AGUA 5/8" PT300 PRETA', brand: 'KORAX' },
    { sku: '2554', name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 AZUL/PRETO', brand: 'SUNFLEX' },
    { sku: '5422', name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 VERDE/PRETO', brand: 'SUNFLEX' },
    { sku: '2510', name: 'MANGUEIRA JARDIM 1/2" X 2.5MM PT200 VINHO/ PRETO', brand: 'SUNFLEX' },
    { sku: '790', name: 'MANGUEIRA JARDIM 1/2" X 3,0MM PT300 PRETA LISA', brand: 'SUNFLEX' },
    { sku: '8379', name: 'MANGUEIRA JARDIM 3/4" X 2.5MM PT200 AZUL/PRETO', brand: 'SUNFLEX' },

    // 2) Cinzas (IVCL, KEL-SC, KV, SKUs 2210, 2209, 2751, 2752, 5533, 7519, 3040, 7031, 5240, 8649, 1624, 2748, 4278, 1880, 5241, 2753, 2420, 4504, 4003, 5090, 4715, 10018, e os sem cor 5022 e 1599):
    {
      sku: '2210',
      name: 'MANGUEIRA VACUO AR 1" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2209',
      name: 'MANGUEIRA VACUO AR 1.1/4" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2751',
      name: 'MANGUEIRA VACUO AR 1.1/2" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2752',
      name: 'MANGUEIRA VACUO AR 2" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '5533',
      name: 'MANGUEIRA VACUO AR 2.1/2" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '7519',
      name: 'MANGUEIRA VACUO AR 3" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '3040',
      name: 'MANGUEIRA VACUO AR 4" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '7031',
      name: 'MANGUEIRA VACUO AR 5" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '5240',
      name: 'MANGUEIRA VACUO AR 6" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '8649',
      name: 'MANGUEIRA VACUO AR 8" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '1624',
      name: 'MANGUEIRA VACUO AR 1" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2748',
      name: 'MANGUEIRA VACUO AR 1.1/4" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '4278',
      name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '1880',
      name: 'MANGUEIRA VACUO AR 2" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '5241',
      name: 'MANGUEIRA VACUO AR 2.1/2" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2753',
      name: 'MANGUEIRA VACUO AR 3" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2420',
      name: 'MANGUEIRA VACUO AR 4" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '4504',
      name: 'MANGUEIRA VACUO AR 6" KEL-SC CINZA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '4003',
      name: 'MANGUEIRA VACUO AR 1.3/4" KV CINZA REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '5090',
      name: 'MANGUEIRA VACUO AR 2" KV CINZA REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '4715',
      name: 'MANGUEIRA VACUO AR 4" KV CINZA REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '10018',
      name: 'MANGUEIRA VACUO AR 8" KV CINZA REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    { sku: '5022', name: 'MANGUEIRA VACUO AR 3/4"', brand: '', expectedImg: VACUO_AR_CINZA_IMAGE },
    {
      sku: '1599',
      name: 'MANGUEIRA VACUO AR 1.1/2"',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },

    // 3) Sucção/Vácuo Ar Laranja (SKUs 2745, 2746, 9072, 8212, 2383):
    {
      sku: '2745',
      name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA',
      brand: 'IBIRÁ',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
    {
      sku: '2746',
      name: 'MANGUEIRA SUCÇAO 2.1/2" ISLP LARANJA',
      brand: 'IBIRÁ',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
    {
      sku: '9072',
      name: 'MANGUEIRA SUCÇAO 4" ISLP LARANJA',
      brand: 'IBIRÁ',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
    {
      sku: '8212',
      name: 'MANGUEIRA SUCÇAO 6" ISLP LARANJA',
      brand: 'IBIRÁ',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
    {
      sku: '2383',
      name: 'MANGUEIRA SUCÇÃO LARANJA 3"',
      brand: '',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },

    // 4) Sucção/Vácuo Ar Azul (SKUs 2747, 8093, 3064, 2977, 9023, 5177, 2717):
    {
      sku: '2747',
      name: 'MANGUEIRA SUCÇAO 3" AZUL',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '8093',
      name: 'MANGUEIRA VACUO AR 2" KEV AZUL REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '3064',
      name: 'MANGUEIRA VACUO AR 2.1/2" KEV AZUL REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '2977',
      name: 'MANGUEIRA VACUO AR 2.1/2" KEV AZUL REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '9023',
      name: 'MANGUEIRA VACUO AR 12" KEV AZUL REFORÇADA',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '5177',
      name: 'MANGUEIRA VACUO AR 4" KEL-S AZUL ESCURO',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '2717',
      name: 'MANGUEIRA VACUO AR 5" KEL-S AZUL ESCURO',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },

    // 5) Vácuo Ar transparente cobreada (IVPU) e prata (SVE Continental):
    {
      sku: '9276',
      name: 'MANGUEIRA VACUO AR 1.1/2" IVPU PU-C TRANSPARENTE COBREADA',
      brand: 'IBIRÁ',
    },
    { sku: '9974', name: 'MANGUEIRA VACUO AR 2" IVPU PU-C TRANSPARENTE COBREADA', brand: 'IBIRÁ' },
    { sku: '4108', name: 'MANGUEIRA VACUO AR 1.1/4" SVE PRATA CONTINENTAL', brand: 'CONTINENTAL' },
    { sku: '4109', name: 'MANGUEIRA VACUO AR 1.1/4" SVE PRATA CONTINENTAL', brand: 'CONTINENTAL' },

    // 6) Sucções transparentes com espiral e atóxicas:
    { sku: '2212', name: 'MANGUEIRA SUCÇAO 1" ISAL TRANSPARENTE C/ ESPIRAL AZUL', brand: 'IBIRÁ' },
    {
      sku: '1688',
      name: 'MANGUEIRA SUCÇAO 2" KKM TRANSPARENTE C/ ESPIRAL AZUL',
      brand: 'KANAFLEX',
    },
    { sku: '8449', name: 'MANGUEIRA SUCÇAO 1" ISAM ATOXICA ARAME METAL', brand: 'IBIRÁ' },
    {
      sku: '8675',
      name: 'MANGUEIRA SUCÇAO 1" KA ATOXICA TRANSPARENTE ESPIRAL BRANCO',
      brand: 'KANAFLEX',
    },

    // 7) Todas as 22 linhas de catálogo anteriores (não-regressão):
    {
      sku: '9810',
      name: 'MANGUEIRA BALFLEX FORZA UNO TROPIC 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_UNO_TROPIC_IMAGE,
    },
    {
      sku: '9811',
      name: 'MANGUEIRA BALFLEX FORZA UNO 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_UNO_IMAGE,
    },
    {
      sku: '9812',
      name: 'MANGUEIRA BALFLEX FORZA DUE TROPIC 3/8"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_DUE_TROPIC_IMAGE,
    },
    {
      sku: '9813',
      name: 'MANGUEIRA BALFLEX FORZA DUE 3/8"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_DUE_IMAGE,
    },
    {
      sku: '9814',
      name: 'MANGUEIRA BALFLEX TEXMASTER 2 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_TEXMASTER_IMAGE,
    },
    {
      sku: '9815',
      name: 'MANGUEIRA BALFLEX R6 MULTIPURPOSE 1/4"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_R6_MULTIPURPOSE_IMAGE,
    },
    {
      sku: '4982',
      name: 'MANGUEIRA R1 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA1_IMAGE,
    },
    {
      sku: '4985',
      name: 'MANGUEIRA R2 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA2_IMAGE,
    },
    {
      sku: '9816',
      name: 'MANGUEIRA BALFLEX FUEL PUMP 3/4"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FUEL_PUMP_IMAGE,
    },
    {
      sku: '9817',
      name: 'MANGUEIRA BALFLEX SUPERSTEAM 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_SUPERSTEAM_IMAGE,
    },
    {
      sku: '6757',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 0,6 METRO',
      brand: 'CONTUFLEX',
      expectedImg: BLINDADA_GAS_FG_IMAGE,
    },
    {
      sku: '3687',
      name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250',
      brand: 'IBIRÁ',
      expectedImg: CRISTAL_TRANCADA_IMAGE,
    },
    {
      sku: '6980',
      name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS',
      brand: 'IBIRA',
      expectedImg: CRISTAL_IMAGE,
    },
    {
      sku: '8885',
      name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM',
      brand: 'IBIRÁ',
      expectedImg: SAIDA_DRENAGEM_IMAGE,
    },
    {
      sku: '8894',
      name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA',
      brand: '',
      expectedImg: SAIDA_CORRUGADA_BRANCA_IMAGE,
    },
    {
      sku: '4529',
      name: 'MANGUEIRA SAIDA TANQUINHO 1,5M',
      brand: '',
      expectedImg: SAIDA_TANQUINHO_IMAGE,
    },
    {
      sku: '6354',
      name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT',
      brand: '',
      expectedImg: ALUMINIO_PROTECAO_IMAGE,
    },
    {
      sku: '4592',
      name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI',
      brand: 'KORAX',
      expectedImg: R14_TEFLON_IMAGE,
    },
    {
      sku: '861',
      name: 'MANGUEIRA LISA IRRIGAÇÃO 1" PAREDE 3,0 MM VERMELHO 100M',
      brand: '',
      expectedImg: LISA_IRRIGACAO_IMAGE,
    },
  ]

  for (const item of vacuoArPretaNegativeCases) {
    if (isVacuoArPreta(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isVacuoArPreta`)
    }
    if (getProductImage(item) === VACUO_AR_PRETA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar VACUO_AR_PRETA_IMAGE`)
    }
    if ('expectedImg' in item && item.expectedImg) {
      if (getProductImage(item) !== item.expectedImg) {
        throw new Error(
          `Item ${item.sku} (${item.name}) regressão detectada: esperava imagem dedicada`,
        )
      }
    }
  }

  // --- Validação da Linha MANGUEIRA GAS GNV/GLP/GN PRETA LONADA (25ª linha fotografada) ---
  // Casos positivos reais confirmados no banco de dados (SKUs 1960, 5737, 1966, 1073):
  const gasLonadaPretaPositiveCases = [
    { sku: '1960', name: 'MANGUEIRA GAS GNV/GLP/GN 1/4" PRETA LONADA', brand: '' },
    { sku: '5737', name: 'MANGUEIRA GAS GNV/GLP/GN 5/16" PRETA LONADA', brand: '' },
    { sku: '1966', name: 'MANGUEIRA GAS GNV/GLP/GN 3/8" PRETA LONADA', brand: '' },
    { sku: '1073', name: 'MANGUEIRA GAS GNV/GLP/GN 1/2" PRETA LONADA', brand: '' },
    // Variações de case, formato, acentuação (GÁS) e descrição:
    { sku: '9850', name: 'mangueira gas gnv/glp/gn 1/4" preta lonada', brand: '' },
    { sku: '9851', name: 'MANGUEIRA GÁS LONADA PRETA 5/16"', brand: 'GENÉRICA' },
    { sku: '9852', name: 'MANGUEIRA LONADA PARA GÁS GLP 1/2"', brand: '' },
    { sku: '9853', name: 'MANGUEIRA LONADA GAS', brand: '' },
    {
      sku: '9854',
      name: 'MANGUEIRA AUTOMOTIVA 3/8"',
      description: 'Mangueira gas gnv preta lonada para alta pressao',
      brand: '',
    },
  ]

  for (const item of gasLonadaPretaPositiveCases) {
    if (!isGasLonadaPreta(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isGasLonadaPreta`)
    }
    // Não pode casar com outras linhas de imagem
    if (isBlindadaGasFg(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isBlindadaGasFg`)
    }
    if (isVacuoArPreta(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isVacuoArPreta`)
    }
    if (isLisaIrrigacao(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isLisaIrrigacao`)
    }
    if (getProductImage(item) !== GAS_LONADA_PRETA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou GAS_LONADA_PRETA_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== GAS_LONADA_PRETA_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [GAS_LONADA_PRETA_IMAGE]`)
    }
  }

  // Precedência de imagem própria cadastrada sobre GAS_LONADA_PRETA_IMAGE
  const customImgGasLonada = {
    sku: '1960',
    name: 'MANGUEIRA GAS GNV/GLP/GN 1/4" PRETA LONADA',
    image: 'https://exemplo.com/foto-especifica-gas-lonada.jpg',
  }
  if (
    getProductImage(customImgGasLonada) !== 'https://exemplo.com/foto-especifica-gas-lonada.jpg'
  ) {
    throw new Error('Imagem própria do produto deve ter precedência sobre GAS_LONADA_PRETA_IMAGE')
  }

  // Casos negativos obrigatórios para Gás Lonada Preta:
  // 1) "MANGUEIRA GAS PVC 3/8" PT-250 9K C/ TARJA" (SKU 1946) — é gás mas NÃO é lonada
  // 2) Blindada Gás FG (Contuflex) — mantém a foto própria da linha dela; não pode casar com isGasLonadaPreta nem perder sua imagem
  // 3) Produtos com "lonada" sem "gás"
  // 4) Produtos com "gás" sem "lonada"
  // 5) Não-regressão de todas as 23 linhas fotografadas anteriormente
  const gasLonadaPretaNegativeCases = [
    // 1) SKU 1946: gás pvc com tarja sem lonada
    {
      sku: '1946',
      name: 'MANGUEIRA GAS PVC 3/8" PT-250 9K C/ TARJA',
      brand: '',
    },
    // 2) Blindada Gás FG (SKUs reais do catálogo)
    {
      sku: '6757',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 0,6 METRO',
      brand: 'CONTUFLEX',
      expectedImg: BLINDADA_GAS_FG_IMAGE,
    },
    {
      sku: '5882',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 1,2 METROS',
      brand: 'CONTUFLEX',
      expectedImg: BLINDADA_GAS_FG_IMAGE,
    },
    {
      sku: '5881',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 1,0 METRO',
      brand: 'CONTUFLEX',
      expectedImg: BLINDADA_GAS_FG_IMAGE,
    },
    // 3) Tem "lonada" sem "gás":
    {
      sku: '9860',
      name: 'MANGUEIRA DE BORRACHA LONADA 1/2" PARA AGUA',
      brand: '',
    },
    {
      sku: '9861',
      name: 'CORREIA LONADA INDUSTRIAL',
      brand: '',
    },
    {
      sku: '9862',
      name: 'LONA LONADA IMPERMEAVEL 4X4',
      brand: '',
    },
    // 4) Tem "gás" sem "lonada":
    {
      sku: '9863',
      name: 'REGULADOR DE GAS GLP BAIXA PRESSAO',
      brand: '',
    },
    {
      sku: '9864',
      name: 'MANGUEIRA PARA GAS BUTANO REFORCADA',
      brand: '',
    },
    {
      sku: '9865',
      name: 'TUBO COBRE PARA GÁS 3/8"',
      brand: '',
    },
    // 5) Não-regressão de amostras de todas as linhas de catálogo anteriores:
    {
      sku: '9810',
      name: 'MANGUEIRA BALFLEX FORZA UNO TROPIC 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_UNO_TROPIC_IMAGE,
    },
    {
      sku: '9811',
      name: 'MANGUEIRA BALFLEX FORZA UNO 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_UNO_IMAGE,
    },
    {
      sku: '9812',
      name: 'MANGUEIRA BALFLEX FORZA DUE TROPIC 3/8"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_DUE_TROPIC_IMAGE,
    },
    {
      sku: '9813',
      name: 'MANGUEIRA BALFLEX FORZA DUE 3/8"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_DUE_IMAGE,
    },
    {
      sku: '9814',
      name: 'MANGUEIRA BALFLEX TEXMASTER 2 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_TEXMASTER_IMAGE,
    },
    {
      sku: '9815',
      name: 'MANGUEIRA BALFLEX R6 MULTIPURPOSE 1/4"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_R6_MULTIPURPOSE_IMAGE,
    },
    {
      sku: '4982',
      name: 'MANGUEIRA R1 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA1_IMAGE,
    },
    {
      sku: '4985',
      name: 'MANGUEIRA R2 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA2_IMAGE,
    },
    {
      sku: '9816',
      name: 'MANGUEIRA BALFLEX FUEL PUMP 3/4"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FUEL_PUMP_IMAGE,
    },
    {
      sku: '9817',
      name: 'MANGUEIRA BALFLEX SUPERSTEAM 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_SUPERSTEAM_IMAGE,
    },
    {
      sku: '3687',
      name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250',
      brand: 'IBIRÁ',
      expectedImg: CRISTAL_TRANCADA_IMAGE,
    },
    {
      sku: '6980',
      name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS',
      brand: 'IBIRA',
      expectedImg: CRISTAL_IMAGE,
    },
    {
      sku: '8885',
      name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM',
      brand: 'IBIRÁ',
      expectedImg: SAIDA_DRENAGEM_IMAGE,
    },
    {
      sku: '8894',
      name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA',
      brand: '',
      expectedImg: SAIDA_CORRUGADA_BRANCA_IMAGE,
    },
    {
      sku: '4529',
      name: 'MANGUEIRA SAIDA TANQUINHO 1,5M',
      brand: '',
      expectedImg: SAIDA_TANQUINHO_IMAGE,
    },
    {
      sku: '2745',
      name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA',
      brand: 'IBIRÁ',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
    {
      sku: '2210',
      name: 'MANGUEIRA VACUO AR 1" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '5022',
      name: 'MANGUEIRA VACUO AR 3/4"',
      brand: '',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '1599',
      name: 'MANGUEIRA VACUO AR 1.1/2"',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2747',
      name: 'MANGUEIRA SUCÇAO 3" AZUL',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '6293',
      name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SP PRETA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_PRETA_IMAGE,
    },
    {
      sku: '6354',
      name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT',
      brand: '',
      expectedImg: ALUMINIO_PROTECAO_IMAGE,
    },
    {
      sku: '4592',
      name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI',
      brand: 'KORAX',
      expectedImg: R14_TEFLON_IMAGE,
    },
    {
      sku: '861',
      name: 'MANGUEIRA LISA IRRIGAÇÃO 1" PAREDE 3,0 MM VERMELHO 100M',
      brand: '',
      expectedImg: LISA_IRRIGACAO_IMAGE,
    },
  ]

  for (const item of gasLonadaPretaNegativeCases) {
    if (isGasLonadaPreta(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isGasLonadaPreta`)
    }
    if (getProductImage(item) === GAS_LONADA_PRETA_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar GAS_LONADA_PRETA_IMAGE`)
    }
    if ('expectedImg' in item && item.expectedImg) {
      if (getProductImage(item) !== item.expectedImg) {
        throw new Error(
          `Item ${item.sku} (${item.name}) regressão detectada: esperava imagem dedicada`,
        )
      }
    }
  }

  // --- Validação da Linha MANGUEIRA GÁS / FLEXÍVEL PVC (26ª linha fotografada) ---
  // Casos positivos reais e variações baseados na regra da usuária:
  // "mangueira flexivel pvc", "mangueira pvc gas", "mangueira gas pvc"
  // SKU 1946 real do banco: "MANGUEIRA GAS PVC 3/8\" PT-250 9K C/ TARJA"
  const gasPvcPositiveCases = [
    {
      sku: '1946',
      name: 'MANGUEIRA GAS PVC 3/8" PT-250 9K C/ TARJA',
      brand: '',
    },
    // Variações de case, ordem de palavras e acentuação:
    {
      sku: '9870',
      name: 'mangueira gas pvc 3/8"',
      brand: '',
    },
    {
      sku: '9871',
      name: 'MANGUEIRA PVC GÁS 1/2" REFORÇADA',
      brand: 'GENÉRICA',
    },
    {
      sku: '9872',
      name: 'mangueira pvc gas amarela',
      brand: '',
    },
    {
      sku: '9873',
      name: 'MANGUEIRA FLEXÍVEL PVC 1/2"',
      brand: '',
    },
    {
      sku: '9874',
      name: 'mangueira flexivel pvc para gás',
      brand: '',
    },
    {
      sku: '9875',
      name: 'MANGUEIRA PVC FLEXIVEL 3/4"',
      brand: 'KORAX',
    },
    {
      sku: '9876',
      name: 'MANGUEIRA PARA GÁS GLP EM PVC',
      brand: '',
    },
    {
      sku: '9877',
      name: 'MANGUEIRA INDUSTRIAL 3/8"',
      description: 'Mangueira flexivel pvc amarela com tarja para gas',
      brand: '',
    },
  ]

  for (const item of gasPvcPositiveCases) {
    if (!isGasPvc(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) deveria casar com isGasPvc`)
    }
    // Não pode casar com outras linhas de imagem
    if (isBlindadaGasFg(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isBlindadaGasFg`)
    }
    if (isGasLonadaPreta(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isGasLonadaPreta`)
    }
    if (isVacuoArPreta(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isVacuoArPreta`)
    }
    if (isLisaIrrigacao(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isLisaIrrigacao`)
    }
    if (getProductImage(item) !== GAS_PVC_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) não retornou GAS_PVC_IMAGE`)
    }
    const imgs = getProductImages(item)
    if (imgs.length !== 1 || imgs[0] !== GAS_PVC_IMAGE) {
      throw new Error(`Item ${item.sku} galeria não retornou [GAS_PVC_IMAGE]`)
    }
  }

  // Precedência de imagem própria cadastrada sobre GAS_PVC_IMAGE
  const customImgGasPvc = {
    sku: '1946',
    name: 'MANGUEIRA GAS PVC 3/8" PT-250 9K C/ TARJA',
    image: 'https://exemplo.com/foto-especifica-gas-pvc.jpg',
  }
  if (getProductImage(customImgGasPvc) !== 'https://exemplo.com/foto-especifica-gas-pvc.jpg') {
    throw new Error('Imagem própria do produto deve ter precedência sobre GAS_PVC_IMAGE')
  }

  // Precedência de Gas Lonada Preta caso um produto hipotético cite "GAS PVC LONADA":
  // Gas Lonada Preta foi posicionada antes na cadeia e deve ter prioridade.
  const hipoteticoLonadaPvc = {
    sku: '9878',
    name: 'MANGUEIRA GAS PVC PRETA LONADA 1/2"',
    brand: '',
  }
  if (!isGasLonadaPreta(hipoteticoLonadaPvc)) {
    throw new Error('Produto hipotético com gas e lonada deveria casar com isGasLonadaPreta')
  }
  if (getProductImage(hipoteticoLonadaPvc) !== GAS_LONADA_PRETA_IMAGE) {
    throw new Error(
      'GAS_LONADA_PRETA_IMAGE deve ter precedência sobre GAS_PVC_IMAGE quando ambas casarem',
    )
  }

  // Precedência de Blindada Gás FG:
  const hipoteticoBlindadaPvc = {
    sku: '9879',
    name: 'MANGUEIRA BLINDADA GAS FG 1/2" REVESTIDA EM PVC',
    brand: 'CONTUFLEX',
  }
  if (!isBlindadaGasFg(hipoteticoBlindadaPvc)) {
    throw new Error('Produto blindada fg deveria casar com isBlindadaGasFg')
  }
  if (getProductImage(hipoteticoBlindadaPvc) !== BLINDADA_GAS_FG_IMAGE) {
    throw new Error(
      'BLINDADA_GAS_FG_IMAGE deve ter precedência sobre GAS_PVC_IMAGE quando ambas casarem',
    )
  }

  // Casos negativos obrigatórios para Gás / Flexível PVC:
  // - Os 4 SKUs da Gas Lonada (1960, 5737, 1966, 1073): mantêm foto Lonada
  // - SKU 1236: "MANGUEIRA FLEXIVEL 1.1/2\" PVC ESPIRAL AÇO" — casaria com flexivel+pvc MAS não tem tarja amarela de gás?
  //   Atenção: verificar se SKU 1236, 2891, 4903, 6207 NÃO devem casar com isGasPvc!
  // - Produtos com "PVC" isolado sem gás/flexível (ex.: SKU 2234, 6407)
  // - Produtos com "gás" isolado sem PVC (ex.: lonadas, reguladores)
  // - Produtos com "flexível" isolado sem PVC (ex.: flexível alumínio SKU 6354)
  const gasPvcNegativeCases = [
    // 4 SKUs da Gás Lonada Preta (mantêm GAS_LONADA_PRETA_IMAGE, não citam PVC)
    {
      sku: '1960',
      name: 'MANGUEIRA GAS GNV/GLP/GN 1/4" PRETA LONADA',
      brand: '',
      expectedImg: GAS_LONADA_PRETA_IMAGE,
    },
    {
      sku: '5737',
      name: 'MANGUEIRA GAS GNV/GLP/GN 5/16" PRETA LONADA',
      brand: '',
      expectedImg: GAS_LONADA_PRETA_IMAGE,
    },
    {
      sku: '1966',
      name: 'MANGUEIRA GAS GNV/GLP/GN 3/8" PRETA LONADA',
      brand: '',
      expectedImg: GAS_LONADA_PRETA_IMAGE,
    },
    {
      sku: '1073',
      name: 'MANGUEIRA GAS GNV/GLP/GN 1/2" PRETA LONADA',
      brand: '',
      expectedImg: GAS_LONADA_PRETA_IMAGE,
    },
    // Casos negativos citados explicitamente na tarefa:
    // SKU 1236: MANGUEIRA FLEXIVEL 1.1/2" PVC ESPIRAL AÇO (PVC espiral de aço)
    {
      sku: '1236',
      name: 'MANGUEIRA FLEXIVEL 1.1/2" PVC ESPIRAL AÇO',
      brand: 'KANAFLEX',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // SKU 2891: MANGUEIRA FLEXIVEL 2" PVC LARANJA / TRANSPARENTE
    {
      sku: '2891',
      name: 'MANGUEIRA FLEXIVEL 2" PVC LARANJA / TRANSPARENTE',
      brand: 'KANAFLEX',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // SKU 4903: MANGUEIRA FLEXIVEL 2" KPU-Z (flexível sem pvc)
    {
      sku: '4903',
      name: 'MANGUEIRA FLEXIVEL 2" KPU-Z',
      brand: 'KANAFLEX',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // SKU 6207: MANGUEIRA FLEXIVEL 1.1/2" KAT ATOXICA (flexível sem pvc)
    {
      sku: '6207',
      name: 'MANGUEIRA FLEXIVEL 1.1/2" KAT ATOXICA',
      brand: 'KANAFLEX',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // SKU 2234: PVC sem gás nem flexível
    {
      sku: '2234',
      name: 'MANGUEIRA CHUVEIRO 5/16" X 1,3MM PVC BRANCA',
      brand: '',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // SKU 6407: CRISTAL PT250 PVC (tem regra própria Cristal Liso)
    {
      sku: '6407',
      name: 'MANGUEIRA CRISTAL 1/2" PVC PT250 ATOXICA',
      brand: 'KANAFLEX',
      expectedImg: CRISTAL_IMAGE,
    },
    // Blindada Gás FG (mantém BLINDADA_GAS_FG_IMAGE)
    {
      sku: '6757',
      name: 'MANGUEIRA BLINDADA GAS FG 1/2" X MF 1/2" - 0,6 METRO',
      brand: 'CONTUFLEX',
      expectedImg: BLINDADA_GAS_FG_IMAGE,
    },
    // Flexível Alumínio (mantém ALUMINIO_PROTECAO_IMAGE, flexível sem PVC)
    {
      sku: '6354',
      name: 'MANGUEIRA FLEXIVEL ALUMINIO PROTEÇÃO 24MM INT',
      brand: '',
      expectedImg: ALUMINIO_PROTECAO_IMAGE,
    },
    // Gás isolado sem PVC
    {
      sku: '9880',
      name: 'REGULADOR DE GAS GLP BAIXA PRESSAO',
      brand: '',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    {
      sku: '9881',
      name: 'TUBO COBRE PARA GÁS 3/8"',
      brand: '',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // PVC isolado sem gás nem flexível
    {
      sku: '9882',
      name: 'TUBO PVC ESGOTO 100MM',
      brand: 'TIGRE',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    {
      sku: '9883',
      name: 'CURVA 90 PVC MARROM 25MM',
      brand: '',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // Flexível isolado sem PVC
    {
      sku: '9884',
      name: 'ENGATE FLEXIVEL INOX 40CM 1/2"',
      brand: '',
      expectedImg: DEFAULT_PRODUCT_PLACEHOLDER,
    },
    // Amostras de não-regressão de outras linhas
    {
      sku: '9810',
      name: 'MANGUEIRA BALFLEX FORZA UNO TROPIC 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_UNO_TROPIC_IMAGE,
    },
    {
      sku: '9811',
      name: 'MANGUEIRA BALFLEX FORZA UNO 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_UNO_IMAGE,
    },
    {
      sku: '9812',
      name: 'MANGUEIRA BALFLEX FORZA DUE TROPIC 3/8"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_DUE_TROPIC_IMAGE,
    },
    {
      sku: '9813',
      name: 'MANGUEIRA BALFLEX FORZA DUE 3/8"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_FORZA_DUE_IMAGE,
    },
    {
      sku: '9814',
      name: 'MANGUEIRA BALFLEX TEXMASTER 2 1/2"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_TEXMASTER_IMAGE,
    },
    {
      sku: '9815',
      name: 'MANGUEIRA BALFLEX R6 MULTIPURPOSE 1/4"',
      brand: 'BALFLEX',
      expectedImg: BALFLEX_R6_MULTIPURPOSE_IMAGE,
    },
    {
      sku: '4982',
      name: 'MANGUEIRA R1 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA1_IMAGE,
    },
    {
      sku: '4985',
      name: 'MANGUEIRA R2 1/2" KOBRA',
      brand: 'KORAX',
      expectedImg: KORAX_KOBRA2_IMAGE,
    },
    {
      sku: '3687',
      name: 'MANGUEIRA CRISTAL TRANÇADA 1" PT250',
      brand: 'IBIRÁ',
      expectedImg: CRISTAL_TRANCADA_IMAGE,
    },
    {
      sku: '6980',
      name: 'MANGUEIRA CRISTAL LISA 1/4" X 2.0MM 50 LBS',
      brand: 'IBIRA',
      expectedImg: CRISTAL_IMAGE,
    },
    {
      sku: '8885',
      name: 'MANGUEIRA SAIDA DRENAGEM 1,55M CINZA BOCAL RETO 22MM',
      brand: 'IBIRÁ',
      expectedImg: SAIDA_DRENAGEM_IMAGE,
    },
    {
      sku: '8894',
      name: 'MANGUEIRA SAIDA CORRUGADA 1,30M 3/4" BRANCA',
      brand: '',
      expectedImg: SAIDA_CORRUGADA_BRANCA_IMAGE,
    },
    {
      sku: '4529',
      name: 'MANGUEIRA SAIDA TANQUINHO 1,5M',
      brand: '',
      expectedImg: SAIDA_TANQUINHO_IMAGE,
    },
    {
      sku: '2745',
      name: 'MANGUEIRA SUCÇAO 2" ISLP LARANJA',
      brand: 'IBIRÁ',
      expectedImg: SUCCAO_LARANJA_IMAGE,
    },
    {
      sku: '2210',
      name: 'MANGUEIRA VACUO AR 1" IVCL CINZA',
      brand: 'IBIRÁ',
      expectedImg: VACUO_AR_CINZA_IMAGE,
    },
    {
      sku: '2747',
      name: 'MANGUEIRA SUCÇAO 3" AZUL',
      brand: 'KANAFLEX',
      expectedImg: SUCCAO_AZUL_IMAGE,
    },
    {
      sku: '6293',
      name: 'MANGUEIRA VACUO AR 1.1/2" KEL-SP PRETA',
      brand: 'KANAFLEX',
      expectedImg: VACUO_AR_PRETA_IMAGE,
    },
    {
      sku: '4592',
      name: 'MANGUEIRA R14 1/2" TEFLON 1.520 PSI',
      brand: 'KORAX',
      expectedImg: R14_TEFLON_IMAGE,
    },
    {
      sku: '861',
      name: 'MANGUEIRA LISA IRRIGAÇÃO 1" PAREDE 3,0 MM VERMELHO 100M',
      brand: '',
      expectedImg: LISA_IRRIGACAO_IMAGE,
    },
  ]

  for (const item of gasPvcNegativeCases) {
    if (isGasPvc(item)) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deveria casar com isGasPvc`)
    }
    if (getProductImage(item) === GAS_PVC_IMAGE) {
      throw new Error(`Item ${item.sku} (${item.name}) NÃO deve retornar GAS_PVC_IMAGE`)
    }
    if ('expectedImg' in item && item.expectedImg) {
      if (getProductImage(item) !== item.expectedImg) {
        throw new Error(
          `Item ${item.sku} (${item.name}) regressão detectada: esperava imagem dedicada`,
        )
      }
    }
  }

  return true
}

// Execução imediata no carregamento do módulo durante build/test
runProductImageSelfCheck()
