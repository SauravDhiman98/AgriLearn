-- V4__seed_student_data.sql
-- AgriLearn Student Data Seed
-- Covers: Instructors, Students, Courses (8 categories, 4 languages),
--         Chapters, Lessons, Quizzes, Forum Posts, Enrollments

-- ═══════════════════════════════════════════════════════════════
-- PASSWORD NOTE: All seeded users have password = "AgriLearn@123"
-- BCrypt hash (cost=10): $2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi
-- ═══════════════════════════════════════════════════════════════

-- ─── INSTRUCTORS (5 domain experts) ────────────────────────────
INSERT INTO users (first_name, last_name, email, password, role, enabled, phone, state, bio, preferred_language, created_at, updated_at)
VALUES
  ('Dr. Ramesh',    'Sharma',    'ramesh.sharma@agrilearn.com',  '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'INSTRUCTOR', true, '9811234567', 'Uttar Pradesh',
   'PhD in Agronomy from IARI Delhi. 15 years experience in crop science and precision farming.', 'HINDI', NOW(), NOW()),

  ('Dr. Priya',     'Patel',     'priya.patel@agrilearn.com',    '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'INSTRUCTOR', true, '9822345678', 'Gujarat',
   'Soil scientist with expertise in organic farming and biofertilizers. MSc Agriculture, AAU Anand.', 'ENGLISH', NOW(), NOW()),

  ('Prof. Gurpreet', 'Singh',    'gurpreet.singh@agrilearn.com', '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'INSTRUCTOR', true, '9815567890', 'Punjab',
   'Agricultural engineer specialising in modern irrigation and greenhouse technology. PAU Ludhiana alumni.', 'PUNJABI', NOW(), NOW()),

  ('Dr. Sunita',    'Deshmukh',  'sunita.deshmukh@agrilearn.com','$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'INSTRUCTOR', true, '9823456789', 'Maharashtra',
   'Horticulture expert with 12 years in vegetable and fruit crop management. MPKV Rahuri gold medalist.', 'MARATHI', NOW(), NOW()),

  ('Anil',          'Kumar',     'anil.kumar@agrilearn.com',     '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'INSTRUCTOR', true, '9834567890', 'Rajasthan',
   'Agri-business consultant and farmer entrepreneur. Runs 50-acre organic farm in Jaipur district.', 'HINDI', NOW(), NOW());

-- ─── STUDENTS (12 sample learners across states & languages) ───
INSERT INTO users (first_name, last_name, email, password, role, enabled, phone, state, bio, preferred_language, created_at, updated_at)
VALUES
  ('Rahul',     'Verma',    'rahul.verma@example.com',    '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9801111111', 'Uttar Pradesh',  'Small-scale wheat & sugarcane farmer looking to improve yield.',        'HINDI', NOW() - INTERVAL '30 days', NOW()),
  ('Sneha',     'Patil',    'sneha.patil@example.com',    '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9802222222', 'Maharashtra',    'Agriculture student at Pune University. Interested in horticulture.',   'MARATHI', NOW() - INTERVAL '25 days', NOW()),
  ('Harpreet',  'Kaur',     'harpreet.kaur@example.com',  '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9803333333', 'Punjab',         'Paddy and wheat farmer, wants to transition to organic farming.',        'PUNJABI', NOW() - INTERVAL '20 days', NOW()),
  ('Manish',    'Gupta',    'manish.gupta@example.com',   '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9804444444', 'Madhya Pradesh', 'First-generation farmer learning modern techniques.',                   'HINDI', NOW() - INTERVAL '18 days', NOW()),
  ('Lakshmi',   'Reddy',    'lakshmi.reddy@example.com',  '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9805555555', 'Telangana',      'Cotton and chilli farmer. Keen on pest management.',                    'ENGLISH', NOW() - INTERVAL '15 days', NOW()),
  ('Arjun',     'Nair',     'arjun.nair@example.com',     '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9806666666', 'Kerala',         'Spice and coconut farmer looking to improve farm profitability.',        'ENGLISH', NOW() - INTERVAL '12 days', NOW()),
  ('Kavita',    'Sharma',   'kavita.sharma@example.com',  '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9807777777', 'Rajasthan',      'Women farmer running a 10-acre mixed farm with her family.',            'HINDI', NOW() - INTERVAL '10 days', NOW()),
  ('Ravi',      'Shankar',  'ravi.shankar@example.com',   '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9808888888', 'Bihar',          'Paddy farmer interested in soil health and organic inputs.',            'HINDI', NOW() - INTERVAL '8 days',  NOW()),
  ('Meena',     'Devi',     'meena.devi@example.com',     '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9809999999', 'Haryana',        'Vegetable grower supplying to local mandis.',                           'HINDI', NOW() - INTERVAL '6 days',  NOW()),
  ('Suresh',    'Bhat',     'suresh.bhat@example.com',    '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9810101010', 'Karnataka',      'Coffee and spice farmer exploring agri-tech solutions.',                'ENGLISH', NOW() - INTERVAL '4 days',  NOW()),
  ('Pooja',     'Jadhav',   'pooja.jadhav@example.com',   '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9811112233', 'Maharashtra',    'Agri-student preparing for state agriculture officer exam.',            'MARATHI', NOW() - INTERVAL '3 days',  NOW()),
  ('Gurdeep',   'Sandhu',   'gurdeep.sandhu@example.com', '$2b$10$K8HvWnfyT.D3Z1xQm8vxhuJ.O.RcVX0FvlMZzUYIbf3U4sSYPSoXi', 'STUDENT', true, '9812223344', 'Punjab',         'Progressive farmer with 30 acres. Exploring drip irrigation.',          'PUNJABI', NOW() - INTERVAL '1 day',  NOW());

-- ═══════════════════════════════════════════════════════════════
-- COURSES  (16 courses × 8 categories × 4 languages, mix free/paid)
-- instructor IDs are SELECT'd by email for portability
-- ═══════════════════════════════════════════════════════════════

-- ─── CATEGORY 1: CROP_SCIENCE ──────────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'Kharif Fasal Vigyan: Chawal aur Makai',
  'Kharif mausam ki pramukh faslon - chawal, makai aur arhar ki sampurna kheti. Beej chunav se lekar katai tak ki puri jaankari is course mein hai.',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
  'CROP_SCIENCE', 'BEGINNER', 'HINDI', 'PUBLISHED', true, NULL, 180,
  (SELECT id FROM users WHERE email='ramesh.sharma@agrilearn.com'), 4.6, 245, NOW() - INTERVAL '60 days', NOW()
),
(
  'Rabi Crop Management: Wheat & Mustard',
  'Comprehensive guide to Rabi season crops — wheat, mustard and gram. Covers soil preparation, seed treatment, irrigation scheduling and harvesting for North Indian conditions.',
  'https://images.unsplash.com/photo-1625246333195-78d73c2333ea?w=800',
  'CROP_SCIENCE', 'INTERMEDIATE', 'ENGLISH', 'PUBLISHED', false, 999.00, 240,
  (SELECT id FROM users WHERE email='ramesh.sharma@agrilearn.com'), 4.8, 312, NOW() - INTERVAL '55 days', NOW()
);

-- ─── CATEGORY 2: SOIL_HEALTH ───────────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'Maati Ki Sehat: Jaivik Khad aur Soil Testing',
  'Mitti ki jaanch karna, uski kami samajhna aur deshi tarike se uski sehat sudhaarna seekhen. Vermicompost, green manure aur jeevamrut banane ki vidhi.',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
  'SOIL_HEALTH', 'BEGINNER', 'HINDI', 'PUBLISHED', true, NULL, 150,
  (SELECT id FROM users WHERE email='priya.patel@agrilearn.com'), 4.7, 198, NOW() - INTERVAL '50 days', NOW()
),
(
  'Soil Health & Biofertilizers',
  'Learn soil testing, nutrient management and how to prepare bio-fertilizers like Rhizobium, PSB and Azospirillum. Reduce chemical dependency and improve long-term fertility.',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
  'SOIL_HEALTH', 'INTERMEDIATE', 'ENGLISH', 'PUBLISHED', false, 799.00, 200,
  (SELECT id FROM users WHERE email='priya.patel@agrilearn.com'), 4.5, 167, NOW() - INTERVAL '45 days', NOW()
);

-- ─── CATEGORY 3: PEST_MANAGEMENT ──────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'IPM: Sansthit Keet Prabandhan (Hindi)',
  'Rasayanik keetnashkon par nirbharta kum karo. IPM ke sidhanton ko samjho — jaivik niyantran, feromone trap, sticky trap aur sahayak kitaon ka upyog.',
  'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800',
  'PEST_MANAGEMENT', 'BEGINNER', 'HINDI', 'PUBLISHED', false, 699.00, 180,
  (SELECT id FROM users WHERE email='ramesh.sharma@agrilearn.com'), 4.4, 143, NOW() - INTERVAL '40 days', NOW()
),
(
  'Integrated Pest & Disease Management',
  'Identify 50+ common pests and diseases in Indian crops. Learn biological control, chemical safety, spray schedules and resistance management.',
  'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800',
  'PEST_MANAGEMENT', 'INTERMEDIATE', 'ENGLISH', 'PUBLISHED', false, 1199.00, 260,
  (SELECT id FROM users WHERE email='priya.patel@agrilearn.com'), 4.9, 289, NOW() - INTERVAL '38 days', NOW()
);

-- ─── CATEGORY 4: MODERN_FARMING ───────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'Adhunik Kheti: Drip Sinchai aur Polyhouse',
  'Drip irrigation, sprinkler system aur polyhouse farming ki sampurna jaankari. Pani ki bachat aur adhik paidavar ke liye aadhunik takneekon ka upyog.',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
  'FARM_TECHNOLOGY', 'INTERMEDIATE', 'HINDI', 'PUBLISHED', false, 1499.00, 300,
  (SELECT id FROM users WHERE email='gurpreet.singh@agrilearn.com'), 4.7, 211, NOW() - INTERVAL '35 days', NOW()
),
(
  'ਆਧੁਨਿਕ ਖੇਤੀ: ਡ੍ਰਿੱਪ ਸਿੰਚਾਈ ਅਤੇ ਗ੍ਰੀਨਹਾਊਸ',
  'ਡ੍ਰਿੱਪ ਸਿੰਚਾਈ ਪ੍ਰਣਾਲੀ, ਸਪ੍ਰਿੰਕਲਰ ਅਤੇ ਪੌਲੀਹਾਊਸ ਤਕਨੀਕਾਂ ਬਾਰੇ ਸੰਪੂਰਨ ਜਾਣਕਾਰੀ। ਪਾਣੀ ਦੀ ਬੱਚਤ ਅਤੇ ਵੱਧ ਝਾੜ ਲਈ ਆਧੁਨਿਕ ਤਕਨੀਕਾਂ।',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
  'FARM_TECHNOLOGY', 'INTERMEDIATE', 'PUNJABI', 'PUBLISHED', true, NULL, 280,
  (SELECT id FROM users WHERE email='gurpreet.singh@agrilearn.com'), 4.6, 178, NOW() - INTERVAL '32 days', NOW()
);

-- ─── CATEGORY 5: FARM_BUSINESS ────────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'Khet se Bazaar: Agri Business Basics',
  'Apni fasal ka sahi daam pana seekhen. Mandi system, FPO, agri startups aur government subsidy schemes ki jaankari. PM-KISAN, Kisan Credit Card aur crop insurance.',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
  'AGRIBUSINESS', 'BEGINNER', 'HINDI', 'PUBLISHED', true, NULL, 200,
  (SELECT id FROM users WHERE email='anil.kumar@agrilearn.com'), 4.5, 322, NOW() - INTERVAL '28 days', NOW()
),
(
  'Farm Business & Financial Planning',
  'Build a profitable farming enterprise. Covers crop costing, government schemes (PM-KISAN, PMFBY), FPO formation, bank loans and agri-export opportunities.',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
  'AGRIBUSINESS', 'ADVANCED', 'ENGLISH', 'PUBLISHED', false, 1299.00, 240,
  (SELECT id FROM users WHERE email='anil.kumar@agrilearn.com'), 4.8, 156, NOW() - INTERVAL '25 days', NOW()
);

-- ─── CATEGORY 6: ORGANIC_FARMING ─────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'Jaivik Kheti: Shuruat se Prashikshapath Tak',
  'Rasayanik se jaivik kheti ki taraf kadam: jaivik pramanikaran, jeevamrut, panchagavya, beeja amrut aur natural farming ke tarike step-by-step.',
  'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800',
  'ORGANIC_FARMING', 'BEGINNER', 'HINDI', 'PUBLISHED', false, 899.00, 220,
  (SELECT id FROM users WHERE email='priya.patel@agrilearn.com'), 4.7, 267, NOW() - INTERVAL '22 days', NOW()
),
(
  'सेंद्रिय शेती: संपूर्ण मार्गदर्शन',
  'रासायनिक ते सेंद्रिय शेतीकडे संक्रमण. जीवामृत, पंचगव्य, बीजामृत तयार करणे आणि सेंद्रिय प्रमाणीकरण कसे मिळवायचे याची संपूर्ण माहिती.',
  'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800',
  'ORGANIC_FARMING', 'BEGINNER', 'MARATHI', 'PUBLISHED', true, NULL, 200,
  (SELECT id FROM users WHERE email='sunita.deshmukh@agrilearn.com'), 4.6, 134, NOW() - INTERVAL '20 days', NOW()
);

-- ─── CATEGORY 7: HORTICULTURE ─────────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'Sabzi Baag: Tamatar, Pyaz aur Aalu Ki Kheti',
  'Ghar ke baagiche se lekar vyavsayik sabzi utpadan tak. Tamatar, pyaz, aalu, mirchi ki kheti ki sampurna vidhi — Nursery, transplanting, irrigation, marketing.',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
  'HORTICULTURE', 'BEGINNER', 'HINDI', 'PUBLISHED', true, NULL, 160,
  (SELECT id FROM users WHERE email='sunita.deshmukh@agrilearn.com'), 4.5, 289, NOW() - INTERVAL '18 days', NOW()
),
(
  'फळबाग व भाजीपाला लागवड',
  'आंबा, डाळिंब, केळी आणि भाजीपाल्याची शास्त्रोक्त लागवड पद्धती. रोपवाटिका व्यवस्थापन, ठिबक सिंचन आणि काढणीपश्चात तंत्रज्ञान.',
  'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800',
  'HORTICULTURE', 'INTERMEDIATE', 'MARATHI', 'PUBLISHED', false, 1099.00, 250,
  (SELECT id FROM users WHERE email='sunita.deshmukh@agrilearn.com'), 4.8, 198, NOW() - INTERVAL '15 days', NOW()
);

-- ─── CATEGORY 8: AGRI_TECH (bonus) ────────────────────────────
INSERT INTO courses (title, description, thumbnail_url, category, level, language, status, free, price, duration_minutes, instructor_id, rating, total_ratings, created_at, updated_at)
VALUES
(
  'Drone aur Satellite Imaging in Farming',
  'Drone se fasal ki sarvekshan, satellite data se mitti aur fasal swasthya ki jaanch. Precision agriculture tools jo chhote kisan bhi use kar saken.',
  'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
  'FARM_TECHNOLOGY', 'ADVANCED', 'HINDI', 'PUBLISHED', false, 1999.00, 280,
  (SELECT id FROM users WHERE email='gurpreet.singh@agrilearn.com'), 4.9, 89, NOW() - INTERVAL '10 days', NOW()
),
(
  'Agri-Tech for Indian Farmers',
  'Mobile apps, IoT sensors, weather APIs and government digital services (eNAM, APMC). A practical tech toolkit for modern Indian farmers with low data budgets.',
  'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
  'FARM_TECHNOLOGY', 'BEGINNER', 'ENGLISH', 'PUBLISHED', true, NULL, 180,
  (SELECT id FROM users WHERE email='anil.kumar@agrilearn.com'), 4.7, 203, NOW() - INTERVAL '7 days', NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CHAPTERS & LESSONS for first 4 courses (most popular)
-- ═══════════════════════════════════════════════════════════════

-- ── Course 1: Kharif Fasal Vigyan (Hindi, Free) ───────────────
INSERT INTO chapters (title, description, order_index, course_id)
SELECT c.title_ch, c.desc_ch, c.ord, co.id
FROM (VALUES
  ('Parichay: Kharif Mausam aur Faslen',      'Kharif mausam kya hai, kaunsi faslen ugayi jaati hain aur unka mahatva.', 1),
  ('Chawal Ki Kheti',                           'Dhan ki puri kheti — nursery se lekar katai tak.',                       2),
  ('Makai Utpadan',                             'Makai ki kism, buwai aur dekhbhal.',                                    3),
  ('Katai aur Bhandaran',                       'Sahi katai ka samay aur anaj ka bhandaran.',                            4)
) AS c(title_ch, desc_ch, ord)
CROSS JOIN (SELECT id FROM courses WHERE title = 'Kharif Fasal Vigyan: Chawal aur Makai') co;

INSERT INTO lessons (title, content, order_index, duration_minutes, type, free_preview, chapter_id)
SELECT l.title_l, l.content_l, l.ord, l.dur, l.ltype, l.fp, ch.id
FROM (VALUES
  ('Kharif Mausam Kya Hai?',        'Bharat mein kharif mausam June se October tak chalta hai...', 1, 10, 'VIDEO',    true),
  ('Pramukh Kharif Faslen',         'Dhan, makai, arhar, bajra, soyabean ki jankari.',            2, 12, 'VIDEO',    false),
  ('Dhan Ki Kishmen Chunna',        'HYV kism, hybrid aur deshi kismon ki tulna.',                1, 15, 'VIDEO',    true),
  ('Nursery Taiyar Karna',          'Dhan ki pathshala kaise taiyar karein step-by-step.',        2, 18, 'VIDEO',    false),
  ('Transplanting aur Khad Dena',   'Ropai ki sahi vidhi aur urvarak prabandhan.',                3, 20, 'VIDEO',    false),
  ('Makai Buwai aur Seedbed',       'Makai ke liye mitti taiyar karna aur beej darna.',           1, 14, 'VIDEO',    false),
  ('Sahi Katai Ka Samay',           'Paki fasal ki pehchaan aur katai yantra.',                   1, 15, 'VIDEO',    false),
  ('Anaj Bhandaran Ke Tarike',      'Godown, HDPE bags aur nami se bachne ke upay.',              2, 12, 'DOCUMENT', false)
) AS l(title_l, content_l, ord, dur, ltype, fp)
JOIN chapters ch ON
  (l.ord = 1 AND ch.order_index = CASE WHEN l.title_l LIKE '%Mausam%' THEN 1
                                        WHEN l.title_l LIKE '%Faslen%' THEN 1
                                        WHEN l.title_l LIKE '%Kishmen%' THEN 2
                                        WHEN l.title_l LIKE '%Nursery%' THEN 2
                                        WHEN l.title_l LIKE '%Trans%'   THEN 2
                                        WHEN l.title_l LIKE '%Makai B%' THEN 3
                                        WHEN l.title_l LIKE '%Katai%'   THEN 4
                                        WHEN l.title_l LIKE '%Bhandar%' THEN 4 ELSE 1 END)
WHERE ch.course_id = (SELECT id FROM courses WHERE title = 'Kharif Fasal Vigyan: Chawal aur Makai');

-- Simpler lesson inserts for remaining courses using direct chapter IDs approach
-- ── Course 2: Rabi Crop Management (English, Paid) ─────────────
INSERT INTO chapters (title, description, order_index, course_id)
SELECT c.t, c.d, c.o, co.id
FROM (VALUES
  ('Introduction to Rabi Crops',       'Overview of wheat, mustard and gram cultivation in India.',                1),
  ('Wheat Cultivation',                'Land preparation, seed treatment, sowing methods and irrigation.',         2),
  ('Mustard & Gram Production',        'Canola-type mustard and gram: variety selection and crop calendar.',       3),
  ('Harvesting, Threshing & Storage',  'Combine harvester use, post-harvest losses and grain storage.',            4)
) AS c(t, d, o)
CROSS JOIN (SELECT id FROM courses WHERE title = 'Rabi Crop Management: Wheat & Mustard') co;

-- ── Course 3: Maati Ki Sehat (Hindi, Free) ────────────────────
INSERT INTO chapters (title, description, order_index, course_id)
SELECT c.t, c.d, c.o, co.id
FROM (VALUES
  ('Mitti Ki Pehchaan',              'Mitti ke prakar aur unki visheshatayen.',         1),
  ('Soil Testing aur Parinaam',      'Soil health card kaise padhen aur use karein.',   2),
  ('Jaivik Khad Banana',             'Vermicompost, jeevamrut aur green manure.',       3),
  ('Mitti Sudhar ke Upay',           'Lime application, gypsum aur organic matter.',    4)
) AS c(t, d, o)
CROSS JOIN (SELECT id FROM courses WHERE title = 'Maati Ki Sehat: Jaivik Khad aur Soil Testing') co;

-- ── Course 5: Farm Business (Hindi, Free) ─────────────────────
INSERT INTO chapters (title, description, order_index, course_id)
SELECT c.t, c.d, c.o, co.id
FROM (VALUES
  ('Apni Fasal Ka Mulyankan',        'Cost of cultivation aur break-even nikalna.',          1),
  ('Mandi System aur eNAM',          'APMC mandi, eNAM portal aur kisan card.',              2),
  ('Sarkar Ki Yojnayen',             'PM-KISAN, PMFBY, KCC aur subsidy schemes.',            3),
  ('FPO aur Cooperative Farming',    'Farmer producer organisations kaise banayein.',        4)
) AS c(t, d, o)
CROSS JOIN (SELECT id FROM courses WHERE title = 'Khet se Bazaar: Agri Business Basics') co;

-- ── Lessons for Rabi Crop Management ──────────────────────────
INSERT INTO lessons (title, content, order_index, duration_minutes, type, free_preview, chapter_id)
SELECT t, ct, o, dur, ltype, fp, chapter_id FROM (
  SELECT 'What Are Rabi Crops?' AS t, 'Rabi crops are grown in the winter season (October–March).' AS ct, 1 AS o, 10 AS dur, 'VIDEO' AS ltype, true AS fp,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=1) AS chapter_id
  UNION ALL SELECT 'Soil & Climate for Wheat', 'Wheat requires cool dry climate and loamy soil.', 2, 12, 'VIDEO', false,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=1)
  UNION ALL SELECT 'Wheat Seed Treatment', 'Carbendazim and Thiram treatment to prevent smut and bunt.', 1, 15, 'VIDEO', true,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=2)
  UNION ALL SELECT 'Irrigation Scheduling for Wheat', 'Critical irrigation stages: CRI, tillering, heading, grain-fill.', 2, 18, 'VIDEO', false,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=2)
  UNION ALL SELECT 'Mustard Production Calendar', 'Month-wise crop management for mustard (Brassica juncea).', 1, 16, 'VIDEO', false,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=3)
  UNION ALL SELECT 'Aphid & White Rust Control in Mustard', 'Spray schedules and economic threshold levels.', 2, 14, 'VIDEO', false,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=3)
  UNION ALL SELECT 'Combine Harvesting Wheat', 'Settings, loss estimation and moisture content at harvest.', 1, 18, 'VIDEO', false,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=4)
  UNION ALL SELECT 'Grain Storage Best Practices', 'Silos, moisture meters and fumigation with Aluminium Phosphide.', 2, 14, 'DOCUMENT', false,
         (SELECT id FROM chapters WHERE course_id=(SELECT id FROM courses WHERE title='Rabi Crop Management: Wheat & Mustard') AND order_index=4)
) sub;

-- ═══════════════════════════════════════════════════════════════
-- QUIZZES for first 2 courses
-- ═══════════════════════════════════════════════════════════════

-- Quiz 1: Kharif Fasal (Hindi)
INSERT INTO quizzes (title, description, passing_score, time_limit_minutes, course_id, created_at)
VALUES (
  'Kharif Fasal Gyan Pariksha',
  'Is quiz mein aap apna kharif fasal ka gyan jaanchein.',
  60, 15,
  (SELECT id FROM courses WHERE title = 'Kharif Fasal Vigyan: Chawal aur Makai'),
  NOW()
);

INSERT INTO questions (question_text, type, explanation, quiz_id)
VALUES
  ('Kharif mausam mein pramukh roop se kaun si fasal ugayi jaati hai?',  'SINGLE_CHOICE', 'Chawal (Dhan) Kharif ki mukhya fasal hai jo monsoon mein ugayi jaati hai.',       (SELECT id FROM quizzes WHERE title='Kharif Fasal Gyan Pariksha')),
  ('Dhan ki nursery ke liye kitni seedlings per hectare chahiye hoti hai?', 'SINGLE_CHOICE', 'Pramanik taur par 25-30 kg beej se taiyar nursery ek hectare ke liye kaafi hoti hai.', (SELECT id FROM quizzes WHERE title='Kharif Fasal Gyan Pariksha')),
  ('Dhan mein Nitrogen khad kab dena chahiye?', 'SINGLE_CHOICE', 'Nitrogen teen kiston mein diya jata hai: ropai par, tillering par aur panicle initiation par.', (SELECT id FROM quizzes WHERE title='Kharif Fasal Gyan Pariksha'));

INSERT INTO question_options (option_text, correct, question_id) VALUES
  ('Chawal (Dhan)', true,  (SELECT id FROM questions WHERE question_text LIKE 'Kharif mausam%')),
  ('Gehu',          false, (SELECT id FROM questions WHERE question_text LIKE 'Kharif mausam%')),
  ('Sarson',        false, (SELECT id FROM questions WHERE question_text LIKE 'Kharif mausam%')),
  ('Chana',         false, (SELECT id FROM questions WHERE question_text LIKE 'Kharif mausam%')),

  ('25-30 kg beej',  true,  (SELECT id FROM questions WHERE question_text LIKE 'Dhan ki nursery%')),
  ('5-10 kg beej',   false, (SELECT id FROM questions WHERE question_text LIKE 'Dhan ki nursery%')),
  ('50-60 kg beej',  false, (SELECT id FROM questions WHERE question_text LIKE 'Dhan ki nursery%')),
  ('100 kg beej',    false, (SELECT id FROM questions WHERE question_text LIKE 'Dhan ki nursery%')),

  ('Teen kiston mein - ropai, tillering, panicle',  true,  (SELECT id FROM questions WHERE question_text LIKE 'Dhan mein Nitrogen%')),
  ('Ek hi baar puri matra mein',                    false, (SELECT id FROM questions WHERE question_text LIKE 'Dhan mein Nitrogen%')),
  ('Sirf katai ke 2 hafte pehle',                   false, (SELECT id FROM questions WHERE question_text LIKE 'Dhan mein Nitrogen%')),
  ('Nitrogen dene ki zaroorat nahi',                false, (SELECT id FROM questions WHERE question_text LIKE 'Dhan mein Nitrogen%'));

-- Quiz 2: Rabi Crop Management (English)
INSERT INTO quizzes (title, description, passing_score, time_limit_minutes, course_id, created_at)
VALUES (
  'Rabi Crop Knowledge Test',
  'Test your understanding of wheat and mustard cultivation.',
  60, 15,
  (SELECT id FROM courses WHERE title = 'Rabi Crop Management: Wheat & Mustard'),
  NOW()
);

INSERT INTO questions (question_text, type, explanation, quiz_id)
VALUES
  ('Which disease is controlled by seed treatment with Carbendazim in wheat?', 'SINGLE_CHOICE', 'Loose Smut (Ustilago tritici) is controlled by Carbendazim seed treatment.', (SELECT id FROM quizzes WHERE title='Rabi Crop Knowledge Test')),
  ('What is the critical irrigation stage for wheat called?',                  'SINGLE_CHOICE', 'CRI (Crown Root Initiation) at 21 days after sowing is the most critical irrigation.', (SELECT id FROM quizzes WHERE title='Rabi Crop Knowledge Test')),
  ('Which pest commonly attacks mustard crop in India?',                        'SINGLE_CHOICE', 'Mustard Aphid (Lipaphis erysimi) is the most common and devastating pest of mustard.', (SELECT id FROM quizzes WHERE title='Rabi Crop Knowledge Test'));

INSERT INTO question_options (option_text, correct, question_id) VALUES
  ('Loose Smut',         true,  (SELECT id FROM questions WHERE question_text LIKE 'Which disease%')),
  ('Leaf Rust',          false, (SELECT id FROM questions WHERE question_text LIKE 'Which disease%')),
  ('Powdery Mildew',     false, (SELECT id FROM questions WHERE question_text LIKE 'Which disease%')),
  ('Stem Rot',           false, (SELECT id FROM questions WHERE question_text LIKE 'Which disease%')),

  ('CRI (Crown Root Initiation)',  true,  (SELECT id FROM questions WHERE question_text LIKE 'What is the critical%')),
  ('Flowering stage',              false, (SELECT id FROM questions WHERE question_text LIKE 'What is the critical%')),
  ('Grain filling stage',          false, (SELECT id FROM questions WHERE question_text LIKE 'What is the critical%')),
  ('Maturity stage',               false, (SELECT id FROM questions WHERE question_text LIKE 'What is the critical%')),

  ('Mustard Aphid',   true,  (SELECT id FROM questions WHERE question_text LIKE 'Which pest%')),
  ('Stem Borer',      false, (SELECT id FROM questions WHERE question_text LIKE 'Which pest%')),
  ('Whitefly',        false, (SELECT id FROM questions WHERE question_text LIKE 'Which pest%')),
  ('Thrips',          false, (SELECT id FROM questions WHERE question_text LIKE 'Which pest%'));

-- ═══════════════════════════════════════════════════════════════
-- ENROLLMENTS (students → courses, with varied progress)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO enrollments (student_id, course_id, progress_percent, completed, enrolled_at)
SELECT s.id, c.id, p.pct, p.done, NOW() - p.dago
FROM (VALUES
  ('rahul.verma@example.com',    'Kharif Fasal Vigyan: Chawal aur Makai',               80, false, INTERVAL '28 days'),
  ('rahul.verma@example.com',    'Maati Ki Sehat: Jaivik Khad aur Soil Testing',        40, false, INTERVAL '15 days'),
  ('rahul.verma@example.com',    'Khet se Bazaar: Agri Business Basics',               100, true,  INTERVAL '25 days'),
  ('sneha.patil@example.com',    'Sabzi Baag: Tamatar, Pyaz aur Aalu Ki Kheti',         60, false, INTERVAL '20 days'),
  ('sneha.patil@example.com',    'सेंद्रिय शेती: संपूर्ण मार्गदर्शन',                   90, false, INTERVAL '18 days'),
  ('sneha.patil@example.com',    'फळबाग व भाजीपाला लागवड',                             30, false, INTERVAL '10 days'),
  ('harpreet.kaur@example.com',  'ਆਧੁਨਿਕ ਖੇਤੀ: ਡ੍ਰਿੱਪ ਸਿੰਚਾਈ ਅਤੇ ਗ੍ਰੀਨਹਾਊਸ',           75, false, INTERVAL '18 days'),
  ('harpreet.kaur@example.com',  'Jaivik Kheti: Shuruat se Prashikshapath Tak',        100, true,  INTERVAL '15 days'),
  ('manish.gupta@example.com',   'Kharif Fasal Vigyan: Chawal aur Makai',              100, true,  INTERVAL '17 days'),
  ('manish.gupta@example.com',   'Rabi Crop Management: Wheat & Mustard',               55, false, INTERVAL '10 days'),
  ('lakshmi.reddy@example.com',  'Integrated Pest & Disease Management',                45, false, INTERVAL '12 days'),
  ('lakshmi.reddy@example.com',  'Farm Business & Financial Planning',                  20, false, INTERVAL '5 days'),
  ('arjun.nair@example.com',     'Agri-Tech for Indian Farmers',                        90, false, INTERVAL '6 days'),
  ('arjun.nair@example.com',     'Soil Health & Biofertilizers',                        65, false, INTERVAL '10 days'),
  ('kavita.sharma@example.com',  'Khet se Bazaar: Agri Business Basics',                80, false, INTERVAL '8 days'),
  ('kavita.sharma@example.com',  'Maati Ki Sehat: Jaivik Khad aur Soil Testing',       100, true,  INTERVAL '6 days'),
  ('ravi.shankar@example.com',   'Maati Ki Sehat: Jaivik Khad aur Soil Testing',        50, false, INTERVAL '7 days'),
  ('meena.devi@example.com',     'Sabzi Baag: Tamatar, Pyaz aur Aalu Ki Kheti',        100, true,  INTERVAL '5 days'),
  ('suresh.bhat@example.com',    'Agri-Tech for Indian Farmers',                         35, false, INTERVAL '3 days'),
  ('suresh.bhat@example.com',    'Drone aur Satellite Imaging in Farming',               10, false, INTERVAL '2 days'),
  ('pooja.jadhav@example.com',   'फळबाग व भाजीपाला लागवड',                             70, false, INTERVAL '3 days'),
  ('gurdeep.sandhu@example.com', 'ਆਧੁਨਿਕ ਖੇਤੀ: ਡ੍ਰਿੱਪ ਸਿੰਚਾਈ ਅਤੇ ਗ੍ਰੀਨਹਾਊਸ',          100, true,  INTERVAL '1 day')
) AS p(email, ctitle, pct, done, dago)
JOIN users s ON s.email = p.email
JOIN courses c ON c.title = p.ctitle
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Mark completed enrollments
UPDATE enrollments e
SET completed_at = enrolled_at + INTERVAL '7 days'
FROM courses c, users u
WHERE e.course_id = c.id
  AND e.student_id = u.id
  AND e.completed = true;

-- ═══════════════════════════════════════════════════════════════
-- FORUM POSTS (realistic agriculture questions)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO forum_posts (title, content, author_id, upvotes, view_count, pinned, solved, created_at, updated_at)
VALUES
(
  'मेरे धान में पत्तियाँ पीली हो रही हैं - क्या करूँ?',
  'मेरे खेत में ट्रांसप्लांटिंग के 15 दिन बाद धान की पत्तियाँ पीली पड़ने लगी हैं। मैंने Urea 50 kg/एकड़ डाल दी है फिर भी कोई सुधार नहीं है। मिट्टी जाँच में pH 6.8 है। क्या यह Iron deficiency हो सकती है?',
  (SELECT id FROM users WHERE email='rahul.verma@example.com'), 18, 234, false, true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'
),
(
  'Drip irrigation system cost for 1 acre — is it worth it?',
  'I am planning to install drip irrigation on my 1-acre vegetable farm in Karnataka. Local dealers are quoting ₹35,000-45,000 per acre. Government subsidy available is 55%. Has anyone used it for tomato and beans? What is the payback period in your experience?',
  (SELECT id FROM users WHERE email='suresh.bhat@example.com'), 32, 445, false, false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days'
),
(
  'ਕਣਕ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ ਦਾ ਹਮਲਾ — ਤੁਰੰਤ ਦਵਾਈ ਦੱਸੋ',
  'ਮੇਰੀ ਕਣਕ ਦੀ ਫਸਲ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ (Yellow Rust) ਦੇ ਲੱਛਣ ਦਿਖ ਰਹੇ ਹਨ। ਪੱਤਿਆਂ ਤੇ ਪੀਲੇ ਧੱਬੇ ਪਾਊਡਰ ਵਰਗੇ ਹਨ। ਕਿਹੜੀ ਦਵਾਈ ਛਿੜਕਣੀ ਚਾਹੀਦੀ ਹੈ ਅਤੇ ਕਿੰਨੀ ਮਾਤਰਾ ਵਿੱਚ?',
  (SELECT id FROM users WHERE email='harpreet.kaur@example.com'), 25, 312, false, true, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'
),
(
  'Organic certification process — how long does it take in India?',
  'I want to convert my 5-acre farm to certified organic. I know there is a 3-year conversion period. Which certifying agency is best — APEDA, IMO, or ECOCERT? What documents are needed and what is the approximate cost for a small farmer?',
  (SELECT id FROM users WHERE email='arjun.nair@example.com'), 41, 567, true, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'
),
(
  'टमाटर में विल्ट रोग से फसल बर्बाद हो गई',
  'मेरी टमाटर की फसल में अचानक पौधे मुरझाने लगे और 2-3 दिन में पूरा पौधा मर गया। जड़ों को देखने पर भूरी हो गई हैं। क्या यह Fusarium wilt है? ट्रायकोडर्मा से क्या फर्क पड़ेगा? कोई उपाय बताएं।',
  (SELECT id FROM users WHERE email='meena.devi@example.com'), 15, 198, false, false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'
),
(
  'PM-KISAN तीसरी किस्त नहीं आई - क्या करें?',
  'मुझे PM-KISAN की पहली दो किस्त मिली थी लेकिन तीसरी किस्त अभी तक नहीं आई। पोर्टल पर देखने पर Beneficiary Status में "Pending for Approval" दिख रहा है। तहसील में जाकर पूछा तो बोले eKYC नहीं हुई। आधार OTP से eKYC कैसे करें?',
  (SELECT id FROM users WHERE email='kavita.sharma@example.com'), 28, 423, false, true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'
);

-- Forum post tags
INSERT INTO forum_post_tags (post_id, tag) VALUES
  ((SELECT id FROM forum_posts WHERE title LIKE '%धान में पत्तियाँ%'), 'crop-disease'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%धान में पत्तियाँ%'), 'rice'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%धान में पत्तियाँ%'), 'iron-deficiency'),
  ((SELECT id FROM forum_posts WHERE title LIKE 'Drip irrigation%'), 'irrigation'),
  ((SELECT id FROM forum_posts WHERE title LIKE 'Drip irrigation%'), 'subsidy'),
  ((SELECT id FROM forum_posts WHERE title LIKE 'Drip irrigation%'), 'vegetable'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%ਕਣਕ ਵਿੱਚ%'), 'wheat'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%ਕਣਕ ਵਿੱਚ%'), 'disease'),
  ((SELECT id FROM forum_posts WHERE title LIKE 'Organic certification%'), 'organic'),
  ((SELECT id FROM forum_posts WHERE title LIKE 'Organic certification%'), 'certification'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%टमाटर में विल्ट%'), 'tomato'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%टमाटर में विल्ट%'), 'disease'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%PM-KISAN%'), 'government-scheme'),
  ((SELECT id FROM forum_posts WHERE title LIKE '%PM-KISAN%'), 'pm-kisan');

-- Forum answers from instructors
INSERT INTO forum_comments (content, post_id, author_id, upvotes, accepted, created_at)
VALUES
(
  'Aapki samasya Iron deficiency (Klorosis) lagti hai. Ferrous Sulphate 0.5% (5 gram per liter paani) ka foliar spray karein. 2-3 spray 10 din ke antral par karein. Saath hi kheti mein Zinc Sulphate 25 kg/hectare basaal dose mein milayein. pH 6.8 theek hai, lekin waterlogging check karein kyunki woh bhi Iron availability ko reduce karta hai.',
  (SELECT id FROM forum_posts WHERE title LIKE '%धान में पत्तियाँ%'),
  (SELECT id FROM users WHERE email='ramesh.sharma@agrilearn.com'), 22, true, NOW() - INTERVAL '19 days'
),
(
  'For 1-acre drip system in Karnataka, the cost is typically ₹35,000-40,000 before subsidy. With PMKSY (Pradhan Mantri Krishi Sinchayee Yojana) subsidy of 55% for small farmers, your net cost comes to ~₹16,000-18,000. Payback period for tomato: 1.5-2 seasons. Key benefits: 30-40% water saving, 20-25% yield increase, reduced weed pressure. Apply through your district agriculture office or Karnataka Horticulture Department portal.',
  (SELECT id FROM forum_posts WHERE title LIKE 'Drip irrigation%'),
  (SELECT id FROM users WHERE email='gurpreet.singh@agrilearn.com'), 28, false, NOW() - INTERVAL '14 days'
),
(
  'Yellow Rust (Puccinia striiformis) ਲਈ ਤੁਰੰਤ Propiconazole 25EC @ 1ml/liter ਪਾਣੀ ਦਾ ਛਿੜਕਾਅ ਕਰੋ। ਜਾਂ Tebuconazole 250 EW @ 1ml/liter ਵਰਤ ਸਕਦੇ ਹੋ। 10-15 ਦਿਨਾਂ ਬਾਅਦ ਦੂਜਾ ਛਿੜਕਾਅ ਕਰੋ। ਧਿਆਨ ਰੱਖੋ: ਸਵੇਰੇ ਜਲਦੀ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਛਿੜਕਾਅ ਕਰੋ। ਅਗਲੀ ਵਾਰ rust-resistant ਕਿਸਮਾਂ ਜਿਵੇਂ HD-2967 ਜਾਂ HD-3086 ਬੀਜੋ।',
  (SELECT id FROM forum_posts WHERE title LIKE '%ਕਣਕ ਵਿੱਚ%'),
  (SELECT id FROM users WHERE email='gurpreet.singh@agrilearn.com'), 31, true, NOW() - INTERVAL '11 days'
),
(
  'eKYC is mandatory from 2023. Steps: 1) Visit pmkisan.gov.in 2) Click "Farmers Corner" → "eKYC" 3) Enter Aadhaar number 4) OTP will come on Aadhaar-linked mobile 5) Enter OTP and verify. If mobile number not linked to Aadhaar, visit nearest Common Service Centre (CSC) for biometric eKYC — it costs ₹30-50. After eKYC approval takes 3-7 working days for status to update.',
  (SELECT id FROM forum_posts WHERE title LIKE '%PM-KISAN%'),
  (SELECT id FROM users WHERE email='anil.kumar@agrilearn.com'), 35, true, NOW() - INTERVAL '4 days'
);


