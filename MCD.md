# MCD — EcoRide (Merise)
_MAJ : 2025-08-22_

Le diagramme ci-dessous utilise la syntaxe Mermaid **erDiagram**.  
> Astuce : GitHub rend Mermaid **uniquement dans les fichiers .md**. Ouvrez ce fichier sur GitHub (web) pour voir le rendu.

```mermaid
erDiagram
  USERS ||--o{ VEHICLES : owns
  USERS ||--o{ TRIPS : drives
  VEHICLES ||--o{ TRIPS : used_for
  USERS }o--o{ TRIPS : participates
  TRIPS ||--o{ REVIEWS : has
  USERS ||--o{ REVIEWS : writes
  USERS ||--o{ CREDIT_LEDGER : has
  USERS ||--|| PREFERENCES : has
  USERS ||--o{ SUSPENSIONS : subject_of
  USERS ||--o{ INCIDENTS : reports
  TRIPS ||--o{ INCIDENTS : concerns

  USERS {{
    uuid id PK
    string email
    string pseudo
    string password_hash
    string role
    int credits
    bool is_suspended
    datetime created_at
  }}
  PREFERENCES {{
    uuid user_id PK,FK
    bool smoke_allowed
    bool animals_allowed
    string notes
  }}
  VEHICLES {{
    uuid id PK
    uuid user_id FK
    string make
    string model
    string color
    string energy
    int seats
    datetime created_at
  }}
  TRIPS {{
    uuid id PK
    uuid driver_id FK
    uuid vehicle_id FK
    string origin_city
    string destination_city
    datetime departure_time
    datetime arrival_time
    int price_cents
    int seats_total
    int seats_available
    bool is_ecologic
    string status
    datetime created_at
  }}
  PARTICIPATIONS {{
    uuid id PK
    uuid trip_id FK
    uuid user_id FK
    string status
    datetime created_at
  }}
  REVIEWS {{
    uuid id PK
    uuid trip_id FK
    uuid reviewer_id FK
    uuid driver_id FK
    int rating
    string comment
    bool is_moderated
    datetime created_at
  }}
  CREDIT_LEDGER {{
    uuid id PK
    uuid user_id FK
    int delta
    string reason
    datetime created_at
  }}
  SUSPENSIONS {{
    uuid id PK
    uuid user_id FK
    string reason
    date start_date
    date end_date
    uuid created_by FK
    datetime created_at
  }}
  INCIDENTS {{
    uuid id PK
    uuid trip_id FK
    uuid reporter_id FK
    string summary
    string description
    string status
    datetime created_at
  }}
```
