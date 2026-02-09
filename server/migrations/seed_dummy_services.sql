-- Compatible Seed Script for Urban Elite
-- Cleaning
INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color) 
SELECT id, 'Full House Cleaning', 'Deep Home Cleaning Service (1-2 BHK)', '4-5 hrs', '₹2,499', '4.9', 'https://img.freepik.com/free-photo/person-cleaning-house_23-2148181395.jpg', '#FFF5F5'
FROM service_categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Kitchen Cleaning', 'Deep Cleaning of Kitchen Cabinets & Floors', '2-3 hrs', '₹999', '4.8', 'https://img.freepik.com/free-photo/woman-cleaning-kitchen_23-2148181400.jpg', '#F0FFF4'
FROM service_categories WHERE slug = 'cleaning' LIMIT 1;

INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Bathroom Cleaning', 'Disinfection & Deep Scrubbing of Bathrooms', '1 hr', '₹499', '4.7', 'https://img.freepik.com/free-photo/cleaning-bathroom_23-2148181405.jpg', '#EBF8FF'
FROM service_categories WHERE slug = 'cleaning' LIMIT 1;

-- AC Repair
INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'AC Service', 'Filter cleaning & Basic Servicing', '45 min', '₹599', '4.9', 'https://img.freepik.com/free-photo/repairman-fixing-air-conditioner_23-2148171780.jpg', '#EBF8FF'
FROM service_categories WHERE slug = 'ac-repair' LIMIT 1;

INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Installation', 'Safe Installation of Split or Window AC', '3 hrs', '₹1,500', '4.8', 'https://img.freepik.com/free-photo/ac-installation_23-2148171790.jpg', '#F0FFF4'
FROM service_categories WHERE slug = 'ac-repair' LIMIT 1;

-- Electrician
INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Fan Repair', 'Ceiling Fan Repair & Capacitor Change', '30 min', '₹199', '4.8', 'https://img.freepik.com/free-photo/fan-repair_23-2148274940.jpg', '#FFF9E6'
FROM service_categories WHERE slug = 'electrician' LIMIT 1;

INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'LED Panel Fixing', 'Concealed LED Light Installation', '45 min', '₹149', '4.9', 'https://img.freepik.com/free-photo/led-lights_23-2148274950.jpg', '#F0F5FF'
FROM service_categories WHERE slug = 'electrician' LIMIT 1;

-- Plumbing
INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Tap Leakage', 'Fixing or Replacing Leaky Faucets', '30 min', '₹149', '4.8', 'https://img.freepik.com/free-photo/plumbing-tap_23-2148204220.jpg', '#EBF8FF'
FROM service_categories WHERE slug = 'plumbing' LIMIT 1;

INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Flush Repair', 'Toilet Tank Flush Mechanism Fix', '1 hr', '₹399', '4.6', 'https://img.freepik.com/free-photo/toilet-repair_23-2148204225.jpg', '#FFF5F5'
FROM service_categories WHERE slug = 'plumbing' LIMIT 1;

-- Salon (Men)
INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Haircut', 'Adult Haircut & Styling', '30 min', '₹199', '4.9', 'https://img.freepik.com/free-photo/haircut-men_23-2148835450.jpg', '#F5F5F5'
FROM service_categories WHERE slug = 'mens-salon' LIMIT 1;

INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Shave & Trim', 'Classic Shave or Beard Trim', '20 min', '₹99', '4.8', 'https://img.freepik.com/free-photo/beard-trim_23-2148835455.jpg', '#F0F4FF'
FROM service_categories WHERE slug = 'mens-salon' LIMIT 1;

-- Salon (Women)
INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Facial', 'Herbal or Fruit Facial', '1 hr', '₹799', '4.8', 'https://img.freepik.com/free-photo/facial-women_23-2148181285.jpg', '#FFF5F7'
FROM service_categories WHERE slug = 'womens-salon' LIMIT 1;

INSERT INTO service_items (category_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Manicure', 'Classic Hand Care & Polish', '45 min', '₹499', '4.7', 'https://img.freepik.com/free-photo/manicure_23-2148181290.jpg', '#F5F0FF'
FROM service_categories WHERE slug = 'womens-salon' LIMIT 1;
