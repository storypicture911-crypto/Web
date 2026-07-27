/*
  Browser-safe Supabase configuration.
  The publishable key is designed for client-side use, but database security
  still depends on the Row Level Security policies in schema.sql.
*/
window.APP_CONFIG = Object.freeze({
  SUPABASE_URL: "https://kebltdheqbisuvzidjdn.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_Zg8mGuF3CeV1c5xGHKFSTA_jzDusoSR",
  STORAGE_BUCKET: "site-assets",
  DEMO_ADMIN_PIN: "2468",
  SITE_SLUG: "shinhtatehtar"
});
