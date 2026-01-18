-- Make the bucket public and fix storage policies
UPDATE storage.buckets 
SET public = true 
WHERE id = 'issue-photos';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own uploads" ON storage.objects;

-- Create policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'issue-photos');

-- Create policy to allow public viewing of images
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'issue-photos');

-- Create policy to allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'issue-photos');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'issue-photos');
