// Données de démarrage du cabinet.
// Aucune donnée financière ici : chiffre d'affaires, résultat, anomalies…
// seront renseignés à l'intérieur de chaque mission (import balance / FEC).

// Informations propres au poste et à la licence.
// Les informations du cabinet (nom, exercice, signataire…) sont dans Paramétrage (store).
export const cabinet = {
  poste: 'AUDIT',
  utilisateur: 'AUDIT',
  licences: 1,
  version: '0.1.0',
  referentiel: 'SYSCOHADA révisé',
}

export const typesMission = [
  'CAC (commissariat aux comptes) — norme ISA',
  'Examen limité — norme ISRE',
  "Autres missions d'assurance — normes ISAE",
  'Missions de services connexes (procédures convenues) — norme ISRS',
]

export const etapesDemarrage = [
  { titre: 'Créer le dossier client', detail: 'Raison sociale, forme juridique, RCCM, NIF, dirigeants.' },
  { titre: 'Paramétrer la mission', detail: 'Type de mission (ISA, ISRE, ISAE, ISRS), exercice, équipe.' },
  { titre: 'Importer la balance / FEC', detail: 'Balance générale SYSCOHADA : CA, résultat et bilan sont calculés automatiquement.' },
  { titre: 'Lancer les travaux', detail: 'Programme de travail, cycles, contrôles et détection des anomalies.' },
]

export const actualites = [
  {
    date: '2026-09-24',
    titre: 'Nouveau : Dossiers clients & Paramétrage',
    texte:
      "Retrouvez chaque client avec l'historique de ses missions. Renseignez les informations du cabinet et consultez le plan comptable SYSCOHADA dans Paramétrage.",
  },
  {
    date: '2026-09-24',
    titre: 'Nouveau : Missions & Droits',
    texte:
      "Créez une mission vierge, clonez une mission existante ou reprenez l'arrêté N pour démarrer N+1. Gérez les collaborateurs, leurs profils et leurs affectations dans Droits. Tout est expliqué dans le Memento.",
  },
  {
    date: '2026-09-24',
    titre: 'Bienvenue sur ADOC Audit',
    texte:
      "Votre espace d'audit est prêt. Commencez par créer une mission : les indicateurs financiers du client (chiffre d'affaires, résultat, anomalies) s'afficheront une fois la balance importée.",
  },
  {
    date: '2026-09-24',
    titre: 'Référentiel',
    texte: 'Le plan de comptes SYSCOHADA révisé est utilisé par défaut pour le mapping des balances.',
  },
]
