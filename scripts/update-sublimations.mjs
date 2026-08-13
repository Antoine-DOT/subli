import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const SOURCE = 'https://wakfu.guide/sublimations/'
const OUTPUT = new URL('../src/data/sublimations.json', import.meta.url)
const SYMBOLS = { '🔴': 'R', '🟢': 'V', '🔵': 'B' }

function decode(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slug(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const response = await fetch(SOURCE, { headers: { 'user-agent': 'Subli dataset updater/0.1' } })
if (!response.ok) throw new Error(`Source inaccessible: HTTP ${response.status}`)
const html = await response.text()
const tableMatches = [...html.matchAll(/createSublimationsTable\([\s\S]*?`([\s\S]*?)`\s*\)/g)]
if (tableMatches.length < 30) throw new Error(`Structure inattendue: seulement ${tableMatches.length} tableaux détectés`)

const report = { tables: tableMatches.length, examined: 0, imported: 0, epicsIgnored: 0, relicsIgnored: 0, duplicates: 0, invalid: [] }
const unique = new Map()

for (const [, block] of tableMatches) {
  for (const rawLine of block.split(/\r?\n/)) {
    const line = decode(rawLine)
    if (!line) continue
    report.examined++
    const fields = line.split('|').map(decode)
    if (fields.length < 3) {
      report.invalid.push({ line, reason: 'moins de trois colonnes' })
      continue
    }
    const symbols = [...fields[0]].filter((symbol) => symbol in SYMBOLS)
    if (fields[0].includes('🟠')) { report.epicsIgnored++; continue }
    if (fields[0].includes('🟣')) { report.relicsIgnored++; continue }
    if (symbols.length !== 3) {
      report.invalid.push({ line, reason: 'pattern classique absent ou invalide' })
      continue
    }
    const pattern = symbols.map((symbol) => SYMBOLS[symbol])
    const name = fields[1]
    const effect = fields[2]
    const acquisition = fields.slice(3).join(' | ').trim() || 'Non renseignée par la source'
    if (!name || !effect) {
      report.invalid.push({ line, reason: 'nom ou effet manquant' })
      continue
    }
    const patternCode = pattern.join('')
    const key = `${patternCode}\u0000${name}\u0000${effect}\u0000${acquisition}`
    if (unique.has(key)) { report.duplicates++; continue }
    unique.set(key, { id: `${slug(name)}-${patternCode.toLowerCase()}-${createHash('sha1').update(key).digest('hex').slice(0, 7)}`, name, pattern, patternCode, effect, acquisition, source: SOURCE })
  }
}

const sublimations = [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }))
report.imported = sublimations.length
if (sublimations.length < 50) throw new Error(`Import peu fiable: seulement ${sublimations.length} classiques uniques`)

const payload = { metadata: { source: SOURCE, retrievedAt: new Date().toISOString().slice(0, 10), method: 'HTML statique, lignes embarquées dans createSublimationsTable', report }, sublimations }
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true })
await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
