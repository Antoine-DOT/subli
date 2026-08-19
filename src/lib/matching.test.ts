import { describe, expect, it } from 'vitest'
import { findCompatibleSublimations, isValidClassicPattern, matchesReorderable, matchesWindow } from './matching'
import type { Sublimation } from '../types'

const makeSub = (id: string, patternCode: string): Sublimation => ({
  id, name: id, pattern: patternCode.split('') as Sublimation['pattern'], patternCode, effect: 'Effet', acquisition: 'Obtention', source: 'source',
})

describe('matching', () => {
  it('respecte strictement l’ordre', () => {
    expect(matchesWindow(['R', 'R', 'V'], ['R', 'R', 'V'])).toBe(true)
    expect(matchesWindow(['R', 'R', 'V'], ['R', 'V', 'R'])).toBe(false)
  })

  it('utilise le Joker côté équipement', () => {
    for (const code of ['RRR', 'RRV', 'RRB']) expect(matchesWindow(code.split('') as Sublimation['pattern'], ['R', 'R', 'J'])).toBe(true)
  })

  it('teste les deux fenêtres de quatre châsses et déduplique', () => {
    const result = findCompatibleSublimations([makeSub('first', 'RRB'), makeSub('second', 'RBV')], ['R', 'R', 'J', 'V'])
    expect(result.find(({ id }) => id === 'first')?.windows).toContain('1-2-3')
    expect(result.find(({ id }) => id === 'second')?.windows).toContain('2-3-4')
    const double = findCompatibleSublimations([makeSub('double', 'RRR')], ['R', 'R', 'R', 'R'])
    expect(double).toHaveLength(1)
    expect(double[0].windows).toEqual(['1-2-3', '2-3-4'])
  })

  it('fait matcher tous les patterns avec trois ou quatre Jokers', () => {
    const subs = [makeSub('a', 'RRR'), makeSub('b', 'VBR'), makeSub('c', 'BBB')]
    expect(findCompatibleSublimations(subs, ['J', 'J', 'J'])).toHaveLength(3)
    expect(findCompatibleSublimations(subs, ['J', 'J', 'J', 'J'])).toHaveLength(3)
  })

  it('refuse moins de trois châsses', () => {
    const subs = [makeSub('a', 'RRR')]
    expect(findCompatibleSublimations(subs, [])).toEqual([])
    expect(findCompatibleSublimations(subs, ['R'])).toEqual([])
    expect(findCompatibleSublimations(subs, ['R', 'R'])).toEqual([])
  })

  it('ne compacte pas les châsses séparées par un trou', () => {
    const subs = [makeSub('bvb', 'BVB')]
    expect(findCompatibleSublimations(subs, ['B', 'V', null, 'B'])).toEqual([])
    expect(findCompatibleSublimations(subs, ['B', null, 'V', 'B'])).toEqual([])
  })

  it('accepte toujours trois châsses contiguës avec une quatrième vide', () => {
    const subs = [makeSub('bvb', 'BVB')]
    expect(findCompatibleSublimations(subs, ['B', 'V', 'B', null])).toHaveLength(1)
    expect(findCompatibleSublimations(subs, [null, 'B', 'V', 'B'])).toHaveLength(1)
  })

  it('valide exactement trois couleurs classiques', () => {
    expect(isValidClassicPattern(['R', 'V', 'B'])).toBe(true)
    expect(isValidClassicPattern(['R', 'J', 'B'])).toBe(false)
    expect(isValidClassicPattern(['R', 'V'])).toBe(false)
  })

  describe('ordre modifiable', () => {
    it('considère les permutations équivalentes sans modifier le mode normal', () => {
      expect(matchesWindow(['V', 'B', 'R'], ['R', 'B', 'V'])).toBe(false)
      expect(matchesReorderable(['V', 'B', 'R'], ['R', 'B', 'V'])).toBe(true)
      expect(findCompatibleSublimations([makeSub('permutation', 'VBR')], ['R', 'B', 'V'])).toEqual([])
      expect(findCompatibleSublimations([makeSub('permutation', 'VBR')], ['R', 'B', 'V'], 'reorderable')).toHaveLength(1)
    })

    it('respecte les quantités et le nombre de Jokers avec BBVJ', () => {
      expect(matchesReorderable(['B', 'B', 'B'], ['B', 'B', 'V', 'J'])).toBe(true)
      expect(matchesReorderable(['R', 'R', 'V'], ['B', 'B', 'V', 'J'])).toBe(false)
    })

    it('ne réutilise pas un Joker pour deux couleurs manquantes', () => {
      expect(matchesReorderable(['B', 'R', 'V'], ['B', 'B', 'J'])).toBe(false)
      expect(matchesReorderable(['B', 'R', 'V'], ['B', 'J', 'J'])).toBe(true)
      expect(matchesReorderable(['R', 'R', 'R'], ['B', 'J', 'J'])).toBe(false)
    })

    it('fait matcher tous les patterns valides avec JJJ et JJJJ', () => {
      const patterns = [['R', 'R', 'R'], ['R', 'V', 'B'], ['B', 'B', 'V']] as const
      for (const pattern of patterns) {
        expect(matchesReorderable(pattern, ['J', 'J', 'J'])).toBe(true)
        expect(matchesReorderable(pattern, ['J', 'J', 'J', 'J'])).toBe(true)
      }
    })

    it('utilise n’importe quelles trois châsses sur un équipement à quatre châsses', () => {
      const sublimation = makeSub('non-contigu', 'RRV')
      expect(findCompatibleSublimations([sublimation], ['R', 'B', 'R', 'V'])).toEqual([])
      expect(findCompatibleSublimations([sublimation], ['R', 'B', 'R', 'V'], 'reorderable')).toHaveLength(1)
    })

    it('ne produit aucun doublon', () => {
      const sublimation = makeSub('unique', 'RBV')
      const result = findCompatibleSublimations([sublimation], ['R', 'B', 'V', 'J'], 'reorderable')
      expect(result).toHaveLength(1)
      expect(new Set(result.map(({ id }) => id)).size).toBe(result.length)
    })

    it('refuse également les trous en mode ordre modifiable', () => {
      const sublimation = makeSub('bvb', 'BVB')
      expect(findCompatibleSublimations([sublimation], ['B', 'V', null, 'B'], 'reorderable')).toEqual([])
    })
  })
})
