-- Run in Supabase SQL Editor to verify the Author Studio setup.
select
  to_regclass('public.site_settings') as site_settings,
  to_regclass('public.books') as books,
  to_regclass('public.posts') as posts,
  to_regclass('public.quotes') as quotes,
  to_regclass('public.page_views') as page_views,
  to_regclass('public.visitor_sessions') as visitor_sessions,
  to_regclass('public.content_views') as content_views,
  to_regclass('public.subscribers') as subscribers;

select
  (select count(*) from public.site_settings) as settings_rows,
  (select count(*) from public.books) as book_rows,
  (select count(*) from public.posts) as post_rows,
  (select count(*) from public.quotes) as quote_rows;

select id, email, email_confirmed_at, last_sign_in_at
from auth.users
order by created_at desc;
