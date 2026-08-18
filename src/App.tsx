import { useMemo, useState } from 'react'
import dataset from './data/sublimations.json'
import { findCompatibleSublimations } from './lib/matching'
import { searchSublimations } from './lib/search'
import type { EquipmentSocket, Sublimation, SublimationMatch } from './types'

const sublimations = dataset.sublimations as Sublimation[]
const colors: Array<{ code: EquipmentSocket; label: string }> = [
  { code: 'R', label: 'Rouge' }, { code: 'V', label: 'Verte' }, { code: 'B', label: 'Bleue' }, { code: 'J', label: 'Blanche / Joker' },
]

function Pattern({ code }: { code: string }) {
  return <span className="pattern" aria-label={`Pattern ${code}`}>{[...code].map((socket, index) => <span className={`rune rune-${socket}`} key={`${socket}-${index}`} aria-hidden="true"><i /></span>)}</span>
}

function ResultCard({ item, showWindows = false }: { item: Sublimation | SublimationMatch; showWindows?: boolean }) {
  const windows = 'windows' in item ? item.windows : []
  return <article className="result-card">
    <div className="result-pattern"><Pattern code={item.patternCode} /><span className="pattern-code">{item.patternCode}</span></div>
    <div className="result-copy">
      <div className="result-title"><h3>{item.name}</h3>{showWindows && windows.length > 0 && <span className="window-tag">{windows.length === 2 ? 'Deux fenêtres' : windows[0]}</span>}</div>
      <p>{item.effect}</p>
      <p className="acquisition"><span>Obtention</span>{item.acquisition}</p>
    </div>
  </article>
}

export default function App() {
  const [sockets, setSockets] = useState<Array<EquipmentSocket | null>>([null, null, null, null])
  const [activeSlot, setActiveSlot] = useState(0)
  const [query, setQuery] = useState('')
  const [reorderable, setReorderable] = useState(false)
  const equipment = sockets.filter((socket): socket is EquipmentSocket => socket !== null)
  const matches = useMemo(() => findCompatibleSublimations(
    sublimations,
    sockets.filter((socket): socket is EquipmentSocket => socket !== null),
    reorderable ? 'reorderable' : 'ordered',
  ), [sockets, reorderable])
  const searchResults = useMemo(() => searchSublimations(sublimations, query), [query])

  function chooseSocket(socket: EquipmentSocket) {
    const updated = [...sockets]
    updated[activeSlot] = socket
    setSockets(updated)
    setActiveSlot(Math.min(activeSlot + 1, 3))
  }

  function clearSlot(index: number) {
    const updated = [...sockets]
    updated[index] = null
    setSockets(updated)
    setActiveSlot(index)
  }

  return <>
    <header className="topbar"><a className="brand" href="#top" aria-label="Subli, accueil"><span className="brand-mark">S</span>SUBLI</a><span className="header-note">L’ATELIER DES SUBLIMATIONS</span></header>
    <main id="top">
      <section className="quick-search" aria-labelledby="search-title"><div className="quick-search-heading"><p className="step">RECHERCHE DIRECTE</p><h1 id="search-title">Rechercher une sublimation</h1></div><label className="search-box"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Brûlure, Sauvegarde…" aria-label="Rechercher une sublimation par nom" />{query && <button onClick={() => setQuery('')} aria-label="Effacer la recherche">×</button>}</label>{query.trim() && <div className="search-summary">{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}</div>}{query.trim() && <div className="result-list search-list">{searchResults.map((item) => <ResultCard key={item.id} item={item} />)}</div>}</section>

      <section className="finder" aria-labelledby="finder-title">
        <div className="section-heading"><h2 id="finder-title">Tes châsses</h2><button className="reset" onClick={() => { setSockets([null, null, null, null]); setActiveSlot(0) }} disabled={equipment.length === 0}>Tout effacer</button></div>
        <div className="socket-row">
          {sockets.map((socket, index) => <button key={index} className={`socket ${socket ? `socket-${socket}` : ''} ${activeSlot === index ? 'active' : ''}`} onClick={() => { if (socket) clearSlot(index); else setActiveSlot(index) }} aria-label={socket ? `Châsse ${index + 1}: ${socket}, cliquer pour vider` : `Châsse ${index + 1}: vide`}>{socket ? <span className={`rune rune-${socket}`} aria-hidden="true"><i /></span> : <span className="socket-plus">+</span>}<small>{index + 1}</small></button>)}
        </div>
        <div className="palette" aria-label="Choisir une couleur">{colors.map(({ code, label }) => <button key={code} className={`color-choice color-${code}`} onClick={() => chooseSocket(code)}><span className={`rune rune-${code}`} aria-hidden="true"><i /></span>{label}</button>)}</div>
        <div className="finder-options"><p className="legend"><span><i className="dot red" />R Rouge</span><span><i className="dot green" />V Verte</span><span><i className="dot blue" />B Bleue</span><span><i className="dot white" />J Blanche / Joker</span></p><label className="order-toggle"><input type="checkbox" checked={reorderable} onChange={(event) => setReorderable(event.target.checked)} /><span className="toggle-track" aria-hidden="true"><i /></span><span><strong>Ordre modifiable</strong><small>Considère les châsses comme réorganisables.</small></span></label></div>
      </section>

      <section className="results" aria-live="polite">
        <div className="results-heading"><div><p className="step">SUBLIMATIONS POSSIBLES</p><h2>{equipment.length < 3 ? 'Complète au moins 3 châsses' : <><strong>{matches.length}</strong> sublimation{matches.length > 1 ? 's' : ''} compatible{matches.length > 1 ? 's' : ''}</>}</h2></div>{equipment.length >= 3 && <span className="equipment-code">{equipment.join('')}</span>}</div>
        {equipment.length < 3 ? <div className="empty-state"><span>⌁</span><p>Les résultats apparaîtront ici dès que trois châsses seront renseignées.</p></div> : <div className="result-list">{matches.map((item) => <ResultCard key={item.id} item={item} showWindows={equipment.length === 4 && !reorderable} />)}</div>}
      </section>

    </main>
    <footer><span className="brand small"><span className="brand-mark">S</span>SUBLI</span><div className="footer-copy"><p className="creator">Un outil communautaire créé par Roi, meneur de la guilde Andromeda.</p><p>Site non officiel et non affilié à Ankama. WAKFU et tous les éléments associés appartiennent à Ankama. Subli est conçu uniquement pour aider les joueurs.</p></div></footer>
  </>
}
