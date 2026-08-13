import type { Sublimation } from '../types'

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim().replace(/\s+/g, ' ')
}

export function searchSublimations(sublimations: readonly Sublimation[], query: string): Sublimation[] {
  const normalized = normalizeSearch(query)
  if (!normalized) return []
  return sublimations.filter(({ name }) => normalizeSearch(name).includes(normalized))
}
