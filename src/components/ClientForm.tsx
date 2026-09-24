import { formesJuridiques, uid, type Client } from '../store'

export const clientVide = (): Client => ({
  id: uid(), raisonSociale: '', sigle: '', formeJuridique: 'SA', rccm: '', nif: '', siege: '', activite: '', dirigeant: '',
})

interface Props {
  client: Client
  onChange: (c: Client) => void
  disabled?: boolean
}

/** Champs d'identité d'un client (assistant de mission, dossiers clients). */
export default function ClientForm({ client, onChange, disabled }: Props) {
  const champ = (label: string, cle: keyof Client) => (
    <label className="field">
      <span>{label}</span>
      <input value={client[cle]} disabled={disabled} onChange={(e) => onChange({ ...client, [cle]: e.target.value })} />
    </label>
  )

  return (
    <div className="form-grid">
      {champ('Raison sociale *', 'raisonSociale')}
      {champ('Sigle', 'sigle')}
      <label className="field">
        <span>Forme juridique</span>
        <select value={client.formeJuridique} disabled={disabled} onChange={(e) => onChange({ ...client, formeJuridique: e.target.value })}>
          {formesJuridiques.map((f) => <option key={f}>{f}</option>)}
        </select>
      </label>
      {champ('N° RCCM', 'rccm')}
      {champ('NIF / NINEA', 'nif')}
      {champ('Dirigeant', 'dirigeant')}
      {champ('Siège social', 'siege')}
      {champ('Activité', 'activite')}
    </div>
  )
}
