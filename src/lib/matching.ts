import type { EquipmentSlot, RequiredSocket, Sublimation, SublimationMatch } from '../types'

const requiredSockets = new Set<RequiredSocket>(['R', 'V', 'B'])
const socketColors: RequiredSocket[] = ['R', 'V', 'B']

export type MatchingMode = 'ordered' | 'reorderable'

export function isValidClassicPattern(pattern: readonly string[]): pattern is RequiredSocket[] {
  return pattern.length === 3 && pattern.every((socket) => requiredSockets.has(socket as RequiredSocket))
}

export function matchesWindow(pattern: readonly RequiredSocket[], window: readonly EquipmentSlot[]): boolean {
  return isValidClassicPattern(pattern) && window.length === 3 && pattern.every((required, index) => window[index] === 'J' || window[index] === required)
}

function hasThreeContiguousSockets(equipment: readonly EquipmentSlot[]): boolean {
  let contiguous = 0
  return equipment.some((socket) => {
    contiguous = socket === null ? 0 : contiguous + 1
    return contiguous >= 3
  })
}

export function matchesReorderable(pattern: readonly RequiredSocket[], equipment: readonly EquipmentSlot[]): boolean {
  if (!isValidClassicPattern(pattern) || equipment.length < 3 || equipment.length > 4) return false
  if (!hasThreeContiguousSockets(equipment)) return false

  const jokers = equipment.filter((socket) => socket === 'J').length
  const missingColors = socketColors.reduce((missing, color) => {
    const required = pattern.filter((socket) => socket === color).length
    const available = equipment.filter((socket) => socket === color).length
    return missing + Math.max(0, required - available)
  }, 0)

  return missingColors <= jokers
}

export function findOrderedSublimations(sublimations: readonly Sublimation[], equipment: readonly EquipmentSlot[]): SublimationMatch[] {
  if (equipment.length < 3 || equipment.length > 4) return []
  const windows = equipment.length === 3
    ? [{ label: '1-2-3' as const, sockets: equipment }]
    : [
        { label: '1-2-3' as const, sockets: equipment.slice(0, 3) },
        { label: '2-3-4' as const, sockets: equipment.slice(1, 4) },
      ]

  return sublimations.flatMap((sublimation) => {
    if (!isValidClassicPattern(sublimation.pattern)) return []
    const matched = windows.filter(({ sockets }) => matchesWindow(sublimation.pattern, sockets)).map(({ label }) => label)
    return matched.length ? [{ ...sublimation, windows: matched }] : []
  })
}

export function findReorderableSublimations(sublimations: readonly Sublimation[], equipment: readonly EquipmentSlot[]): SublimationMatch[] {
  if (equipment.length < 3 || equipment.length > 4) return []
  return sublimations.flatMap((sublimation) => matchesReorderable(sublimation.pattern, equipment)
    ? [{ ...sublimation, windows: [] }]
    : [])
}

export function findCompatibleSublimations(
  sublimations: readonly Sublimation[],
  equipment: readonly EquipmentSlot[],
  mode: MatchingMode = 'ordered',
): SublimationMatch[] {
  return mode === 'reorderable'
    ? findReorderableSublimations(sublimations, equipment)
    : findOrderedSublimations(sublimations, equipment)
}
