(() => {
  const STORAGE_KEY = "shinhtatehtar-author-studio-v4";
  const ANALYTICS_KEY = "shinhtatehtar-local-analytics-v1";
  const cfg = window.APP_CONFIG || {};
  const deepClone = value => JSON.parse(JSON.stringify(value));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const DEFAULT_TIMEOUT = Number(cfg.REQUEST_TIMEOUT_MS || 12000);

  function withTimeout(value, timeoutMs = DEFAULT_TIMEOUT, label = "Request") {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timeout — internet connection သို့မဟုတ် Supabase Project URL ကို စစ်ပါ။`)), timeoutMs);
    });
    return Promise.race([Promise.resolve(value), timeout]).finally(() => clearTimeout(timer));
  }

  function friendlyError(error) {
    const raw = String(error?.message || error || "Unknown error");
    const lower = raw.toLowerCase();
    if (lower.includes("invalid login credentials")) return "Email သို့မဟုတ် Password မမှန်ပါ။ Supabase Authentication → Users မှာ သတ်မှတ်ထားတဲ့ password ကိုသုံးပါ။";
    if (lower.includes("email not confirmed")) return "ဒီ email ကို Confirm မလုပ်ရသေးပါ။ Supabase Authentication → Users မှာ Confirm လုပ်ပါ။";
    if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("load failed")) return "Supabase ကို ဆက်သွယ်မရပါ။ Internet၊ Project URL နဲ့ Publishable Key ကိုစစ်ပါ။";
    if (lower.includes("jwt") || lower.includes("api key") || lower.includes("apikey")) return "Supabase Publishable Key မမှန်နိုင်ပါ။ config.js ကိုစစ်ပါ။";
    if (lower.includes("invalid input syntax for type uuid")) return "အသစ်ထည့်တဲ့အချက်အလက်ရဲ့ ID ကို အလွတ်စာသားအဖြစ် ပို့နေပါတယ်။ v4.1.2 ဖိုင်တွေကို GitHub မှာ replace လုပ်ပါ။";
    if (lower.includes("timeout")) return raw;
    return raw;
  }

  const defaultData = {
    settings: {
      id: 1,
      site_title: "Author Studio",
      author_name: "စာရေးဆရာမ",
      author_role: "စာရေးဆရာမ",
      tagline: "စကားလုံးတွေက လူတစ်ယောက်ရဲ့ နေ့ရက်ကို ပြောင်းလဲပေးနိုင်တယ်။",
      bio: "စာအုပ်၊ ကဗျာနဲ့ နေ့စဉ်ဘဝထဲက သေးသေးလေးတွေကို နူးညံ့တဲ့ စကားလုံးတွေနဲ့ ရေးသားသူပါ။",
      hero_quote: "စာအုပ်တစ်အုပ်ဆိုတာ ကိုယ်မသွားဖူးသေးတဲ့ နေရာတစ်ခုရဲ့ တံခါးပါ။",
      hero_image: "assets/author-hero.svg",
      about_image: "assets/author-about.svg",
      instagram: "",
      facebook: "",
      tiktok: "",
      telegram: "",
      email: ""
    },
    books: [
      {
        id: "10000000-0000-4000-8000-000000000001",
        title: "လမင်းဆီသို့ စာများ",
        subtitle: "အချစ်နှင့် မေတ္တာအကြောင်း ဝတ္ထု",
        category: "ဝတ္ထု",
        description: "မပို့ဖြစ်ခဲ့တဲ့ စာတွေ၊ ပြန်မတွေ့နိုင်တော့တဲ့ လူတွေနဲ့ ကိုယ့်ကိုယ်ကို ပြန်ရှာတွေ့ရတဲ့ ညများအကြောင်း နူးညံ့တဲ့ ဝတ္ထုတစ်ပုဒ်။",
        cover_image: "assets/book-1.svg",
        status: "Available",
        price: 12000,
        currency: "MMK",
        is_free: false,
        free_content: "",
        pdf_url: "",
        buy_url: "#",
        published_year: 2026,
        display_order: 1
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        title: "တိတ်ဆိတ်သော ဥယျာဉ်",
        subtitle: "ဝတ္ထုတိုစုစည်းမှု",
        category: "ဝတ္ထုတို",
        description: "လူတွေရဲ့ မပြောဖြစ်တဲ့ စိတ်ကူးတွေကို ဥယျာဉ်တစ်ခုလို ဖြည်းဖြည်းဖွင့်ပြထားတဲ့ ဝတ္ထုတိုများ။",
        cover_image: "assets/book-2.svg",
        status: "Available",
        price: null,
        currency: "MMK",
        is_free: true,
        free_content: "အခန်း (၁) — တိတ်ဆိတ်သော ဥယျာဉ်\n\nမနက်ခင်းရဲ့အလင်းဟာ ပြတင်းပေါက်ကနေ အေးအေးလေး ဝင်လာတယ်။ ဥယျာဉ်ထဲမှာ စကားမပြောတတ်တဲ့ ပန်းတွေက သူတို့နည်းသူတို့ဟန်နဲ့ နေ့သစ်ကို ကြိုဆိုနေကြတယ်။\n\nအခန်း (၂) — အိမ်ပြန်လမ်း\n\nအချိန်အတော်ကြာပြီးနောက် သူမဟာ မိမိရဲ့တိတ်ဆိတ်မှုကို ရန်သူမဟုတ်တော့ဘဲ အိမ်တစ်လုံးလို ပြန်သိလာခဲ့တယ်။",
        pdf_url: "",
        buy_url: "",
        published_year: 2025,
        display_order: 2
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        title: "နေဝင်ချိန် လက်ဖက်ရည်",
        subtitle: "နေ့စဉ်ဘဝ အက်ဆေးများ",
        category: "အက်ဆေး",
        description: "အိမ်၊ ခရီး၊ မိုးညနှင့် လက်ဖက်ရည်တစ်ခွက်ကြားက သေးငယ်တဲ့ ပျော်ရွှင်မှုတွေကို စုစည်းထားတဲ့ အက်ဆေးစာအုပ်။",
        cover_image: "assets/book-3.svg",
        status: "Pre-order",
        price: 15000,
        currency: "MMK",
        is_free: false,
        free_content: "",
        pdf_url: "",
        buy_url: "#",
        published_year: 2026,
        display_order: 3
      },
      {
        id: "10000000-0000-4000-8000-000000000004",
        title: "ကြယ်နှစ်လုံးကြား",
        subtitle: "ကဗျာစု",
        category: "ကဗျာ",
        description: "ဝေးကွာခြင်း၊ စောင့်ဆိုင်းခြင်းနဲ့ ပြန်လည်စတင်ခြင်းအကြောင်း ကဗျာတိုများ။",
        cover_image: "assets/book-4.svg",
        status: "Sold Out",
        price: 9000,
        currency: "MMK",
        is_free: false,
        free_content: "",
        pdf_url: "",
        buy_url: "",
        published_year: 2024,
        display_order: 4
      }
    ],
    posts: [
      {
        id: "20000000-0000-4000-8000-000000000001",
        title: "စာရေးချင်စိတ်မရှိတဲ့နေ့မှာ ကျွန်မလုပ်တဲ့အရာ ၅ ခု",
        category: "Writing",
        excerpt: "စာရေးသူတိုင်း ကြုံရတဲ့ တိတ်ဆိတ်တဲ့နေ့တွေကို ဖြတ်သန်းဖို့ လက်တွေ့အသုံးဝင်တဲ့ နည်းလမ်းလေးတွေ။",
        content: "စာရေးချင်စိတ်ဆိုတာ နေ့တိုင်း တစ်ပုံစံတည်း လာမနေပါဘူး။ စာရေးခြင်းကို အပြစ်ပေးတဲ့အလုပ်မဖြစ်စေဘဲ ပြန်လာချင်စရာ နေရာတစ်ခုလို ထိန်းသိမ်းထားဖို့ အရေးကြီးပါတယ်။\n\n၁။ စာအုပ်တစ်မျက်နှာပဲ ဖတ်တယ်။\n၂။ စာတစ်ကြောင်းပဲ ရေးတယ်။\n၃။ လမ်းလျှောက်ရင်း စိတ်ကူးကို အသံဖမ်းတယ်။\n၄။ စားပွဲကို သန့်ရှင်းတယ်။\n၅။ အနားယူခွင့်ပေးတယ်။",
        image: "assets/blog-1.svg",
        post_date: new Date().toISOString().slice(0, 10),
        status: "published"
      },
      {
        id: "20000000-0000-4000-8000-000000000002",
        title: "မိုးရွာတဲ့မြို့နဲ့ ဝတ္ထုအသစ်ရဲ့ ပထမစာမျက်နှာ",
        category: "Behind the scenes",
        excerpt: "ဝတ္ထုတစ်ပုဒ်ရဲ့ ပထမဆုံးပုံရိပ်က ဘယ်လိုစတင်ခဲ့သလဲဆိုတဲ့ နောက်ကွယ်ကမှတ်တမ်း။",
        content: "ဒီဝတ္ထုရဲ့ ပထမစာမျက်နှာက မိုးရေထဲမှာ ရပ်နေတဲ့ ဘတ်စ်ကားမှတ်တိုင်တစ်ခုက စခဲ့ပါတယ်။ စာတစ်ပုဒ်စတင်ဖို့ အဖြေတစ်ခုထက် မေးခွန်းတစ်ခုက ပိုလိုတတ်ပါတယ်။",
        image: "assets/blog-2.svg",
        post_date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
        status: "published"
      }
    ],
    quotes: [
      { id: "30000000-0000-4000-8000-000000000001", quote_text: "အိပ်မက်တစ်ခုကို စတင်ဖို့ အကောင်းဆုံးအချိန်က မနေ့ကပါ။ ဒုတိယအကောင်းဆုံးအချိန်က ဒီနေ့ပါ။", source: "Notebook No. 7", display_order: 1 },
      { id: "30000000-0000-4000-8000-000000000002", quote_text: "မပြောဖြစ်တဲ့ စကားလုံးတွေက တစ်ခါတလေ ဝတ္ထုတစ်ပုဒ်ဖြစ်လာတတ်တယ်။", source: "လမင်းဆီသို့ စာများ", display_order: 2 },
      { id: "30000000-0000-4000-8000-000000000003", quote_text: "နူးညံ့ခြင်းဟာ အားနည်းခြင်းမဟုတ်ဘူး။ လူသားဖြစ်ခြင်းရဲ့ သတ္တိတစ်မျိုးပါ။", source: "တိတ်ဆိတ်သော ဥယျာဉ်", display_order: 3 }
    ]
  };

  let client = null;
  let mode = "local";
  let libraryPromise = null;

  function loadSupabaseLibrary() {
    if (window.supabase?.createClient) return Promise.resolve(true);
    if (libraryPromise) return libraryPromise;

    libraryPromise = new Promise(resolve => {
      const existing = document.getElementById("supabaseClientLibrary");
      const script = existing || document.createElement("script");
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!value) libraryPromise = null;
        resolve(value);
      };
      const timer = setTimeout(() => finish(Boolean(window.supabase?.createClient)), 8000);

      script.id = "supabaseClientLibrary";
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => finish(Boolean(window.supabase?.createClient));
      script.onerror = () => finish(false);
      if (!existing) document.head.appendChild(script);
    });
    return libraryPromise;
  }

  function localRead() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.warn("Local data read failed", error);
    }
    const initial = deepClone(defaultData);
    localWrite(initial);
    return initial;
  }

  function localWrite(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("author-data-changed"));
  }

  function localAnalyticsRead() {
    try { return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "null") || { pageViews: [], contentViews: [], subscribers: [] }; }
    catch { return { pageViews: [], contentViews: [], subscribers: [] }; }
  }

  function localAnalyticsWrite(value) {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(value));
  }

  async function init() {
    const url = String(cfg.SUPABASE_URL || "").trim();
    const key = String(cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_ANON_KEY || "").trim();
    const validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url);

    const libraryReady = validUrl && key ? await loadSupabaseLibrary() : false;
    if (validUrl && key && libraryReady && window.supabase?.createClient) {
      client = window.supabase.createClient(url.replace(/\/$/, ""), key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: `author-studio-auth-${cfg.SITE_SLUG || "site"}`
        },
        global: {
          headers: { "x-client-info": `shinhtatehtar-author-studio/${cfg.APP_VERSION || "4"}` }
        }
      });
      mode = "supabase";
    } else {
      mode = "local";
      client = null;
      localRead();
    }
    return mode;
  }

  async function testConnection() {
    if (mode !== "supabase" || !client) {
      return { ok: false, mode, message: "Supabase client မတက်သေးပါ။ CDN သို့မဟုတ် config.js ကိုစစ်ပါ။" };
    }
    try {
      const result = await withTimeout(
        client.from("site_settings").select("id").eq("id", 1).maybeSingle(),
        DEFAULT_TIMEOUT,
        "Supabase connection"
      );
      if (result.error) throw result.error;
      return { ok: true, mode, message: "Supabase ချိတ်ဆက်မှု အောင်မြင်ပါတယ်။" };
    } catch (error) {
      return { ok: false, mode, message: friendlyError(error), error };
    }
  }

  function normalizeSettings(row) {
    return { ...deepClone(defaultData.settings), ...(row || {}) };
  }

  async function getPublicData() {
    if (mode === "local") {
      const local = localRead();
      return { ...deepClone(local), source: "local" };
    }

    try {
      const results = await withTimeout(Promise.all([
        client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        client.from("books").select("*").order("display_order", { ascending: true }),
        client.from("posts").select("*").eq("status", "published").order("post_date", { ascending: false }).order("created_at", { ascending: false }),
        client.from("quotes").select("*").order("display_order", { ascending: true })
      ]), DEFAULT_TIMEOUT, "Website data");
      const [settingsResult, booksResult, postsResult, quotesResult] = results;
      for (const result of results) {
        if (result.error) throw result.error;
      }
      return {
        settings: normalizeSettings(settingsResult.data),
        books: booksResult.data || [],
        posts: postsResult.data || [],
        quotes: quotesResult.data || [],
        source: "supabase"
      };
    } catch (error) {
      console.warn("Supabase data is not ready; using preview data.", error);
      return { ...deepClone(defaultData), source: "fallback", loadError: friendlyError(error) };
    }
  }

  async function getAdminData() {
    if (mode === "local") return { ...deepClone(localRead()), source: "local" };
    const results = await withTimeout(Promise.all([
      client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      client.from("books").select("*").order("display_order", { ascending: true }),
      client.from("posts").select("*").order("post_date", { ascending: false }).order("created_at", { ascending: false }),
      client.from("quotes").select("*").order("display_order", { ascending: true })
    ]), DEFAULT_TIMEOUT, "Admin data");
    const [settingsResult, booksResult, postsResult, quotesResult] = results;
    for (const result of results) {
      if (result.error) throw result.error;
    }
    return {
      settings: normalizeSettings(settingsResult.data),
      books: booksResult.data || [],
      posts: postsResult.data || [],
      quotes: quotesResult.data || [],
      source: "supabase"
    };
  }

  async function getSession() {
    if (mode === "local") return { user: { email: "demo@local" } };
    const { data, error } = await withTimeout(client.auth.getSession(), DEFAULT_TIMEOUT, "Session check");
    if (error) throw error;
    return data.session;
  }

  async function signIn(email, passwordOrPin) {
    if (mode === "local") {
      if (String(passwordOrPin) !== String(cfg.DEMO_ADMIN_PIN || "2468")) throw new Error("PIN မမှန်ပါ။");
      sessionStorage.setItem("author-demo-admin", "1");
      return { user: { email: "demo@local" } };
    }
    if (!email) throw new Error("Admin email ထည့်ပါ။");
    if (!passwordOrPin) throw new Error("Password ထည့်ပါ။");
    const { data, error } = await withTimeout(
      client.auth.signInWithPassword({ email, password: passwordOrPin }),
      DEFAULT_TIMEOUT,
      "Admin login"
    );
    if (error) throw new Error(friendlyError(error));
    return data;
  }

  async function signOut() {
    if (mode === "local") {
      sessionStorage.removeItem("author-demo-admin");
      return;
    }
    const { error } = await withTimeout(client.auth.signOut(), DEFAULT_TIMEOUT, "Logout");
    if (error) throw new Error(friendlyError(error));
  }

  async function saveSettings(values) {
    const payload = { ...values, id: 1 };
    if (mode === "local") {
      const local = localRead();
      local.settings = { ...local.settings, ...payload };
      localWrite(local);
      return local.settings;
    }
    const { data, error } = await client.from("site_settings").upsert(payload).select().single();
    if (error) throw error;
    return data;
  }

  function cleanOptionalUuid(values) {
    const payload = { ...values };
    const id = String(payload.id || "").trim();
    if (id) payload.id = id;
    else delete payload.id;
    return payload;
  }

  function cleanBook(values) {
    const base = cleanOptionalUuid(values);
    return {
      ...base,
      price: values.is_free || values.price === "" || values.price == null ? null : Number(values.price),
      is_free: Boolean(values.is_free),
      published_year: values.published_year ? Number(values.published_year) : null,
      display_order: Number(values.display_order || 0),
      pdf_url: values.pdf_url || null,
      buy_url: values.buy_url || null,
      free_content: values.free_content || null
    };
  }

  async function saveBook(values) {
    const payload = cleanBook(values);
    if (mode === "local") {
      const local = localRead();
      if (payload.id) {
        const index = local.books.findIndex(item => item.id === payload.id);
        if (index < 0) throw new Error("Book မတွေ့ပါ။");
        local.books[index] = { ...local.books[index], ...payload };
      } else {
        payload.id = uid();
        local.books.push(payload);
      }
      localWrite(local);
      return payload;
    }
    const query = payload.id
      ? client.from("books").update(payload).eq("id", payload.id)
      : client.from("books").insert(payload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }

  async function deleteBook(id) {
    if (mode === "local") {
      const local = localRead();
      local.books = local.books.filter(item => item.id !== id);
      localWrite(local);
      return;
    }
    const { error } = await client.from("books").delete().eq("id", id);
    if (error) throw error;
  }

  async function savePost(values) {
    const payload = cleanOptionalUuid({
      ...values,
      post_date: values.post_date || new Date().toISOString().slice(0, 10)
    });
    if (mode === "local") {
      const local = localRead();
      if (payload.id) {
        const index = local.posts.findIndex(item => item.id === payload.id);
        if (index < 0) throw new Error("Blog မတွေ့ပါ။");
        local.posts[index] = { ...local.posts[index], ...payload };
      } else {
        payload.id = uid();
        payload.created_at = new Date().toISOString();
        local.posts.push(payload);
      }
      localWrite(local);
      return payload;
    }
    const query = payload.id
      ? client.from("posts").update(payload).eq("id", payload.id)
      : client.from("posts").insert(payload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }

  async function deletePost(id) {
    if (mode === "local") {
      const local = localRead();
      local.posts = local.posts.filter(item => item.id !== id);
      localWrite(local);
      return;
    }
    const { error } = await client.from("posts").delete().eq("id", id);
    if (error) throw error;
  }

  async function saveQuote(values) {
    const payload = cleanOptionalUuid({
      ...values,
      display_order: Number(values.display_order || 0)
    });
    if (mode === "local") {
      const local = localRead();
      if (payload.id) {
        const index = local.quotes.findIndex(item => item.id === payload.id);
        if (index < 0) throw new Error("Quote မတွေ့ပါ။");
        local.quotes[index] = { ...local.quotes[index], ...payload };
      } else {
        payload.id = uid();
        local.quotes.push(payload);
      }
      localWrite(local);
      return payload;
    }
    const query = payload.id
      ? client.from("quotes").update(payload).eq("id", payload.id)
      : client.from("quotes").insert(payload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }

  async function deleteQuote(id) {
    if (mode === "local") {
      const local = localRead();
      local.quotes = local.quotes.filter(item => item.id !== id);
      localWrite(local);
      return;
    }
    const { error } = await client.from("quotes").delete().eq("id", id);
    if (error) throw error;
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadAsset(file, folder = "uploads") {
    if (!file) return "";
    if (mode === "local") {
      if (file.size > 2_500_000) throw new Error("Demo Mode မှာ 2.5MB အောက်ဖိုင်ပဲ သုံးပါ။ Supabase Mode မှာ PDF ကြီးတွေတင်နိုင်ပါတယ်။");
      return fileToDataUrl(file);
    }
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
    const path = `${folder}/${Date.now()}-${uid()}-${safeName}`;
    const { error } = await withTimeout(client.storage.from(cfg.STORAGE_BUCKET || "site-assets").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined
    }), Math.max(DEFAULT_TIMEOUT, 60000), "File upload");
    if (error) throw error;
    const { data } = client.storage.from(cfg.STORAGE_BUCKET || "site-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  async function trackVisit(sessionId, path, referrer = "") {
    const now = new Date().toISOString();
    if (mode === "local") {
      const analytics = localAnalyticsRead();
      analytics.pageViews.push({ session_id: sessionId, path, referrer, created_at: now });
      analytics.pageViews = analytics.pageViews.slice(-5000);
      localAnalyticsWrite(analytics);
      return;
    }
    const [{ error: insertError }, { error: heartbeatError }] = await Promise.all([
      client.from("page_views").insert({ session_id: sessionId, path, referrer: String(referrer || "").slice(0, 500) }),
      client.rpc("touch_visitor_session", { p_session_id: sessionId, p_path: path })
    ]);
    if (insertError) console.warn("Page view tracking failed", insertError);
    if (heartbeatError) console.warn("Visitor heartbeat failed", heartbeatError);
  }

  async function heartbeat(sessionId, path) {
    if (mode === "local") return;
    const { error } = await client.rpc("touch_visitor_session", { p_session_id: sessionId, p_path: path });
    if (error) console.warn("Heartbeat failed", error);
  }

  async function trackContentView(sessionId, contentType, contentId) {
    if (!contentId) return;
    if (mode === "local") {
      const analytics = localAnalyticsRead();
      analytics.contentViews.push({ session_id: sessionId, content_type: contentType, content_id: contentId, created_at: new Date().toISOString() });
      analytics.contentViews = analytics.contentViews.slice(-5000);
      localAnalyticsWrite(analytics);
      return;
    }
    const { error } = await client.from("content_views").insert({ session_id: sessionId, content_type: contentType, content_id: contentId });
    if (error) console.warn("Content view tracking failed", error);
  }

  async function subscribeReader(email, deviceId, permission) {
    if (mode === "local") {
      const analytics = localAnalyticsRead();
      const key = email || deviceId;
      const existing = analytics.subscribers.find(item => (item.email || item.device_id) === key);
      const item = { email: email || null, device_id: deviceId || null, notification_permission: permission || "", updated_at: new Date().toISOString() };
      if (existing) Object.assign(existing, item); else analytics.subscribers.push(item);
      localAnalyticsWrite(analytics);
      return;
    }
    const { error } = await client.rpc("subscribe_reader", {
      p_email: email || null,
      p_device_id: deviceId || null,
      p_permission: permission || null
    });
    if (error) throw error;
  }

  function computeLocalAnalytics(data) {
    const analytics = localAnalyticsRead();
    const today = new Date().toISOString().slice(0, 10);
    const countBy = (type, source) => {
      const counts = new Map();
      analytics.contentViews.filter(v => v.content_type === type).forEach(v => counts.set(v.content_id, (counts.get(v.content_id) || 0) + 1));
      return [...source].map(item => ({ id: item.id, title: item.title, views: counts.get(item.id) || 0 })).sort((a,b) => b.views - a.views).slice(0,5);
    };
    const last7 = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0,10);
      return { day: date, visits: analytics.pageViews.filter(v => String(v.created_at).slice(0,10) === date).length };
    });
    return {
      total_visits: analytics.pageViews.length,
      unique_visitors: new Set(analytics.pageViews.map(v => v.session_id)).size,
      today_visits: analytics.pageViews.filter(v => String(v.created_at).slice(0,10) === today).length,
      active_now: 1,
      subscriber_count: analytics.subscribers.length,
      top_posts: countBy("post", data.posts),
      top_books: countBy("book", data.books),
      last_7_days: last7
    };
  }

  async function getAnalytics(data) {
    if (mode === "local") return computeLocalAnalytics(data || localRead());
    const { data: analytics, error } = await withTimeout(client.rpc("get_admin_analytics"), DEFAULT_TIMEOUT, "Analytics");
    if (error) throw new Error(friendlyError(error));
    return analytics || {};
  }

  function subscribeToPublishedPosts(callback) {
    if (mode !== "supabase") return () => {};
    const channel = client
      .channel(`published-posts-${uid()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, payload => {
        if (payload.new?.status === "published") callback(payload.new);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, payload => {
        if (payload.new?.status === "published" && payload.old?.status !== "published") callback(payload.new);
      })
      .subscribe();
    return () => client.removeChannel(channel);
  }

  function exportLocal() {
    return JSON.stringify(localRead(), null, 2);
  }

  function importLocal(jsonText) {
    const parsed = JSON.parse(jsonText);
    if (!parsed.settings || !Array.isArray(parsed.books) || !Array.isArray(parsed.posts) || !Array.isArray(parsed.quotes)) {
      throw new Error("Backup JSON ပုံစံမမှန်ပါ။");
    }
    localWrite(parsed);
  }

  function resetLocal() {
    localWrite(deepClone(defaultData));
  }

  window.AuthorStore = Object.freeze({
    init,
    getMode: () => mode,
    getClient: () => client,
    getProjectRef: () => String(cfg.SUPABASE_URL || "").replace(/^https:\/\//, "").split(".")[0],
    testConnection,
    friendlyError,
    withTimeout,
    getPublicData,
    getAdminData,
    getSession,
    signIn,
    signOut,
    saveSettings,
    saveBook,
    deleteBook,
    savePost,
    deletePost,
    saveQuote,
    deleteQuote,
    uploadAsset,
    trackVisit,
    heartbeat,
    trackContentView,
    subscribeReader,
    getAnalytics,
    subscribeToPublishedPosts,
    exportLocal,
    importLocal,
    resetLocal,
    defaults: deepClone(defaultData)
  });
})();
