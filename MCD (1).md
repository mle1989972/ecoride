# MCD — EcoRide (Merise)
_MAJ : 2025-08-22_

> Ouvrez ce fichier sur **GitHub (web)** pour voir le rendu Mermaid.
> Si un message apparaît, vérifiez que chaque entité utilise **une seule paire d’accolades** `{ }` et que le bloc commence par `erDiagram`.

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

  USERS {
    string id
    string email
    string pseudo
    string password_hash
    string role
    int credits
    bool is_suspended
    datetime created_at
  }

  PREFERENCES {
    string user_id
    bool smoke_allowed
    bool animals_allowed
    string notes
  }

  VEHICLES {
    string id
    string user_id
    string make
    string model
    string color
    string energy
    int seats
    datetime created_at
  }

  TRIPS {
    string id
    string driver_id
    string vehicle_id
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
  }

  PARTICIPATIONS {
    string id
    string trip_id
    string user_id
    string status
    datetime created_at
  }

  REVIEWS {
    string id
    string trip_id
    string reviewer_id
    string driver_id
    int rating
    string comment
    bool is_moderated
    datetime created_at
  }

  CREDIT_LEDGER {
    string id
    string user_id
    int delta
    string reason
    datetime created_at
  }

  SUSPENSIONS {
    string id
    string user_id
    string reason
    date start_date
    date end_date
    string created_by
    datetime created_at
  }

  INCIDENTS {
    string id
    string trip_id
    string reporter_id
    string summary
    string description
    string status
    datetime created_at
  }
```