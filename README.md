# ADOC Audit

Logiciel de gestion des missions d'audit du **Cabinet ADOC Audit & Conseil**, inspiré d'AuditSoft Premier OHADA (référentiel SYSCOHADA révisé).

## Modules disponibles

- **Tableau de bord** : indicateurs du cabinet, tuiles Missions / Droits / Paramétrage, missions récentes.
- **Missions** : création vierge, clonage, reprise de l'arrêté N → N+1, clôture (arrêté), page de travail de la mission.
- **Droits** : collaborateurs et grades (Stagiaire, A1/A2, S1–S3, Chef de mission, AM, M1–M3, SM/Director), habilitations, affectations aux missions.
- **Memento** : guide d'utilisation intégré (`src/data/memento.ts`), mis à jour à chaque module.

## Démarrer

```bash
npm install
npm run dev
```

Build de production : `npm run build` (sortie dans `dist/`).

## Stack

React 19 · TypeScript · Vite · lucide-react. Déployé sur Vercel.

> Les données sont pour l'instant enregistrées dans le navigateur (localStorage) ; une version serveur est prévue pour le travail en réseau.
