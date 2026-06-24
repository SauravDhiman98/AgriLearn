-- V9 was never applied on Railway (V10 ran first). Apply the icon fix here.
UPDATE exams SET icon = '/icons/UPSSSC.avif' WHERE slug = 'up-cane-supervisor' AND icon = '🌿';
