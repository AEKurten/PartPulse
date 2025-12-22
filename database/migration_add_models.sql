-- Migration: Add common models for PC components
-- Run this AFTER migration_add_brands_models.sql
-- This inserts models linked to the brands we created

-- GPU Models (NVIDIA)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'GPU'
FROM brands,
(VALUES
  ('RTX 4090'),
  ('RTX 4080'),
  ('RTX 4070 Ti'),
  ('RTX 4070'),
  ('RTX 4060 Ti'),
  ('RTX 4060'),
  ('RTX 3090'),
  ('RTX 3080'),
  ('RTX 3070'),
  ('RTX 3060 Ti'),
  ('RTX 3060'),
  ('RTX 2080 Ti'),
  ('RTX 2080'),
  ('RTX 2070'),
  ('RTX 2060')
) AS models(model_name)
WHERE brands.name = 'NVIDIA' AND brands.category = 'GPU'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- GPU Models (AMD)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'GPU'
FROM brands,
(VALUES
  ('RX 7900 XTX'),
  ('RX 7900 XT'),
  ('RX 7800 XT'),
  ('RX 7700 XT'),
  ('RX 7600'),
  ('RX 6950 XT'),
  ('RX 6900 XT'),
  ('RX 6800 XT'),
  ('RX 6800'),
  ('RX 6700 XT'),
  ('RX 6600 XT'),
  ('RX 6600'),
  ('RX 6500 XT')
) AS models(model_name)
WHERE brands.name = 'AMD' AND brands.category = 'GPU'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- CPU Models (Intel)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'CPU'
FROM brands,
(VALUES
  ('Core i9-14900K'),
  ('Core i9-13900K'),
  ('Core i9-12900K'),
  ('Core i7-14700K'),
  ('Core i7-13700K'),
  ('Core i7-12700K'),
  ('Core i5-14600K'),
  ('Core i5-13600K'),
  ('Core i5-12600K'),
  ('Core i5-12400'),
  ('Core i3-13100'),
  ('Core i3-12100')
) AS models(model_name)
WHERE brands.name = 'Intel' AND brands.category = 'CPU'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- CPU Models (AMD)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'CPU'
FROM brands,
(VALUES
  ('Ryzen 9 7950X'),
  ('Ryzen 9 7900X'),
  ('Ryzen 9 5950X'),
  ('Ryzen 9 5900X'),
  ('Ryzen 7 7800X3D'),
  ('Ryzen 7 7700X'),
  ('Ryzen 7 5800X'),
  ('Ryzen 7 5700X'),
  ('Ryzen 5 7600X'),
  ('Ryzen 5 5600X'),
  ('Ryzen 5 5600'),
  ('Ryzen 5 5500'),
  ('Ryzen 3 5300G')
) AS models(model_name)
WHERE brands.name = 'AMD' AND brands.category = 'CPU'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- RAM Models (G.Skill)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'RAM'
FROM brands,
(VALUES
  ('Trident Z5 RGB DDR5-6000'),
  ('Trident Z5 DDR5-6000'),
  ('Ripjaws S5 DDR5-5600'),
  ('Ripjaws V DDR4-3600'),
  ('Trident Z RGB DDR4-3600'),
  ('Aegis DDR4-3200'),
  ('Ripjaws V DDR4-3200')
) AS models(model_name)
WHERE brands.name = 'G.Skill' AND brands.category = 'RAM'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- RAM Models (Kingston)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'RAM'
FROM brands,
(VALUES
  ('Fury Beast DDR5-5600'),
  ('Fury Beast DDR4-3600'),
  ('Fury Renegade DDR4-3600'),
  ('HyperX Fury DDR4-3200'),
  ('ValueRAM DDR4-3200')
) AS models(model_name)
WHERE brands.name = 'Kingston' AND brands.category = 'RAM'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Storage Models (Samsung)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Storage'
FROM brands,
(VALUES
  ('980 PRO 2TB'),
  ('980 PRO 1TB'),
  ('980 PRO 500GB'),
  ('970 EVO Plus 2TB'),
  ('970 EVO Plus 1TB'),
  ('970 EVO Plus 500GB'),
  ('970 EVO 1TB'),
  ('870 EVO 2TB'),
  ('870 EVO 1TB'),
  ('860 EVO 1TB')
) AS models(model_name)
WHERE brands.name = 'Samsung' AND brands.category = 'Storage'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Storage Models (Western Digital)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Storage'
FROM brands,
(VALUES
  ('Black SN850X 2TB'),
  ('Black SN850X 1TB'),
  ('Black SN850 1TB'),
  ('Black SN770 1TB'),
  ('Blue SN580 1TB'),
  ('Blue SN570 1TB'),
  ('Black 4TB HDD'),
  ('Blue 2TB HDD'),
  ('Blue 1TB HDD')
) AS models(model_name)
WHERE brands.name = 'Western Digital' AND brands.category = 'Storage'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Motherboard Models (ASUS)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Motherboard'
FROM brands,
(VALUES
  ('ROG Strix X670E-E'),
  ('ROG Strix B650E-F'),
  ('ROG Strix Z790-E'),
  ('ROG Strix Z690-E'),
  ('TUF Gaming X670E-Plus'),
  ('TUF Gaming B650-Plus'),
  ('Prime X670E-Pro'),
  ('Prime B650-Plus')
) AS models(model_name)
WHERE brands.name = 'ASUS' AND brands.category = 'Motherboard'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Motherboard Models (MSI)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Motherboard'
FROM brands,
(VALUES
  ('MEG X670E Ace'),
  ('MPG X670E Carbon'),
  ('MAG B650 Tomahawk'),
  ('MEG Z790 Ace'),
  ('MPG Z790 Carbon'),
  ('MAG Z790 Tomahawk'),
  ('Pro Z790-A'),
  ('Pro B650M-A')
) AS models(model_name)
WHERE brands.name = 'MSI' AND brands.category = 'Motherboard'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Motherboard Models (Gigabyte)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Motherboard'
FROM brands,
(VALUES
  ('X670E Aorus Master'),
  ('X670E Aorus Elite'),
  ('B650 Aorus Elite'),
  ('Z790 Aorus Master'),
  ('Z790 Aorus Elite'),
  ('B650M Aorus Elite'),
  ('B550 Aorus Pro'),
  ('B450 Aorus Elite')
) AS models(model_name)
WHERE brands.name = 'Gigabyte' AND brands.category = 'Motherboard'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- PSU Models (Seasonic)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'PSU'
FROM brands,
(VALUES
  ('Prime TX-1000'),
  ('Prime GX-850'),
  ('Prime GX-750'),
  ('Focus GX-850'),
  ('Focus GX-750'),
  ('Focus GX-650'),
  ('Focus GM-750'),
  ('S12III 650W')
) AS models(model_name)
WHERE brands.name = 'Seasonic' AND brands.category = 'PSU'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Cooling Models (Cooler Master)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Cooling'
FROM brands,
(VALUES
  ('MasterLiquid ML360R'),
  ('MasterLiquid ML240R'),
  ('Hyper 212 RGB'),
  ('Hyper 212 Black'),
  ('MasterLiquid ML120L'),
  ('MasterAir MA620P'),
  ('MasterBox TD500')
) AS models(model_name)
WHERE brands.name = 'Cooler Master' AND brands.category = 'Cooling'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Case Models (NZXT)
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Case'
FROM brands,
(VALUES
  ('H9 Flow'),
  ('H7 Flow'),
  ('H5 Flow'),
  ('H510 Elite'),
  ('H510 Flow'),
  ('H210i'),
  ('H210')
) AS models(model_name)
WHERE brands.name = 'NZXT' AND brands.category = 'Case'
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Additional Corsair Models (various categories)
-- RAM
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'RAM'
FROM brands,
(VALUES
  ('Vengeance RGB DDR5-6000'),
  ('Vengeance DDR5-5600'),
  ('Vengeance RGB Pro DDR4-3600'),
  ('Vengeance LPX DDR4-3600'),
  ('Vengeance LPX DDR4-3200')
) AS models(model_name)
WHERE brands.name = 'Corsair' AND brands.category IS NULL
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- PSU
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'PSU'
FROM brands,
(VALUES
  ('RM1000x'),
  ('RM850x'),
  ('RM750x'),
  ('RM650x'),
  ('CX750M'),
  ('CX650M')
) AS models(model_name)
WHERE brands.name = 'Corsair' AND brands.category IS NULL
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Cooling
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Cooling'
FROM brands,
(VALUES
  ('iCUE H150i Elite'),
  ('iCUE H100i Elite'),
  ('H115i RGB Pro'),
  ('H100i RGB Pro')
) AS models(model_name)
WHERE brands.name = 'Corsair' AND brands.category IS NULL
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- Case
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'Case'
FROM brands,
(VALUES
  ('4000D Airflow'),
  ('5000D Airflow'),
  ('7000D Airflow'),
  ('iCUE 4000X RGB'),
  ('iCUE 5000X RGB')
) AS models(model_name)
WHERE brands.name = 'Corsair' AND brands.category IS NULL
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- EVGA Models
-- GPU
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'GPU'
FROM brands,
(VALUES
  ('FTW3 RTX 4090'),
  ('FTW3 RTX 4080'),
  ('FTW3 RTX 3090'),
  ('FTW3 RTX 3080'),
  ('XC3 RTX 3070'),
  ('XC3 RTX 3060')
) AS models(model_name)
WHERE brands.name = 'EVGA' AND brands.category IS NULL
ON CONFLICT (brand_id, name, category) DO NOTHING;

-- PSU
INSERT INTO models (brand_id, name, category)
SELECT id, model_name, 'PSU'
FROM brands,
(VALUES
  ('SuperNOVA 1000 G6'),
  ('SuperNOVA 850 G6'),
  ('SuperNOVA 750 G6'),
  ('SuperNOVA 650 G6')
) AS models(model_name)
WHERE brands.name = 'EVGA' AND brands.category IS NULL
ON CONFLICT (brand_id, name, category) DO NOTHING;

