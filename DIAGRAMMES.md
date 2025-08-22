# Diagrammes — EcoRide (Mermaid)
_MAJ : 2025-08-22_

Ces diagrammes sont au format **Mermaid** et se rendent nativement sur GitHub **dans un fichier .md**.

## Séquence — Inscription / Connexion
```mermaid
sequenceDiagram
  actor U as Utilisateur
  participant API as API
  participant SQL as PostgreSQL

  U->>API: POST /auth/register (pseudo,email,pwd)
  API->>SQL: INSERT utilisateur (+20 crédits)
  SQL-->>API: ok (id)
  API-->>U: 201 Created

  U->>API: POST /auth/login (email,pwd)
  API->>SQL: SELECT utilisateur
  SQL-->>API: password_hash, role, id
  API-->>U: 200 OK (JWT)
```

## Séquence — Recherche & Liste
```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant API as API
  participant SQL as PostgreSQL

  U->>API: GET /trips?from=...&to=...&date=...
  API->>SQL: SELECT trajets WHERE seats_available>0 AND date~
  SQL-->>API: rows
  API-->>U: liste (ou date proche si vide)
```

## Séquence — Publication d’un trajet
```mermaid
sequenceDiagram
  actor C as Chauffeur
  participant API as API
  participant SQL as PostgreSQL

  C->>API: POST /trips (vehicle_id, horaires, prix, places)
  API->>SQL: INSERT trajet (is_ecologic dérivé de véhicule.energy)
  SQL-->>API: ok
  API-->>C: 201 Created
```

## Séquence — Participation & crédits
```mermaid
sequenceDiagram
  actor P as Passager
  actor C as Chauffeur
  participant API as API
  participant SQL as PostgreSQL

  P->>API: POST /trips/:id/participations
  API->>SQL: INSERT participation(status=pending)
  API-->>C: notif "nouvelle demande"
  C->>API: POST /participations/:id/accept
  API->>SQL: UPDATE participation->accepted
  API->>SQL: UPDATE users.credits (passager -= prix) & trajets.seats_available--
  API-->>P: confirmation
```

## Séquence — Démarrer / Arriver / Avis / Modération
```mermaid
sequenceDiagram
  actor C as Chauffeur
  actor P as Passager
  participant API as API
  participant SQL as PostgreSQL
  participant EMP as Employé

  C->>API: POST /trips/:id/start
  API->>SQL: UPDATE trajet.status=started

  C->>API: POST /trips/:id/arrive
  API->>SQL: UPDATE trajet.status=arrived
  API-->>P: email "valider + laisser un avis"

  P->>API: POST /reviews (trip_id, rating, comment)
  API->>SQL: INSERT avis(is_moderated=false)

  EMP->>API: POST /reviews/:id/moderate
  API->>SQL: UPDATE avis.is_moderated=true
```

## Séquence — Annulation chauffeur
```mermaid
sequenceDiagram
  actor C as Chauffeur
  actor P as Passager
  participant API as API
  participant SQL as PostgreSQL

  C->>API: POST /trips/:id/cancel
  API->>SQL: UPDATE trajet.status=cancelled
  API->>SQL: UPDATE users.credits (passagers += prix)
  API-->>P: email "trajet annulé"
```
