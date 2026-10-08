import {
  buildProductTitle,
  buildProductDescription,
  toAbsoluteImageUrl,
  DEFAULT_SEO,
  SITE_DOMAIN,
} from './seo'
import { Product } from '@/types'

export function runSeoSelfCheck() {
  const sampleProduct: Product = {
    id: 'prod123',
    sku: '1001',
    name: 'Mangueira Balflex Forza Due 2SN 1/2" — 5 metros',
    brand: 'Balflex',
    category: 'Mangueiras Hidráulicas',
    subcategory: 'Linha 2SN',
    unit: 'MT',
    price: 159.9,
    shortDescription: 'Linha alta pressão Forza Due',
    longDescription: 'Mangueira com 2 tramas de aço de alta resistência.',
    images: [],
    specs: {},
    featured: false,
  }

  // 1. Título do produto
  const title = buildProductTitle(sampleProduct)
  if (!title.includes('Mangueira Balflex Forza Due 2SN 1/2" — 5 metros')) {
    throw new Error(`Título inválido gerado: ${title}`)
  }
  if (!title.endsWith('— Catálogo BR Mangueiras')) {
    throw new Error(`Título sem sufixo padrão BR Mangueiras: ${title}`)
  }

  // 2. Descrição do produto
  const desc = buildProductDescription(sampleProduct)
  if (!desc.includes('WhatsApp (11) 9.4708-2171')) {
    throw new Error(`Descrição sem WhatsApp de contato: ${desc}`)
  }
  if (desc.length > 175) {
    throw new Error(`Descrição excedeu comprimento seguro (~160 chars): ${desc.length}`)
  }

  // 3. Teste específico para o SKU 7970 com a nova descrição (Brakemaster 2.100 PSI / 13,8 MPA)
  const sku7970Product: Product = {
    id: '6ynj8dnhlrlohij',
    sku: '7970',
    name: 'MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA',
    brand: 'BALFLEX',
    category: 'MANGUEIRA HIDRAULICA',
    subcategory: '',
    unit: 'MT',
    price: 63.2,
    shortDescription: 'MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA',
    longDescription: 'MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA',
    images: [],
    specs: { Marca: 'BALFLEX', Unidade: 'MT' },
    featured: false,
  }

  const sku7970Title = buildProductTitle(sku7970Product)
  if (!sku7970Title.includes('MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA')) {
    throw new Error(`Título incorreto para SKU 7970: ${sku7970Title}`)
  }

  const sku7970Desc = buildProductDescription(sku7970Product)
  if (!sku7970Desc.includes('WhatsApp (11) 9.4708-2171')) {
    throw new Error(`Descrição incorreta para SKU 7970: ${sku7970Desc}`)
  }

  // 4. Teste específico para o SKU 3273 com a nova descrição e marca Korax
  const sku3273Product: Product = {
    id: 'iqk9alm5wmp1izx',
    sku: '3273',
    name: 'MANGUEIRA R14 5/16" TEFLON 1.520 PSI',
    brand: 'Korax',
    category: 'MANGUEIRA HIDRAULICA',
    subcategory: '',
    unit: 'MT',
    price: 54.8,
    shortDescription: 'MANGUEIRA R14 5/16" TEFLON 1.520 PSI',
    longDescription: 'MANGUEIRA R14 5/16" TEFLON 1.520 PSI',
    images: [],
    specs: { Marca: 'Korax', Unidade: 'MT' },
    featured: false,
  }

  const sku3273Title = buildProductTitle(sku3273Product)
  if (!sku3273Title.includes('MANGUEIRA R14 5/16" TEFLON 1.520 PSI')) {
    throw new Error(`Título incorreto para SKU 3273: ${sku3273Title}`)
  }

  const sku3273Desc = buildProductDescription(sku3273Product)
  if (
    !sku3273Desc.includes('MANGUEIRA R14 5/16" TEFLON 1.520 PSI da Korax') &&
    !sku3273Desc.includes('Korax')
  ) {
    throw new Error(`Descrição incorreta para SKU 3273: ${sku3273Desc}`)
  }
  if (!sku3273Desc.includes('WhatsApp (11) 9.4708-2171')) {
    throw new Error(`Descrição sem WhatsApp para SKU 3273: ${sku3273Desc}`)
  }

  // 5. URLs absolutas
  const relUrl = '/assets/forzadue-2-2ed92.jpeg'
  const absUrl = toAbsoluteImageUrl(relUrl)
  if (absUrl !== `${SITE_DOMAIN}${relUrl}`) {
    throw new Error(`Falha ao converter URL relativa em absoluta: ${absUrl}`)
  }

  const externalUrl = 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/test.jpg'
  if (toAbsoluteImageUrl(externalUrl) !== externalUrl) {
    throw new Error(`URL externa modificada indevidamente: ${toAbsoluteImageUrl(externalUrl)}`)
  }

  if (toAbsoluteImageUrl(null) !== DEFAULT_SEO.image) {
    throw new Error('Falha no fallback de URL nula')
  }

  return true
}

// Execução imediata no carregamento do teste
runSeoSelfCheck()
