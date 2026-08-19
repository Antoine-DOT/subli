import type { Sublimation } from '../types'
import { normalizeSearch } from './search'

export function deduplicateSublimations(sublimations: readonly Sublimation[]): Sublimation[] {
  const unique = new Map<string, Sublimation>()

  for (const sublimation of sublimations) {
    const key = `${normalizeSearch(sublimation.name)}\u0000${sublimation.patternCode}`
    if (!unique.has(key)) unique.set(key, sublimation)
  }

  return [...unique.values()]
}

export function formatSublimationName(name: string): string {
  return name.replace(/\s+(\d+)\s*$/, ' (Max $1)')
}
