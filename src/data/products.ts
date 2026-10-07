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

// Lista vazia para evitar que produtos fictícios do template sejam exibidos caso algo importe `products`
export const products: Product[] = []
