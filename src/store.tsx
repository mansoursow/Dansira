import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StatutMission = 'planification' | 'en_cours' | 'revue' | 'cloturee'
export type ModeCreation = 'vierge' | 'clone' | 'report'

export interface Client {
  id: string
  raisonSociale: string
  sigle: string
  formeJuridique: string
  rccm: string
  nif: string
  siege: string
  activite: string
  dirigeant: string
}

/** Informations du cabinet (module Paramétrage). */
export interface Cabinet {
  nom: string
  sigle: string
  adresse: string
  ville: string
  pays: string
  telephone: string
  email: string
  numeroOrdre: string // n° d'inscription au tableau de l'Ordre
  exercice: number // exercice de travail du cabinet
  signataire: string // associé signataire principal
}

export interface MembreEquipe {
  collaborateurId: string
  role: string
}

export interface Mission {
  id: string
  code: string
  clientId: string
  type: string
  exercice: number
  debut: string // ISO, début d'exercice
  fin: string // ISO, fin d'exercice (date de clôture des comptes)
  echeance: string // ISO, date limite d'émission du rapport
  statut: StatutMission
  avancement: number
  equipe: MembreEquipe[]
  origine: { mode: ModeCreation; sourceId?: string; sourceCode?: string }
  reprise: string[] // éléments repris de la mission source
  arrete?: { date: string; commentaire: string } // renseigné à la clôture
  suiteId?: string // mission N+1 créée depuis celle-ci
  creeLe: string
}

export type Permission =
  | 'mission.creer'
  | 'mission.toutes'
  | 'mission.modifier'
  | 'travaux.saisir'
  | 'travaux.reviser'
  | 'mission.cloturer'
  | 'rapport.signer'
  | 'droits.gerer'
  | 'parametrage.gerer'

export interface Profil {
  id: string
  nom: string
  description: string
  permissions: Permission[]
  systeme: boolean // profils livrés, non supprimables
  niveaux?: string[] // grades du profil (ex. S1, S2, S3)
  roleDefaut: string // rôle proposé lors d'une affectation à une mission
}

export interface Collaborateur {
  id: string
  nom: string
  prenom: string
  initiales: string
  email: string
  telephone: string
  profilId: string
  niveau?: string // grade précis quand le profil en comporte plusieurs
  actif: boolean
}

export interface State {
  version: number
  cabinet: Cabinet
  clients: Client[]
  missions: Mission[]
  collaborateurs: Collaborateur[]
  profils: Profil[]
  compteur: number // numérotation des missions
}

// ---------------------------------------------------------------------------
// Référentiels
// ---------------------------------------------------------------------------

export const permissionsLabels: Record<Permission, string> = {
  'mission.creer': 'Créer des missions',
  'mission.toutes': 'Voir toutes les missions du cabinet',
  'mission.modifier': 'Modifier les missions affectées',
  'travaux.saisir': 'Réaliser les travaux (feuilles de travail)',
  'travaux.reviser': 'Revoir et valider les travaux',
  'mission.cloturer': 'Clôturer une mission (arrêté)',
  'rapport.signer': 'Signer les rapports',
  'droits.gerer': 'Gérer collaborateurs et droits',
  'parametrage.gerer': 'Paramétrage du cabinet',
}

export const toutesPermissions = Object.keys(permissionsLabels) as Permission[]

export const rolesMission = [
  'Associé signataire',
  'Senior Manager / Directeur',
  'Manager',
  'Assistant Manager',
  'Chef de mission',
  'Senior',
  'Assistant',
  'Stagiaire',
]

export const formesJuridiques = ['SA', 'SARL', 'SAS', 'SNC', 'SCS', 'GIE', 'Société civile', 'Association', 'Établissement public', 'Autre']

export const statutLabels: Record<StatutMission, string> = {
  planification: 'Planification',
  en_cours: 'En cours',
  revue: 'En revue',
  cloturee: 'Clôturée',
}

/** Éléments reprenables selon le mode de création. */
export const elementsReprise: Record<Exclude<ModeCreation, 'vierge'>, { id: string; label: string; detail: string; defaut: boolean }[]> = {
  clone: [
    { id: 'parametres', label: 'Paramètres de mission', detail: 'Type de mission et norme applicable', defaut: true },
    { id: 'programme', label: 'Programme de travail', detail: 'Cycles, contrôles et feuilles de travail (vides)', defaut: true },
    { id: 'equipe', label: 'Équipe', detail: 'Collaborateurs affectés et leurs rôles', defaut: true },
    { id: 'modeles', label: 'Modèles de documents', detail: 'Lettre de mission, confirmations, rapports', defaut: true },
  ],
  report: [
    { id: 'client', label: 'Identité du client', detail: 'Toujours reprise (même entité)', defaut: true },
    { id: 'parametres', label: 'Paramètres de mission', detail: 'Type de mission et norme applicable', defaut: true },
    { id: 'equipe', label: 'Équipe', detail: 'Collaborateurs affectés et leurs rôles', defaut: true },
    { id: 'programme', label: 'Programme de travail', detail: 'Structure des cycles et contrôles', defaut: true },
    { id: 'dossier_permanent', label: 'Dossier permanent', detail: 'Statuts, organigramme, contrats, procédures', defaut: true },
    { id: 'a_nouveaux', label: "À-nouveaux (soldes d'ouverture)", detail: "Soldes de l'arrêté N repris comme ouverture N+1", defaut: true },
    { id: 'points_suivi', label: 'Points de suivi N', detail: 'Recommandations et anomalies à revoir en N+1', defaut: true },
  ],
}

export const elementLabel = (id: string) =>
  [...elementsReprise.clone, ...elementsReprise.report].find((e) => e.id === id)?.label ?? id

// ---------------------------------------------------------------------------
// Données initiales
// ---------------------------------------------------------------------------

// Grille des grades du cabinet (codes usuels).
const profilsInitiaux: Profil[] = [
  {
    id: 'p-stagiaire', nom: 'Stagiaire', description: 'Stagiaire', systeme: true, roleDefaut: 'Stagiaire',
    permissions: ['travaux.saisir'],
  },
  {
    id: 'p-assistant', nom: 'A1 / A2', description: 'Associate / Assistant 1 & 2', systeme: true, niveaux: ['A1', 'A2'], roleDefaut: 'Assistant',
    permissions: ['travaux.saisir'],
  },
  {
    id: 'p-senior', nom: 'S1 / S2 / S3', description: 'Senior 1, 2, 3', systeme: true, niveaux: ['S1', 'S2', 'S3'], roleDefaut: 'Senior',
    permissions: ['mission.modifier', 'travaux.saisir'],
  },
  {
    id: 'p-chef', nom: 'Chef de mission', description: 'Responsable de mission', systeme: true, roleDefaut: 'Chef de mission',
    permissions: ['mission.modifier', 'travaux.saisir', 'travaux.reviser'],
  },
  {
    id: 'p-am', nom: 'AM', description: 'Assistant Manager', systeme: true, roleDefaut: 'Assistant Manager',
    permissions: ['mission.creer', 'mission.modifier', 'travaux.saisir', 'travaux.reviser'],
  },
  {
    id: 'p-manager', nom: 'M1 / M2 / M3', description: 'Manager 1, 2, 3', systeme: true, niveaux: ['M1', 'M2', 'M3'], roleDefaut: 'Manager',
    permissions: ['mission.creer', 'mission.toutes', 'mission.modifier', 'travaux.saisir', 'travaux.reviser', 'mission.cloturer'],
  },
  {
    id: 'p-sm', nom: 'SM / Director', description: 'Senior Manager / Directeur', systeme: true, niveaux: ['SM', 'Director'], roleDefaut: 'Senior Manager / Directeur',
    permissions: ['mission.creer', 'mission.toutes', 'mission.modifier', 'travaux.saisir', 'travaux.reviser', 'mission.cloturer'],
  },
  {
    id: 'p-associe', nom: 'Associé signataire', description: 'Supervise, revoit et signe les rapports', systeme: true, roleDefaut: 'Associé signataire',
    permissions: ['mission.creer', 'mission.toutes', 'mission.modifier', 'travaux.reviser', 'mission.cloturer', 'rapport.signer'],
  },
  {
    id: 'p-admin', nom: 'Administrateur', description: 'Accès complet au logiciel', systeme: true, roleDefaut: 'Associé signataire',
    permissions: [...toutesPermissions],
  },
]

const VERSION = 2

const etatInitial: State = {
  version: VERSION,
  cabinet: {
    nom: 'Cabinet ADOC Audit & Conseil',
    sigle: 'ADOC',
    adresse: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    numeroOrdre: '',
    exercice: 2026,
    signataire: '',
  },
  clients: [],
  missions: [],
  collaborateurs: [
    { id: 'c-audit', nom: 'AUDIT', prenom: '', initiales: 'AU', email: '', telephone: '', profilId: 'p-admin', actif: true },
  ],
  profils: profilsInitiaux,
  compteur: 0,
}

// ---------------------------------------------------------------------------
// Persistance locale (navigateur) — sera remplacée par un serveur plus tard
// ---------------------------------------------------------------------------

const CLE = 'adoc-audit:v1'

/** Met à niveau des données enregistrées par une version précédente. */
function migrer(s: State): State {
  if ((s.version ?? 1) < 2) {
    // v2 : grille des grades (A1/A2, S1/S2/S3, AM, M1/M2/M3, SM/Director…)
    const correspondance: Record<string, string> = { 'p-auditeur': 'p-assistant' }
    s = {
      ...s,
      profils: [...profilsInitiaux, ...s.profils.filter((p) => !p.systeme).map((p) => ({ ...p, roleDefaut: p.roleDefaut ?? 'Assistant' }))],
      collaborateurs: s.collaborateurs.map((c) => {
        const profilId = correspondance[c.profilId] ?? c.profilId
        return { ...c, profilId, niveau: c.niveau ?? profilsInitiaux.find((p) => p.id === profilId)?.niveaux?.[0] }
      }),
    }
  }
  return { ...s, version: VERSION }
}

function charger(): State {
  try {
    const brut = localStorage.getItem(CLE)
    if (brut) return migrer({ ...etatInitial, version: 1, ...JSON.parse(brut) })
  } catch { /* stockage indisponible */ }
  return etatInitial
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const addYear = (iso: string, n = 1) => {
  const d = new Date(iso)
  d.setFullYear(d.getFullYear() + n)
  return d.toISOString().slice(0, 10)
}

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'


// ---------------------------------------------------------------------------
// Contexte + actions
// ---------------------------------------------------------------------------

export interface NouvelleMission {
  mode: ModeCreation
  sourceId?: string
  client: Client // client existant (id connu) ou nouveau
  mission: Pick<Mission, 'type' | 'exercice' | 'debut' | 'fin' | 'echeance'>
  equipe: MembreEquipe[]
  reprise: string[]
}

function useStoreValue() {
  const [state, setState] = useState<State>(charger)

  useEffect(() => {
    try { localStorage.setItem(CLE, JSON.stringify(state)) } catch { /* ignoré */ }
  }, [state])

  const creerMission = (d: NouvelleMission): Mission => {
    const compteur = state.compteur + 1
    const source = state.missions.find((m) => m.id === d.sourceId)
    const mission: Mission = {
      id: uid(),
      code: `M-${d.mission.exercice}-${String(compteur).padStart(3, '0')}`,
      clientId: d.client.id,
      ...d.mission,
      statut: 'planification',
      avancement: 0,
      equipe: d.equipe,
      origine: { mode: d.mode, sourceId: source?.id, sourceCode: source?.code },
      reprise: d.reprise,
      creeLe: new Date().toISOString(),
    }
    setState((s) => {
      const clientExiste = s.clients.some((c) => c.id === d.client.id)
      return {
        ...s,
        compteur,
        clients: clientExiste ? s.clients.map((c) => (c.id === d.client.id ? d.client : c)) : [...s.clients, d.client],
        missions: [
          ...s.missions.map((m) => (d.mode === 'report' && m.id === d.sourceId ? { ...m, suiteId: mission.id } : m)),
          mission,
        ],
      }
    })
    return mission
  }

  const majCabinet = (patch: Partial<Cabinet>) => setState((s) => ({ ...s, cabinet: { ...s.cabinet, ...patch } }))

  const enregistrerClient = (c: Client) =>
    setState((s) => ({
      ...s,
      clients: s.clients.some((x) => x.id === c.id) ? s.clients.map((x) => (x.id === c.id ? c : x)) : [...s.clients, c],
    }))

  /** Supprime un client sans mission. */
  const supprimerClient = (id: string) =>
    setState((s) => (s.missions.some((m) => m.clientId === id) ? s : { ...s, clients: s.clients.filter((c) => c.id !== id) }))

  const majMission = (id: string, patch: Partial<Mission>) =>
    setState((s) => ({ ...s, missions: s.missions.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))

  const cloturerMission = (id: string, date: string, commentaire: string) =>
    majMission(id, { statut: 'cloturee', avancement: 100, arrete: { date, commentaire } })

  const supprimerMission = (id: string) =>
    setState((s) => ({
      ...s,
      missions: s.missions
        .filter((m) => m.id !== id)
        .map((m) => (m.suiteId === id ? { ...m, suiteId: undefined } : m)),
    }))

  const enregistrerCollaborateur = (c: Collaborateur) =>
    setState((s) => ({
      ...s,
      collaborateurs: s.collaborateurs.some((x) => x.id === c.id)
        ? s.collaborateurs.map((x) => (x.id === c.id ? c : x))
        : [...s.collaborateurs, c],
    }))

  const enregistrerProfil = (p: Profil) =>
    setState((s) => ({
      ...s,
      profils: s.profils.some((x) => x.id === p.id) ? s.profils.map((x) => (x.id === p.id ? p : x)) : [...s.profils, p],
    }))

  const supprimerProfil = (id: string) =>
    setState((s) => ({ ...s, profils: s.profils.filter((p) => p.id !== id) }))

  const affecter = (missionId: string, membre: MembreEquipe) =>
    setState((s) => ({
      ...s,
      missions: s.missions.map((m) =>
        m.id === missionId
          ? { ...m, equipe: [...m.equipe.filter((e) => e.collaborateurId !== membre.collaborateurId), membre] }
          : m,
      ),
    }))

  const retirer = (missionId: string, collaborateurId: string) =>
    setState((s) => ({
      ...s,
      missions: s.missions.map((m) =>
        m.id === missionId ? { ...m, equipe: m.equipe.filter((e) => e.collaborateurId !== collaborateurId) } : m,
      ),
    }))

  const client = (id: string) => state.clients.find((c) => c.id === id)
  const collaborateur = (id: string) => state.collaborateurs.find((c) => c.id === id)
  const profil = (id: string) => state.profils.find((p) => p.id === id)
  /** Grade affiché : niveau précis (ex. S2) sinon nom du profil. */
  const grade = (c?: Collaborateur) => (c ? c.niveau || profil(c.profilId)?.nom || '' : '')

  return {
    state, client, collaborateur, profil, grade,
    majCabinet, enregistrerClient, supprimerClient,
    creerMission, majMission, cloturerMission, supprimerMission,
    enregistrerCollaborateur, enregistrerProfil, supprimerProfil, affecter, retirer,
  }
}

type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useStoreValue()}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore doit être utilisé dans <StoreProvider>')
  return s
}
