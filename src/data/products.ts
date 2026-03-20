import { Product, Category } from '@/types'

export const categories: Category[] = [
  {
    name: 'Mobiliário Corporativo',
    subcategories: ['Cadeiras Ergonômicas', 'Mesas de Reunião', 'Armários e Arquivos'],
  },
  {
    name: 'Equipamentos de TI',
    subcategories: ['Monitores Profissionais', 'Estações de Trabalho', 'Acessórios'],
  },
  {
    name: 'Iluminação',
    subcategories: ['Painéis LED', 'Luminárias de Mesa', 'Iluminação Industrial'],
  },
]

export const products: Product[] = [
  {
    id: '1',
    sku: 'MC-CAD-001',
    name: 'Cadeira Ergonômica Pro Elite',
    shortDescription: 'Cadeira com suporte lombar ajustável e tela mesh respirável.',
    longDescription:
      'A Cadeira Ergonômica Pro Elite foi desenvolvida para ambientes corporativos de alta performance. Com ajustes 4D nos braços, inclinação sincronizada e suporte lombar dinâmico, garante conforto para jornadas prolongadas. Seu encosto em tela mesh de alta densidade proporciona excelente dissipação térmica.',
    images: [
      'https://img.usecurling.com/p/800/800?q=office%20chair&color=black',
      'https://img.usecurling.com/p/800/800?q=chair%20wheels&color=black',
      'https://img.usecurling.com/p/800/800?q=mesh%20fabric&color=gray',
    ],
    category: 'Mobiliário Corporativo',
    subcategory: 'Cadeiras Ergonômicas',
    featured: true,
    specs: {
      'Peso Máximo': '150 kg',
      Material: 'Alumínio, Nylon, Tela Mesh',
      'Ajuste de Altura': 'Gás Classe 4 (10cm de variação)',
      Garantia: '5 anos',
    },
  },
  {
    id: '2',
    sku: 'MC-MES-042',
    name: 'Mesa de Reunião Executive 8 Lugares',
    shortDescription: 'Mesa de reunião ampla com acabamento em nogueira e calha conectora.',
    longDescription:
      'Projetada para salas de decisão, a Mesa Executive acomoda confortavelmente até 8 pessoas. Conta com sistema de caixas de conectividade centrais ocultas embutidas no tampo, permitindo organização impecável dos cabos.',
    images: [
      'https://img.usecurling.com/p/800/800?q=meeting%20table',
      'https://img.usecurling.com/p/800/800?q=wood%20texture',
    ],
    category: 'Mobiliário Corporativo',
    subcategory: 'Mesas de Reunião',
    featured: true,
    specs: {
      Dimensões: '240cm x 120cm x 75cm',
      Material: 'MDF BP 25mm, Aço carbono',
      Conectividade: '2 caixas com 4 tomadas e 2 RJ45 cada',
    },
  },
  {
    id: '3',
    sku: 'TI-MON-089',
    name: 'Monitor Profissional UltraWide 34"',
    shortDescription: 'Monitor curvo 34 polegadas com resolução WQHD para produtividade extrema.',
    longDescription:
      'Expanda seu espaço de trabalho com o Monitor UltraWide de 34 polegadas. Sua curvatura sutil reduz a fadiga ocular, enquanto o painel IPS garante precisão de cores para trabalhos criativos e análise de dados complexos.',
    images: [
      'https://img.usecurling.com/p/800/800?q=ultrawide%20monitor',
      'https://img.usecurling.com/p/800/800?q=computer%20screen',
    ],
    category: 'Equipamentos de TI',
    subcategory: 'Monitores Profissionais',
    featured: false,
    specs: {
      Resolução: '3440 x 1440 (WQHD)',
      Painel: 'IPS, 99% sRGB',
      Conexões: 'USB-C (90W PD), 2x HDMI, 1x DP',
      Ergonomia: 'Ajuste de altura e inclinação',
    },
  },
  {
    id: '4',
    sku: 'IL-LED-102',
    name: 'Painel LED Embutir 40W',
    shortDescription: 'Iluminação homogênea para escritórios e ambientes comerciais.',
    longDescription:
      'Painel de LED ultrafino com design elegante, ideal para forros modulares ou gesso. Proporciona luz difusa sem ofuscamento, ideal para manter o conforto visual da equipe durante todo o dia.',
    images: ['https://img.usecurling.com/p/800/800?q=led%20panel&color=white'],
    category: 'Iluminação',
    subcategory: 'Painéis LED',
    featured: false,
    specs: {
      Potência: '40W',
      'Temperatura de Cor': '4000K (Branco Neutro)',
      'Fluxo Luminoso': '4000 lúmens',
      VidaÚtil: '50.000 horas',
    },
  },
  {
    id: '5',
    sku: 'TI-WRK-005',
    name: 'Estação de Trabalho Dual Pro',
    shortDescription: 'Desktop de alto desempenho para modelagem 3D e renderização.',
    longDescription:
      'Uma verdadeira usina de força. A Estação Dual Pro foi montada com componentes de nível servidor para lidar com as cargas de trabalho mais exigentes, de simulações de engenharia à criação de mídias.',
    images: ['https://img.usecurling.com/p/800/800?q=workstation%20pc&color=black'],
    category: 'Equipamentos de TI',
    subcategory: 'Estações de Trabalho',
    featured: true,
    specs: {
      Processador: 'Intel Xeon W-series',
      Memória: '64GB ECC DDR4',
      Armazenamento: '2TB NVMe PCIe 4.0',
      'Placa de Vídeo': 'NVIDIA RTX A4000 16GB',
    },
  },
  {
    id: '6',
    sku: 'MC-ARM-220',
    name: 'Armário Corporativo em Aço',
    shortDescription: 'Armário resistente de duas portas com fechadura reforçada.',
    longDescription:
      'Segurança e durabilidade para arquivar documentos importantes. Feito inteiramente em chapa de aço tratada com pintura eletrostática, possui prateleiras reguláveis e suporta até 50kg por bandeja.',
    images: ['https://img.usecurling.com/p/800/800?q=metal%20cabinet&color=gray'],
    category: 'Mobiliário Corporativo',
    subcategory: 'Armários e Arquivos',
    featured: false,
    specs: {
      Dimensões: '198cm x 90cm x 40cm',
      Material: 'Chapa de Aço #24',
      Acabamento: 'Pintura Epóxi Pó',
      Capacidade: '50kg por prateleira',
    },
  },
]
