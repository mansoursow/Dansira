// Memento : documentation fonctionnelle d'ADOC Audit.
// À compléter à chaque nouveau module validé.

export type Bloc =
  | { type: 'p'; texte: string }
  | { type: 'etapes'; items: { titre: string; texte: string }[] }
  | { type: 'liste'; items: string[] }
  | { type: 'table'; entetes: string[]; lignes: string[][] }
  | { type: 'note'; texte: string; ton?: 'info' | 'warn' }
  | { type: 'h'; texte: string }

export interface Section {
  id: string
  titre: string
  resume: string
  blocs: Bloc[]
}

export const majMemento = '24/09/2026'

export const memento: Section[] = [
  {
    id: 'presentation',
    titre: 'Présentation',
    resume: 'Le principe du logiciel et son organisation.',
    blocs: [
      { type: 'p', texte: "ADOC Audit est le logiciel de gestion des missions d'audit du Cabinet ADOC Audit & Conseil. Il s'inspire du fonctionnement d'AuditSoft Premier OHADA et utilise le référentiel SYSCOHADA révisé." },
      { type: 'p', texte: "Tout s'organise autour de la mission. Le cabinet ne dispose d'aucun chiffre financier tant qu'aucune mission n'est démarrée : chiffre d'affaires, résultat, bilan et anomalies sont renseignés à l'intérieur de chaque mission (import de la balance), pour un client et un exercice donnés." },
      { type: 'note', texte: "Le tableau de bord donne donc une vue « cabinet » (missions, clients, échéances, équipe) et non une vue financière d'une entreprise." },
    ],
  },
  {
    id: 'accueil',
    titre: "Écran d'accueil",
    resume: 'Menu, tuiles, indicateurs et barre d’état.',
    blocs: [
      { type: 'h', texte: 'Menu latéral' },
      { type: 'p', texte: "Il donne accès aux modules : Tableau de bord, Missions, Dossiers clients, Droits & utilisateurs, Paramétrage, ainsi qu'aux ressources Memento et Tutoriel. Les entrées marquées « bientôt » sont en cours de construction." },
      { type: 'h', texte: 'Les trois tuiles' },
      { type: 'liste', items: [
        'Un clic sur la partie bleue ouvre le module (Missions, Droits ou Paramétrage).',
        'Un clic sur la flèche à droite affiche les actions rapides du module (ex. « Nouvelle mission », « Utilisateurs », « Profils & habilitations »).',
      ] },
      { type: 'h', texte: 'Indicateurs' },
      { type: 'table', entetes: ['Indicateur', 'Ce qui est compté'], lignes: [
        ['Missions en cours', 'Missions au statut Planification ou En cours'],
        ['En revue / à signer', 'Missions au statut En revue (revue de l’associé signataire)'],
        ['Missions clôturées', 'Missions dont l’arrêté a été enregistré'],
        ['Dossiers clients', 'Clients distincts ayant au moins une mission'],
        ['Échéances à 30 jours', 'Missions non clôturées dont l’échéance du rapport tombe dans les 30 jours (ou est dépassée)'],
        ['Collaborateurs', 'Collaborateurs actifs du cabinet'],
      ] },
      { type: 'h', texte: 'Barre d’état' },
      { type: 'p', texte: 'En bas de l’écran : pastille verte = liaison active, grise = inactive. Elle rappelle aussi le poste connecté, le signataire, le nombre de licences et la version.' },
    ],
  },
  {
    id: 'missions',
    titre: 'Missions : cycle de vie',
    resume: 'Les 4 statuts d’une mission et la fiche mission.',
    blocs: [
      { type: 'p', texte: 'Une mission correspond à un client, un type de mission et un exercice. Elle porte un code unique attribué automatiquement : M-<exercice>-<numéro> (ex. M-2025-003).' },
      { type: 'etapes', items: [
        { titre: 'Planification', texte: 'Statut de départ : prise de connaissance, lettre de mission, équipe.' },
        { titre: 'En cours', texte: 'Travaux terrain : cycles, contrôles, feuilles de travail.' },
        { titre: 'En revue', texte: 'Revue du manager et de l’associé signataire, préparation du rapport.' },
        { titre: 'Clôturée', texte: 'Arrêté enregistré, mission figée en lecture seule.' },
      ] },
      { type: 'h', texte: 'La page de la mission' },
      { type: 'p', texte: 'Un clic sur une mission (liste des missions ou missions récentes du tableau de bord) ouvre sa page de travail en grand. Après la création d’une mission, on y arrive directement. C’est dans cette page que seront construits les éléments de la mission (balance, programme de travail, feuilles de travail…) ; elle est vierge pour l’instant. Le lien « ← Missions » ramène à la liste.' },
      { type: 'h', texte: 'La fiche mission' },
      { type: 'p', texte: 'Dans la page de la mission, le bouton « Fiche mission » ouvre à droite le résumé : mission, client, origine (vierge, clonée ou reprise N+1), éléments repris et équipe. Actions disponibles :' },
      { type: 'liste', items: [
        '« Passer … » : fait avancer la mission au statut suivant.',
        '« Clôturer (arrêté) » : enregistre la date d’arrêté et fige la mission.',
        '« Démarrer l’exercice N+1 » : visible sur une mission clôturée qui n’a pas encore de suite.',
        '« Cloner » : ouvre l’assistant en mode clonage avec cette mission comme source.',
        '« Gérer » (équipe) : ouvre les affectations de la mission dans le module Droits.',
        '« Supprimer la mission » : suppression définitive après confirmation.',
      ] },
      { type: 'p', texte: 'Les onglets Toutes / Planification / En cours / En revue / Clôturées et la barre de recherche (client, code, type, exercice) permettent de filtrer la liste.' },
    ],
  },
  {
    id: 'creation',
    titre: 'Créer une mission',
    resume: 'L’assistant en 5 étapes et les 3 modes de création.',
    blocs: [
      { type: 'p', texte: 'Bouton « Nouvelle mission » (en-tête, tuile Missions ou module Missions). Un assistant guide la création :' },
      { type: 'etapes', items: [
        { titre: 'Mode', texte: 'Mission vierge, clonage d’une mission, ou reprise de l’arrêté N vers N+1.' },
        { titre: 'Source', texte: 'Choix de la mission d’origine et des éléments à reprendre (ignorée pour une mission vierge).' },
        { titre: 'Client & mission', texte: 'Identité du client (raison sociale, forme, RCCM, NIF/NINEA…), type de mission, exercice, dates et échéance du rapport.' },
        { titre: 'Équipe', texte: 'Collaborateurs affectés et rôle de chacun sur la mission.' },
        { titre: 'Récapitulatif', texte: 'Vérification puis création. La mission démarre au statut Planification et sa page s’ouvre.' },
      ] },
      { type: 'h', texte: 'Types de mission' },
      { type: 'table', entetes: ['Type de mission', 'Norme'], lignes: [
        ['CAC (commissariat aux comptes)', 'ISA — normes internationales d’audit'],
        ['Examen limité', 'ISRE — normes internationales d’examen limité'],
        ['Autres missions d’assurance', 'ISAE — normes internationales de missions d’assurance'],
        ['Missions de services connexes (procédures convenues)', 'ISRS — normes internationales de services connexes'],
      ] },
      { type: 'h', texte: '1. Mission vierge' },
      { type: 'p', texte: 'Pour un nouveau client ou un premier exercice audité. On peut créer un nouveau dossier client ou choisir un client déjà enregistré. Aucune donnée n’est reprise.' },
      { type: 'h', texte: '2. Cloner une mission' },
      { type: 'p', texte: 'Sert de modèle : on reprend l’organisation d’une mission existante (quel que soit son statut) pour un autre client, ou pour une autre mission du même client. Le client est librement choisi.' },
      { type: 'note', texte: 'Les données financières et les travaux réalisés ne sont jamais clonés : la nouvelle mission démarre sans balance.' },
      { type: 'h', texte: '3. Reprise de l’arrêté N → N+1' },
      { type: 'p', texte: 'Pour démarrer l’exercice suivant d’une mission clôturée, comme on passe de l’audit de N à celui de N+1. Le client est repris et verrouillé ; l’exercice et toutes les dates sont décalés d’un an automatiquement. Une mission N ne peut avoir qu’une seule mission N+1 : les deux sont reliées dans leurs fiches.' },
      { type: 'table', entetes: ['Élément', 'Clonage', 'Reprise N+1'], lignes: [
        ['Identité du client', 'Non (client au choix)', 'Oui, verrouillé'],
        ['Paramètres (type de mission)', 'Optionnel', 'Optionnel'],
        ['Programme de travail', 'Optionnel', 'Optionnel'],
        ['Équipe', 'Optionnel', 'Optionnel'],
        ['Modèles de documents', 'Optionnel', '—'],
        ['Dossier permanent', '—', 'Optionnel'],
        ["À-nouveaux (soldes d'ouverture)", '—', 'Optionnel'],
        ['Points de suivi N', '—', 'Optionnel'],
        ['Balance, travaux, anomalies', 'Jamais', 'Jamais (seuls les soldes de clôture passent en ouverture)'],
      ] },
      { type: 'note', ton: 'warn', texte: 'Les options « Reprise N+1 » et « Cloner » sont grisées tant qu’il n’existe pas de mission clôturée / de mission existante.' },
    ],
  },
  {
    id: 'cloture',
    titre: 'Clôture et arrêté',
    resume: 'Figer une mission et préparer l’exercice suivant.',
    blocs: [
      { type: 'p', texte: 'Depuis la fiche mission, « Clôturer (arrêté) » demande la date d’arrêté des comptes (par défaut la fin d’exercice) et un commentaire facultatif (opinion émise, réserves…).' },
      { type: 'liste', items: [
        'La mission passe au statut Clôturée, à 100 %, en lecture seule.',
        'Son équipe ne peut plus être modifiée.',
        'Elle devient disponible comme source pour une reprise N+1 : les soldes arrêtés deviendront les à-nouveaux de l’exercice suivant.',
      ] },
    ],
  },
  {
    id: 'droits',
    titre: 'Droits : collaborateurs et profils',
    resume: 'Créer des collaborateurs, gérer les habilitations.',
    blocs: [
      { type: 'p', texte: 'Le module Droits comporte trois onglets : Collaborateurs, Profils & habilitations, Affectations aux missions.' },
      { type: 'h', texte: 'Collaborateurs' },
      { type: 'p', texte: '« Nouveau collaborateur » : prénom, nom (les initiales sont calculées), e-mail, téléphone et grade. Quand le grade comporte plusieurs niveaux (A1 / A2, S1 / S2 / S3, M1 / M2 / M3, SM / Director), un champ « Niveau » permet de préciser le grade exact ; c’est lui qui s’affiche ensuite (ex. S2). Un clic sur une ligne permet de modifier la fiche ou de désactiver le collaborateur (il ne pourra plus être affecté). Le poste AUDIT est l’administrateur principal : son profil ne peut pas être changé.' },
      { type: 'h', texte: 'Profils & habilitations' },
      { type: 'p', texte: 'Chaque grade du cabinet est un profil, c’est-à-dire un ensemble d’habilitations. Les grades livrés reprennent les codes usuels du cabinet ; vous pouvez ajuster leurs cases à cocher ou créer vos propres profils (bouton « Nouveau profil », éventuellement à partir d’un profil existant).' },
      { type: 'table', entetes: ['Code usuel', 'Signification', 'Rôle proposé sur une mission'], lignes: [
        ['Stagiaire', 'Stagiaire', 'Stagiaire'],
        ['A1 / A2', 'Associate / Assistant 1 & 2', 'Assistant'],
        ['S1 / S2 / S3', 'Senior 1, 2, 3', 'Senior'],
        ['Chef de mission', 'Responsable de mission', 'Chef de mission'],
        ['AM', 'Assistant Manager', 'Assistant Manager'],
        ['M1 / M2 / M3', 'Manager 1, 2, 3', 'Manager'],
        ['SM / Director', 'Senior Manager / Directeur', 'Senior Manager / Directeur'],
        ['Associé signataire', 'Associé qui signe les rapports', 'Associé signataire'],
        ['Administrateur', 'Toutes les habilitations (non modifiable)', 'Associé signataire'],
      ] },
      { type: 'p', texte: 'Habilitations disponibles : créer des missions, voir toutes les missions du cabinet, modifier les missions affectées, réaliser les travaux, revoir et valider, clôturer une mission, signer les rapports, gérer collaborateurs et droits, paramétrage du cabinet.' },
      { type: 'note', texte: 'Un profil personnalisé ne peut être supprimé que s’il n’est attribué à aucun collaborateur.' },
    ],
  },
  {
    id: 'affectations',
    titre: 'Affecter une équipe à une mission',
    resume: 'Profil du collaborateur vs rôle sur la mission.',
    blocs: [
      { type: 'p', texte: 'Deux possibilités : à l’étape « Équipe » de l’assistant de création, ou à tout moment dans Droits › Affectations aux missions (accessible aussi par « Gérer » dans la fiche mission).' },
      { type: 'etapes', items: [
        { titre: 'Choisir la mission', texte: 'Dans la liste de gauche (les missions clôturées apparaissent en dernier).' },
        { titre: 'Choisir le collaborateur', texte: 'Seuls les collaborateurs actifs non encore affectés sont proposés.' },
        { titre: 'Choisir le rôle', texte: 'Proposé d’après son grade (voir le tableau des grades), modifiable (ex. un M1 peut être Chef de mission sur un dossier).' },
        { titre: 'Affecter', texte: 'Le rôle reste modifiable ; l’icône corbeille retire le collaborateur.' },
      ] },
      { type: 'note', texte: 'Le grade (profil) définit ce qu’un collaborateur peut faire dans le logiciel ; le rôle définit sa place dans une mission donnée. Un avertissement s’affiche si aucun associé signataire n’est désigné.' },
    ],
  },
  {
    id: 'donnees',
    titre: 'Données et sauvegarde',
    resume: 'Où sont enregistrées les informations.',
    blocs: [
      { type: 'p', texte: 'Dans cette version, les données (clients, missions, collaborateurs, profils) sont enregistrées automatiquement sur ce poste, dans le navigateur. Elles sont conservées d’une session à l’autre sur le même poste et le même navigateur.' },
      { type: 'note', ton: 'warn', texte: 'Vider les données de navigation du navigateur efface les données du logiciel. Le partage entre plusieurs postes nécessitera la version serveur (à venir).' },
    ],
  },
  {
    id: 'glossaire',
    titre: 'Glossaire',
    resume: 'Les termes utilisés dans le logiciel.',
    blocs: [
      { type: 'table', entetes: ['Terme', 'Définition'], lignes: [
        ['Arrêté', 'Date à laquelle les comptes de l’exercice sont arrêtés ; enregistrée à la clôture de la mission.'],
        ['À-nouveaux', 'Soldes d’ouverture de l’exercice N+1, égaux aux soldes de clôture de N.'],
        ['ISA / ISRE / ISAE / ISRS', 'Normes internationales applicables selon le type de mission (audit, examen limité, autres missions d’assurance, services connexes).'],
        ['Dossier permanent', 'Informations durables sur le client : statuts, organigramme, contrats, procédures.'],
        ['Points de suivi', 'Recommandations et anomalies de N à vérifier lors de l’audit N+1.'],
        ['Associé signataire', 'Associé qui signe le rapport et engage la responsabilité du cabinet.'],
        ['SYSCOHADA', 'Système comptable de l’espace OHADA, référentiel utilisé pour le mapping des balances.'],
      ] },
    ],
  },
  {
    id: 'a-venir',
    titre: 'Modules à venir',
    resume: 'Ce qui sera ajouté prochainement.',
    blocs: [
      { type: 'liste', items: [
        'Import de la balance / FEC et mapping SYSCOHADA (chiffre d’affaires, résultat, bilan dans la mission).',
        'Programme de travail, cycles et feuilles de travail.',
        'Détection des anomalies.',
        'Dossiers clients et dossier permanent.',
        'Paramétrage du cabinet et modèles de documents.',
        'Rapports et export.',
        'Connexion par utilisateur et application des habilitations.',
      ] },
    ],
  },
]
