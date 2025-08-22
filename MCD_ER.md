
erDiagram
  UTILISATEUR ||--o{ VEHICULE : possede
  UTILISATEUR ||--o{ TRAJET : conduit
  VEHICULE ||--o{ TRAJET : utilise_pour
  UTILISATEUR }o--o{ TRAJET : "participe (via PARTICIPATION)"
  TRAJET ||--o{ AVIS : recoit
  UTILISATEUR ||--o{ AVIS : ecrit
  UTILISATEUR ||--o{ MOUVEMENTCREDITS : subit
  UTILISATEUR ||--|| PREFERENCE : a
  UTILISATEUR ||--o{ SUSPENSION : subit
  UTILISATEUR ||--o{ INCIDENT : declare
  TRAJET ||--o{ INCIDENT : concerne

  UTILISATEUR {{
    uuid id PK
    string email
    string pseudo
    string password_hash
    enum role  "user|employee|admin"
    int credits
    bool is_suspended
    datetime created_at
  }}
  PREFERENCE {{
    uuid user_id PK,FK
    bool smoke_allowed
    bool animals_allowed
    string notes
  }}
  VEHICULE {{
    uuid id PK
    uuid user_id FK
    string make
    string model
    string color
    enum energy "electric|hybrid|petrol|diesel"
    int seats
    datetime created_at
  }}
  TRAJET {{
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
    enum status "scheduled|started|arrived|cancelled"
    datetime created_at
  }}
  PARTICIPATION {{
    uuid id PK
    uuid trip_id FK
    uuid user_id FK
    enum status "pending|accepted|cancelled"
    datetime created_at
  }}
  AVIS {{
    uuid id PK
    uuid trip_id FK
    uuid reviewer_id FK
    uuid driver_id FK
    int rating "1..5"
    string comment
    bool is_moderated
    datetime created_at
  }}
  MOUVEMENTCREDITS {{
    uuid id PK
    uuid user_id FK
    int delta
    string reason
    datetime created_at
  }}
  SUSPENSION {{
    uuid id PK
    uuid user_id FK
    string reason
    date start_date
    date end_date
    uuid created_by FK
    datetime created_at
  }}
  INCIDENT {{
    uuid id PK
    uuid trip_id FK
    uuid reporter_id FK
    string summary
    string description
    enum status "open|in_review|closed"
    datetime created_at
  }}
