import {
  isKoraxBrand,
  isKoraxKobra1,
  isKoraxKobra2,
  getProductImage,
  getProductImages,
  KORAX_KOBRA1_IMAGE,
  KORAX_KOBRA2_IMAGE,
  DEFAULT_PRODUCT_PLACEHOLDER,
} from './productImage'

/**
 * Validação em tempo de compilação e execução para as regras Kobra 1 e Kobra 2.
 * Garante cobertura dos 6 SKUs solicitados e casos de borda sem dependências externas.
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

  // Caso de borda: R12 KOBRA NÃO deve casar nem com Kobra 1 nem com Kobra 2
  const r12Product = { sku: '9999', name: 'MANGUEIRA R12 3/4" KOBRA', brand: 'KORAX' }
  if (isKoraxKobra1(r12Product)) {
    throw new Error('R12 KOBRA NÃO pode casar com Kobra 1')
  }
  if (isKoraxKobra2(r12Product)) {
    throw new Error('R12 KOBRA NÃO pode casar com Kobra 2')
  }
  if (getProductImage(r12Product) !== DEFAULT_PRODUCT_PLACEHOLDER) {
    throw new Error('R12 KOBRA deveria retornar placeholder default')
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

  return true
}

// Execução imediata no carregamento do módulo durante build/test
runProductImageSelfCheck()
