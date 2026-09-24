import { Mail, BookOpen, PlayCircle } from 'lucide-react'
import { actualites } from '../data/cabinet'
import { useUi } from '../ui'

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

export default function NewsPanel() {
  const { aller, soon } = useUi()
  return (
    <aside className="side-col">
      <section className="card news">
        <header className="card__head">
          <h2 className="card__title"><Mail size={16} /> Informations</h2>
        </header>
        <ul className="news__list">
          {actualites.map((a) => (
            <li key={a.titre}>
              <div className="news__date">{fmt(a.date)}</div>
              <div className="news__title">{a.titre}</div>
              <p>{a.texte}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="resources">
        <button className="resource" onClick={() => aller('memento')}>
          <BookOpen size={20} /> <span>Memento</span>
        </button>
        <button className="resource resource--alt" onClick={() => soon('Tutoriel')}>
          <PlayCircle size={20} /> <span>Tutoriel</span>
        </button>
      </div>
    </aside>
  )
}
