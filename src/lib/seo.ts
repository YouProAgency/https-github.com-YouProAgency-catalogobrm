/**
 * Helper de SEO para atualização dinâmica de tags <head> no SPA da BR Mangueiras.
 * Atualiza:
 * - document.title
 * - meta[name="title"]
 * - meta[name="description"]
 * - meta[property="og:title"]
 * - meta[property="og:description"]
 * - meta[property="og:type"]
 * - meta[property="og:url"]
 * - meta[property="og:image"]
 * - meta[property="og:image:secure_url"]
 * - meta[property="og:image:alt"]
 * - meta[name="twitter:card"]
 * - meta[name="twitter:title"]
 * - meta[name="twitter:description"]
 * - meta[name="twitter:image"]
 * - meta[name="twitter:image:alt"]
 * - link[rel="canonical"]
 * - meta[name="robots"] (ex: noindex quando produto não encontrado)
 */

import { Product } from '@/types'
import { extractBitola } from '@/lib/bitola'
import { getProductImage } from '@/lib/productImage'
import { formatCurrencyBRL } from '@/lib/utils'

export const SITE_DOMAIN = 'https://brmangueiras.com.br'

export const DEFAULT_SEO = {
  title: 'BR Mangueiras — Mangueiras, Flexíveis e Conexões',
  description:
    'Catálogo de mangueiras, flexíveis e conexões para indústria, oficina e lava rápido. Linha completa R1 a R17, conexões hidráulicas, industriais e pneumáticas. Atendimento nacional.',
  url: `${SITE_DOMAIN}/`,
  canonical: `${SITE_DOMAIN}/`,
  image: `${SITE_DOMAIN}/og-brmangueiras.svg`,
  imageAlt: 'Logotipo Oficial BR Mangueiras — Mangueiras, Flexíveis e Conexões',
  type: 'website',
  card: 'summary_large_image',
  robots: 'index, follow',
}

export interface SeoTagsConfig {
  title: string
  description: string
  url?: string
  canonical?: string
  image?: string
  imageAlt?: string
  type?: 'website' | 'product' | 'article'
  card?: 'summary' | 'summary_large_image'
  robots?: string
}

function setOrCreateMeta(selector: string, createAttrs: Record<string, string>, content: string) {
  let element = document.querySelector(selector) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    for (const [key, value] of Object.entries(createAttrs)) {
      element.setAttribute(key, value)
    }
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function removeMeta(selector: string) {
  const element = document.querySelector(selector)
  if (element && element.parentNode) {
    element.parentNode.removeChild(element)
  }
}

function setOrCreateLink(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

/**
 * Converte URLs relativas ou locais para URLs absolutas públicas no domínio de produção.
 */
export function toAbsoluteImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || !rawUrl.trim()) {
    return DEFAULT_SEO.image
  }
  const clean = rawUrl.trim()
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean
  }
  // Se for caminho absoluto local (/assets/..., /favicon.ico)
  if (clean.startsWith('/')) {
    return `${SITE_DOMAIN}${clean}`
  }
  return `${SITE_DOMAIN}/${clean}`
}

/**
 * Constrói o título dinâmico do produto para SEO:
 * "{nome do produto} — Catálogo BR Mangueiras"
 */
export function buildProductTitle(product: Product): string {
  const cleanName = (product.name || '').trim().replace(/[\r\n\t]+/g, ' ')
  if (!cleanName) {
    return 'Produto — Catálogo BR Mangueiras'
  }
  return `${cleanName} — Catálogo BR Mangueiras`
}

/**
 * Constrói a meta description própria do produto:
 * Nome, marca, bitola/medida e chamada útil para WhatsApp.
 * Limite em torno de 160 caracteres, truncado de forma limpa.
 */
export function buildProductDescription(product: Product): string {
  const name = (product.name || '').trim().replace(/[\r\n\t]+/g, ' ')
  const brand = (product.brand || '').trim()
  const bitola = extractBitola(name)

  // Segmento base descritivo
  const parts: string[] = []

  // Se o nome não tiver a marca explicitamente inserida, podemos contextualizar
  const nameHasBrand = brand && name.toLowerCase().includes(brand.toLowerCase())
  const intro = nameHasBrand ? name : brand ? `${name} da ${brand}` : name
  parts.push(intro)

  if (bitola && !name.includes(bitola)) {
    parts.push(`Bitola: ${bitola}`)
  }

  // Preço opcional se disponível
  let priceText = ''
  if (product.price && product.price > 0) {
    priceText = ` a partir de ${formatCurrencyBRL(product.price)}`
  }

  const baseText = `${parts.join('. ')}${priceText}. Catálogo BR Mangueiras — solicite seu orçamento pelo WhatsApp (11) 9.4708-2171.`

  // Se exceder 160 chars, trunca de maneira limpa
  if (baseText.length <= 165) {
    return baseText
  }

  // Versão mais concisa mantendo o WhatsApp e a chamada comercial
  const callToAction = ' Catálogo BR Mangueiras — WhatsApp (11) 9.4708-2171.'
  const allowedIntroLength = Math.max(50, 160 - callToAction.length)

  let compactIntro = intro
  if (compactIntro.length > allowedIntroLength) {
    compactIntro = compactIntro.slice(0, allowedIntroLength).trim()
    // Corta na última palavra para não ficar palavra pela metade
    const lastSpace = compactIntro.lastIndexOf(' ')
    if (lastSpace > 30) {
      compactIntro = compactIntro.slice(0, lastSpace)
    }
    compactIntro += '...'
  }

  return `${compactIntro}.${callToAction}`
}

/**
 * Aplica as tags de SEO no <head> da página.
 */
export function applySeoTags(config: SeoTagsConfig) {
  // Title
  document.title = config.title
  setOrCreateMeta('meta[name="title"]', { name: 'title' }, config.title)

  // Description
  setOrCreateMeta('meta[name="description"]', { name: 'description' }, config.description)

  // Canonical
  const canonicalUrl = config.canonical || config.url || DEFAULT_SEO.canonical
  setOrCreateLink('canonical', canonicalUrl)

  // Open Graph
  setOrCreateMeta('meta[property="og:title"]', { property: 'og:title' }, config.title)
  setOrCreateMeta(
    'meta[property="og:description"]',
    { property: 'og:description' },
    config.description,
  )
  setOrCreateMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
  setOrCreateMeta('meta[property="og:type"]', { property: 'og:type' }, config.type || 'website')

  const imageUrl = toAbsoluteImageUrl(config.image || DEFAULT_SEO.image)
  const imageAlt = config.imageAlt || config.title
  setOrCreateMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl)
  setOrCreateMeta(
    'meta[property="og:image:secure_url"]',
    { property: 'og:image:secure_url' },
    imageUrl,
  )
  setOrCreateMeta('meta[property="og:image:alt"]', { property: 'og:image:alt' }, imageAlt)

  // Twitter Card
  setOrCreateMeta(
    'meta[name="twitter:card"]',
    { name: 'twitter:card' },
    config.card || 'summary_large_image',
  )
  setOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, config.title)
  setOrCreateMeta(
    'meta[name="twitter:description"]',
    { name: 'twitter:description' },
    config.description,
  )
  setOrCreateMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl)
  setOrCreateMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt' }, imageAlt)
  setOrCreateMeta('meta[name="twitter:url"]', { name: 'twitter:url' }, canonicalUrl)

  // Robots
  if (config.robots) {
    setOrCreateMeta('meta[name="robots"]', { name: 'robots' }, config.robots)
  } else {
    removeMeta('meta[name="robots"]')
  }
}

/**
 * Aplica SEO dinâmico específico para a página de detalhes de um produto.
 */
export function applyProductSeo(product: Product) {
  const title = buildProductTitle(product)
  const description = buildProductDescription(product)
  const canonicalUrl = `${SITE_DOMAIN}/produto/${product.id}`
  const resolvedImage = getProductImage(product)
  const absoluteImageUrl = toAbsoluteImageUrl(resolvedImage)

  applySeoTags({
    title,
    description,
    url: canonicalUrl,
    canonical: canonicalUrl,
    image: absoluteImageUrl,
    imageAlt: `${product.name} — BR Mangueiras`,
    type: 'product',
    card: 'summary_large_image',
    robots: 'index, follow',
  })
}

/**
 * Aplica SEO para páginas 404 ou produto não encontrado/excluído (bloqueando indexação do Google).
 */
export function applyNotFoundSeo(customTitle = 'Produto não encontrado — Catálogo BR Mangueiras') {
  applySeoTags({
    title: customTitle,
    description: 'O produto solicitado não foi encontrado no catálogo da BR Mangueiras.',
    url: `${SITE_DOMAIN}/`,
    canonical: `${SITE_DOMAIN}/`,
    image: DEFAULT_SEO.image,
    imageAlt: DEFAULT_SEO.imageAlt,
    type: 'website',
    card: 'summary_large_image',
    robots: 'noindex, nofollow',
  })
}

/**
 * Restaura as meta tags padrão do site BR Mangueiras (definidas originalmente no index.html).
 */
export function resetDefaultSeo() {
  applySeoTags({
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    url: DEFAULT_SEO.url,
    canonical: DEFAULT_SEO.canonical,
    image: DEFAULT_SEO.image,
    imageAlt: DEFAULT_SEO.imageAlt,
    type: 'website',
    card: 'summary_large_image',
  })
}
