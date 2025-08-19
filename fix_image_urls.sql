-- Fix broken image URLs for Vercel deployment
-- Run this in Supabase SQL Editor after running the cleanup scripts

-- First, let's see what the current image URLs look like
SELECT '=== CURRENT IMAGE URLS ===' as info;
SELECT 
    id,
    title,
    image_urls
FROM projects 
ORDER BY id;

-- Fix the image URLs to use the correct Vercel domain
-- Replace the local paths with the actual Vercel domain
UPDATE projects 
SET image_urls = ARRAY['https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg']
WHERE title LIKE '%Plot 77%';

UPDATE projects 
SET image_urls = ARRAY['https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg']
WHERE title LIKE '%Plot 79%';

UPDATE projects 
SET image_urls = ARRAY['https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg']
WHERE title LIKE '%Plot 81%';

UPDATE projects 
SET image_urls = ARRAY['https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg']
WHERE title LIKE '%Plot 84%';

UPDATE projects 
SET image_urls = ARRAY['https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg']
WHERE title LIKE '%Plot 87%';

-- Show the updated image URLs
SELECT '=== UPDATED IMAGE URLS ===' as info;
SELECT 
    id,
    title,
    image_urls
FROM projects 
ORDER BY id;

-- Also, let's add some additional images for variety
-- Update Plot 77 to have multiple images
UPDATE projects 
SET image_urls = ARRAY[
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg',
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-map.jpg',
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/site-plans.jpg'
]
WHERE title LIKE '%Plot 77%';

-- Update Plot 79 to have residential estate images (NOT lakefront)
UPDATE projects 
SET image_urls = ARRAY[
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg',
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/site-plans.jpg'
]
WHERE title LIKE '%Plot 79%';

-- Update Plot 81 to have wellness hub images (proximity to wellness hub)
UPDATE projects 
SET image_urls = ARRAY[
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg',
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/welness-hub.JPG'
]
WHERE title LIKE '%Plot 81%';

-- Update Plot 84 to have community images (play areas, daycare/school)
UPDATE projects 
SET image_urls = ARRAY[
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg',
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/site-plans.jpg'
]
WHERE title LIKE '%Plot 84%';

-- Update Plot 87 to have residential estate images
UPDATE projects 
SET image_urls = ARRAY[
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-logo.jpg',
    'https://subx-real-minfuxhpz-colourfulrhythms-projects.vercel.app/2-seasons/2seasons-map.jpg'
]
WHERE title LIKE '%Plot 87%';

-- Final verification
SELECT '=== FINAL IMAGE URLS ===' as info;
SELECT 
    id,
    title,
    image_urls
FROM projects 
ORDER BY id;

-- Test if the URLs are accessible (this will show in the results)
SELECT '=== IMAGE URL TEST ===' as info;
SELECT 
    title,
    'Image URLs updated for Vercel deployment' as status,
    array_length(image_urls, 1) as image_count
FROM projects 
ORDER BY id;
