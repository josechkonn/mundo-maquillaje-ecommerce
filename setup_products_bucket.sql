-- Create the "products" bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to the products bucket
CREATE POLICY "Allow public uploads to products"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'products');

-- Allow anyone to read from the products bucket
CREATE POLICY "Allow public reads from products"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'products');

-- Allow anyone to update their uploads
CREATE POLICY "Allow public updates to products"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Allow anyone to delete from the products bucket
CREATE POLICY "Allow public deletes from products"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'products');
