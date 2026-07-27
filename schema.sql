-- Shin Htate Htar Author Studio / Supabase schema
-- Run this whole file in Supabase Dashboard > SQL Editor.
-- It is safe to run again: tables/columns/policies are created or refreshed.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_title text not null default 'Her Story Studio',
  author_name text not null default 'စာရေးဆရာမ',
  author_role text,
  tagline text,
  bio text,
  hero_quote text,
  hero_image text,
  about_image text,
  instagram text,
  facebook text,
  tiktok text,
  telegram text,
  email text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings add column if not exists hero_image text;
alter table public.site_settings add column if not exists about_image text;
alter table public.site_settings add column if not exists tiktok text;
alter table public.site_settings add column if not exists telegram text;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  category text,
  description text,
  cover_image text,
  status text not null default 'Available' check (status in ('Available','Pre-order','Sold Out')),
  price numeric(12,2),
  currency text not null default 'MMK',
  is_free boolean not null default false,
  free_content text,
  pdf_url text,
  buy_url text,
  published_year integer,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.books add column if not exists category text;
alter table public.books add column if not exists price numeric(12,2);
alter table public.books add column if not exists currency text not null default 'MMK';
alter table public.books add column if not exists is_free boolean not null default false;
alter table public.books add column if not exists free_content text;
alter table public.books add column if not exists pdf_url text;
alter table public.books add column if not exists updated_at timestamptz not null default now();

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  excerpt text,
  content text,
  image text,
  post_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists category text;
alter table public.posts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_text text not null,
  source text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null default '/',
  referrer text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_at_idx on public.page_views(created_at desc);
create index if not exists page_views_session_idx on public.page_views(session_id);

create table if not exists public.visitor_sessions (
  session_id text primary key,
  path text not null default '/',
  last_seen timestamptz not null default now(),
  first_seen timestamptz not null default now()
);
create index if not exists visitor_sessions_last_seen_idx on public.visitor_sessions(last_seen desc);

create table if not exists public.content_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  content_type text not null check (content_type in ('book','post')),
  content_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists content_views_created_at_idx on public.content_views(created_at desc);
create index if not exists content_views_content_idx on public.content_views(content_type, content_id);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique,
  device_id text unique,
  notification_permission text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or device_id is not null)
);

-- Public site content RLS
alter table public.site_settings enable row level security;
alter table public.books enable row level security;
alter table public.posts enable row level security;
alter table public.quotes enable row level security;
alter table public.page_views enable row level security;
alter table public.visitor_sessions enable row level security;
alter table public.content_views enable row level security;
alter table public.subscribers enable row level security;

-- Public visitors can only read publishable website content.
drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings" on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "Public read books" on public.books;
create policy "Public read books" on public.books for select to anon, authenticated using (true);

drop policy if exists "Public read published posts" on public.posts;
create policy "Public read published posts" on public.posts for select to anon, authenticated using (status = 'published');

drop policy if exists "Public read quotes" on public.quotes;
create policy "Public read quotes" on public.quotes for select to anon, authenticated using (true);

-- Signed-in admins can manage content.
drop policy if exists "Authenticated manage site settings" on public.site_settings;
create policy "Authenticated manage site settings" on public.site_settings for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage books" on public.books;
create policy "Authenticated manage books" on public.books for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated read all posts" on public.posts;
create policy "Authenticated read all posts" on public.posts for select to authenticated using (true);
drop policy if exists "Authenticated insert posts" on public.posts;
create policy "Authenticated insert posts" on public.posts for insert to authenticated with check (true);
drop policy if exists "Authenticated update posts" on public.posts;
create policy "Authenticated update posts" on public.posts for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated delete posts" on public.posts;
create policy "Authenticated delete posts" on public.posts for delete to authenticated using (true);

drop policy if exists "Authenticated manage quotes" on public.quotes;
create policy "Authenticated manage quotes" on public.quotes for all to authenticated using (true) with check (true);

-- Anonymous analytics writes; analytics reads remain admin-only.
drop policy if exists "Public insert page views" on public.page_views;
create policy "Public insert page views" on public.page_views for insert to anon, authenticated with check (char_length(session_id) between 8 and 100);
drop policy if exists "Authenticated read page views" on public.page_views;
create policy "Authenticated read page views" on public.page_views for select to authenticated using (true);

drop policy if exists "Public insert content views" on public.content_views;
create policy "Public insert content views" on public.content_views for insert to anon, authenticated with check (char_length(session_id) between 8 and 100);
drop policy if exists "Authenticated read content views" on public.content_views;
create policy "Authenticated read content views" on public.content_views for select to authenticated using (true);

drop policy if exists "Authenticated read visitor sessions" on public.visitor_sessions;
create policy "Authenticated read visitor sessions" on public.visitor_sessions for select to authenticated using (true);

drop policy if exists "Authenticated read subscribers" on public.subscribers;
create policy "Authenticated read subscribers" on public.subscribers for select to authenticated using (true);

-- Public helper: heartbeat/upsert without exposing visitor_sessions updates directly.
create or replace function public.touch_visitor_session(p_session_id text, p_path text default '/')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_session_id is null or char_length(p_session_id) < 8 or char_length(p_session_id) > 100 then
    raise exception 'invalid session id';
  end if;
  insert into public.visitor_sessions(session_id, path, last_seen)
  values (p_session_id, left(coalesce(p_path, '/'), 500), now())
  on conflict (session_id) do update set path = excluded.path, last_seen = now();
end;
$$;
revoke all on function public.touch_visitor_session(text,text) from public;
grant execute on function public.touch_visitor_session(text,text) to anon, authenticated;

-- Public helper: save email/browser notification preference without exposing subscriber rows.
create or replace function public.subscribe_reader(
  p_email text default null,
  p_device_id text default null,
  p_permission text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_email citext := nullif(trim(p_email), '')::citext;
  clean_device text := nullif(trim(p_device_id), '');
begin
  if clean_email is null and clean_device is null then
    raise exception 'email or device id required';
  end if;
  if clean_email is not null and clean_email::text !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;

  if clean_email is not null then
    insert into public.subscribers(email, device_id, notification_permission)
    values (clean_email, clean_device, left(coalesce(p_permission,''),30))
    on conflict (email) do update
      set device_id = coalesce(excluded.device_id, public.subscribers.device_id),
          notification_permission = excluded.notification_permission,
          updated_at = now();
  else
    insert into public.subscribers(device_id, notification_permission)
    values (clean_device, left(coalesce(p_permission,''),30))
    on conflict (device_id) do update
      set notification_permission = excluded.notification_permission,
          updated_at = now();
  end if;
end;
$$;
revoke all on function public.subscribe_reader(text,text,text) from public;
grant execute on function public.subscribe_reader(text,text,text) to anon, authenticated;

-- Admin-only analytics summary.
create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if auth.role() <> 'authenticated' then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'total_visits', (select count(*) from public.page_views),
    'unique_visitors', (select count(distinct session_id) from public.page_views),
    'today_visits', (select count(*) from public.page_views where created_at >= date_trunc('day', now())),
    'active_now', (select count(*) from public.visitor_sessions where last_seen >= now() - interval '5 minutes'),
    'subscriber_count', (select count(*) from public.subscribers),
    'top_posts', coalesce((
      select jsonb_agg(x) from (
        select p.id, p.title, count(v.id)::int as views
        from public.posts p
        left join public.content_views v on v.content_type='post' and v.content_id=p.id
        group by p.id, p.title order by views desc, p.title limit 5
      ) x
    ), '[]'::jsonb),
    'top_books', coalesce((
      select jsonb_agg(x) from (
        select b.id, b.title, count(v.id)::int as views
        from public.books b
        left join public.content_views v on v.content_type='book' and v.content_id=b.id
        group by b.id, b.title order by views desc, b.title limit 5
      ) x
    ), '[]'::jsonb),
    'last_7_days', coalesce((
      select jsonb_agg(x order by day) from (
        select d::date as day, count(pv.id)::int as visits
        from generate_series(current_date - 6, current_date, interval '1 day') d
        left join public.page_views pv on pv.created_at >= d and pv.created_at < d + interval '1 day'
        group by d
      ) x
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke all on function public.get_admin_analytics() from public;
grant execute on function public.get_admin_analytics() to authenticated;

-- Public Storage bucket for author images, book covers and PDFs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read site assets" on storage.objects;
create policy "Public read site assets" on storage.objects for select to public using (bucket_id = 'site-assets');

drop policy if exists "Authenticated upload site assets" on storage.objects;
create policy "Authenticated upload site assets" on storage.objects for insert to authenticated with check (bucket_id = 'site-assets');

drop policy if exists "Authenticated update site assets" on storage.objects;
create policy "Authenticated update site assets" on storage.objects for update to authenticated using (bucket_id = 'site-assets') with check (bucket_id = 'site-assets');

drop policy if exists "Authenticated delete site assets" on storage.objects;
create policy "Authenticated delete site assets" on storage.objects for delete to authenticated using (bucket_id = 'site-assets');

-- Enable Realtime for blog publish/update notifications.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
end $$;

-- Updated-at helper.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists books_updated_at on public.books;
create trigger books_updated_at before update on public.books for each row execute function public.set_updated_at();
drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();

-- Starter content. Inserts only when the corresponding table is empty.
insert into public.site_settings (
  id, site_title, author_name, author_role, tagline, bio, hero_quote,
  hero_image, about_image, instagram, facebook, tiktok, telegram, email
)
values (
  1,
  'Her Story Studio',
  'အိမ့်ချမ်းမြေ့',
  'စာရေးဆရာမ · ကဗျာဆရာမ',
  'စကားလုံးတွေက လူတစ်ယောက်ရဲ့ နေ့ရက်ကို ပြောင်းလဲပေးနိုင်တယ်။',
  'စာအုပ်၊ ကဗျာနဲ့ နေ့စဉ်ဘဝထဲက သေးသေးလေးတွေကို နူးညံ့တဲ့ စကားလုံးတွေနဲ့ ရေးသားသူပါ။',
  'စာအုပ်တစ်အုပ်ဆိုတာ ကိုယ်မသွားဖူးသေးတဲ့ နေရာတစ်ခုရဲ့ တံခါးပါ။',
  'assets/author-hero.svg', 'assets/author-about.svg', '#', '#', '#', '#', 'hello@example.com'
)
on conflict (id) do nothing;

insert into public.books (
  title, subtitle, category, description, cover_image, status, price, currency,
  is_free, free_content, pdf_url, buy_url, published_year, display_order
)
select * from (values
  ('လမင်းဆီသို့ စာများ','အချစ်နှင့် မေတ္တာအကြောင်း ဝတ္ထု','ဝတ္ထု','မပို့ဖြစ်ခဲ့တဲ့ စာတွေ၊ ပြန်မတွေ့နိုင်တော့တဲ့ လူတွေနဲ့ ကိုယ့်ကိုယ်ကို ပြန်ရှာတွေ့ရတဲ့ ညများအကြောင်း နူးညံ့တဲ့ ဝတ္ထုတစ်ပုဒ်။','assets/book-1.svg','Available',12000::numeric,'MMK',false,null,null,'#',2026,1),
  ('တိတ်ဆိတ်သော ဥယျာဉ်','ဝတ္ထုတိုစုစည်းမှု','ဝတ္ထုတို','လူတွေရဲ့ မပြောဖြစ်တဲ့ စိတ်ကူးတွေကို ဥယျာဉ်တစ်ခုလို ဖြည်းဖြည်းဖွင့်ပြထားတဲ့ ဝတ္ထုတိုများ။','assets/book-2.svg','Available',null,'MMK',true,'ဒီစာအုပ်ကို အခမဲ့ဖတ်ရှုနိုင်ပါတယ်။\n\nအခန်း (၁) — တိတ်ဆိတ်သော ဥယျာဉ်\n\nမနက်ခင်းရဲ့အလင်းဟာ ပြတင်းပေါက်ကနေ အေးအေးလေး ဝင်လာတယ်။ ဥယျာဉ်ထဲမှာ စကားမပြောတတ်တဲ့ ပန်းတွေက သူတို့နည်းသူတို့ဟန်နဲ့ နေ့သစ်ကို ကြိုဆိုနေကြတယ်။',null,null,2025,2),
  ('နေဝင်ချိန် လက်ဖက်ရည်','နေ့စဉ်ဘဝ အက်ဆေးများ','အက်ဆေး','အိမ်၊ ခရီး၊ မိုးညနှင့် လက်ဖက်ရည်တစ်ခွက်ကြားက သေးငယ်တဲ့ ပျော်ရွှင်မှုတွေကို စုစည်းထားတဲ့ အက်ဆေးစာအုပ်။','assets/book-3.svg','Pre-order',15000,'MMK',false,null,null,'#',2026,3),
  ('ကြယ်နှစ်လုံးကြား','ကဗျာစု','ကဗျာ','ဝေးကွာခြင်း၊ စောင့်ဆိုင်းခြင်းနဲ့ ပြန်လည်စတင်ခြင်းအကြောင်း ကဗျာတိုများ။','assets/book-4.svg','Sold Out',9000,'MMK',false,null,null,'#',2024,4)
) as seed(title,subtitle,category,description,cover_image,status,price,currency,is_free,free_content,pdf_url,buy_url,published_year,display_order)
where not exists (select 1 from public.books);

insert into public.posts (title, category, excerpt, content, image, post_date, status)
select * from (values
  ('စာရေးချင်စိတ်မရှိတဲ့နေ့မှာ ကျွန်မလုပ်တဲ့အရာ ၅ ခု','Writing','စာရေးသူတိုင်း ကြုံရတဲ့ တိတ်ဆိတ်တဲ့နေ့တွေကို ဖြတ်သန်းဖို့ လက်တွေ့အသုံးဝင်တဲ့ နည်းလမ်းလေးတွေ။','စာရေးချင်စိတ်ဆိုတာ နေ့တိုင်း တစ်ပုံစံတည်း လာမနေပါဘူး။ စာရေးခြင်းကို အပြစ်ပေးတဲ့အလုပ်မဖြစ်စေဘဲ ပြန်လာချင်စရာ နေရာတစ်ခုလို ထိန်းသိမ်းထားဖို့ အရေးကြီးပါတယ်။','assets/blog-1.svg',current_date,'published'),
  ('မိုးရွာတဲ့မြို့နဲ့ ဝတ္ထုအသစ်ရဲ့ ပထမစာမျက်နှာ','Behind the scenes','ဝတ္ထုတစ်ပုဒ်ရဲ့ ပထမဆုံးပုံရိပ်က ဘယ်လိုစတင်ခဲ့သလဲဆိုတဲ့ နောက်ကွယ်ကမှတ်တမ်း။','ဒီဝတ္ထုရဲ့ ပထမစာမျက်နှာက မိုးရေထဲမှာ ရပ်နေတဲ့ ဘတ်စ်ကားမှတ်တိုင်တစ်ခုက စခဲ့ပါတယ်။','assets/blog-2.svg',current_date - 3,'published')
) as seed(title,category,excerpt,content,image,post_date,status)
where not exists (select 1 from public.posts);

insert into public.quotes (quote_text, source, display_order)
select * from (values
  ('အိပ်မက်တစ်ခုကို စတင်ဖို့ အကောင်းဆုံးအချိန်က မနေ့ကပါ။ ဒုတိယအကောင်းဆုံးအချိန်က ဒီနေ့ပါ။','Notebook No. 7',1),
  ('မပြောဖြစ်တဲ့ စကားလုံးတွေက တစ်ခါတလေ ဝတ္ထုတစ်ပုဒ်ဖြစ်လာတတ်တယ်။','လမင်းဆီသို့ စာများ',2),
  ('နူးညံ့ခြင်းဟာ အားနည်းခြင်းမဟုတ်ဘူး။ လူသားဖြစ်ခြင်းရဲ့ သတ္တိတစ်မျိုးပါ။','တိတ်ဆိတ်သော ဥယျာဉ်',3)
) as seed(quote_text,source,display_order)
where not exists (select 1 from public.quotes);
