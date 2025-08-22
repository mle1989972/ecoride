
# EcoRide — Plateforme de covoiturage (ECF TP Développeur Web & Web Mobile)

Application web de covoiturage focalisée sur l'impact écologique (voitures électriques mises en avant) et l'économie d'usage.

> **Liens utiles (à remplacer par les vôtres)**  
> • Déploiement Front : https://…  
> • Déploiement API : https://…  
> • Dépôt GitHub (public) : https://github.com/…/ecoride  
> • Board Kanban (Trello/Notion/Jira) : https://…  

---

## 1) Fonctionnalités (US)

- **US1 – Accueil** : présentation EcoRide, barre de recherche (villes + date), footer (mail + mentions légales).  
- **US2 – Menu** : Accueil, Covoiturages, Connexion, Contact.  
- **US3 – Liste des covoiturages** : après saisie des villes + date, affichage des trajets **avec places > 0** ; si aucun trajet, proposer la **date disponible la plus proche**. Cartes avec pseudo, photo, **note chauffeur**, **places restantes**, **prix**, **horaires**, **mention "écologique"** si véhicule électrique, bouton **Détail**.  
- **US4 – Filtres** : écologique, **prix max**, **durée max**, **note minimale**.  
- **US5 – Détail d’un covoiturage** : infos étendues, **avis** sur le conducteur, **marque/modèle/énergie** du véhicule, **préférences** du conducteur.  
- **US6 – Participer** : bouton accessible si connecté, **places restantes** et **crédits disponibles** ; **double confirmation**, débit crédits, décrément places, enregistrement côté passager. Redirection vers login/inscription sinon.  
- **US7 – Compte** : inscription avec **pseudo, mail, mot de passe sécurisé**, attribution **+20 crédits** à la création.  
- **US8 – Espace utilisateur** : choisir rôle(s) (chauffeur/passager), gérer **véhicules** (plaque, 1ère immat., marque/modèle/couleur, **places**), **préférences** (fumeur, animaux, + perso).  
- **US9 – Saisir un voyage (chauffeur)** : villes départ/arrivée, date/heure, **prix** (plateforme retient **2 crédits**), sélection du véhicule.  
- **US10 – Historique / Annulation** : liste des covoiturages (chauffeur & passager), annulation, **maj crédits/places**, **mail aux passagers si annulation chauffeur**.  
- **US11 – Démarrer / Arriver** : workflow start → arrive ; **mail** aux passagers pour valider le trajet, **avis** + **note** (modération).  
- **US12 – Espace Employé** : **modération** des avis, gestion des **incidents** (trajets mal passés) avec récap (n° trajet, pseudos, mails, lieux, dates).  
- **US13 – Espace Admin** : création **comptes employés**, **suspensions** utilisateurs/employés, **2 graphiques** (covoiturages/jour, crédits gagnés/jour) + **total crédits** plateforme. **Le compte admin est créé en amont** (hors app).

---

## 2) Pile technique

- **Front** : HTML5 + CSS (Bootstrap) + JavaScript (Vanilla).  
- **API** : Node.js + Express (ou PHP/PDO si vous préférez).  
- **SQL** : PostgreSQL / MySQL / MariaDB (au choix).  
- **NoSQL** : MongoDB (logs/modération/queue email).  
- **Déploiement** : Vercel (front), Render/Fly.io/Heroku/Azure (API) — au choix.  

> Aucune techno n’est imposée, sauf l’usage d’une **BD relationnelle + une BD NoSQL**.

---

## 3) Architecture du dépôt

```
ecoride/
├─ docs/
│  ├─ schema.sql          # Schéma SQL relationnel (obligatoire)
│  ├─ MANUEL_UTILISATEUR.pdf
│  ├─ CHARTE_GRAPHIQUE.pdf  # Palette & polices + exports des 3 maquettes desktop & 3 mobiles
│  ├─ DOC_TECHNIQUE.pdf     # MCD/diagrammes, choix techniques, déploiement
│  └─ GESTION_PROJET.pdf    # Explication du Kanban et méthode
├─ public/                 # (si front statique) assets, index.html
├─ src/                    # (si API Node) routes, controllers, services, models...
│  └─ ...
├─ scripts/
│  └─ createAdmin.js       # Création du compte administrateur (hors app)
├─ .env.example
└─ README.md               # Ce fichier
```

---

## 4) Prérequis

- Node.js 20+ (si stack Node)  
- Un serveur **SQL** (PostgreSQL/MySQL) accessible + un **MongoDB** (Atlas possible)  
- Un compte SMTP pour l’envoi des mails (Nodemailer, Sendgrid, etc.)

**Variables d’environnement (exemple)**

| Variable        | Description |
|----------------|-------------|
| `DATABASE_URL` | Connexion SQL, ex. `postgres://user:pass@host:5432/ecoride` |
| `MONGODB_URI`  | Connexion MongoDB (si utilisé) |
| `JWT_SECRET`   | Secret JWT |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | SMTP pour emails |
| `SMTP_FROM`    | Ex. `EcoRide <noreply@ecoride.app>` |
| `PORT`         | Port API (ex. 3000) |

---

## 5) Installation locale (API Node.js — exemple)

```bash
# 1) Cloner
git clone https://github.com/votrecompte/ecoride.git
cd ecoride

# 2) Config env
cp .env.example .env
# éditer .env (DATABASE_URL, JWT_SECRET, SMTP…)

# 3) Dépendances
npm install

# 4) Base de données (SQL)
psql "$DATABASE_URL" -f docs/schema.sql
# (Option) Données d'exemple
psql "$DATABASE_URL" -f src/seed/seed.sql

# 5) Démarrer
npm run dev   # mode dev
# npm start   # mode production
```

### Création du compte administrateur (obligatoire)
- L’admin n’est **pas** créé via l’application. Lancer un script dédié :  
  ```bash
  node scripts/createAdmin.js
  ```
- **Fournir les identifiants dans le MANUEL_UTILISATEUR.pdf** (section “Comptes de test”).

---

## 6) Endpoints API (MVP)

- `POST /api/auth/register` — Inscription (pseudo, email, password) → **+20 crédits**.  
- `POST /api/auth/login` — Connexion (JWT).  
- `GET  /api/trips` — Recherche par `from`, `to`, `date`, filtres `eco`, `priceMax`, `durationMax`, `ratingMin`.  
- `POST /api/trips` — Créer un trajet (chauffeur).  
- `POST /api/trips/:id/participations` — Participer (double confirmation).  
- `POST /api/trips/:id/start` — Démarrer le trajet.  
- `POST /api/trips/:id/arrive` — Arrivée + demande d’avis.  
- `POST /api/reviews/:id/moderate` — (Employé) modération avis.  
- `POST /api/admin/suspend/:userId` — (Admin) suspension de compte.  
- `GET  /api/admin/stats` — (Admin) stats & graphiques.  

> Voir `docs/DOC_TECHNIQUE.pdf` pour le modèle de données et les schémas d’API détaillés.

---

## 7) Sécurité (mesures clés)

- **Validation** et **sanitization** (Joi/Zod) sur toutes les entrées.  
- **Auth JWT** signée ; mots de passe **bcrypt**.  
- **helmet** + **CORS** (origines autorisées) ; **rate limiting** sur auth.  
- **RBAC** : routes protégées (user / employee / admin).  
- **Logs** et audit (MongoDB) ; gestion des erreurs centralisée.

---

## 8) Déploiement (exemple)

- **API** : Render (Node) avec variables d’environnement (DATABASE_URL, JWT_SECRET, SMTP…).  
- **Front** : Vercel (static/CSR).  
- Vérifier CORS entre domaines.  
- Renseigner les **liens déployés** dans ce README et dans la **copie à rendre**.

---

## 9) Gestion de projet (Kanban)

Colonnes recommandées : **Backlog** → **À faire (Sprint)** → **En cours** → **Terminé (dev)** → **Mergé (main)**.  
Chaque fonctionnalité = une **carte** liée à une **branche** (feature/…) et une **PR**.

---

## 10) Comptes de test (à compléter)

- **Admin (créé en amont)** : `admin@ecoride.app` / `…`  
- **Employé** : `employee@ecoride.app` / `…`  
- **Chauffeur** : `driver@ecoride.app` / `…`  
- **Passager** : `rider@ecoride.app` / `…`  

---

## 11) Licence

Usage pédagogique (ECF).

---

_Mis à jour le 2025-08-22._

