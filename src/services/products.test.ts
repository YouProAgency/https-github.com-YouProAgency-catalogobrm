import { isExcludedSku, isExcludedProduct } from './products'

export function runExcludedProductsSelfCheck() {
  // 1. SKU 1637 deve ser expressamente excluído
  if (!isExcludedSku('1637')) {
    throw new Error('isExcludedSku deve retornar true para o SKU 1637')
  }
  if (!isExcludedSku(' 1637 ')) {
    throw new Error('isExcludedSku deve tolerar espaços em branco para o SKU 1637')
  }

  // 2. SKU 2713 deve continuar excluído
  if (!isExcludedSku('2713')) {
    throw new Error('isExcludedSku deve retornar true para o SKU 2713')
  }
  if (!isExcludedSku(' 2713 ')) {
    throw new Error('isExcludedSku deve tolerar espaços em branco para o SKU 2713')
  }

  // 3. Outros produtos da linha R2 não podem ser afetados
  const validR2Skus = [
    '9197',
    '7715',
    '7620',
    '1256',
    '7806',
    '7642',
    '475',
    '7640',
    '7641',
    '6369',
  ]
  for (const sku of validR2Skus) {
    if (isExcludedSku(sku)) {
      throw new Error(`isExcludedSku retornou true indevidamente para o SKU legítimo R2 ${sku}`)
    }
    const item = {
      sku,
      name: `MANGUEIRA R2 ${sku}`,
      brand: 'BALFLEX',
      unit: 'MT',
    }
    if (isExcludedProduct(item)) {
      throw new Error(
        `isExcludedProduct retornou true indevidamente para o produto legítimo R2 ${sku}`,
      )
    }
  }

  // 4. isExcludedProduct deve bloquear o produto SKU 1637 completo
  const product1637 = {
    sku: '1637',
    name: 'MANGUEIRA R2 2" 80 BAR / 1160 PSI',
    category: 'MANGUEIRA HIDRAULICA',
    brand: '',
    unit: 'MT',
  }
  if (!isExcludedProduct(product1637)) {
    throw new Error('isExcludedProduct deve retornar true para o produto SKU 1637')
  }

  // 5. SKU 7970 (R5 Brakemaster) deve permanecer válido
  if (
    isExcludedSku('7970') ||
    isExcludedProduct({ sku: '7970', name: 'MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA' })
  ) {
    throw new Error('SKU 7970 foi incorretamente considerado excluído')
  }

  // 6. SKU 3273 (R14 Teflon Korax) deve permanecer válido
  if (
    isExcludedSku('3273') ||
    isExcludedProduct({ sku: '3273', name: 'MANGUEIRA R14 5/16" TEFLON 1.520 PSI', brand: 'Korax' })
  ) {
    throw new Error('SKU 3273 foi incorretamente considerado excluído')
  }

  return true
}

runExcludedProductsSelfCheck()
