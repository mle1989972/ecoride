-- EcoRide — jeu de données minimal
-- Le hash correspond au mot de passe "Password123!"
INSERT INTO users (id, email, pseudo, password_hash, role, credits) VALUES
  (COALESCE(uuid_generate_v4(), gen_random_uuid()), 'alice@example.com', 'Alice', '$2a$10$0UuMZ5cxo7IPgZbY0Nn1Qe9i8Jv3S9S8gDUKqKXJ2yQn4mL1GzvV2', 'user', 40),
  (COALESCE(uuid_generate_v4(), gen_random_uuid()), 'bob@example.com',   'Bob',   '$2a$10$0UuMZ5cxo7IPgZbY0Nn1Qe9i8Jv3S9S8gDUKqKXJ2yQn4mL1GzvV2', 'user', 20);

-- Crée un véhicule pour le premier utilisateur
WITH first_user AS (SELECT id FROM users ORDER BY created_at LIMIT 1)
INSERT INTO vehicles (user_id, make, model, color, energy, seats)
SELECT id, 'Renault', 'Zoé', 'Vert', 'electric', 4 FROM first_user;

-- Crée un trajet dans 2h (durée 2h)
WITH v AS (SELECT id AS vehicle_id, user_id AS driver_id FROM vehicles ORDER BY created_at LIMIT 1)
INSERT INTO trips (driver_id, vehicle_id, origin_city, destination_city, departure_time, arrival_time, price_cents, seats_total, seats_available, is_ecologic, status)
SELECT driver_id, vehicle_id, 'Rouen', 'Paris', now() + interval '2 hours', now() + interval '4 hours',
       1200, 3, 3, true, 'scheduled'
FROM v;
