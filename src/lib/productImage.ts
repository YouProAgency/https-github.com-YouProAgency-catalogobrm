import balflexForzaDueImg from '@/assets/forzadue-2-2ed92.jpeg'
import balflexForzaDueTropicImg from '@/assets/forzaduetropic-d1f0c.png'
import balflexForzaUnoImg from '@/assets/forzauno-1-4bb26.png'
import balflexForzaUnoTropicImg from '@/assets/forzaunotropic-1c6bc.png'
import balflexTexmasterImg from '@/assets/texmaster-3ae16.png'
import balflexR6MultipurposeImg from '@/assets/multipurpose-2-f77a3.jpeg'
import balflexFuelPumpImg from '@/assets/fuelpump-82454.png'
import balflexSupersteamImg from '@/assets/supersteam-76b98.png'
import blindadaGasFgImg from '@/assets/gasblindada-c22ff.png'
import cristalImg from '@/assets/cristallisa-938ec.png'
import cristalTrancadaImg from '@/assets/cristaltrancada-ebff7.png'
import koraxKobra1Img from '@/assets/korax-kobra1.ts'
import koraxKobra2Img from '@/assets/korax-kobra2.ts'
import saidaCorrugadaBrancaImg from '@/assets/corrugadabranca-7439b.png'
import saidaDrenagemImg from '@/assets/saidadrenagem-1aa95.png'
import succaoLaranjaImg from '@/assets/succaolaranja-1c004.png'
import vacuoArCinzaImg from '@/assets/vacuoarcinza-4fbba.png'
import succaoAzulImg from '@/assets/succaoazul-1b2f4.png'
import aluminioProtecaoImg from '@/assets/aluminioprotecao-f6034.png'
import r14TeflonImg from '@/assets/tefloninox-5d491.png'

export const DEFAULT_PRODUCT_PLACEHOLDER =
  'https://img.usecurling.com/p/800/800?q=hydraulic%20hose&color=black'
export const BALFLEX_FORZA_UNO_TROPIC_IMAGE = balflexForzaUnoTropicImg
export const BALFLEX_FORZA_DUE_TROPIC_IMAGE = balflexForzaDueTropicImg
export const BALFLEX_FORZA_DUE_IMAGE = balflexForzaDueImg
export const BALFLEX_FORZA_UNO_IMAGE = balflexForzaUnoImg
export const BALFLEX_TEXMASTER_IMAGE = balflexTexmasterImg
export const BALFLEX_R6_MULTIPURPOSE_IMAGE = balflexR6MultipurposeImg
export const BALFLEX_FUEL_PUMP_IMAGE = balflexFuelPumpImg
export const BALFLEX_SUPERSTEAM_IMAGE = balflexSupersteamImg
export const BLINDADA_GAS_FG_IMAGE = blindadaGasFgImg
export const CRISTAL_TRANCADA_IMAGE = cristalTrancadaImg
export const CRISTAL_IMAGE = cristalImg
export const KORAX_KOBRA1_IMAGE = koraxKobra1Img
export const KORAX_KOBRA2_IMAGE = koraxKobra2Img
export const SAIDA_CORRUGADA_BRANCA_IMAGE = saidaCorrugadaBrancaImg
export const SAIDA_DRENAGEM_IMAGE = saidaDrenagemImg
export const SUCCAO_LARANJA_IMAGE = succaoLaranjaImg
export const VACUO_AR_CINZA_IMAGE = vacuoArCinzaImg
export const SUCCAO_AZUL_IMAGE = succaoAzulImg
export const ALUMINIO_PROTECAO_IMAGE = aluminioProtecaoImg
export const R14_TEFLON_IMAGE = r14TeflonImg

// Validação em desenvolvimento/build para regras de imagem e SKUs Kobra 1 / Kobra 2
if (import.meta.env.DEV) {
  import('./productImage.validation').catch(() => {})
}

export interface ProductImageSubject {
  sku?: string | number | null
  name?: string | null
  description?: string | null
  shortDescription?: string | null
  longDescription?: string | null
  brand?: string | null
  images?: string[] | null
  image?: string | null
}

function getSubjectCombinedText(product: ProductImageSubject | null | undefined): string {
  if (!product) return ''
  return [
    product.name || '',
    product.description || '',
    product.shortDescription || '',
    product.longDescription || '',
  ].join(' ')
}

/**
 * Checa se o produto pertence à marca Balflex (pelo campo brand ou pelo texto do nome/descrição).
 */
export function isBalflexBrand(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  if (product.brand && /\bbalflex\b/i.test(product.brand)) {
    return true
  }
  const text = getSubjectCombinedText(product)
  return /\bbalflex\b/i.test(text)
}

/**
 * Checa se o produto pertence à marca Korax (pelo campo brand ou pelo texto do nome/descrição).
 */
export function isKoraxBrand(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  if (product.brand && /\bkorax\b/i.test(product.brand)) {
    return true
  }
  const text = getSubjectCombinedText(product)
  return /\bkorax\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Uno Tropic.
 * Regra: restrita à marca Balflex via `isBalflexBrand` e detectando "TROPIC"
 * por palavra exata case-insensitive (/\btropic\b/i) no texto combinado do produto.
 * Deve conter também a identificação de "FORZA UNO" para distinguir de outras linhas Tropic (ex.: Forza Due Tropic).
 */
export function isBalflexForzaUnoTropic(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  if (!isBalflexBrand(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)
  const hasForzaUno = /\bforza\s+uno\b/i.test(text)
  const hasTropic = /\btropic\b/i.test(text)

  return hasForzaUno && hasTropic
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Uno.
 * Regra: nome ou descrição contém "FORZA UNO" (case-insensitive e com limite de palavra).
 * Não deve casar com "FORZA DUE".
 */
export function isBalflexForzaUno(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\bforza\s+uno\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Due Tropic.
 * Regra: restrita à marca Balflex via `isBalflexBrand` e detectando a presença de "FORZA DUE"
 * e do termo exato "TROPIC" (/\btropic\b/i) no texto combinado do produto.
 * Deve conter também a identificação de "FORZA DUE" para distinguir de Forza Uno Tropic.
 */
export function isBalflexForzaDueTropic(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  if (!isBalflexBrand(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)
  const hasForzaDue = /\bforza\s+due\b/i.test(text)
  const hasTropic = /\btropic\b/i.test(text)

  return hasForzaDue && hasTropic
}

/**
 * Checa se o produto é uma mangueira Balflex da linha Forza Due.
 * Regra: nome ou descrição contém "FORZA DUE" (case-insensitive e com limite de palavra).
 * Não deve casar com "FORZA UNO".
 */
export function isBalflexForzaDue(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\bforza\s+due\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira da linha Balflex Texmaster.
 * Regra: nome ou descrição contém "TEXMASTER" (aceitando variações como TEXMASTER, TEXMASTER 1, TEXMASTER 2, TEXMASTER 3).
 * Não deve casar com produtos da linha R6 Multipurpose.
 */
export function isBalflexTexmaster(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\btexmaster(?:\s*\d+)?\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira da linha Balflex R6 Multipurpose.
 * Regra: o produto precisa ser da marca Balflex E conter "R6" e/ou "MULTIPURPOSE" com limites de palavra.
 * Não deve capturar indevidamente produtos de outras linhas (ex.: Texmaster R6 é tratado como Texmaster).
 */
export function isBalflexR6Multipurpose(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  // Se for explicitamente Texmaster, a linha Texmaster tem sua própria foto dedicada
  if (isBalflexTexmaster(product)) {
    return false
  }

  // Precisa ser da marca Balflex
  if (!isBalflexBrand(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)
  const hasR6 = /\br6\b/i.test(text)
  const hasMultipurpose = /\bmultipurpose\b/i.test(text)

  return hasR6 || hasMultipurpose
}

/**
 * Checa se o produto é uma mangueira da linha Kobra 1 (modelo Korax).
 * Regra:
 * - Caso contenha a palavra exata "KOBRA 1" (/\bkobra\s*1\b/i) em produto da marca KORAX, OU
 * - Caso contenha "R1" por palavra exata (/\br1\b/i) E "KOBRA" (/\bkobra\b/i) em produto da marca KORAX.
 * Utiliza limites de palavra estritos para não casar com R12, R14, R17, etc.
 */
export function isKoraxKobra1(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  if (!isKoraxBrand(product)) return false

  const text = getSubjectCombinedText(product)
  const hasKobra1Explicit = /\bkobra\s*1\b/i.test(text)
  const hasR1AndKobra = /\br1\b/i.test(text) && /\bkobra\b/i.test(text)

  return hasKobra1Explicit || hasR1AndKobra
}

/**
 * Checa se o produto é uma mangueira da linha Kobra 2 (modelo Korax).
 * Regra:
 * - Caso contenha o termo explícito "Kobra 2" (/\bkobra\s*2\b/i), OU
 * - Caso seja da marca KORAX e contenha "R2" por palavra exata (/\br2\b/i) E "KOBRA" (/\bkobra\b/i).
 * Utiliza limites de palavra estritos para não casar com outros prefixos/sufixos.
 */
export function isKoraxKobra2(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)

  // Mantém a detecção explícita existente de "KOBRA 2"
  if (/\bkobra\s*2\b/i.test(text)) {
    return true
  }

  // Estende para casar "R2" + "KOBRA" na marca KORAX
  if (isKoraxBrand(product)) {
    const hasR2AndKobra = /\br2\b/i.test(text) && /\bkobra\b/i.test(text)
    if (hasR2AndKobra) {
      return true
    }
  }

  return false
}

/**
 * Checa se o produto é uma mangueira da linha Balflex Fuel Pump.
 * Regra: o produto precisa ser da marca Balflex E conter "FUEL PUMP" ou "FUELPUMP"
 * (case-insensitive com limites de palavra tipo `\bfuel\s*pump\b`).
 * Restrito exclusivamente a produtos da marca Balflex.
 */
export function isBalflexFuelPump(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  // Restrito à marca Balflex (mesma validação usada em isBalflexR6Multipurpose)
  if (!isBalflexBrand(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)
  return /\bfuel\s*pump\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira da linha Balflex Supersteam.
 * Regra: o produto precisa ser da marca Balflex E casar com a regex /\bsupersteam\b/i
 * contra o texto combinado do produto (nome + descrições), exatamente como isBalflexFuelPump.
 */
export function isBalflexSupersteam(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  if (!isBalflexBrand(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)
  return /\bsupersteam\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira da linha "Mangueira Blindada Gás FG".
 * Regra: casa quando o texto combinado do produto (nome + descrições) contém
 * a expressão "BLINDADA GÁS FG" ou "BLINDADA GAS FG" (com ou sem acento, case-insensitive).
 * NÃO é restrito à marca Balflex (a linha do catálogo pertence à Contuflex).
 */
export function isBlindadaGasFg(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /blindada\s+g[aá]s\s+fg\b/i.test(text)
}

/**
 * Checa se o produto pertence à linha Cristal Trançada (mangueira de PVC cristal/transparente com trama trançada).
 * Regra: o texto consolidado (nome/descrição) deve conter a expressão "CRISTAL TRANÇADA" ou "CRISTAL TRANCADA",
 * aceitando variações de acento/cedilha e espaçamento, case-insensitive.
 * Também aceita "CRISTAL" E "TRANÇADA/TRANCADA" presentes no texto com limite de palavra.
 * SEM restrição de marca.
 */
export function isCristalTrancada(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  const hasCristal = /\bcristal\b/i.test(text)
  const hasTrancada = /\btran[cç]ada\b/i.test(text)
  return hasCristal && hasTrancada
}

/**
 * Checa se o produto pertence à linha Cristal (mangueira de PVC cristal/transparente).
 * Regra: casa quando o texto combinado do produto (nome + descrições) contém
 * a palavra "CRISTAL" (case-insensitive com limites de palavra).
 * Cobre variações como "MANGUEIRA CRISTAL LISA", "MANGUEIRA CRISTAL", etc.
 * SEM restrição de marca (vale para qualquer fabricante).
 */
export function isCristal(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  return /\bcristal\b/i.test(text)
}

/**
 * Checa se o produto é uma mangueira da linha Saída Drenagem.
 * Regra: exige a presença simultânea das palavras "SAÍDA" / "SAIDA" E "DRENAGEM"
 * no texto consolidado do produto (nome + descrições), case-insensitive e tolerante a acentuação.
 * SEM restrição de marca (cobre Ibirá, sem marca ou outros fabricantes).
 * Não deve capturar produtos de saída corrugada ou tanquinho que não tenham "DRENAGEM".
 */
export function isSaidaDrenagem(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  const hasSaida = /\bsa[ií]da\b/i.test(text)
  const hasDrenagem = /\bdrenagem\b/i.test(text)
  return hasSaida && hasDrenagem
}

/**
 * Checa se o produto é uma mangueira da linha Saída Corrugada Branca.
 * Regra: exige a presença simultânea dos termos que caracterizam a linha:
 * "SAÍDA" / "SAIDA" E "CORRUGADA" E "BRANCA"
 * no texto consolidado do produto (nome + descrições), case-insensitive e tolerante a acentuação.
 * SEM restrição de marca.
 * Não deve capturar:
 * - Saída Drenagem (que tem regra e foto própria com precedência)
 * - Saída Tanquinho ou outras mangueiras corrugadas que não sejam brancas ou de saída
 */
export function isSaidaCorrugadaBranca(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  const hasSaida = /\bsa[ií]da\b/i.test(text)
  const hasCorrugada = /\bcorrugada\b/i.test(text)
  const hasBranca = /\bbranca\b/i.test(text)
  return hasSaida && hasCorrugada && hasBranca
}

/**
 * Checa se o produto é uma mangueira da linha Sucção Laranja / Sucção Pesada.
 * Regra: analisa o texto consolidado do produto (nome + descrições) e casa quando
 * houver a palavra "SUCÇÃO" / "SUCCÃO" / "SUCÇAO" / "SUCCAO" (tolerante a acentos e cedilha, case-insensitive)
 * E simultaneamente ("LARANJA" OU "PESADA").
 * NÃO casam: sucções transparentes com espiral (azul/verde), sucções atóxicas com arame,
 * ou qualquer produto sem "sucção".
 */
export function isSuccaoLaranja(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  const hasSuccao = /\bsu[cç][cç]?[aãá]o\b/i.test(text)
  const hasLaranjaOuPesada = /\b(?:laranja|pesada)\b/i.test(text)
  return hasSuccao && hasLaranjaOuPesada
}

/**
 * Checa se o produto pertence à linha Sucção Cinza / Vácuo Ar Cinza.
 * Regra: analisa o texto consolidado do produto (nome + descrições):
 * - Contém "SUCÇÃO" / "SUCCÃO" / "SUCÇAO" / "SUCCAO" (tolerante a acentos e cedilha, \b) OU "VACUO AR" / "VÁCUO AR"
 * - E simultaneamente um indicador da linha cinza:
 *   a) A palavra "CINZA" (\bcinza\b)
 *   b) Ou códigos de modelo conhecidos da linha cinza: IVCL, KEL-SC ou KV
 *   c) Ou SKUs confirmados da linha cinza sem modelo/cor indicada (ex.: SKU 5022 bitola 3/4", SKU 1599 bitola 1.1/2")
 *   d) Ou ausência de qualquer cor / código de modelo conflitante conhecido:
 *      (exclui azul, preta/preto, prata, verde, transparente/translúcida, cobreada, atóxica/arame,
 *       códigos KEV, KEL-S, KEL-SP, KPU-BOR, SVE, IVPU, ISAL, KKM, KKE, ISAM, KA, ISLP, etc.)
 * Exclusões estritas (NÃO deve capturar):
 * - Sucção Laranja / Pesada (já capturada antes pela precedência isSuccaoLaranja)
 * - Vácuo ar ou sucção em outras cores explicitadas no nome: azul, preta/preto, prata, verde, etc.
 * - Sucção transparente com espiral: ISAL, KKM, KKE
 * - Sucção atóxica com arame/espiral: ISAM, KA
 * - Outros códigos de cor/modelo: KEV (azul), KEL-S (azul), KEL-SP (preta), KPU-BOR (preta), SVE (prata Continental), IVPU (transparente cobreada)
 */
export function isSuccaoCinzaOuVacuoArCinza(
  product: ProductImageSubject | null | undefined,
): boolean {
  if (!product) return false

  // Se já for sucção laranja/pesada, não pertence à linha cinza
  if (isSuccaoLaranja(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)

  // Deve ter termo de sucção ou vácuo ar
  const hasSuccao = /\bsu[cç][cç]?[aãá]o\b/i.test(text)
  const hasVacuoAr = /\bv[aá]cuo\s+ar\b/i.test(text)
  if (!hasSuccao && !hasVacuoAr) {
    return false
  }

  // Exclusões de cores ou descritores conflitantes (azul, preta, prata, verde, transparente, cobreada, atóxica, arame, etc.)
  if (
    /\b(?:azul|pret[ao]|prata|verde|transparente?|transl[uú]cid[ao]|cobread[ao]|at[oó]xic[ao]|arame)\b/i.test(
      text,
    )
  ) {
    return false
  }

  // Exclusões de modelos/séries de outras linhas conhecidas:
  // - KEV, KEL-S (azul Kanaflex)
  // - KEL-SP, KPU-BOR (preta Kanaflex)
  // - SVE (prata Continental)
  // - IVPU (transparente cobreada Ibirá)
  // - ISAL, KKM, KKE (sucção transparente com espiral)
  // - ISAM, KA (sucção atóxica)
  // - ISLP (sucção laranja pesada)
  if (/\b(?:kev|kel-s|kel-sp|kpu-bor|sve|ivpu|isal|kkm|kke|isam|ka|islp)\b/i.test(text)) {
    return false
  }

  // SKU confirmado explicitamente (ex: SKU 5022 "MANGUEIRA VACUO AR 3/4"", SKU 1599 "MANGUEIRA VACUO AR 1.1/2"")
  const productSku = product.sku != null ? String(product.sku).trim() : ''
  if (productSku === '5022' || productSku === '1599') {
    return true
  }

  // Indicador de cinza: palavra CINZA literal ou códigos de modelo IVCL, KEL-SC, KV
  const hasCinzaWord = /\bcinza\b/i.test(text)
  const hasCinzaModel = /\b(?:ivcl|kel-sc|kv)\b/i.test(text)

  // Se tem a palavra cinza ou modelo cinza
  if (hasCinzaWord || hasCinzaModel) {
    return true
  }

  // Para produtos de "VÁCUO AR" / "VACUO AR":
  // Se não tem nenhuma cor ou modelo de outra linha indicado (as exclusões acima já removeram azul, preta, prata, etc.),
  // trata-se da linha padrão de vácuo ar cinza (a linha estándar do mercado para vácuo ar vinílico)
  if (hasVacuoAr) {
    return true
  }

  return false
}

/**
 * Checa se o produto pertence à linha Sucção Azul / Vácuo Ar Azul.
 * Regra:
 * - Deve conter "SUCÇÃO" / "SUCCÃO" / "SUCÇAO" / "SUCCAO" OU "VACUO AR" / "VÁCUO AR"
 * - E simultaneamente conter "AZUL" (incluindo "AZUL REFORÇADA", "AZUL ESCURO", etc.)
 * - SEM restrição de marca (Kanaflex, Ibirá ou genérica)
 * Exclusões estritas (NÃO capturam a foto azul):
 * - Sucções/vácuo ar TRANSPARENTES que apenas citam espiral azul (ex.: ISAL TRANSPARENTE C/ ESPIRAL AZUL,
 *   KKM TRANSPARENTE C/ ESPIRAL AZUL, TRANSPARENTE COM ESPIRAL AZUL). Se tiver "transparente" ou "translúcid[ao]", NÃO pega.
 * - Outras cores conflitantes no nome (laranja, cinza, preta, prata, verde, cobreada).
 * - Produtos azuis que NÃO são sucção/vácuo ar (ex.: CHATA FLAT AZUL, LAVA AUTO AZUL, JARDIM AZUL, LISA IRRIGAÇÃO AZUL).
 */
export function isSuccaoAzul(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false

  // Se for sucção laranja/pesada, a regra laranja tem prioridade
  if (isSuccaoLaranja(product)) {
    return false
  }

  const text = getSubjectCombinedText(product)

  // Deve ter termo de sucção ou vácuo ar
  const hasSuccao = /\bsu[cç][cç]?[aãá]o\b/i.test(text)
  const hasVacuoAr = /\bv[aá]cuo\s+ar\b/i.test(text)
  if (!hasSuccao && !hasVacuoAr) {
    return false
  }

  // Deve ser azul de verdade
  const hasAzul = /\bazul\b/i.test(text)
  if (!hasAzul) {
    return false
  }

  // Exclusão obrigatória: produtos transparentes/translúcidos com espiral azul
  if (/\b(?:transparente?|transl[uú]cid[ao])\b/i.test(text)) {
    return false
  }

  // Exclusões de outras cores conflitantes no nome
  if (/\b(?:laranja|pesada|cinza|pret[ao]|prata|verde|cobread[ao])\b/i.test(text)) {
    return false
  }

  return true
}

/**
 * Checa se o produto pertence à linha "Mangueira Flexível Alumínio Proteção".
 * Regra: exige simultaneamente as palavras "ALUMÍNIO" / "ALUMINIO" E "PROTEÇÃO" / "PROTECAO"
 * (case-insensitive e tolerante a acentuação) no texto consolidado do produto (nome + descrições).
 * SEM restrição de marca (os produtos do catálogo são sem marca).
 * Não deve capturar outras mangueiras metálicas/corrugadas (ex: Blindada Gás FG, que não possui o par).
 */
export function isAluminioProtecao(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  const text = getSubjectCombinedText(product)
  const hasAluminio = /\balum[ií]nio\b/i.test(text)
  const hasProtecao = /\bprote[cç][aãá]o\b/i.test(text)
  return hasAluminio && hasProtecao
}

/**
 * Checa se o produto pertence à linha "Mangueira R14 Teflon" (PTFE com malha inox) da marca Korax.
 * Regra: exige SIMULTANEAMENTE:
 * - Marca = Korax (case-insensitive, via `isKoraxBrand`)
 * - "R14" como palavra/token inteiro (/\br14\b/i) no texto consolidado (nome + descrições)
 * - "TEFLON" (/\bteflon\b/i) no texto consolidado, tolerante a acentuação e case
 * Não deve capturar outras mangueiras metálicas (ex.: Blindada Gás FG ou Alumínio Proteção)
 * nem outros modelos Korax (ex.: Kobra 1/R1, Kobra 2/R2, R17 Elite).
 */
export function isR14Teflon(product: ProductImageSubject | null | undefined): boolean {
  if (!product) return false
  if (!isKoraxBrand(product)) return false

  const text = getSubjectCombinedText(product)
  const hasR14 = /\br14\b/i.test(text)
  const hasTeflon = /\bteflon\b/i.test(text)

  return hasR14 && hasTeflon
}

/**
 * Retorna a imagem mais apropriada para exibição do produto:
 * 1. Imagem própria do produto (se já cadastrada no PocketBase ou na lista de images)
 * 2. Se for da linha Balflex Forza Uno Tropic, retorna BALFLEX_FORZA_UNO_TROPIC_IMAGE (precedência sobre Forza Uno genérica)
 * 3. Se for da linha Balflex Forza Uno, retorna a imagem oficial anexada (BALFLEX_FORZA_UNO_IMAGE)
 * 4. Se for da linha Balflex Forza Due Tropic, retorna BALFLEX_FORZA_DUE_TROPIC_IMAGE (precedência sobre Forza Due genérica)
 * 5. Se for da linha Balflex Forza Due, retorna a imagem oficial anexada (BALFLEX_FORZA_DUE_IMAGE)
 * 6. Se for da linha Balflex Texmaster, retorna a imagem oficial anexada (BALFLEX_TEXMASTER_IMAGE)
 * 7. Se for da linha Balflex R6 Multipurpose, retorna a imagem oficial anexada (BALFLEX_R6_MULTIPURPOSE_IMAGE)
 * 8. Se for da linha Kobra 1 (Korax), retorna a imagem oficial anexada (KORAX_KOBRA1_IMAGE)
 * 9. Se for da linha Kobra 2 (Korax), retorna a imagem oficial anexada (KORAX_KOBRA2_IMAGE)
 * 10. Se for da linha Balflex Fuel Pump, retorna a imagem oficial anexada (BALFLEX_FUEL_PUMP_IMAGE)
 * 11. Se for da linha Balflex Supersteam, retorna a imagem oficial anexada (BALFLEX_SUPERSTEAM_IMAGE)
 * 12. Se for da linha Blindada Gás FG, retorna a imagem oficial anexada (BLINDADA_GAS_FG_IMAGE)
 * 13. Se for da linha Cristal Trançada, retorna a imagem oficial anexada (CRISTAL_TRANCADA_IMAGE) — precedência sobre Cristal genérica
 * 14. Se for da linha Cristal, retorna a imagem oficial anexada (CRISTAL_IMAGE)
 * 15. Se for da linha Saída Drenagem, retorna a imagem oficial anexada (SAIDA_DRENAGEM_IMAGE)
 * 16. Se for da linha Saída Corrugada Branca, retorna a imagem oficial anexada (SAIDA_CORRUGADA_BRANCA_IMAGE)
 * 17. Se for da linha Sucção Laranja / Pesada, retorna a imagem oficial anexada (SUCCAO_LARANJA_IMAGE)
 * 18. Se for da linha Sucção Cinza / Vácuo Ar Cinza, retorna a imagem oficial anexada (VACUO_AR_CINZA_IMAGE)
 * 19. Se for da linha Sucção Azul / Vácuo Ar Azul, retorna a imagem oficial anexada (SUCCAO_AZUL_IMAGE)
 * 20. Se for da linha Alumínio Proteção, retorna a imagem oficial anexada (ALUMINIO_PROTECAO_IMAGE)
 * 21. Se for da linha R14 Teflon (Korax), retorna a imagem oficial anexada (R14_TEFLON_IMAGE)
 * 22. Fallback: placeholder genérico de produto
 */
export function getProductImage(
  product: ProductImageSubject | null | undefined,
  fallbackUrl: string = DEFAULT_PRODUCT_PLACEHOLDER,
): string {
  if (!product) return fallbackUrl

  // Se tiver imagem própria preenchida (e não for string vazia ou placeholder genérico)
  const candidate =
    (product.images && product.images.length > 0 && product.images[0]) || product.image || ''

  if (candidate && !candidate.includes('placeholder')) {
    return candidate
  }

  // Avaliação não ambígua de linhas oficiais
  // Forza Uno Tropic deve vir ANTES de Forza Uno genérica
  if (isBalflexForzaUnoTropic(product)) {
    return BALFLEX_FORZA_UNO_TROPIC_IMAGE
  }

  if (isBalflexForzaUno(product)) {
    return BALFLEX_FORZA_UNO_IMAGE
  }

  // Forza Due Tropic deve vir ANTES de Forza Due genérica
  if (isBalflexForzaDueTropic(product)) {
    return BALFLEX_FORZA_DUE_TROPIC_IMAGE
  }

  if (isBalflexForzaDue(product)) {
    return BALFLEX_FORZA_DUE_IMAGE
  }

  if (isBalflexTexmaster(product)) {
    return BALFLEX_TEXMASTER_IMAGE
  }

  if (isBalflexR6Multipurpose(product)) {
    return BALFLEX_R6_MULTIPURPOSE_IMAGE
  }

  if (isKoraxKobra1(product)) {
    return KORAX_KOBRA1_IMAGE
  }

  if (isKoraxKobra2(product)) {
    return KORAX_KOBRA2_IMAGE
  }

  if (isBalflexFuelPump(product)) {
    return BALFLEX_FUEL_PUMP_IMAGE
  }

  if (isBalflexSupersteam(product)) {
    return BALFLEX_SUPERSTEAM_IMAGE
  }

  if (isBlindadaGasFg(product)) {
    return BLINDADA_GAS_FG_IMAGE
  }

  // Cristal Trançada deve vir ANTES da checagem genérica do Cristal
  if (isCristalTrancada(product)) {
    return CRISTAL_TRANCADA_IMAGE
  }

  if (isCristal(product)) {
    return CRISTAL_IMAGE
  }

  if (isSaidaDrenagem(product)) {
    return SAIDA_DRENAGEM_IMAGE
  }

  if (isSaidaCorrugadaBranca(product)) {
    return SAIDA_CORRUGADA_BRANCA_IMAGE
  }

  if (isSuccaoLaranja(product)) {
    return SUCCAO_LARANJA_IMAGE
  }

  if (isSuccaoCinzaOuVacuoArCinza(product)) {
    return VACUO_AR_CINZA_IMAGE
  }

  if (isSuccaoAzul(product)) {
    return SUCCAO_AZUL_IMAGE
  }

  if (isAluminioProtecao(product)) {
    return ALUMINIO_PROTECAO_IMAGE
  }

  if (isR14Teflon(product)) {
    return R14_TEFLON_IMAGE
  }

  // Se o candidato for uma imagem válida (inclusive placeholder customizado se fornecido)
  if (candidate) {
    return candidate
  }

  return fallbackUrl
}

/**
 * Retorna a lista completa de imagens para a galeria de detalhes:
 * - Se tiver imagens próprias não-placeholder, retorna elas.
 * - Se for Forza Uno Tropic, retorna [BALFLEX_FORZA_UNO_TROPIC_IMAGE].
 * - Se for Forza Uno, retorna [BALFLEX_FORZA_UNO_IMAGE].
 * - Se for Forza Due Tropic, retorna [BALFLEX_FORZA_DUE_TROPIC_IMAGE].
 * - Se for Forza Due, retorna [BALFLEX_FORZA_DUE_IMAGE].
 * - Se for Texmaster, retorna [BALFLEX_TEXMASTER_IMAGE].
 * - Se for R6 Multipurpose, retorna [BALFLEX_R6_MULTIPURPOSE_IMAGE].
 * - Se for Kobra 1 (Korax), retorna [KORAX_KOBRA1_IMAGE].
 * - Se for Kobra 2 (Korax), retorna [KORAX_KOBRA2_IMAGE].
 * - Se for Fuel Pump, retorna [BALFLEX_FUEL_PUMP_IMAGE].
 * - Se for Supersteam, retorna [BALFLEX_SUPERSTEAM_IMAGE].
 * - Se for Blindada Gás FG, retorna [BLINDADA_GAS_FG_IMAGE].
 * - Se for Cristal Trançada, retorna [CRISTAL_TRANCADA_IMAGE].
 * - Se for Cristal, retorna [CRISTAL_IMAGE].
 * - Se for Saída Drenagem, retorna [SAIDA_DRENAGEM_IMAGE].
 * - Se for Saída Corrugada Branca, retorna [SAIDA_CORRUGADA_BRANCA_IMAGE].
 * - Se for Sucção Laranja / Pesada, retorna [SUCCAO_LARANJA_IMAGE].
 * - Se for Sucção Cinza / Vácuo Ar Cinza, retorna [VACUO_AR_CINZA_IMAGE].
 * - Se for Sucção Azul / Vácuo Ar Azul, retorna [SUCCAO_AZUL_IMAGE].
 * - Se for Alumínio Proteção, retorna [ALUMINIO_PROTECAO_IMAGE].
 * - Se for R14 Teflon (Korax), retorna [R14_TEFLON_IMAGE].
 * - Caso contrário, retorna [fallbackUrl].
 */
export function getProductImages(
  product: ProductImageSubject | null | undefined,
  fallbackUrl: string = DEFAULT_PRODUCT_PLACEHOLDER,
): string[] {
  if (!product) return [fallbackUrl]

  const validImages = (product.images || []).filter(
    (img) => Boolean(img) && !img.includes('placeholder'),
  )

  if (validImages.length > 0) {
    return validImages
  }

  if (product.image && !product.image.includes('placeholder')) {
    return [product.image]
  }

  if (isBalflexForzaUnoTropic(product)) {
    return [BALFLEX_FORZA_UNO_TROPIC_IMAGE]
  }

  if (isBalflexForzaUno(product)) {
    return [BALFLEX_FORZA_UNO_IMAGE]
  }

  if (isBalflexForzaDueTropic(product)) {
    return [BALFLEX_FORZA_DUE_TROPIC_IMAGE]
  }

  if (isBalflexForzaDue(product)) {
    return [BALFLEX_FORZA_DUE_IMAGE]
  }

  if (isBalflexTexmaster(product)) {
    return [BALFLEX_TEXMASTER_IMAGE]
  }

  if (isBalflexR6Multipurpose(product)) {
    return [BALFLEX_R6_MULTIPURPOSE_IMAGE]
  }

  if (isKoraxKobra1(product)) {
    return [KORAX_KOBRA1_IMAGE]
  }

  if (isKoraxKobra2(product)) {
    return [KORAX_KOBRA2_IMAGE]
  }

  if (isBalflexFuelPump(product)) {
    return [BALFLEX_FUEL_PUMP_IMAGE]
  }

  if (isBalflexSupersteam(product)) {
    return [BALFLEX_SUPERSTEAM_IMAGE]
  }

  if (isBlindadaGasFg(product)) {
    return [BLINDADA_GAS_FG_IMAGE]
  }

  if (isCristalTrancada(product)) {
    return [CRISTAL_TRANCADA_IMAGE]
  }

  if (isCristal(product)) {
    return [CRISTAL_IMAGE]
  }

  if (isSaidaDrenagem(product)) {
    return [SAIDA_DRENAGEM_IMAGE]
  }

  if (isSaidaCorrugadaBranca(product)) {
    return [SAIDA_CORRUGADA_BRANCA_IMAGE]
  }

  if (isSuccaoLaranja(product)) {
    return [SUCCAO_LARANJA_IMAGE]
  }

  if (isSuccaoCinzaOuVacuoArCinza(product)) {
    return [VACUO_AR_CINZA_IMAGE]
  }

  if (isSuccaoAzul(product)) {
    return [SUCCAO_AZUL_IMAGE]
  }

  if (isAluminioProtecao(product)) {
    return [ALUMINIO_PROTECAO_IMAGE]
  }

  if (isR14Teflon(product)) {
    return [R14_TEFLON_IMAGE]
  }

  return [fallbackUrl]
}
