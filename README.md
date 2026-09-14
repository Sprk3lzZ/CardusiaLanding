# Cardusia — Landing newsletter

Landing page « Cardusia, l'IA éthique et responsable » avec inscription à la newsletter,
notification email à chaque inscription et backoffice de suivi.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind 4 + framer-motion
- SQLite via `node:sqlite` (Node ≥ 22.13 / 24) — fichier `data/subscribers.db`
- Resend pour l'envoi d'email

## Lancer

```bash
cp .env.example .env   # puis renseigner les valeurs
npm install
npm run dev
```

- Landing : http://localhost:3000
- Backoffice : http://localhost:3000/admin (mot de passe = `ADMIN_PASSWORD`)
- Export CSV : http://localhost:3000/admin/export

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` | Clé Resend. Absente → l'email est loggé en console, pas envoyé. |
| `NEWSLETTER_FROM` | Expéditeur (domaine vérifié sur Resend, ou `onboarding@resend.dev` en test). |
| `NOTIFY_EMAIL` | Destinataire de la notification (défaut `zeghiche@gmail.com`). |
| `ADMIN_PASSWORD` | Mot de passe du backoffice. |
| `SESSION_SECRET` | Secret de signature du cookie admin. |
| `DATA_DIR` | Dossier de la base SQLite (défaut `./data`). |

## Déploiement

La base est un fichier SQLite : il faut un hébergement avec disque persistant
(VPS, Docker avec volume, Railway/Fly volume). Sur Vercel (FS éphémère), remplacer `lib/db.ts`
par un stockage externe (Postgres/Neon, Turso, Upstash…), l'interface est isolée dans ce fichier.

## Déploiement Railway

Le projet embarque un `Dockerfile` (Next.js en mode `standalone`) et un `railway.toml`.

1. **Créer le service** : New Project → Deploy from GitHub repo → `Sprk3lzZ/CardusiaLanding`.
   Railway détecte le Dockerfile automatiquement.
2. **Ajouter un volume** (indispensable pour SQLite) : dans le service → onglet *Volumes* → *Add Volume*,
   mount path **`/data`**. Sans volume, la base est perdue à chaque redéploiement.
3. **Variables** (onglet *Variables*) :

   | Variable | Valeur |
   |---|---|
   | `RESEND_API_KEY` | clé Resend |
   | `NEWSLETTER_FROM` | `Cardusia <newsletter@votre-domaine.com>` (domaine vérifié sur Resend) |
   | `NOTIFY_EMAIL` | `zeghiche@gmail.com` |
   | `ADMIN_PASSWORD` | mot de passe fort |
   | `SESSION_SECRET` | chaîne aléatoire longue (`openssl rand -hex 32`) |
   | `RAILWAY_RUN_UID` | `0` — le volume est monté en root, cette variable permet au conteneur d'y écrire |

   `DATA_DIR=/data` et `PORT` sont déjà gérés par le Dockerfile / Railway.
4. **Domaine** : onglet *Settings* → *Networking* → *Generate Domain* (ou domaine custom).

Le healthcheck pointe sur `/`. Les logs d'envoi d'email sont visibles dans *Deployments → Logs*.
