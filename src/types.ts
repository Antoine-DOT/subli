export type RequiredSocket = 'R' | 'V' | 'B'
export type EquipmentSocket = RequiredSocket | 'J'
export type EquipmentSlot = EquipmentSocket | null

export interface Sublimation {
  id: string
  name: string
  pattern: RequiredSocket[]
  patternCode: string
  effect: string
  acquisition: string
  source: string
}

export interface SublimationMatch extends Sublimation {
  windows: Array<'1-2-3' | '2-3-4'>
}
