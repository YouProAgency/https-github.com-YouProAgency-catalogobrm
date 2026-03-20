import { Product, Category } from '@/types'

export const categories: Category[] = [
  {
    name: 'Mangueiras Industriais',
    subcategories: ['Ar e Água', 'Hidráulicas', 'Sucção e Descarga'],
  },
  {
    name: 'Conexões',
    subcategories: ['Aço Carbono', 'Latão', 'Engates Rápidos'],
  },
  {
    name: 'Acessórios',
    subcategories: ['Abraçadeiras', 'Válvulas', 'Manômetros'],
  },
]

export const products: Product[] = [
  {
    id: '1',
    sku: 'MANG-AA-01',
    name: 'Mangueira de Ar e Água 300 PSI',
    shortDescription:
      'Mangueira flexível e resistente para uso industrial geral e construção civil.',
    longDescription:
      'Desenvolvida para serviços pesados na indústria e construção civil, a mangueira de Ar e Água 300 PSI oferece alta durabilidade contra abrasão e intempéries. Construída com borracha sintética e reforço de fios de poliéster de alta tenacidade.',
    images: ['https://img.usecurling.com/p/800/800?q=industrial%20hose&color=black'],
    category: 'Mangueiras Industriais',
    subcategory: 'Ar e Água',
    featured: true,
    specs: {
      'Pressão de Trabalho': '300 PSI',
      Material: 'Borracha Sintética EPDM',
      Temperatura: '-20°C a +80°C',
    },
  },
  {
    id: '2',
    sku: 'MANG-HID-100',
    name: 'Mangueira Hidráulica R2AT Alta Pressão',
    shortDescription:
      'Mangueira com duplo reforço em aço para sistemas hidráulicos de alta pressão.',
    longDescription:
      'Ideal para equipamentos hidráulicos sujeitos a picos de pressão. O modelo R2AT possui tubo interno de borracha sintética resistente a óleo e duplo trançado de fios de aço de alta resistência, suportando aplicações extremas.',
    images: ['https://img.usecurling.com/p/800/800?q=hydraulic%20hose&color=black'],
    category: 'Mangueiras Industriais',
    subcategory: 'Hidráulicas',
    featured: true,
    specs: {
      Reforço: '2 tramas de aço',
      Fluido: 'Óleo mineral ou sintético',
      Norma: 'SAE 100 R2AT',
    },
  },
  {
    id: '3',
    sku: 'CONEX-LT-45',
    name: 'Conexão Macho Latão NPT 1/2"',
    shortDescription: 'Conexão robusta em latão forjado para sistemas de ar comprimido e água.',
    longDescription:
      'As conexões em latão garantem perfeita vedação e excelente resistência à corrosão. Amplamente utilizadas em redes de ar comprimido, lubrificação, e linhas de água industrial, suportando intempéries.',
    images: ['https://img.usecurling.com/p/800/800?q=brass%20fitting&color=yellow'],
    category: 'Conexões',
    subcategory: 'Latão',
    featured: false,
    specs: {
      Rosca: 'NPT 1/2"',
      Material: 'Latão Forjado',
      Aplicação: 'Ar, Água, Óleo',
    },
  },
  {
    id: '4',
    sku: 'ENG-RAP-01',
    name: 'Engate Rápido Face Plana (Flat Face)',
    shortDescription:
      'Engate rápido de alta segurança que evita vazamento de fluidos ao desconectar.',
    longDescription:
      'O Engate Rápido de Face Plana foi desenhado para aplicações exigentes onde o vazamento de fluido no desacoplamento é inaceitável. Evita contaminação do solo e garante a segurança da operação.',
    images: ['https://img.usecurling.com/p/800/800?q=quick%20coupling&color=gray'],
    category: 'Conexões',
    subcategory: 'Engates Rápidos',
    featured: true,
    specs: {
      Material: 'Aço Carbono Zincado',
      'Pressão Máxima': '350 Bar',
      Válvula: 'Face Plana (Sem Gotejamento)',
    },
  },
]
