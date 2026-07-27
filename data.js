(() => {
  const STORAGE_KEY = "authorBookStudio.v2";
  const config = window.APP_CONFIG || {};
  let client = null;

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const today = () => new Date().toISOString().slice(0, 10);

  const DEFAULT_DATA = {
    settings: {
      id: 1,
      site_title: "Her Story Studio",
      author_name: "အိမ့်ချမ်းမြေ့",
      author_role: "စာရေးဆရာမ · ကဗျာဆရာမ",
      tagline: "စကားလုံးတွေက လူတစ်ယောက်ရဲ့ နေ့ရက်ကို ပြောင်းလဲပေးနိုင်တယ်။",
      bio: "စာအုပ်၊ ကဗျာနဲ့ နေ့စဉ်ဘဝထဲက သေးသေးလေးတွေကို နူးညံ့တဲ့ စကားလုံးတွေနဲ့ ရေးသားသူပါ။ ဒီနေရာမှာ စာအုပ်အသစ်တွေ၊ စာရေးခြင်းနောက်ကွယ်က မှတ်တမ်းတွေနဲ့ နေ့စဉ်ဘလော့ဂ်တွေကို မျှဝေထားပါတယ်။",
      hero_quote: "စာအုပ်တစ်အုပ်ဆိုတာ ကိုယ်မသွားဖူးသေးတဲ့ နေရာတစ်ခုရဲ့ တံခါးပါ။",
      profile_image: "assets/author-portrait.svg",
      instagram: "#",
      facebook: "#",
      email: "hello@example.com"
    },
    books: [
      { id: uid(), title: "လမင်းဆီသို့ စာများ", subtitle: "အချစ်နှင့် မေတ္တာအကြောင်း ဝတ္ထု", description: "မပို့ဖြစ်ခဲ့တဲ့ စာတွေ၊ ပြန်မတွေ့နိုင်တော့တဲ့ လူတွေနဲ့ ကိုယ့်ကိုယ်ကို ပြန်ရှာတွေ့ရတဲ့ ညများအကြောင်း နူးညံ့တဲ့ ဝတ္ထုတစ်ပုဒ်။", cover_image: "assets/book-1.svg", status: "Available", buy_url: "#", published_year: 2026, display_order: 1 },
      { id: uid(), title: "တိတ်ဆိတ်သော ဥယျာဉ်", subtitle: "ဝတ္ထုတိုစုစည်းမှု", description: "လူတွေရဲ့ မပြောဖြစ်တဲ့ စိတ်ကူးတွေကို ဥယျာဉ်တစ်ခုလို ဖြည်းဖြည်းဖွင့်ပြထားတဲ့ ဝတ္ထုတိုများ။", cover_image: "assets/book-2.svg", status: "Available", buy_url: "#", published_year: 2025, display_order: 2 },
      { id: uid(), title: "နေဝင်ချိန် လက်ဖက်ရည်", subtitle: "နေ့စဉ်ဘဝ အက်ဆေးများ", description: "အိမ်၊ ခရီး၊ မိုးညနှင့် လက်ဖက်ရည်တစ်ခွက်ကြားက သေးငယ်တဲ့ ပျော်ရွှင်မှုတွေကို စုစည်းထားတဲ့ အက်ဆေးစာအုပ်။", cover_image: "assets/book-3.svg", status: "Pre-order", buy_url: "#", published_year: 2026, display_order: 3 },
      { id: uid(), title: "ကြယ်နှစ်လုံးကြား", subtitle: "ကဗျာစု", description: "ဝေးကွာခြင်း၊ စောင့်ဆိုင်းခြင်းနဲ့ ပြန်လည်စတင်ခြင်းအကြောင်း ကဗျာတိုများ။", cover_image: "assets/book-4.svg", status: "Sold Out", buy_url: "#", published_year: 2024, display_order: 4 }
    ],
    posts: [
      { id: uid(), title: "စာရေးချင်စိတ်မရှိတဲ့နေ့မှာ ကျွန်မလုပ်တဲ့အရာ ၅ ခု", excerpt: "စာရေးသူတိုင်း ကြုံရတဲ့ တိတ်ဆိတ်တဲ့နေ့တွေကို ဖြတ်သန်းဖို့ လက်တွေ့အသုံးဝင်တဲ့ နည်းလမ်းလေးတွေ။", content: "စာရေးချင်စိတ်ဆိုတာ နေ့တိုင်း တစ်ပုံစံတည်း လာမနေပါဘူး။ တချို့နေ့တွေမှာ စကားလုံးတွေက လျင်မြန်စွာ လာတတ်ပြီး တချို့နေ့တွေမှာတော့ စာရွက်အလွတ်က မျက်နှာချင်းဆိုင်ထိုင်နေသလို ဖြစ်နေတတ်ပါတယ်။\n\nအဲဒီလိုနေ့တွေမှာ ကျွန်မက အရင်ဆုံး စာမရေးရမယ်လို့ ကိုယ့်ကိုယ်ကို ခဏခွင့်ပြုပါတယ်။ ပြီးတော့ လမ်းလျှောက်ခြင်း၊ စာအုပ်အနည်းငယ်ဖတ်ခြင်း၊ စကားလုံး ၁၀၀ ပဲ ရေးမယ်လို့ ရည်မှန်းခြင်း၊ အဟောင်းရေးထားတာတွေ ပြန်ဖတ်ခြင်းနဲ့ ပတ်ဝန်းကျင်ပြောင်းထိုင်ခြင်းတို့ကို လုပ်ပါတယ်။\n\nအရေးကြီးဆုံးက စာရေးခြင်းကို အပြစ်ပေးတဲ့အလုပ်မဖြစ်စေဘဲ ပြန်လာချင်စရာ နေရာတစ်ခုလို ထိန်းသိမ်းထားဖို့ပါ။", image: "assets/blog-1.svg", post_date: today(), status: "published" },
      { id: uid(), title: "မိုးရွာတဲ့မြို့နဲ့ ဝတ္ထုအသစ်ရဲ့ ပထမစာမျက်နှာ", excerpt: "ဝတ္ထုတစ်ပုဒ်ရဲ့ ပထမဆုံးပုံရိပ်က ဘယ်လိုစတင်ခဲ့သလဲဆိုတဲ့ နောက်ကွယ်ကမှတ်တမ်း။", content: "ဒီဝတ္ထုရဲ့ ပထမစာမျက်နှာက မိုးရေထဲမှာ ရပ်နေတဲ့ ဘတ်စ်ကားမှတ်တိုင်တစ်ခုက စခဲ့ပါတယ်။ လူတိုင်းအိမ်ပြန်နေကြပေမယ့် ဇာတ်ကောင်တစ်ယောက်ကတော့ တစ်နေရာကို မသွားချင်သေးဘူး။\n\nအဲဒီစိတ်ခံစားချက်က ဇာတ်လမ်းတစ်ပုဒ်လုံးရဲ့ အသံဖြစ်လာခဲ့ပါတယ်။ တခါတလေ ဝတ္ထုတစ်ပုဒ်စဖို့ ပေါက်ကွဲသံကြီးမလိုပါဘူး။ မိုးရေတစ်စက်နဲ့ မပြန်ချင်သေးတဲ့ စိတ်တစ်ခုလောက်ပဲ လိုပါတယ်။", image: "assets/blog-2.svg", post_date: "2026-07-24", status: "published" },
      { id: uid(), title: "ညအချိန် စာဖတ်ခြင်းရဲ့ အေးချမ်းမှု", excerpt: "ဖုန်းကို ခဏပိတ်ပြီး စာအုပ်တစ်အုပ်နဲ့ အချိန်ဖြုန်းရတဲ့ အဓိပ္ပါယ်။", content: "ညဘက်မှာ စာဖတ်တဲ့အခါ နေ့တစ်နေ့လုံးရဲ့ အသံတွေ ဖြည်းဖြည်းလျော့သွားပါတယ်။ စာမျက်နှာတစ်ရွက်ချင်းစီက အမြန်မလိုတဲ့ အချိန်တစ်ခုကို ပြန်ပေးတယ်။\n\nဖတ်ရင်းနဲ့ ကိုယ့်အတွေးကို ပြန်ကြားရတယ်။ မဖြေရှင်းရသေးတဲ့ မေးခွန်းတွေကို ခဏထားနိုင်တယ်။ ဒါကြောင့် ညအချိန် စာဖတ်ခြင်းက အလေ့အကျင့်တစ်ခုထက် ကိုယ့်ကိုယ်ကို ပြန်တွေ့တဲ့ အခမ်းအနားသေးသေးလေးတစ်ခုလို့ ကျွန်မထင်ပါတယ်။", image: "assets/blog-3.svg", post_date: "2026-07-20", status: "published" }
    ],
    quotes: [
      { id: uid(), quote_text: "အိပ်မက်တစ်ခုကို စတင်ဖို့ အကောင်းဆုံးအချိန်က မနေ့ကပါ။ ဒုတိယအကောင်းဆုံးအချိန်က ဒီနေ့ပါ။", source: "Notebook No. 7", display_order: 1 },
      { id: uid(), quote_text: "မပြောဖြစ်တဲ့ စကားလုံးတွေက တစ်ခါတလေ ဝတ္ထုတစ်ပုဒ်ဖြစ်လာတတ်တယ်။", source: "လမင်းဆီသို့ စာများ", display_order: 2 },
      { id: uid(), quote_text: "နူးညံ့ခြင်းဟာ အားနည်းခြင်းမဟုတ်ဘူး။ လူသားဖြစ်ခြင်းရဲ့ သတ္တိတစ်မျိုးပါ။", source: "တိတ်ဆိတ်သော ဥယျာဉ်", display_order: 3 }
    ]
  };

  const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_DATA));

  function getLocalData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.settings && Array.isArray(saved.books) && Array.isArray(saved.posts)) return saved;
    } catch (error) {
      console.warn("Could not read saved data", error);
    }
    const fresh = cloneDefaults();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function setLocalData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("author-data-changed"));
    return data;
  }

  function isSupabaseConfigured() {
    return Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY && window.supabase);
  }

  async function init() {
    if (isSupabaseConfigured()) {
      client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      return "supabase";
    }
    getLocalData();
    return "local";
  }

  const mode = () => (client ? "supabase" : "local");

  async function getPublicData() {
    if (!client) {
      const data = getLocalData();
      return { ...data, posts: data.posts.filter(p => p.status === "published") };
    }
    const [settingsRes, booksRes, postsRes, quotesRes] = await Promise.all([
      client.from("site_settings").select("*").eq("id", 1).single(),
      client.from("books").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
      client.from("posts").select("*").eq("status", "published").order("post_date", { ascending: false }),
      client.from("quotes").select("*").order("display_order", { ascending: true })
    ]);
    const error = settingsRes.error || booksRes.error || postsRes.error || quotesRes.error;
    if (error) throw error;
    return {
      settings: settingsRes.data,
      books: booksRes.data || [],
      posts: postsRes.data || [],
      quotes: quotesRes.data || []
    };
  }

  async function getAdminData() {
    if (!client) return getLocalData();
    const [settingsRes, booksRes, postsRes, quotesRes] = await Promise.all([
      client.from("site_settings").select("*").eq("id", 1).single(),
      client.from("books").select("*").order("display_order", { ascending: true }),
      client.from("posts").select("*").order("post_date", { ascending: false }),
      client.from("quotes").select("*").order("display_order", { ascending: true })
    ]);
    const error = settingsRes.error || booksRes.error || postsRes.error || quotesRes.error;
    if (error) throw error;
    return { settings: settingsRes.data, books: booksRes.data || [], posts: postsRes.data || [], quotes: quotesRes.data || [] };
  }

  async function signIn({ email, password, pin }) {
    if (!client) {
      if (String(pin) !== String(config.DEMO_ADMIN_PIN || "2468")) throw new Error("PIN မမှန်ပါ။");
      sessionStorage.setItem("author-admin-demo", "1");
      return { user: { email: "demo-admin" } };
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!client) {
      sessionStorage.removeItem("author-admin-demo");
      return;
    }
    await client.auth.signOut();
  }

  async function hasSession() {
    if (!client) return sessionStorage.getItem("author-admin-demo") === "1";
    const { data } = await client.auth.getSession();
    return Boolean(data.session);
  }

  async function saveSettings(settings) {
    if (!client) {
      const data = getLocalData();
      data.settings = { ...data.settings, ...settings, id: 1 };
      setLocalData(data);
      return data.settings;
    }
    const payload = { ...settings, id: 1, updated_at: new Date().toISOString() };
    const { data, error } = await client.from("site_settings").upsert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async function saveBook(book) {
    const payload = { ...book, id: book.id || uid(), published_year: Number(book.published_year) || null, display_order: Number(book.display_order) || 0 };
    if (!client) {
      const data = getLocalData();
      const index = data.books.findIndex(item => item.id === payload.id);
      if (index >= 0) data.books[index] = payload; else data.books.push(payload);
      setLocalData(data);
      return payload;
    }
    const { data, error } = await client.from("books").upsert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteBook(id) {
    if (!client) {
      const data = getLocalData();
      data.books = data.books.filter(item => item.id !== id);
      setLocalData(data);
      return;
    }
    const { error } = await client.from("books").delete().eq("id", id);
    if (error) throw error;
  }

  async function savePost(post) {
    const payload = { ...post, id: post.id || uid(), post_date: post.post_date || today() };
    if (!client) {
      const data = getLocalData();
      const index = data.posts.findIndex(item => item.id === payload.id);
      if (index >= 0) data.posts[index] = payload; else data.posts.unshift(payload);
      setLocalData(data);
      return payload;
    }
    const { data, error } = await client.from("posts").upsert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async function deletePost(id) {
    if (!client) {
      const data = getLocalData();
      data.posts = data.posts.filter(item => item.id !== id);
      setLocalData(data);
      return;
    }
    const { error } = await client.from("posts").delete().eq("id", id);
    if (error) throw error;
  }

  async function saveQuote(quote) {
    const payload = { ...quote, id: quote.id || uid(), display_order: Number(quote.display_order) || 0 };
    if (!client) {
      const data = getLocalData();
      const index = data.quotes.findIndex(item => item.id === payload.id);
      if (index >= 0) data.quotes[index] = payload; else data.quotes.push(payload);
      setLocalData(data);
      return payload;
    }
    const { data, error } = await client.from("quotes").upsert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteQuote(id) {
    if (!client) {
      const data = getLocalData();
      data.quotes = data.quotes.filter(item => item.id !== id);
      setLocalData(data);
      return;
    }
    const { error } = await client.from("quotes").delete().eq("id", id);
    if (error) throw error;
  }

  function exportLocalData() {
    return JSON.stringify(getLocalData(), null, 2);
  }

  function importLocalData(raw) {
    if (client) throw new Error("Import is available in Demo Mode only.");
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed?.settings || !Array.isArray(parsed.books) || !Array.isArray(parsed.posts) || !Array.isArray(parsed.quotes)) {
      throw new Error("JSON ဖိုင်ပုံစံ မမှန်ပါ။");
    }
    setLocalData(parsed);
    return parsed;
  }

  function resetLocalData() {
    if (client) throw new Error("Reset is available in Demo Mode only.");
    return setLocalData(cloneDefaults());
  }

  window.AuthorStore = {
    init, mode, getPublicData, getAdminData, signIn, signOut, hasSession,
    saveSettings, saveBook, deleteBook, savePost, deletePost,
    saveQuote, deleteQuote, exportLocalData, importLocalData, resetLocalData,
    defaultData: cloneDefaults
  };
})();
