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

  // 3. URLs absolutas
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
