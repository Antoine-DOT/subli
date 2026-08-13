import { describe, expect, it } from 'vitest'
import { normalizeSearch, searchSublimations } from './search'
import type { Sublimation } from '../types'

const brulure: Sublimation = { id: '1', name: 'Brûlure 4', pattern: ['R', 'R', 'B'], patternCode: 'RRB', effect: 'Effet', acquisition: 'Obtention', source: 'source' }

describe('recherche', () => {
  it('normalise accents, casse et espaces', () => expect(normalizeSearch('  BRÛLURE  ')).toBe('brulure'))
  it('retrouve Brûlure avec brulure', () => expect(searchSublimations([brulure], 'brulure')).toEqual([brulure]))
  it('tolère casse et espaces', () => expect(searchSublimations([brulure], '  BrUlUrE ')).toEqual([brulure]))
})
