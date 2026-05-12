# Setup Guide: The Magic Store

Follow these steps to get your production-ready Nigerian-Korean e-commerce store running.

## 1. Supabase Setup
- Create a project on [Supabase](https://supabase.com).
- Go to the **SQL Editor** and run the following to create your products table:

```sql
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  stock integer default 0,
  images text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text,
  product_count integer default 0
);
```

- Copy your **Project URL** and **Anon Key** to your environment variables.

## 2. ImageKit Setup
- Create a free account on [ImageKit.io](https://imagekit.io).
- Go to **Developer Options** and copy your:
  - `Public Key`
  - `Private Key`
  - `URL Endpoint`
- Set these in your environment variables.

## 3. Environment Variables
Ensure the following are set in your platform secrets or local `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_IMAGEKIT_PUBLIC_KEY`
- `VITE_IMAGEKIT_URL_ENDPOINT`
- `IMAGEKIT_PRIVATE_KEY`

## 4. WhatsApp Configuration
Update the WhatsApp phone number in:
- `src/components/WhatsAppButton.tsx`
- `src/lib/utils.ts` (the number used for cart messages)

Currently placeholder: `2347000000000`

## 5. Development
Run `npm run dev` to start the Magic Store.
- Access the Admin Dashboard at `/admin` to start adding your real products.
