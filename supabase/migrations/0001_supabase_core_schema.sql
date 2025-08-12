-- Core users table (linked to auth.users)
create table if not exists public.users (
  id uuid primary key default auth.uid(),
  full_name text,
  phone text,
  nin text,
  kyc_verified boolean default false,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy if not exists "users can read themselves"
  on public.users for select
  using (auth.uid() = id);

create policy if not exists "users can update themselves"
  on public.users for update
  using (auth.uid() = id);

-- Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_geojson jsonb,
  total_size_sqm numeric not null,
  price_per_sqm numeric not null,
  status text not null default 'active',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.properties enable row level security;

create policy if not exists "public can read active properties"
  on public.properties for select
  using (status = 'active');

-- Adjust this admin policy per your admin flag/role approach
create policy if not exists "admins can manage properties"
  on public.properties for all
  using (exists(select 1 from public.users where id = auth.uid() and kyc_verified = true));

-- Ownership units
create table if not exists public.ownership_units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  owner_id uuid references public.users(id) on delete set null,
  size_sqm numeric not null,
  deed_url text,
  certificate_url text,
  acquired_at timestamptz default now(),
  is_active boolean default true,
  parent_unit_id uuid references public.ownership_units(id)
);

alter table public.ownership_units enable row level security;

create policy if not exists "owners read their units"
  on public.ownership_units for select
  using (owner_id = auth.uid());

-- Transactions
create type if not exists txn_status as enum ('pending','completed','failed','cancelled');
create type if not exists txn_type as enum ('buy','resale');

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users(id),
  seller_id uuid references public.users(id),
  ownership_unit_id uuid references public.ownership_units(id),
  amount numeric not null,
  currency text default 'NGN',
  payment_ref text unique,
  status txn_status not null default 'pending',
  transaction_type txn_type not null default 'buy',
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy if not exists "users read their transactions"
  on public.transactions for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  ownership_unit_id uuid references public.ownership_units(id),
  doc_type text not null,
  storage_path text not null,
  uploaded_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy if not exists "owners read their documents"
  on public.documents for select
  using (exists(select 1 from public.ownership_units u where u.id = ownership_unit_id and u.owner_id = auth.uid()));

-- Resale listings
create table if not exists public.resale_listings (
  id uuid primary key default gen_random_uuid(),
  ownership_unit_id uuid references public.ownership_units(id) on delete cascade,
  seller_id uuid references public.users(id),
  size_sqm numeric not null,
  asking_price numeric not null,
  expires_at timestamptz,
  status text not null default 'active',
  created_at timestamptz default now()
);

alter table public.resale_listings enable row level security;

create policy if not exists "owner can manage their listings"
  on public.resale_listings for all
  using (seller_id = auth.uid());

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  owner_id uuid references public.users(id),
  weight_sqm numeric not null,
  vote text not null,
  created_at timestamptz default now()
);

alter table public.votes enable row level security;

create policy if not exists "owners vote"
  on public.votes for insert
  with check (owner_id = auth.uid());

create policy if not exists "owners read their votes"
  on public.votes for select
  using (owner_id = auth.uid());

-- Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

create policy if not exists "user can read own logs"
  on public.audit_logs for select
  using (user_id = auth.uid());

-- Atomic finalize purchase function (simplified). Adjust mapping as needed.
create or replace function public.finalize_purchase(p_payment_ref text)
returns void
language plpgsql
as $$
declare
  v_tx public.transactions%rowtype;
begin
  select * into v_tx from public.transactions where payment_ref = p_payment_ref for update;
  if not found then
    raise exception 'Transaction not found';
  end if;
  if v_tx.status <> 'pending' then
    raise exception 'Transaction not pending';
  end if;

  -- Create a new ownership unit for buyer; size could be passed differently; placeholder 1 sqm
  insert into public.ownership_units (property_id, owner_id, size_sqm, is_active)
  values (
    -- Placeholder: attach to a property; replace with real property_id persistence in transactions if needed
    (select id from public.properties order by created_at desc limit 1),
    v_tx.buyer_id,
    1::numeric,
    true
  ) returning id into v_tx.ownership_unit_id;

  update public.transactions
  set status = 'completed', ownership_unit_id = v_tx.ownership_unit_id
  where id = v_tx.id;
end;
$$;
