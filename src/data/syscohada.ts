// Plan comptable SYSCOHADA révisé — classes et comptes principaux (2 chiffres).
// Sert de référentiel pour le mapping des balances (module Import de la balance).

export interface CompteSyscohada { numero: string; libelle: string }
export interface ClasseSyscohada { numero: string; libelle: string; etat: 'Bilan' | 'Résultat' | 'Hors bilan / analytique'; comptes: CompteSyscohada[] }

export const planSyscohada: ClasseSyscohada[] = [
  {
    numero: '1', libelle: 'Comptes de ressources durables', etat: 'Bilan',
    comptes: [
      { numero: '10', libelle: 'Capital' },
      { numero: '11', libelle: 'Réserves' },
      { numero: '12', libelle: 'Report à nouveau' },
      { numero: '13', libelle: "Résultat net de l'exercice" },
      { numero: '14', libelle: "Subventions d'investissement" },
      { numero: '15', libelle: 'Provisions réglementées et fonds assimilés' },
      { numero: '16', libelle: 'Emprunts et dettes assimilées' },
      { numero: '17', libelle: 'Dettes de location-acquisition' },
      { numero: '18', libelle: 'Dettes liées à des participations et comptes de liaison des établissements et sociétés en participation' },
      { numero: '19', libelle: 'Provisions pour risques et charges' },
    ],
  },
  {
    numero: '2', libelle: "Comptes d'actif immobilisé", etat: 'Bilan',
    comptes: [
      { numero: '21', libelle: 'Immobilisations incorporelles' },
      { numero: '22', libelle: 'Terrains' },
      { numero: '23', libelle: 'Bâtiments, installations techniques et agencements' },
      { numero: '24', libelle: 'Matériel, mobilier et actifs biologiques' },
      { numero: '25', libelle: 'Avances et acomptes versés sur immobilisations' },
      { numero: '26', libelle: 'Titres de participation' },
      { numero: '27', libelle: 'Autres immobilisations financières' },
      { numero: '28', libelle: 'Amortissements' },
      { numero: '29', libelle: 'Dépréciations des immobilisations' },
    ],
  },
  {
    numero: '3', libelle: 'Comptes de stocks', etat: 'Bilan',
    comptes: [
      { numero: '31', libelle: 'Marchandises' },
      { numero: '32', libelle: 'Matières premières et fournitures liées' },
      { numero: '33', libelle: 'Autres approvisionnements' },
      { numero: '34', libelle: 'Produits en cours' },
      { numero: '35', libelle: 'Services en cours' },
      { numero: '36', libelle: 'Produits finis' },
      { numero: '37', libelle: 'Produits intermédiaires et résiduels' },
      { numero: '38', libelle: 'Stocks en cours de route, en consignation ou en dépôt' },
      { numero: '39', libelle: 'Dépréciations des stocks et encours de production' },
    ],
  },
  {
    numero: '4', libelle: 'Comptes de tiers', etat: 'Bilan',
    comptes: [
      { numero: '40', libelle: 'Fournisseurs et comptes rattachés' },
      { numero: '41', libelle: 'Clients et comptes rattachés' },
      { numero: '42', libelle: 'Personnel' },
      { numero: '43', libelle: 'Organismes sociaux' },
      { numero: '44', libelle: 'État et collectivités publiques' },
      { numero: '45', libelle: 'Organismes internationaux' },
      { numero: '46', libelle: 'Apporteurs, associés et groupe' },
      { numero: '47', libelle: 'Débiteurs et créditeurs divers' },
      { numero: '48', libelle: 'Créances et dettes hors activités ordinaires (HAO)' },
      { numero: '49', libelle: 'Dépréciations et risques provisionnés (tiers)' },
    ],
  },
  {
    numero: '5', libelle: 'Comptes de trésorerie', etat: 'Bilan',
    comptes: [
      { numero: '50', libelle: 'Titres de placement' },
      { numero: '51', libelle: 'Valeurs à encaisser' },
      { numero: '52', libelle: 'Banques' },
      { numero: '53', libelle: 'Établissements financiers et assimilés' },
      { numero: '54', libelle: 'Instruments de trésorerie' },
      { numero: '55', libelle: 'Instruments de monnaie électronique' },
      { numero: '56', libelle: "Banques, crédits de trésorerie et d'escompte" },
      { numero: '57', libelle: 'Caisse' },
      { numero: '58', libelle: "Régies d'avances, accréditifs et virements internes" },
      { numero: '59', libelle: 'Dépréciations et risques provisionnés (trésorerie)' },
    ],
  },
  {
    numero: '6', libelle: 'Comptes de charges des activités ordinaires', etat: 'Résultat',
    comptes: [
      { numero: '60', libelle: 'Achats et variations de stocks' },
      { numero: '61', libelle: 'Transports' },
      { numero: '62', libelle: 'Services extérieurs A' },
      { numero: '63', libelle: 'Services extérieurs B' },
      { numero: '64', libelle: 'Impôts et taxes' },
      { numero: '65', libelle: 'Autres charges' },
      { numero: '66', libelle: 'Charges de personnel' },
      { numero: '67', libelle: 'Frais financiers et charges assimilées' },
      { numero: '68', libelle: 'Dotations aux amortissements' },
      { numero: '69', libelle: 'Dotations aux provisions et aux dépréciations' },
    ],
  },
  {
    numero: '7', libelle: 'Comptes de produits des activités ordinaires', etat: 'Résultat',
    comptes: [
      { numero: '70', libelle: 'Ventes' },
      { numero: '71', libelle: "Subventions d'exploitation" },
      { numero: '72', libelle: 'Production immobilisée' },
      { numero: '73', libelle: 'Variations des stocks de biens et de services produits' },
      { numero: '75', libelle: 'Autres produits' },
      { numero: '77', libelle: 'Revenus financiers et produits assimilés' },
      { numero: '78', libelle: 'Transferts de charges' },
      { numero: '79', libelle: 'Reprises de provisions, de dépréciations et autres' },
    ],
  },
  {
    numero: '8', libelle: 'Comptes des autres charges et des autres produits', etat: 'Résultat',
    comptes: [
      { numero: '81', libelle: "Valeurs comptables des cessions d'immobilisations" },
      { numero: '82', libelle: "Produits des cessions d'immobilisations" },
      { numero: '83', libelle: 'Charges hors activités ordinaires' },
      { numero: '84', libelle: 'Produits hors activités ordinaires' },
      { numero: '85', libelle: 'Dotations hors activités ordinaires' },
      { numero: '86', libelle: 'Reprises hors activités ordinaires' },
      { numero: '87', libelle: 'Participation des travailleurs' },
      { numero: '88', libelle: "Subventions d'équilibre" },
      { numero: '89', libelle: 'Impôts sur le résultat' },
    ],
  },
  {
    numero: '9', libelle: 'Comptes des engagements hors bilan et de la comptabilité analytique de gestion', etat: 'Hors bilan / analytique',
    comptes: [
      { numero: '90', libelle: 'Engagements obtenus et engagements accordés' },
      { numero: '91', libelle: 'Contrepartie des engagements' },
    ],
  },
]
