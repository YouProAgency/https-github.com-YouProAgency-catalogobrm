/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor numérico para o padrão de moeda brasileiro (ex.: R$ 1.234,56).
 * Retorna null se o valor for nulo, indefinido ou <= 0.
 */
export function formatCurrencyBRL(value?: number | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return ''
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Valida se uma string de unidade é válida e curta para exibição no frontend (ex.: MT, PC, UN).
 * Rejeita strings com mais de 6 caracteres ou idênticas ao nome do produto.
 */
export function isValidDisplayUnit(unit?: string | null, productName?: string | null): boolean {
  if (!unit) return false
  const trimmed = unit.trim()
  if (!trimmed || trimmed.length > 6) return false
  if (productName && trimmed.toLowerCase() === productName.trim().toLowerCase()) return false
  return true
}
