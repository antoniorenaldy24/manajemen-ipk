-- Seeding Data via Migration
INSERT INTO "User" (id, email, password_hash, role, created_at, updated_at) VALUES 
('3541b66f-e0d1-40e0-a892-517578665016', '198001', '$2b$10$gjDon.GU4AebkUknxGQ6a.ppB9LIjEMQ6brlZAd9RTE05ETrN8Ppa', 'UPM', NOW(), NOW()),
('551d5711-cf24-4f09-a3f9-8f817b676e35', '197505', '$2b$10$LWl6tmnz0X51Y.wHLBjwq.iz42ojIYiq4bEpy9VdJ2XKV9G8RJTmW', 'KAPRODI', NOW(), NOW());

INSERT INTO "User" (id, email, password_hash, role, created_by, created_at, updated_at) VALUES 
('f00d9b1f-b9ff-43b0-8e72-b9aceb33af1a', '21051201', '$2b$10$5NwCKqycMz6sSNlzM87U/.smtHrjaasDERA7I0mbVp.1D5u8B0pGO', 'MAHASISWA', '3541b66f-e0d1-40e0-a892-517578665016', NOW(), NOW());

INSERT INTO "Student" (id, user_id, nim_hash, nim_encrypted, name, batch_year, current_semester, ipk, status, created_by, created_at, updated_at) VALUES 
('69ac4626-bd73-4fa9-afee-0c75264f2963', 'f00d9b1f-b9ff-43b0-8e72-b9aceb33af1a', '7d712549c511b474dd71af04ad6605d3fd02f8c5400598d9e065cc4510f4d65b', '634253fbbe341157535d4ddecd75b456:6361364f64d31fa7069e2d6a461e5482:7ae2197b13b3f335', 'Ahmad Fauzi', 2021, 6, 0.00, 'AMAN', '3541b66f-e0d1-40e0-a892-517578665016', NOW(), NOW());

INSERT INTO "User" (id, email, password_hash, role, created_by, created_at, updated_at) VALUES 
('032f9a4f-0286-4915-9988-c92bc3215863', '21051202', '$2b$10$.3.SxraIhbFX0SKp6QQbTudqUMK/yRNR61rZS/tZy0PFkCjvQ8kJy', 'MAHASISWA', '3541b66f-e0d1-40e0-a892-517578665016', NOW(), NOW());

INSERT INTO "Student" (id, user_id, nim_hash, nim_encrypted, name, batch_year, current_semester, ipk, status, created_by, created_at, updated_at) VALUES 
('95ad04e3-cb07-43f6-a1c7-87cc843c9afc', '032f9a4f-0286-4915-9988-c92bc3215863', 'fad688317e729ee7a548fff120e45f51d231b816d0c1611d3f486ceb9d241492', '005a2180ac7943d4540e40925574c40b:7323cdbdb4f90ce52aec65f1fd15690e:f7b01febec2b5dee', 'Siti Aminah', 2021, 6, 0.00, 'AMAN', '3541b66f-e0d1-40e0-a892-517578665016', NOW(), NOW());

INSERT INTO "User" (id, email, password_hash, role, created_by, created_at, updated_at) VALUES 
('4a1371ee-3258-428c-bc02-d32721e52233', '21051203', '$2b$10$0I6EIm2jS0/tBNm.sDbbn.H4Agkrt6ddSi3HAXj73CX6skcz.j7ee', 'MAHASISWA', '3541b66f-e0d1-40e0-a892-517578665016', NOW(), NOW());

INSERT INTO "Student" (id, user_id, nim_hash, nim_encrypted, name, batch_year, current_semester, ipk, status, created_by, created_at, updated_at) VALUES 
('331c4993-1f6c-43e7-90d1-398343741ee4', '4a1371ee-3258-428c-bc02-d32721e52233', '7babd72a99c50759133a08fc9033bdc93780d7034888abb17fc8e4abdf35a926', 'cd9db824fab3ab374e806e3e2a1090d6:9f360857d583fff656e6a8c72a6baef6:fb271746ff6e3e09', 'Budi Santoso', 2021, 6, 0.00, 'AMAN', '3541b66f-e0d1-40e0-a892-517578665016', NOW(), NOW());

