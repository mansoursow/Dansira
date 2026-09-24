import { useEffect, useState } from 'react'
import { Search, Info, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { memento, majMemento, type Bloc, type Section } from '../data/memento'
import { useUi } from '../ui'

const texteSection = (s: Section) =>
  [s.titre, s.resume, ...s.blocs.map((b) => JSON.stringify(b))].join(' ').toLowerCase()

export default function Memento({ onMenu }: { onMenu: () => void }) {
  const { route, aller } = useUi()
  const [q, setQ] = useState('')
  const actif = route.params.get('s') ?? memento[0].id

  const sections = q ? memento.filter((s) => texteSection(s).includes(q.toLowerCase())) : memento

  useEffect(() => {
    document.getElementById(`m-${actif}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [actif])

  return (
    <>
      <PageHeader titre="Memento" sousTitre={`Guide d'utilisation de DANSIRA · mis à jour le ${majMemento}`} onMenu={onMenu} />
      <main className="content memento">
        <nav className="memento__toc card">
          <label className="search">
            <Search size={16} />
            <input placeholder="Rechercher dans le memento…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <button className={s.id === actif ? 'is-active' : ''} onClick={() => aller('memento', { s: s.id })}>
                  {s.titre}
                </button>
              </li>
            ))}
          </ol>
          {sections.length === 0 && <p className="muted">Aucun résultat.</p>}
        </nav>

        <div className="memento__body">
          {sections.map((s, i) => (
            <section key={s.id} id={`m-${s.id}`} className="card memento__section">
              <div className="memento__num mono">{String(memento.indexOf(s) + 1).padStart(2, '0')}</div>
              <h2>{s.titre}</h2>
              <p className="memento__resume">{s.resume}</p>
              {s.blocs.map((b, j) => <BlocView key={`${i}-${j}`} bloc={b} />)}
            </section>
          ))}
        </div>
      </main>
    </>
  )
}

function BlocView({ bloc: b }: { bloc: Bloc }) {
  switch (b.type) {
    case 'p': return <p>{b.texte}</p>
    case 'h': return <h3>{b.texte}</h3>
    case 'liste': return <ul className="memento__list">{b.items.map((x) => <li key={x}>{x}</li>)}</ul>
    case 'etapes':
      return (
        <ol className="memento__steps">
          {b.items.map((x, i) => (
            <li key={x.titre}><span className="steps__num">{i + 1}</span><div><strong>{x.titre}</strong><p>{x.texte}</p></div></li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{b.entetes.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{b.lignes.map((l) => <tr key={l[0]}>{l.map((c, k) => <td key={k}>{k === 0 ? <strong>{c}</strong> : c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    case 'note':
      return (
        <div className={`callout ${b.ton === 'warn' ? 'callout--warn' : ''}`}>
          {b.ton === 'warn' ? <AlertTriangle size={16} /> : <Info size={16} />}
          <span>{b.texte}</span>
        </div>
      )
  }
}
