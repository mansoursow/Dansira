import { useState } from 'react'
import { Check, Search, FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useStore, type Cabinet } from '../store'
import { useUi } from '../ui'
import { planSyscohada } from '../data/syscohada'
import { cabinet as poste } from '../data/cabinet'

type Onglet = 'cabinet' | 'plan' | 'modeles'

const onglets: { id: Onglet; label: string }[] = [
  { id: 'cabinet', label: 'Informations du cabinet' },
  { id: 'plan', label: 'Plan comptable SYSCOHADA' },
  { id: 'modeles', label: 'Modèles de documents' },
]

export default function Parametrage({ onMenu }: { onMenu: () => void }) {
  const { route, aller } = useUi()
  const onglet = (route.params.get('tab') ?? 'cabinet') as Onglet

  return (
    <>
      <PageHeader titre="Paramétrage" sousTitre={`Référentiel ${poste.referentiel} · version ${poste.version}`} onMenu={onMenu} />
      <main className="content">
        <div className="tabs tabs--page">
          {onglets.map((o) => (
            <button key={o.id} className={`tab ${onglet === o.id ? 'is-active' : ''}`} onClick={() => aller('parametrage', { tab: o.id })}>
              {o.label}
            </button>
          ))}
        </div>
        {onglet === 'cabinet' && <InfosCabinet />}
        {onglet === 'plan' && <PlanComptable />}
        {onglet === 'modeles' && (
          <section className="card">
            <div className="empty">
              <div className="empty__icon"><FileText size={28} strokeWidth={1.6} /></div>
              <h3>Modèles de documents</h3>
              <p>Lettre de mission, lettres de confirmation, rapports… Ce module sera construit avec les travaux de la mission.</p>
            </div>
          </section>
        )}
      </main>
    </>
  )
}

// ---------------------------------------------------------------------------

function InfosCabinet() {
  const { state, majCabinet } = useStore()
  const { toast } = useUi()
  const [c, setC] = useState<Cabinet>(state.cabinet)
  const modifie = JSON.stringify(c) !== JSON.stringify(state.cabinet)

  // Signataires possibles : collaborateurs actifs ayant l'habilitation de signer.
  const signataires = state.collaborateurs.filter((x) =>
    x.actif && state.profils.find((p) => p.id === x.profilId)?.permissions.includes('rapport.signer'),
  )

  const champ = (label: string, cle: keyof Cabinet, type = 'text') => (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={String(c[cle])}
        onChange={(e) => setC({ ...c, [cle]: type === 'number' ? Number(e.target.value) || c.exercice : e.target.value })}
      />
    </label>
  )

  return (
    <section className="card">
      <div className="form">
        <fieldset>
          <legend>Identité</legend>
          <div className="form-grid">
            <label className="field field--wide"><span>Nom du cabinet *</span>
              <input value={c.nom} onChange={(e) => setC({ ...c, nom: e.target.value })} /></label>
            {champ('Sigle', 'sigle')}
            {champ("N° d'inscription à l'Ordre", 'numeroOrdre')}
            {champ('Téléphone', 'telephone')}
            {champ('E-mail', 'email', 'email')}
            <label className="field field--wide"><span>Adresse</span>
              <input value={c.adresse} onChange={(e) => setC({ ...c, adresse: e.target.value })} /></label>
            {champ('Ville', 'ville')}
            {champ('Pays', 'pays')}
          </div>
        </fieldset>
        <fieldset>
          <legend>Exercice et signature</legend>
          <div className="form-grid">
            {champ('Exercice de travail', 'exercice', 'number')}
            <label className="field field--wide"><span>Associé signataire principal</span>
              <select value={c.signataire} onChange={(e) => setC({ ...c, signataire: e.target.value })}>
                <option value="">— Non défini —</option>
                {signataires.map((x) => {
                  const nom = `${x.prenom} ${x.nom}`.trim()
                  return <option key={x.id} value={nom}>{nom}</option>
                })}
                {c.signataire && !signataires.some((x) => `${x.prenom} ${x.nom}`.trim() === c.signataire) && <option>{c.signataire}</option>}
              </select></label>
          </div>
          <p className="note">
            L'exercice de travail s'affiche sur le tableau de bord et dans le menu. Le signataire est choisi parmi les
            collaborateurs dont le profil a l'habilitation « Signer les rapports ».
          </p>
        </fieldset>
        <div className="form-actions">
          {modifie && <span className="muted small">Modifications non enregistrées</span>}
          <button className="btn btn--ghost" disabled={!modifie} onClick={() => setC(state.cabinet)}>Annuler</button>
          <button
            className="btn btn--primary"
            disabled={!modifie || !c.nom.trim()}
            onClick={() => { majCabinet({ ...c, nom: c.nom.trim() }); toast('Informations du cabinet enregistrées') }}
          >
            <Check size={16} /> Enregistrer
          </button>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------

function PlanComptable() {
  const [q, setQ] = useState('')
  const [ouverte, setOuverte] = useState<string | null>(null)
  const terme = q.trim().toLowerCase()

  const classes = planSyscohada
    .map((cl) => ({
      ...cl,
      comptes: terme
        ? cl.comptes.filter((c) => c.numero.startsWith(terme) || c.libelle.toLowerCase().includes(terme))
        : cl.comptes,
    }))
    .filter((cl) => !terme || cl.comptes.length > 0 || cl.libelle.toLowerCase().includes(terme))

  return (
    <section className="card">
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input placeholder="Numéro ou libellé de compte…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <span className="muted small">Classes et comptes principaux · référence pour le mapping des balances</span>
      </div>
      <ul className="plan">
        {classes.map((cl) => {
          const open = !!terme || ouverte === cl.numero
          return (
            <li key={cl.numero} className={open ? 'is-open' : ''}>
              <button className="plan__classe" onClick={() => setOuverte(ouverte === cl.numero ? null : cl.numero)} aria-expanded={open}>
                <span className="plan__num">{cl.numero}</span>
                <span className="plan__lib">{cl.libelle}</span>
                <span className="tag">{cl.etat}</span>
              </button>
              {open && (
                <ul className="plan__comptes">
                  {cl.comptes.map((c) => (
                    <li key={c.numero}><span className="mono">{c.numero}</span>{c.libelle}</li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      {classes.length === 0 && <p className="muted">Aucun compte ne correspond.</p>}
    </section>
  )
}
