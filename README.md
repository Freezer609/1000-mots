# 1000-mots

Application d'entraînement vocabulaire (Flashcards, Quiz, Pendu, Dictée, etc.)

Ce dépôt contient une application front-end statique qui fonctionne hors-ligne via Service Worker et peut être déployée sur GitHub Pages.

## Development

Lancer rapidement un serveur local pour tester (nécessaire pour le Service Worker) :

```bash
# Python
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Features ajoutées
- SRS (SM-2 simplifié) pour programmer la répétition espacée
- Mode session adaptative (révise les mots "dus")
- Recherche & filtrage
- Export / import JSON des données SRS et des mots maîtrisés
- Export session adaptative en CSV / TSV (compatible Anki)
- PWA manifest + service-worker (offline)
- Text-to-Speech (Web Speech API) pour écouter les mots
- Meilleures interactions mobiles (swipe horizontal pour précédent/suivant, swipe vertical pour flip)
- Améliorations accessibilité ARIA

## Deployment sur GitHub Pages
1. Commit et pousse ton `main` sur GitHub (remote `origin`).
2. Dans les paramètres du repository (Settings → Pages), configure la source sur la branche `main` et le dossier racine (`/`).
3. Si tu utilises un `404.html` personnalisé ou une route, vérifie les chemins relatifs dans `index.html`.

Notes:
- GitHub Pages sert le site en HTTPS, ce qui est nécessaire pour que le Service Worker fonctionne correctement.
- Les icônes (référencées dans `manifest.json`) doivent exister dans le dossier `icons/` avant d'activer l'installation PWA.

## Export / Import
- SRS: `Stats` → `S⇧` / `S⇩` pour exporter/importer JSON
- Maîtrisés: `Stats` → `M⇧` / `M⇩` pour exporter/importer JSON
- Session adaptative: `Session adaptative` → `Exporter session` (CSV/TSV)

## Conseils
- Tester d'abord en local (`http://localhost:8000`) pour valider le Service Worker.
- Sauvegarde régulièrement `srs` et `mastered` via l'export JSON.

---
Si tu veux, je peux automatiquement ajouter un `workflow GitHub Actions` pour déployer sur `gh-pages` lorsque tu pousses sur `main` (pré-requis: autoriser le workflow et fournir un token si nécessaire). Dis-moi si tu veux que je le crée.
