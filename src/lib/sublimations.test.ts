import { describe, expect, it } from 'vitest'
import type { Sublimation } from '../types'
import { deduplicateSublimations, formatSublimationName } from './sublimations'

const makeSub = (id: string, name: string, patternCode = 'BBB'): Sublimation => ({
  id,
  name,
  pattern: patternCode.split('') as Sublimation['pattern'],
  patternCode,
  effect: `Effet ${id}`,
  acquisition: 'Obtention',
  source: 'source',
})

describe('présentation des sublimations', () => {
  it('déduplique un même nom et pattern malgré la casse et les accents', () => {
    const result = deduplicateSublimations([
      makeSub('first', 'Écailles de lune 6'),
      makeSub('duplicate', 'ecailles de lune 6'),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('first')
  })

  it('conserve deux patterns officiels différents', () => {
    expect(deduplicateSublimations([
      makeSub('first', 'Exemple 2', 'BBB'),
      makeSub('second', 'Exemple 2', 'RRR'),
    ])).toHaveLength(2)
  })

  it('affiche le nombre final comme un maximum', () => {
    expect(formatSublimationName('Brûlure 6')).toBe('Brûlure (Max lvl 6)')
    expect(formatSublimationName('Sans niveau')).toBe('Sans niveau')
  })
})
