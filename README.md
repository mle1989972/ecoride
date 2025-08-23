# EcoRide — TP Développeur Web & Web Mobile

Projet **back + front** pour une plateforme de covoiturage.  
Objectifs ECF couverts : authentification, recherche et publication de trajets, participation avec double confirmation, gestion des crédits, avis & modération, incidents (employé), administration (employés + statistiques), **front statique** (HTML/CSS/JS), **base relationnelle (PostgreSQL)** et **NoSQL (MongoDB)**.

---

## 🧱 Stack technique

- **Backend** : Node.js (ESM) / Express, PostgreSQL (pg), JWT (jsonwebtoken), Joi (validation), Nodemailer (emails)
- **NoSQL** : MongoDB (journalisation d’événements via `src/mongo/`)
- **Frontend** : HTML5 + CSS + JS (fetch), statique servi par Express (`/public`)
- **Sécurité** : Helmet, CORS, gestion d’erreurs centralisée
- **Outils** : Docker Compose (Postgres, Mongo, Mailhog, App), Vitest + Supertest (tests)

---

## 📂 Arborescence

```
ecoride/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── .env.example
├── README.md
├── docs/
│   └── schema.sql
├── docker/
│   └── postgres/
│       └── init/
│           ├── 01-schema.sql
│           └── 02-seed.sql
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── trip.html
│   ├── dashboard.html
│   ├── employee.html
│   ├── admin.html
│   └── assets/
│       ├── styles.css
│       ├── main.js
│       ├── login.js
│       ├── register.js
│       ├── trip.js
│       ├── dashboard.js
│       ├── employee.js
│       └── admin.js
├── scripts/
│   └── createAdmin.js
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── roles.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── participations.js
│   │   ├── reviews.js
│   │   ├── trips.js
│   │   ├── vehicles.js
│   │   ├── preferences.js
│   │   └── incidents.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── participationsController.js
│   │   ├── reviewsController.js
│   │   ├── tripsController.js
│   │   ├── vehiclesController.js
│   │   ├── preferencesController.js
│   │   └── incidentsController.js
│   ├── emails/
│   │   └── mailer.js
│   ├── mongo/
│   │   ├── client.js
│   │   └── log.js
│   ├── seed/
│   │   └── seed.sql
│   ├── tests/
│   │   ├── health.test.js
│   │   ├── auth.test.js
│   │   └── trips.test.js
│   └── utils/
│       └── credits.js
```

---

## ⚙️ Prérequis

- Node.js 18+ (recommandé : 20)
- PostgreSQL 14+
- (Optionnel) MongoDB 6+ (pour la brique NoSQL)
- (Optionnel) Docker + Docker Compose

---

## 🔐 Variables d’environnement (`.env`)

Copier `.env.example` vers `.env` puis compléter :

```
DATABASE_URL=postgres://user:pass@localhost:5432/ecoride
JWT_SECRET=change-me
# SMTP (optionnel - Mailhog en dev)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM="EcoRide <no-reply@ecoride.local>"
# NoSQL (optionnel)
MONGODB_URI=mongodb://localhost:27017/ecoride
```

> _Si `MONGODB_URI` n’est pas défini, le logging NoSQL est **désactivé** (no-op)._

---

## 🛠️ Installation (local)

1) **Installer les dépendances**
```bash
npm install
```

2) **Créer la base** et le schéma
```bash
# Assurez-vous que DATABASE_URL pointe vers votre base
psql "$DATABASE_URL" -f docs/schema.sql
# (optionnel) données de démo
psql "$DATABASE_URL" -f src/seed/seed.sql
```

3) **Lancer l’app**
```bash
npm start
# Service: http://localhost:3000
```

4) **Créer un admin**
```bash
node scripts/createAdmin.js --email=admin@ecoride.local --pseudo=Admin --password=Admin123!
```

---

## 🐳 Démarrage via Docker

1) **Lancer la stack**
```bash
docker compose up -d
```

- App : http://localhost:3000  
- Postgres : 5432 (DB `ecoride` / `ecoride` / `ecoride`)  
- Mongo : 27017  
- Mailhog (emails de dev) : http://localhost:8025

2) **Créer un admin dans le conteneur**
```bash
docker compose exec app node scripts/createAdmin.js   --email=admin@ecoride.local --pseudo=Admin --password=Admin123!
```

> Le schéma et le seed sont injectés au boot via `docker/postgres/init/`.

---

## 🧭 Parcours front

- `GET /` → `public/index.html` : recherche trajets (filtres : éco, prix max, durée max, note min) + **suggestion de date** si aucun résultat
- `GET /trip.html?id=...` : détail trajet + **double confirmation** de participation
- `GET /login.html` / `GET /register.html`
- `GET /dashboard.html` : véhicules (CRUD), préférences, **créer un trajet**, **mes trajets chauffeur & passager**
- `GET /employee.html` (rôle `employee` ou `admin`) : incidents (liste + statut), **modération avis**
- `GET /admin.html` (rôle `admin`) : **création d’employés**, **2 graphiques** (trajets/jour, crédits/jour) + total crédits

---

## 🔌 API — endpoints principaux

### Auth
- `POST /api/auth/register` `{ pseudo, email, password }` → 201
- `POST /api/auth/login` `{ email, password }` → 200 `{ token, user }`

### Santé
- `GET /api/health` → `{ ok: true }`

### Trajets
- `GET /api/trips?from=&to=&date=YYYY-MM-DD&eco=true&priceMax=&durationMax=&ratingMin=&limit=&offset=`
- `GET /api/trips/:id`
- `POST /api/trips` *(auth)* `{ vehicle_id, origin_city, destination_city, departure_time, arrival_time, price_cents, seats_total }`
- `POST /api/trips/:id/start` *(driver)*
- `POST /api/trips/:id/arrive` *(driver)*
- `POST /api/trips/:id/cancel` *(driver)*

### Mes trajets
- `GET /api/trips/mine?role=driver|passenger|all&upcoming=true|false&status=CSV` *(auth)*

### Participations
- `POST /api/trips/:id/participations` *(auth)* — demande (double confirmation côté front)

### Véhicules *(auth)*
- `GET /api/vehicles`
- `GET /api/vehicles/:id`
- `POST /api/vehicles`
- `PUT /api/vehicles/:id`
- `DELETE /api/vehicles/:id` (refus si véhicule utilisé par un trajet actif)

### Préférences *(auth)*
- `GET /api/preferences`
- `PUT /api/preferences` `{ smoke_allowed?, animals_allowed?, notes? }`

### Avis
- `POST /api/reviews` *(passager d’un trajet “arrived”)* `{ trip_id, rating, comment? }`
- `GET /api/reviews/pending` *(employee/admin)*
- `POST /api/reviews/:id/moderate` *(employee/admin)*

### Incidents
- `POST /api/incidents` *(participant/driver)* `{ trip_id, summary, description? }`
- `GET /api/incidents[?status=open|in_review|closed]` *(employee/admin → tous, sinon → les miens)*
- `PATCH /api/incidents/:id` *(employee/admin)* `{ status }`

### Admin *(admin)*
- `POST /api/admin/employees` `{ email, pseudo, password? }`
- `POST /api/admin/suspend/:userId`
- `GET /api/admin/stats` → séries (30j) + total crédits

---

## 🧪 Tests (Vitest + Supertest)

Ajouter dans `package.json` :
```json
{
  "devDependencies": {
    "vitest": "^1.6.0",
    "supertest": "^6.3.4"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Configurer une base de test (`.env.test`) si possible, puis :
```bash
npm run test
# ou en mode watch
npm run test:watch
```

Tests fournis :
- `src/tests/health.test.js`
- `src/tests/auth.test.js`
- `src/tests/trips.test.js`

---

## 🔒 Rôles & sécurité

- `user` (défaut), `employee`, `admin`
- JWT Bearer dans `Authorization:`
- Contrôles d’accès par middleware (`authRequired`, `requireRole`)
- Emails : envoyés en **best-effort** (si SMTP indisponible → log console)

---

## 🚀 Déploiement (pistes)

- Image Docker `Dockerfile`
- Variables d’env à configurer : `DATABASE_URL`, `JWT_SECRET`, `MONGODB_URI` (optionnel), SMTP
- Prévoir un reverse-proxy (Caddy/Nginx) + HTTPS

---

## 🧭 Conseils & troubleshooting

- **Statique non servi** → vérifier `src/app.js` contient `express.static(..../public)`
- **401 Unauthorized** → vérifier `Authorization: Bearer <token>` et `JWT_SECRET`
- **Emails en dev** → Mailhog `http://localhost:8025` (si Docker)
- **Postgres vide** → rejouer `docs/schema.sql` et `src/seed/seed.sql`

---

## 📜 Licence

Projet pédagogique dans le cadre de l’ECF (usage éducatif).

---

**Bon courage ✨** — et si besoin, ouvre une issue ou ping pour de l’aide.
