# BourseUp — MVP

Micro-SaaS : base de bourses + génération de lettres de motivation par IA + suivi de deadlines.

## Stack
- **Frontend** : Next.js (pages router) + CSS simple
- **Backend** : API routes Next.js
- **Base de données / auth** : Supabase (Postgres + auth intégrée)
- **IA** : API Anthropic (Claude Sonnet)

## Démarrage rapide

1. **Créer un projet Supabase** sur https://supabase.com
   - Dans l'éditeur SQL, exécuter dans l'ordre (New query → coller → Run, à chaque fois dans un éditeur vide) :
     `supabase/schema.sql` → `supabase/auth_trigger.sql` → `supabase/admin_role.sql`
   - Activer l'authentification par email (Authentication > Providers) — désactive la confirmation
     par email en développement (Authentication > Settings) pour tester plus vite

2. **Copier les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   Remplir avec :
   - `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > API)
   - `SUPABASE_SERVICE_ROLE_KEY` (même page, clé secrète — ne jamais commit)
   - `ANTHROPIC_API_KEY` (console.anthropic.com)

3. **Installer et lancer**
   ```bash
   npm install
   npm run dev
   ```
   Ouvrir http://localhost:3000

4. **Devenir admin pour gérer les bourses**
   - Inscris-toi normalement sur l'appli (`/signup`)
   - Dans Supabase → SQL Editor, exécute (avec ton propre email) :
     ```sql
     update public.profiles set is_admin = true
     where id = (select id from auth.users where email = 'ton-email@exemple.com');
     ```
   - Reconnecte-toi puis va sur **`/admin`** — tu peux maintenant ajouter, modifier et
     supprimer des bourses directement depuis l'interface (plus besoin de passer par Supabase)

## Structure du projet
```
pages/
  index.js              → page d'accueil
  login.js / signup.js   → authentification (Supabase Auth)
  scholarships.js        → liste des bourses (filtrable)
  generate.js             → formulaire de génération de lettre (protégé, redirige vers /login)
  admin.js                → back-office : ajout/modification/suppression des bourses (réservé is_admin)
  api/
    scholarships.js       → GET public + POST/PUT/DELETE protégés (vérifie is_admin)
    generate-letter.js    → appelle Claude, applique le quota gratuit, sauvegarde et logue le coût
lib/
  supabaseClient.js       → client Supabase (navigateur + admin serveur)
  useUser.js              → hook React pour l'état de connexion
  anthropic.js            → prompt système + appel API Claude
components/
  Navbar.js               → barre de navigation avec état connecté/déconnecté
public/
  favicon.svg             → icône de l'app (toque + flèche)
  logo.svg                → logotype complet affiché dans la navbar
supabase/
  schema.sql              → tables + Row Level Security
  auth_trigger.sql        → crée automatiquement profil + abonnement "free" à l'inscription
  admin_role.sql           → ajoute la colonne is_admin sur profiles
```

## Favicon et logo
Les fichiers sont déjà dans `public/` et branchés (`pages/_document.js` pour le favicon,
`Navbar.js` pour le logo). Le favicon est en SVG — bien supporté par Chrome, Firefox, Edge
et Safari récent. Si tu veux un `.ico` classique pour une compatibilité maximale (vieux
navigateurs, certains raccourcis iOS), passe `public/favicon.svg` dans un convertisseur
gratuit comme https://favicon.io et remplace/ajoute le fichier généré.

## Gérer les bourses (page admin)
Une fois ton compte passé en admin (voir étape 4 ci-dessus), va sur `/admin` :
- formulaire pour ajouter une nouvelle bourse (nom, organisme, pays, niveau, deadline,
  critères, lien officiel, limite de mots)
- liste de toutes les bourses existantes avec boutons **Modifier** et **Supprimer**
- toute écriture (ajout/modif/suppression) passe par l'API et vérifie côté serveur que
  ton compte a bien `is_admin = true` avant d'exécuter quoi que ce soit

## Authentification (déjà en place)
- Inscription (`/signup`) et connexion (`/login`) via Supabase Auth (email/mot de passe)
- À l'inscription, un trigger SQL crée automatiquement une ligne `profiles` et `subscriptions` (plan `free`)
- Le hook `useUser()` donne l'état de connexion partout dans l'app ; `generate.js` redirige vers `/login` si non connecté

## Prochaines étapes suggérées
1. Brancher Stripe pour le plan Pro (webhook qui met à jour `subscriptions.plan`).
2. Ajouter les rappels de deadlines (cron Supabase Edge Function + email/WhatsApp).
3. Une fois validé : réutiliser `lib/anthropic.js` et les mêmes appels API dans une app React Native (Expo) pour la version mobile.



PDYA:
EHVJ-BBL4-ONBL-KBDU-XQ27
GFTQ-5MFE-TULW-CO02-INIZ
E7JS-YHHV-E93O-C5RN-BVAV
WQTM-UIXC-KFLT-MQJF-QNO9
SFZB-Z2HN-PX7E-H2E2-CKP1