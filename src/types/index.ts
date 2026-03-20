export interface Product {
  id: string
  sku: string
  name: string
  shortDescription: string
  longDescription: string
  images: string[]
  category: string
  subcategory: string
  specs: Record<string, string>
  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  name: string
  subcategories: string[]
}
