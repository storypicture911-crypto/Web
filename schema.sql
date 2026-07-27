-- Her Story Studio: Supabase schema
-- Run this entire file in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_title text not null default 'Her Story Studio',
  author_name text not null default 'စာရေးဆရာမ',
  author_role text,
  tagline text,
  bio text,
  hero_quote text,
  profile_image text,
  instagram text,
  facebook text,
  email text,
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  cover_image text,
  status text not null default 'Available' check (status in ('Available','Pre-order','Sold Out')),
  buy_url text,
  published_year integer,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  content text,
  image text,
  post_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_text text not null,
  source text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.books enable row level security;
alter table public.posts enable row level security;
alter table public.quotes enable row level security;

-- Public visitors can read website content.
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select using (true);

drop policy if exists "Public can read books" on public.books;
create policy "Public can read books" on public.books for select using (true);

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts" on public.posts for select using (status = 'published');

drop policy if exists "Public can read quotes" on public.quotes;
create policy "Public can read quotes" on public.quotes for select using (true);

-- Only signed-in Supabase users can create/edit/delete content.
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings for all to authenticated using (true) with check (true);

drop policy if exists "Admins manage books" on public.books;
create policy "Admins manage books" on public.books for all to authenticated using (true) with check (true);

drop policy if exists "Admins read all posts" on public.posts;
create policy "Admins read all posts" on public.posts for select to authenticated using (true);

drop policy if exists "Admins insert posts" on public.posts;
create policy "Admins insert posts" on public.posts for insert to authenticated with check (true);

drop policy if exists "Admins update posts" on public.posts;
create policy "Admins update posts" on public.posts for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete posts" on public.posts;
create policy "Admins delete posts" on public.posts for delete to authenticated using (true);

drop policy if exists "Admins manage quotes" on public.quotes;
create policy "Admins manage quotes" on public.quotes for all to authenticated using (true) with check (true);

insert into public.site_settings (
  id, site_title, author_name, author_role, tagline, bio, hero_quote,
  profile_image, instagram, facebook, email
) values (
  1,
  'Her Story Studio',
  'အိမ့်ချမ်းမြေ့',
  'စာရေးဆရာမ · ကဗျာဆရာမ',
  'စကားလုံးတွေက လူတစ်ယောက်ရဲ့ နေ့ရက်ကို ပြောင်းလဲပေးနိုင်တယ်။',
  'စာအုပ်၊ ကဗျာနဲ့ နေ့စဉ်ဘဝထဲက သေးသေးလေးတွေကို နူးညံ့တဲ့ စကားလုံးတွေနဲ့ ရေးသားသူပါ။',
  'စာအုပ်တစ်အုပ်ဆိုတာ ကိုယ်မသွားဖူးသေးတဲ့ နေရာတစ်ခုရဲ့ တံခါးပါ။',
  'assets/author-portrait.svg', '#', '#', 'hello@example.com'
) on conflict (id) do nothing;

insert into public.books (title, subtitle, description, cover_image, status, buy_url, published_year, display_order) values
('လမင်းဆီသို့ စာများ','အချစ်နှင့် မေတ္တာအကြောင်း ဝတ္ထု','မပို့ဖြစ်ခဲ့တဲ့ စာတွေ၊ ပြန်မတွေ့နိုင်တော့တဲ့ လူတွေနဲ့ ကိုယ့်ကိုယ်ကို ပြန်ရှာတွေ့ရတဲ့ ညများအကြောင်း နူးညံ့တဲ့ ဝတ္ထုတစ်ပုဒ်။','assets/book-1.svg','Available','#',2026,1),
('တိတ်ဆိတ်သော ဥယျာဉ်','ဝတ္ထုတိုစုစည်းမှု','လူတွေရဲ့ မပြောဖြစ်တဲ့ စိတ်ကူးတွေကို ဥယျာဉ်တစ်ခုလို ဖြည်းဖြည်းဖွင့်ပြထားတဲ့ ဝတ္ထုတိုများ။','assets/book-2.svg','Available','#',2025,2),
('နေဝင်ချိန် လက်ဖက်ရည်','နေ့စဉ်ဘဝ အက်ဆေးများ','အိမ်၊ ခရီး၊ မိုးညနှင့် လက်ဖက်ရည်တစ်ခွက်ကြားက သေးငယ်တဲ့ ပျော်ရွှင်မှုတွေကို စုစည်းထားတဲ့ အက်ဆေးစာအုပ်။','assets/book-3.svg','Pre-order','#',2026,3),
('ကြယ်နှစ်လုံးကြား','ကဗျာစု','ဝေးကွာခြင်း၊ စောင့်ဆိုင်းခြင်းနဲ့ ပြန်လည်စတင်ခြင်းအကြောင်း ကဗျာတိုများ။','assets/book-4.svg','Sold Out','#',2024,4);

insert into public.posts (title, excerpt, content, image, post_date, status) values
('စာရေးချင်စိတ်မရှိတဲ့နေ့မှာ ကျွန်မလုပ်တဲ့အရာ ၅ ခု','စာရေးသူတိုင်း ကြုံရတဲ့ တိတ်ဆိတ်တဲ့နေ့တွေကို ဖြတ်သန်းဖို့ လက်တွေ့အသုံးဝင်တဲ့ နည်းလမ်းလေးတွေ။','စာရေးချင်စိတ်ဆိုတာ နေ့တိုင်း တစ်ပုံစံတည်း လာမနေပါဘူး။ စာရေးခြင်းကို အပြစ်ပေးတဲ့အလုပ်မဖြစ်စေဘဲ ပြန်လာချင်စရာ နေရာတစ်ခုလို ထိန်းသိမ်းထားဖို့ အရေးကြီးပါတယ်။','assets/blog-1.svg',current_date,'published'),
('မိုးရွာတဲ့မြို့နဲ့ ဝတ္ထုအသစ်ရဲ့ ပထမစာမျက်နှာ','ဝတ္ထုတစ်ပုဒ်ရဲ့ ပထမဆုံးပုံရိပ်က ဘယ်လိုစတင်ခဲ့သလဲဆိုတဲ့ နောက်ကွယ်ကမှတ်တမ်း။','ဒီဝတ္ထုရဲ့ ပထမစာမျက်နှာက မိုးရေထဲမှာ ရပ်နေတဲ့ ဘတ်စ်ကားမှတ်တိုင်တစ်ခုက စခဲ့ပါတယ်။','assets/blog-2.svg',current_date - 3,'published');

insert into public.quotes (quote_text, source, display_order) values
('အိပ်မက်တစ်ခုကို စတင်ဖို့ အကောင်းဆုံးအချိန်က မနေ့ကပါ။ ဒုတိယအကောင်းဆုံးအချိန်က ဒီနေ့ပါ။','Notebook No. 7',1),
('မပြောဖြစ်တဲ့ စကားလုံးတွေက တစ်ခါတလေ ဝတ္ထုတစ်ပုဒ်ဖြစ်လာတတ်တယ်။','လမင်းဆီသို့ စာများ',2),
('နူးညံ့ခြင်းဟာ အားနည်းခြင်းမဟုတ်ဘူး။ လူသားဖြစ်ခြင်းရဲ့ သတ္တိတစ်မျိုးပါ။','တိတ်ဆိတ်သော ဥယျာဉ်',3);
