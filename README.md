# Subli

MVP public et statique permettant de trouver les sublimations classiques compatibles avec les châsses d'un équipement Wakfu, ou de rechercher directement une sublimation par son nom.

## Prérequis

- Node.js 20.19+ ou 22.12+
- npm 10+

## Développement

```bash
npm install
npm run dev
```

Le script de développement écoute uniquement sur `127.0.0.1` par défaut. Depuis un poste distant, utiliser un tunnel SSH vers le port indiqué par Vite.

## Vérifications

```bash
npm run lint
npm test
npm run build
```

## Données

Les données sont récupérées depuis [Wakfu.Guide](https://wakfu.guide/sublimations/). La page contient 42 tableaux dont les lignes sont intégrées au HTML statique via `createSublimationsTable`. L'importeur extrait uniquement les patterns de trois couleurs classiques (Rouge, Verte, Bleue), exclut explicitement les symboles des sublimations Épiques et Reliques, déduplique les entrées répétées entre catégories et refuse un résultat anormalement petit.

Dataset actuel : `src/data/sublimations.json`. Sa métadonnée indique la date de récupération, la méthode et le rapport complet.

Pour le régénérer :

```bash
npm run data:update
```

Inspecter le résumé affiché après chaque mise à jour. Toute ligne ambiguë est listée et une évolution structurelle importante fait échouer l'import.

## Architecture

- `src/lib/matching.ts` : validation et compatibilité des patterns, Jokers et fenêtres contiguës.
- `src/lib/search.ts` : recherche normalisée sans casse ni accents.
- `scripts/update-sublimations.mjs` : import de maintenance, jamais exécuté par le site.
- `src/data/sublimations.json` : dataset statique versionné.

Projet non officiel, sans affiliation avec Ankama ou Wakfu.Guide.
