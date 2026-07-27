(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
  const today = () => new Date().toISOString().slice(0,10);
  const safeImage = (value, fallback) => value || fallback;
  let data = null;
  let appMode = "local";
  let currentUser = null;

  function showToast(message, error = false) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.className = `toast show${error ? " error" : ""}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.className = "toast", 3200);
  }

  function formatPrice(book) {
    if (book.is_free) return "FREE";
    if (book.price == null || book.price === "") return "No price";
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits:2 }).format(Number(book.price))} ${book.currency || "MMK"}`;
  }

  function setBusy(button, busy, text = "သိမ်းနေသည်…") {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = text;
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  function openDrawer(title, content) {
    $("#drawerTitle").textContent = title;
    $("#drawerContent").innerHTML = content;
    $("#editorDrawer").classList.add("open");
    $("#editorDrawer").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    $("#editorDrawer").classList.remove("open");
    $("#editorDrawer").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setPage(page) {
    $$('[data-page]').forEach(button => button.classList.toggle("active", button.dataset.page === page));
    $$('[data-page-panel]').forEach(panel => panel.classList.toggle("active", panel.dataset.pagePanel === page));
    $("#adminSidebar").classList.remove("open");
    if (page === "dashboard") loadAnalytics();
  }

  function renderAll() {
    renderBooks();
    renderPosts();
    renderQuotes();
    populateSettings();
    updateDataModeNotice();
  }

  function renderBooks() {
    const list = $("#booksList");
    const books = [...(data?.books || [])].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    list.innerHTML = books.length ? books.map(book => `
      <article class="content-row">
        <div class="content-thumb"><img src="${escapeHTML(safeImage(book.cover_image,"assets/book-1.svg"))}" alt=""></div>
        <div class="content-info"><h4>${escapeHTML(book.title)}</h4><p>${escapeHTML(book.category || "စာအုပ်")} · ${escapeHTML(formatPrice(book))} · ${escapeHTML(book.status || "Available")}</p></div>
        <div class="row-actions">
          <button class="icon-button" type="button" data-edit-book="${escapeHTML(book.id)}" aria-label="Edit">✎</button>
          <button class="icon-button danger" type="button" data-delete-book="${escapeHTML(book.id)}" aria-label="Delete">⌫</button>
        </div>
      </article>`).join("") : '<div class="empty-state">စာအုပ်မရှိသေးပါ။</div>';
    $$('[data-edit-book]').forEach(button => button.addEventListener("click", () => openBookEditor(books.find(item => String(item.id) === button.dataset.editBook))));
    $$('[data-delete-book]').forEach(button => button.addEventListener("click", () => openDeleteConfirm("book", books.find(item => String(item.id) === button.dataset.deleteBook))));
  }

  function renderPosts() {
    const posts = [...(data?.posts || [])].sort((a,b) => `${b.post_date || ""}${b.created_at || ""}`.localeCompare(`${a.post_date || ""}${a.created_at || ""}`));
    $("#postsList").innerHTML = posts.length ? posts.map(post => `
      <article class="content-row">
        <div class="content-thumb wide"><img src="${escapeHTML(safeImage(post.image,"assets/blog-1.svg"))}" alt=""></div>
        <div class="content-info"><h4>${escapeHTML(post.title)}</h4><p>${escapeHTML(post.post_date || "")} · ${escapeHTML(post.category || "Journal")} · ${escapeHTML(post.status || "draft")}</p></div>
        <div class="row-actions">
          <button class="icon-button" type="button" data-edit-post="${escapeHTML(post.id)}" aria-label="Edit">✎</button>
          <button class="icon-button danger" type="button" data-delete-post="${escapeHTML(post.id)}" aria-label="Delete">⌫</button>
        </div>
      </article>`).join("") : '<div class="empty-state">Blog မရှိသေးပါ။</div>';
    $$('[data-edit-post]').forEach(button => button.addEventListener("click", () => openPostEditor(posts.find(item => String(item.id) === button.dataset.editPost))));
    $$('[data-delete-post]').forEach(button => button.addEventListener("click", () => openDeleteConfirm("post", posts.find(item => String(item.id) === button.dataset.deletePost))));
  }

  function renderQuotes() {
    const quotes = [...(data?.quotes || [])].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    $("#quotesList").innerHTML = quotes.length ? quotes.map(quote => `
      <article class="content-row">
        <div class="content-thumb" style="display:grid;place-items:center;font-family:Georgia;font-size:2rem;color:#6d2837">“</div>
        <div class="content-info"><h4>${escapeHTML(quote.quote_text)}</h4><p>${escapeHTML(quote.source || "No source")} · Order ${escapeHTML(quote.display_order || 0)}</p></div>
        <div class="row-actions">
          <button class="icon-button" type="button" data-edit-quote="${escapeHTML(quote.id)}" aria-label="Edit">✎</button>
          <button class="icon-button danger" type="button" data-delete-quote="${escapeHTML(quote.id)}" aria-label="Delete">⌫</button>
        </div>
      </article>`).join("") : '<div class="empty-state">Quote မရှိသေးပါ။</div>';
    $$('[data-edit-quote]').forEach(button => button.addEventListener("click", () => openQuoteEditor(quotes.find(item => String(item.id) === button.dataset.editQuote))));
    $$('[data-delete-quote]').forEach(button => button.addEventListener("click", () => openDeleteConfirm("quote", quotes.find(item => String(item.id) === button.dataset.deleteQuote))));
  }

  function bookForm(book = {}) {
    return `
      <form class="editor-form" id="bookForm">
        <input type="hidden" name="id" value="${escapeHTML(book.id || "")}">
        <div class="form-grid">
          <div class="field full"><label>စာအုပ်အမည်</label><input name="title" value="${escapeHTML(book.title || "")}" required></div>
          <div class="field"><label>Subtitle</label><input name="subtitle" value="${escapeHTML(book.subtitle || "")}"></div>
          <div class="field"><label>Category</label><input name="category" value="${escapeHTML(book.category || "")}" placeholder="ဝတ္ထု / ကဗျာ / အက်ဆေး"></div>
          <div class="field full"><label>Description</label><textarea name="description">${escapeHTML(book.description || "")}</textarea></div>
          <div class="field"><label>Status</label><select name="status"><option ${book.status === "Available" ? "selected" : ""}>Available</option><option ${book.status === "Pre-order" ? "selected" : ""}>Pre-order</option><option ${book.status === "Sold Out" ? "selected" : ""}>Sold Out</option></select></div>
          <div class="field"><label>Published year</label><input name="published_year" type="number" min="1900" max="2200" value="${escapeHTML(book.published_year || new Date().getFullYear())}"></div>
          <div class="field"><label>Price</label><input name="price" type="number" min="0" step="0.01" value="${escapeHTML(book.price ?? "")}" placeholder="12000"></div>
          <div class="field"><label>Currency</label><input name="currency" value="${escapeHTML(book.currency || "MMK")}" placeholder="MMK"></div>
          <label class="check-field full"><input id="isFreeBook" name="is_free" type="checkbox" ${book.is_free ? "checked" : ""}><span>ဒီစာအုပ်ကို FREE အဖြစ်ပြမယ်</span></label>
          <div class="field full" id="freeContentField"><label>Free online reading content</label><textarea class="tall" name="free_content" placeholder="Blog ပုံစံတန်းဖတ်မည့် စာအပြည့်အစုံ…">${escapeHTML(book.free_content || "")}</textarea><small>FREE စာအုပ်မှာ ဒီစာကို Website modal reader ထဲ တန်းဖတ်နိုင်ပါတယ်။</small></div>
          <div class="field full"><label>Buy link</label><input name="buy_url" type="url" value="${escapeHTML(book.buy_url || "")}" placeholder="https://..."></div>
          <div class="field full upload-preview"><div><label>Cover image upload</label><input id="bookCoverFile" type="file" accept="image/*"><input id="bookCoverUrl" name="cover_image" value="${escapeHTML(book.cover_image || "")}" placeholder="assets/book-1.svg or https://..."></div><img id="bookCoverPreview" src="${escapeHTML(safeImage(book.cover_image,"assets/book-1.svg"))}" alt="Cover preview"></div>
          <div class="field full"><label>PDF upload</label><input id="bookPdfFile" type="file" accept="application/pdf"><small>Supabase Storage သို့ upload လုပ်ပြီး public PDF URL ကိုသိမ်းပါမယ်။ Max 50MB.</small></div>
          <div class="field full"><label>PDF URL</label><input id="bookPdfUrl" name="pdf_url" type="url" value="${escapeHTML(book.pdf_url || "")}" placeholder="https://...pdf"></div>
          <div class="field"><label>Display order</label><input name="display_order" type="number" value="${escapeHTML(book.display_order || 0)}"></div>
        </div>
        <div class="form-actions"><button class="btn btn-secondary" type="button" data-close-drawer>Cancel</button><button class="btn btn-primary" type="submit">စာအုပ် သိမ်းမယ်</button></div>
      </form>`;
  }

  function openBookEditor(book = null) {
    openDrawer(book ? "စာအုပ်ပြင်မယ်" : "စာအုပ်အသစ်", bookForm(book || {}));
    const form = $("#bookForm");
    const toggleFree = () => {
      $("#freeContentField").style.opacity = $("#isFreeBook").checked ? "1" : ".65";
      form.elements.price.disabled = $("#isFreeBook").checked;
    };
    $("#isFreeBook").addEventListener("change", toggleFree);
    toggleFree();
    bindPreview("#bookCoverFile", "#bookCoverPreview");
    form.addEventListener("submit", saveBookFromForm);
    $$('[data-close-drawer]').forEach(el => el.addEventListener("click", closeDrawer));
  }

  async function saveBookFromForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    setBusy(button, true);
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      values.is_free = form.elements.is_free.checked;
      const coverFile = $("#bookCoverFile").files[0];
      const pdfFile = $("#bookPdfFile").files[0];
      if (coverFile) values.cover_image = await AuthorStore.uploadAsset(coverFile, "book-covers");
      if (pdfFile) values.pdf_url = await AuthorStore.uploadAsset(pdfFile, "book-pdfs");
      await AuthorStore.saveBook(values);
      await reloadData();
      closeDrawer();
      showToast("စာအုပ် သိမ်းပြီးပါပြီ။");
    } catch (error) {
      console.error(error);
      showToast(error.message || "စာအုပ် သိမ်းမရပါ။", true);
    } finally { setBusy(button, false); }
  }

  function postForm(post = {}) {
    return `
      <form class="editor-form" id="postForm">
        <input type="hidden" name="id" value="${escapeHTML(post.id || "")}">
        <div class="form-grid">
          <div class="field full"><label>Blog ခေါင်းစဉ်</label><input name="title" value="${escapeHTML(post.title || "")}" required></div>
          <div class="field"><label>Category</label><input name="category" value="${escapeHTML(post.category || "")}" placeholder="Writing"></div>
          <div class="field"><label>Date</label><input name="post_date" type="date" value="${escapeHTML(post.post_date || today())}" required></div>
          <div class="field"><label>Status</label><select name="status"><option value="draft" ${post.status !== "published" ? "selected" : ""}>Draft</option><option value="published" ${post.status === "published" ? "selected" : ""}>Published</option></select></div>
          <div class="field full"><label>Excerpt</label><textarea name="excerpt">${escapeHTML(post.excerpt || "")}</textarea></div>
          <div class="field full"><label>Blog စာအပြည့်အစုံ</label><textarea class="tall" name="content" required>${escapeHTML(post.content || "")}</textarea></div>
          <div class="field full upload-preview"><div><label>Blog image upload</label><input id="postImageFile" type="file" accept="image/*"><input id="postImageUrl" name="image" value="${escapeHTML(post.image || "")}" placeholder="assets/blog-1.svg or https://..."></div><img id="postImagePreview" src="${escapeHTML(safeImage(post.image,"assets/blog-1.svg"))}" alt="Blog preview"></div>
        </div>
        <div class="notice">Published လုပ်တဲ့အချိန် Public site ဖွင့်ထားပြီး Notification ခွင့်ပြုထားတဲ့ user တွေကို Realtime browser notification ပြပါမယ်။</div>
        <div class="form-actions"><button class="btn btn-secondary" type="button" data-close-drawer>Cancel</button><button class="btn btn-primary" type="submit">Blog သိမ်းမယ်</button></div>
      </form>`;
  }

  function openPostEditor(post = null) {
    openDrawer(post ? "Blog ပြင်မယ်" : "Blog အသစ်", postForm(post || {}));
    bindPreview("#postImageFile", "#postImagePreview");
    $("#postForm").addEventListener("submit", savePostFromForm);
    $$('[data-close-drawer]').forEach(el => el.addEventListener("click", closeDrawer));
  }

  async function savePostFromForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    setBusy(button, true);
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      const imageFile = $("#postImageFile").files[0];
      if (imageFile) values.image = await AuthorStore.uploadAsset(imageFile, "blog-images");
      await AuthorStore.savePost(values);
      await reloadData();
      closeDrawer();
      showToast(values.status === "published" ? "Blog publish လုပ်ပြီးပါပြီ။" : "Blog draft သိမ်းပြီးပါပြီ။");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Blog သိမ်းမရပါ။", true);
    } finally { setBusy(button, false); }
  }

  function quoteForm(quote = {}) {
    return `
      <form class="editor-form" id="quoteForm">
        <input type="hidden" name="id" value="${escapeHTML(quote.id || "")}">
        <div class="field"><label>Quote</label><textarea class="tall" name="quote_text" required>${escapeHTML(quote.quote_text || "")}</textarea></div>
        <div class="field"><label>Source / Book title</label><input name="source" value="${escapeHTML(quote.source || "")}"></div>
        <div class="field"><label>Display order</label><input name="display_order" type="number" value="${escapeHTML(quote.display_order || 0)}"></div>
        <div class="form-actions"><button class="btn btn-secondary" type="button" data-close-drawer>Cancel</button><button class="btn btn-primary" type="submit">Quote သိမ်းမယ်</button></div>
      </form>`;
  }

  function openQuoteEditor(quote = null) {
    openDrawer(quote ? "Quote ပြင်မယ်" : "Quote အသစ်", quoteForm(quote || {}));
    $("#quoteForm").addEventListener("submit", async event => {
      event.preventDefault();
      const button = event.currentTarget.querySelector('[type="submit"]');
      setBusy(button, true);
      try {
        await AuthorStore.saveQuote(Object.fromEntries(new FormData(event.currentTarget).entries()));
        await reloadData();
        closeDrawer();
        showToast("Quote သိမ်းပြီးပါပြီ။");
      } catch (error) { showToast(error.message || "Quote သိမ်းမရပါ။", true); }
      finally { setBusy(button, false); }
    });
    $$('[data-close-drawer]').forEach(el => el.addEventListener("click", closeDrawer));
  }

  function openDeleteConfirm(type, item) {
    if (!item) return;
    const title = type === "quote" ? item.quote_text : item.title;
    openDrawer("ဖျက်ရန်အတည်ပြုပါ", `
      <div class="delete-confirm">
        <strong>ဒီအချက်အလက်ကို ပြန်ယူလို့မရပါ။</strong>
        <p>ဖျက်မည့်ခေါင်းစဉ်ကို အတိအကျရိုက်ပါ။</p>
        <code>${escapeHTML(title)}</code>
        <div class="field"><label>Confirmation</label><input id="deleteConfirmInput" autocomplete="off"></div>
        <button class="btn btn-danger" id="confirmDeleteButton" type="button" disabled>အပြီးဖျက်မယ်</button>
      </div>`);
    const input = $("#deleteConfirmInput");
    const button = $("#confirmDeleteButton");
    input.addEventListener("input", () => button.disabled = input.value !== title);
    button.addEventListener("click", async () => {
      setBusy(button, true, "ဖျက်နေသည်…");
      try {
        if (type === "book") await AuthorStore.deleteBook(item.id);
        else if (type === "post") await AuthorStore.deletePost(item.id);
        else await AuthorStore.deleteQuote(item.id);
        await reloadData();
        closeDrawer();
        showToast("ဖျက်ပြီးပါပြီ။");
      } catch (error) { showToast(error.message || "ဖျက်မရပါ။", true); }
      finally { setBusy(button, false); }
    });
  }

  function bindPreview(inputSelector, imageSelector) {
    const input = $(inputSelector);
    const image = $(imageSelector);
    input?.addEventListener("change", () => {
      const file = input.files[0];
      if (file) image.src = URL.createObjectURL(file);
    });
  }

  function populateSettings() {
    const s = data?.settings || {};
    const form = $("#settingsForm");
    ["site_title","author_name","author_role","tagline","hero_quote","bio","hero_image","about_image","facebook","tiktok","instagram","telegram","email"].forEach(name => {
      if (form.elements[name]) form.elements[name].value = s[name] || "";
    });
    $("#heroImagePreview").src = safeImage(s.hero_image,"assets/author-hero.svg");
    $("#aboutImagePreview").src = safeImage(s.about_image,"assets/author-about.svg");
  }

  async function saveSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    setBusy(button, true);
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      const heroFile = $("#heroImageUpload").files[0];
      const aboutFile = $("#aboutImageUpload").files[0];
      if (heroFile) values.hero_image = await AuthorStore.uploadAsset(heroFile, "author-images");
      if (aboutFile) values.about_image = await AuthorStore.uploadAsset(aboutFile, "author-images");
      await AuthorStore.saveSettings(values);
      await reloadData();
      showToast("Website settings သိမ်းပြီးပါပြီ။");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Settings သိမ်းမရပါ။", true);
    } finally { setBusy(button, false); }
  }

  function renderRankList(selector, items) {
    const el = $(selector);
    el.innerHTML = (items || []).length ? items.map((item,index) => `
      <div class="rank-item"><span class="rank-number">${index + 1}</span><strong title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</strong><span>${escapeHTML(item.views || 0)} views</span></div>
    `).join("") : '<div class="notice">View data မရှိသေးပါ။</div>';
  }

  async function loadAnalytics() {
    if (!data) return;
    try {
      const analytics = await AuthorStore.getAnalytics(data);
      $("#totalVisits").textContent = Number(analytics.total_visits || 0).toLocaleString("en-US");
      $("#uniqueVisitors").textContent = Number(analytics.unique_visitors || 0).toLocaleString("en-US");
      $("#todayVisits").textContent = Number(analytics.today_visits || 0).toLocaleString("en-US");
      $("#activeNow").textContent = Number(analytics.active_now || 0).toLocaleString("en-US");
      $("#subscriberCount").textContent = Number(analytics.subscriber_count || 0).toLocaleString("en-US");
      const days = analytics.last_7_days || [];
      const max = Math.max(1, ...days.map(day => Number(day.visits || 0)));
      $("#visitsChart").innerHTML = days.map(day => {
        const height = Math.max(5, Math.round(Number(day.visits || 0) / max * 160));
        const label = new Date(`${day.day}T12:00:00`).toLocaleDateString("en-US", { weekday:"short" });
        return `<div class="chart-column" title="${escapeHTML(day.visits || 0)} visits"><div class="chart-bar" style="height:${height}px"></div><small>${escapeHTML(label)}</small></div>`;
      }).join("");
      renderRankList("#topPosts", analytics.top_posts);
      renderRankList("#topBooks", analytics.top_books);
    } catch (error) {
      console.error(error);
      showToast("Analytics ဖတ်မရပါ။ schema.sql ကို အပြည့် run ထားလား စစ်ပါ။", true);
    }
  }

  function updateDataModeNotice() {
    const notice = $("#dataModeNotice");
    if (appMode === "supabase") {
      notice.className = "notice";
      notice.textContent = "LIVE Supabase Mode — data, uploads နဲ့ analytics တွေဟာ Supabase project ထဲမှာ သိမ်းပါမယ်။ JSON export/import buttons က Demo Mode အတွက်သာဖြစ်ပါတယ်။";
      $("#exportButton").disabled = true;
      $("#importFile").disabled = true;
    } else {
      notice.className = "notice error";
      notice.textContent = "LOCAL Demo Mode — ဒီ browser ထဲမှာပဲ သိမ်းပါမယ်။ Live website အတွက် config.js + schema.sql ကိုအသုံးပြုပါ။";
      $("#exportButton").disabled = false;
      $("#importFile").disabled = false;
    }
  }

  async function reloadData() {
    data = await AuthorStore.getAdminData();
    renderAll();
    await loadAnalytics();
  }

  async function showAdmin(session) {
    currentUser = session?.user || session?.session?.user || null;
    $("#loginScreen").hidden = true;
    $("#adminApp").hidden = false;
    $("#sidebarMode").textContent = appMode === "supabase" ? "SUPABASE LIVE" : "LOCAL DEMO";
    $("#connectionText").textContent = appMode === "supabase" ? "Supabase ချိတ်ဆက်ထားသည်" : "Demo Mode";
    $("#adminUserEmail").textContent = currentUser?.email || "Demo admin";
    try {
      await reloadData();
    } catch (error) {
      console.error(error);
      showToast("Admin data မဖတ်နိုင်ပါ။ Supabase မှာ schema.sql run ထားပြီး Auth user ဖန်တီးထားလား စစ်ပါ။", true);
      setPage("data");
    }
  }

  async function initialize() {
    appMode = await AuthorStore.init();
    $("#loginModeBadge").textContent = appMode === "supabase" ? "SUPABASE LIVE MODE" : "LOCAL DEMO MODE";
    if (appMode === "local") {
      $("#emailField").hidden = true;
      $("#passwordLabel").textContent = "Demo PIN";
      $("#loginHelp").textContent = `Demo PIN: ${(window.APP_CONFIG || {}).DEMO_ADMIN_PIN || "2468"}`;
    }
    try {
      const session = await AuthorStore.getSession();
      if (session || (appMode === "local" && sessionStorage.getItem("author-demo-admin") === "1")) await showAdmin(session);
    } catch (error) { console.warn(error); }
  }

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('[type="submit"]');
    setBusy(button, true, "Login ဝင်နေသည်…");
    try {
      const result = await AuthorStore.signIn($("#loginEmail").value.trim(), $("#loginPassword").value);
      await showAdmin(result.session || result);
    } catch (error) {
      console.error(error);
      showToast(error.message || "Login မအောင်မြင်ပါ။", true);
    } finally { setBusy(button, false); }
  });

  $("#logoutButton").addEventListener("click", async () => {
    try { await AuthorStore.signOut(); location.reload(); }
    catch (error) { showToast(error.message || "Logout မရပါ။", true); }
  });
  $$('[data-page]').forEach(button => button.addEventListener("click", () => setPage(button.dataset.page)));
  $("#adminMenuToggle").addEventListener("click", () => $("#adminSidebar").classList.toggle("open"));
  $("#addBookButton").addEventListener("click", () => openBookEditor());
  $("#addPostButton").addEventListener("click", () => openPostEditor());
  $("#addQuoteButton").addEventListener("click", () => openQuoteEditor());
  $("#settingsForm").addEventListener("submit", saveSettings);
  bindPreview("#heroImageUpload", "#heroImagePreview");
  bindPreview("#aboutImageUpload", "#aboutImagePreview");
  $("#refreshAnalytics").addEventListener("click", loadAnalytics);
  $$('[data-close-drawer]').forEach(el => el.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeDrawer(); });
  $("#exportButton").addEventListener("click", () => {
    if (appMode !== "local") return;
    const blob = new Blob([AuthorStore.exportLocal()], { type:"application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `author-studio-backup-${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
  $("#importFile").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file || appMode !== "local") return;
    try {
      AuthorStore.importLocal(await file.text());
      await reloadData();
      showToast("Backup import ပြီးပါပြီ။");
    } catch (error) { showToast(error.message || "Import မရပါ။", true); }
    event.target.value = "";
  });

  initialize();
})();
