-- Remove old seeded exams that no longer apply
DELETE FROM exams WHERE slug IN ('upsc','ssc','ibps','railway','state-psc','defence','teaching','others');

-- Insert correct exams matching the platform focus
INSERT INTO exams (name, description, icon, slug) VALUES
('UPCATET', 'Uttar Pradesh Combined Agriculture and Technology Entrance Test', '/icons/UPCATET.jpg', 'upcatet'),
('UPSSSC AGTA', 'UP Subordinate Service Selection Commission - Agriculture Technical Assistant', '/icons/UPSSSC.avif', 'upsssc-agta'),
('UP Cane Supervisor', 'Uttar Pradesh Cane Supervisor Recruitment Exam', '🌿', 'up-cane-supervisor'),
('IBPS AFO', 'Institute of Banking Personnel Selection - Agriculture Field Officer', '/icons/ibps.png', 'ibps-afo'),
('RRB SO (Agri Officer)', 'Railway Recruitment Board - Senior Section Engineer / Agriculture Officer', '/icons/ibps.png', 'rrb-so-agri'),
('NABARD Grade A', 'National Bank for Agriculture and Rural Development - Grade A Officer', '/icons/NABARD.avif', 'nabard-grade-a')
ON CONFLICT (slug) DO NOTHING;
