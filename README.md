# APECDI — Site institutionnel

**Agence Privée d'Expertise et de Conseil pour un Développement Inclusif**

Site statique React + Vite avec mini-espace d'administration Git-based. Déployable sur Render, Netlify, Vercel ou GitHub Pages. Aucun backend, aucune base de données.

---

## Table des matières

1. [Architecture](#1-architecture)
2. [Installation](#2-installation)
3. [Configuration](#3-configuration)
4. [Développement local](#4-développement-local)
5. [Construction](#5-construction)
6. [Déploiement Render](#6-déploiement-render)
7. [Accès à l'administration](#7-accès-à-ladministration)
8. [Mode A — Export manuel](#8-mode-a--export-manuel)
9. [Mode B — Sync GitHub](#9-mode-b--sync-github)
10. [Import / Restauration](#10-import--restauration)
11. [Sécurité](#11-sécurité)

---

## 1. Architecture

```
apecdi/
├── public/
│   ├── content/              # Contenu versionné (la "base de données") — servi statiquement
│   │   ├── site.json         # Config générale (nom, contacts, tagline…)
│   │   ├── expertises.json
│   │   ├── realisations.json
│   │   ├── equipe.json
│   │   └── publications/
│   │       ├── index.json    # Liste des slugs publiés
│   │       └── *.json        # Une publication = un fichier
│   ├── uploads/              # Images
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── admin/                # Interface d'administration cachée
│   ├── components/           # Composants partagés
│   ├── pages/                # Pages publiques
│   ├── services/             # Logique métier (content, auth, export…)
│   ├── styles/               # CSS (tokens → base → components)
│   └── types/                # TypeScript types
├── render.yaml               # Configuration Render
└── .env.example
```

**Principe de fonctionnement :**
- Le site lit les fichiers JSON de `/content/` au chargement.
- L'admin caché permet de créer/modifier du contenu en brouillon (stocké dans IndexedDB).
- Pour publier : **Mode A** (export .zip → git push) ou **Mode B** (push direct via API GitHub).
- Chaque push sur la branche `main` déclenche un redéploiement Render automatique.

---

## 2. Installation

```bash
# Prérequis : Node.js ≥ 18
git clone https://github.com/OWNER/apecdi-site.git
cd apecdi-site
npm install
```

---

## 3. Configuration

Aucune variable d'environnement n'est requise pour le Mode A.

Le fichier `content/site.json` contient toute la configuration du site (nom, contacts, tagline, CTA, réseaux sociaux). Éditez-le directement ou via l'interface admin.

Les champs non encore confirmés sont marqués `{ "status": "to_validate" }` et ne sont pas affichés sur le site public.

---

## 4. Développement local

```bash
npm run dev
```

Le site est accessible sur `http://localhost:5173`.

**Accès admin en développement :**
- Desktop : `Ctrl+clic` (ou `⌘+clic` sur Mac) sur le logo ou le texte "APECDI" dans la navbar
- Mobile (ou simulation mobile) : double-tap sur le logo (intervalle 800–1500 ms)
- Mot de passe par défaut : `apecdi2024` ← **À changer avant déploiement**

---

## 5. Construction

```bash
npm run build
```

Les fichiers compilés sont dans `dist/`. Ce dossier est prêt à être déployé sur n'importe quel hébergeur de sites statiques.

---

## 6. Déploiement Render

### Premier déploiement

1. Pousser le repo sur GitHub
2. Sur [render.com](https://render.com) → **New → Static Site**
3. Connecter le repo GitHub
4. Render détecte automatiquement `render.yaml` — vérifier :
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `./dist`
5. Cliquer **Create Static Site**

### Redéploiements automatiques

Chaque push sur `main` → Render reconstruit et redéploie automatiquement.
En Mode B, le push GitHub est effectué par l'interface admin — Render redéploie sans aucune action manuelle.

### Domaine personnalisé

Dans Render → Settings → Custom Domains → ajouter `apecdi.com` et `www.apecdi.com`.

---

## 7. Accès à l'administration

L'interface admin est volontairement cachée — aucun lien visible sur le site public.

### Déclenchement

| Appareil | Action | Cible |
|----------|--------|-------|
| Desktop | `Ctrl+clic` (Windows/Linux) ou `⌘+clic` (Mac) | Logo ou texte "APECDI" dans la navbar |
| Mobile | Double-tap (intervalle 800–1500 ms) | Logo dans la navbar |

Le clic simple reste le comportement normal (retour accueil).

### Connexion

Mot de passe par défaut : **`apecdi2024`**

**⚠ Changez ce mot de passe avant le premier déploiement** (Admin → Paramètres → Sécurité).

### Session

- Durée : 30 minutes d'inactivité
- Verrouillage : 5 tentatives échouées → blocage 60 secondes
- Bouton **Déconnexion** dans la sidebar admin

### Sections admin

- **Tableau de bord** — vue d'ensemble, actions d'export, état GitHub
- **Publications** — créer/modifier des articles Markdown
- **Réalisations** — gérer les projets réalisés
- **Médiathèque** — upload, compression, gestion des images
- **Paramètres** — informations du site, contact, GitHub (Mode B), sécurité

---

## 8. Mode A — Export manuel

Mode par défaut. Aucune configuration requise.

### Workflow

1. Dans l'admin, créer ou modifier une publication
2. Cliquer **Exporter (A)**
3. Un fichier `.zip` est téléchargé, contenant :
   - `public/content/publications/mon-slug.json`
   - `public/uploads/publications/*.webp` (images)
4. Décompresser le zip et déposer les fichiers aux bons emplacements dans le repo local
5. Mettre à jour `public/content/publications/index.json` (ajouter le slug si nouveau)
6. Committer et pousser :

```bash
git add content/publications/ public/uploads/publications/
git commit -m "feat: add publication mon-slug"
git push
```

7. Render redéploie automatiquement (1–2 minutes)

### Export global

Depuis le Tableau de bord → **Exporter tout (Mode A)** : génère un zip avec toutes les publications publiées et leur index.

---

## 9. Mode B — Sync GitHub

Mode optionnel. Permet de publier sans toucher au terminal.

### Prérequis : créer un Personal Access Token (fine-grained)

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. **Generate new token**
3. **Resource owner** : votre compte ou organisation
4. **Repository access** : *Only select repositories* → sélectionner le repo APECDI uniquement
5. **Permissions → Repository permissions** :
   - **Contents** → `Read and write`
   - Tout le reste : `No access`
6. Durée de validité recommandée : 1 an maximum
7. **Generate token** → copier le token (affiché une seule fois)

### Configuration dans l'admin

1. Admin → **Paramètres → GitHub (Mode B)**
2. Saisir le dépôt : `proprietaire/nom-du-repo` (ex: `dupont/apecdi-site`)
3. Coller le token
4. Cliquer **Tester la connexion** → vérifier le succès
5. Cliquer **Enregistrer**

Le token est stocké dans `localStorage` **uniquement dans ce navigateur**. Il n'est jamais commité, jamais dans le code source, jamais envoyé ailleurs qu'à `api.github.com`.

### Publier en Mode B

1. Créer/modifier une publication dans l'admin
2. Cliquer **Publier (B)**
3. L'app pousse le JSON (et les images) sur GitHub via l'API REST
4. Render détecte le push et redéploie automatiquement (1–2 minutes)

### Révocation du token en cas de compromission

**Immédiatement** :
1. GitHub → Settings → Developer settings → Personal access tokens
2. Trouver le token compromis → **Revoke**
3. Créer un nouveau token avec les mêmes permissions
4. Mettre à jour dans l'admin (Paramètres → GitHub → supprimer l'ancien, coller le nouveau)

---

## 10. Import / Restauration

### Importer une sauvegarde

Admin → **Tableau de bord → Import / Réinitialisation** :
- Sélectionner un fichier `.zip` (issu d'un export Mode A) → les publications et images sont restaurées en brouillons locaux
- Ou sélectionner un fichier `.json` unique (publication individuelle)

### Réinitialiser les brouillons

Admin → **Tableau de bord → Réinitialiser** : efface tous les brouillons et images de l'IndexedDB locale. Les fichiers déjà publiés dans le repo Git ne sont pas affectés.

---

## 11. Sécurité

### Ce que protège l'authentification admin

L'écran de connexion protège l'interface contre les **visiteurs occasionnels**. Il décourage l'accès non intentionnel.

### Ce qu'elle ne protège pas

Le code source du site est public (repo GitHub). Un utilisateur déterminé peut :
- Lire le code JavaScript compilé
- Identifier l'URL de l'admin (`/admin`)
- Potentiellement contourner l'écran de connexion côté client

**Ce n'est pas un problème critique** car :
- L'admin ne modifie que des brouillons locaux (IndexedDB dans votre navigateur)
- Aucune donnée sensible n'est exposée publiquement
- Le seul secret réel est le PAT GitHub — il n'est jamais dans le code

### Le seul secret réel : le PAT GitHub (Mode B)

- Stocké dans `localStorage` du navigateur de l'administrateur uniquement
- Jamais commité dans le repo
- Jamais dans les variables d'environnement du serveur
- Portée minimale : un seul repo, Contents Read/Write uniquement
- En cas de compromission : révoquer immédiatement sur GitHub (cf. section 9)

### Bonnes pratiques

- Changer le mot de passe par défaut (`apecdi2024`) avant le premier déploiement
- Ne pas utiliser l'interface admin depuis un appareil partagé ou public
- Ne pas stocker le token GitHub dans un gestionnaire de mots de passe non sécurisé
- Révoquer et renouveler le PAT régulièrement (tous les 6 à 12 mois)

---

## Stack technique

| Composant | Outil |
|-----------|-------|
| Framework | React 18 + Vite 5 |
| Langage | TypeScript |
| Routing | React Router v6 |
| Markdown | marked |
| Export zip | JSZip |
| Stockage local | IndexedDB (couche custom) |
| Auth | Web Crypto API (SHA-256) |
| GitHub sync | GitHub REST API v3 |
| Compression images | Canvas API (WebP) |
| CSS | Variables CSS custom (pas de framework) |
| Déploiement | Render (static site) |

---

## Contribuer au contenu

Pour ajouter une publication sans passer par l'admin :

1. Créer `public/content/publications/mon-slug.json` en suivant le schéma des fichiers existants
2. Ajouter le slug dans `public/content/publications/index.json`
3. Déposer les images dans `public/uploads/publications/`
4. `git add . && git commit -m "feat: publication mon-slug" && git push`

---

*APECDI — Agence Privée d'Expertise et de Conseil pour un Développement Inclusif — Bénin, depuis 2013.*
