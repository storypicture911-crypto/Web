(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const today = () => new Date().toISOString().slice(0,10);
  let data = null;
  let appMode = "local";

  function showToast(message, error = false) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.className = `toast show${error ? " error" : ""}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.className = "toast", 3000);
  }

  function formatDate(date) {
    try { return new Intl.DateTimeFormat("my-MM", { year:"numeric", month:"short", day:"numeric" }).format(new Date(`${date}T00:00:00`)); }
    catch { return date || ""; }
  }

  function statusClass(status) { return `status-${String(status || "available").toLowerCase().replace(/\s+/g,"-")}`; }

  async function fileToDataURL(file, maxWidth = 1400, quality = .84) {
    if (!file) return "";
    if (file.size > 5 * 1024 * 1024) throw new Error("ပုံဖိုင်က 5MB ထက်ကြီးနေပါတယ်။");
    const raw = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    const image = await new Promise((resolve,reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = raw; });
    const scale = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  }

  function switchPage(page) {
    $$(".admin-nav button").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
    $$(".admin-page").forEach(panel => panel.classList.toggle("active", panel.dataset.pagePanel === page));
    const active = $(`.admin-nav button[data-page="${page}"]`);
    $("#topbarTitle").textContent = active ? active.textContent.trim() : "Admin";
    $("#adminSidebar").classList.remove("open");
  }

  function openDrawer(title, html) {
    $("#drawerTitle").textContent = title;
    $("#drawerContent").innerHTML = html;
    $("#editorDrawer").classList.add("open");
    $("#editorDrawer").setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    $("#editorDrawer").classList.remove("open");
    $("#editorDrawer").setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }

  function renderDashboard() {
    $("#bookCount").textContent = data.books.length;
    $("#publishedCount").textContent = data.posts.filter(p => p.status === "published").length;
    $("#draftCount").textContent = data.posts.filter(p => p.status === "draft").length;
    $("#quoteCount").textContent = data.quotes.length;
    const recent = [...data.posts].sort((a,b) => String(b.post_date).localeCompare(String(a.post_date))).slice(0,5);
    $("#recentPosts").innerHTML = recent.length ? recent.map(post => `<div class="activity-item"><div><p>${escapeHTML(post.title)}</p><small>${escapeHTML(formatDate(post.post_date))}</small></div><span class="status-pill ${post.status === "published" ? "status-available" : "status-pre-order"}">${escapeHTML(post.status)}</span></div>`).join("") : `<p class="help-text">Blog မရှိသေးပါ။</p>`;
  }

  function renderBooks() {
    const books = [...data.books].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    $("#booksTable").innerHTML = books.length ? books.map(book => `<tr>
      <td><img class="table-cover" src="${escapeHTML(book.cover_image || "assets/book-1.svg")}" alt=""></td>
      <td><div class="table-title">${escapeHTML(book.title)}</div><div class="table-sub">${escapeHTML(book.subtitle || "")}</div></td>
      <td>${escapeHTML(book.published_year || "—")}</td>
      <td><span class="status-pill ${statusClass(book.status)}">${escapeHTML(book.status)}</span></td>
      <td><div class="row-actions"><button class="icon-btn" data-edit-book="${escapeHTML(book.id)}" title="Edit">✎</button><button class="icon-btn danger" data-delete-book="${escapeHTML(book.id)}" title="Delete">⌫</button></div></td>
    </tr>`).join("") : `<tr><td colspan="5">စာအုပ်မရှိသေးပါ။</td></tr>`;
    $$('[data-edit-book]').forEach(btn => btn.addEventListener('click', () => editBook(btn.dataset.editBook)));
    $$('[data-delete-book]').forEach(btn => btn.addEventListener('click', () => removeBook(btn.dataset.deleteBook)));
  }

  function renderPosts() {
    const posts = [...data.posts].sort((a,b) => String(b.post_date).localeCompare(String(a.post_date)));
    $("#postsTable").innerHTML = posts.length ? posts.map(post => `<tr>
      <td><img class="table-thumb" src="${escapeHTML(post.image || "assets/blog-1.svg")}" alt=""></td>
      <td><div class="table-title">${escapeHTML(post.title)}</div><div class="table-sub">${escapeHTML((post.excerpt || "").slice(0,80))}</div></td>
      <td>${escapeHTML(formatDate(post.post_date))}</td>
      <td><span class="status-pill ${post.status === "published" ? "status-available" : "status-pre-order"}">${escapeHTML(post.status)}</span></td>
      <td><div class="row-actions"><button class="icon-btn" data-edit-post="${escapeHTML(post.id)}" title="Edit">✎</button><button class="icon-btn danger" data-delete-post="${escapeHTML(post.id)}" title="Delete">⌫</button></div></td>
    </tr>`).join("") : `<tr><td colspan="5">Blog မရှိသေးပါ။</td></tr>`;
    $$('[data-edit-post]').forEach(btn => btn.addEventListener('click', () => editPost(btn.dataset.editPost)));
    $$('[data-delete-post]').forEach(btn => btn.addEventListener('click', () => removePost(btn.dataset.deletePost)));
  }

  function renderQuotes() {
    const quotes = [...data.quotes].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    $("#quotesTable").innerHTML = quotes.length ? quotes.map(quote => `<tr>
      <td><div class="table-title">“${escapeHTML(quote.quote_text)}”</div></td>
      <td>${escapeHTML(quote.source || "—")}</td><td>${escapeHTML(quote.display_order || 0)}</td>
      <td><div class="row-actions"><button class="icon-btn" data-edit-quote="${escapeHTML(quote.id)}">✎</button><button class="icon-btn danger" data-delete-quote="${escapeHTML(quote.id)}">⌫</button></div></td>
    </tr>`).join("") : `<tr><td colspan="4">Quote မရှိသေးပါ။</td></tr>`;
    $$('[data-edit-quote]').forEach(btn => btn.addEventListener('click', () => editQuote(btn.dataset.editQuote)));
    $$('[data-delete-quote]').forEach(btn => btn.addEventListener('click', () => removeQuote(btn.dataset.deleteQuote)));
  }

  function renderSettings() {
    const s = data.settings;
    Object.entries(s).forEach(([key,value]) => {
      const field = $(`#settingsForm [name="${key}"]`);
      if (field) field.value = value ?? "";
    });
    $("#profilePreview").src = s.profile_image || "assets/author-portrait.svg";
  }

  function renderAll() { renderDashboard(); renderBooks(); renderPosts(); renderQuotes(); renderSettings(); }

  async function reloadData() {
    data = await AuthorStore.getAdminData();
    renderAll();
  }

  function bookForm(book = {}) {
    return `<form id="bookForm">
      <div class="form-grid">
        <input type="hidden" name="id" value="${escapeHTML(book.id || "")}">
        <div class="field full"><label>စာအုပ်အမည်</label><input name="title" required value="${escapeHTML(book.title || "")}"></div>
        <div class="field full"><label>Subtitle / အမျိုးအစား</label><input name="subtitle" value="${escapeHTML(book.subtitle || "")}"></div>
        <div class="field full"><label>အကြောင်းအရာ</label><textarea name="description" rows="6">${escapeHTML(book.description || "")}</textarea></div>
        <div class="field"><label>Cover image URL / path</label><input id="bookCoverUrl" name="cover_image" value="${escapeHTML(book.cover_image || "assets/book-1.svg")}"></div>
        <div class="field"><label>Cover upload</label><input id="bookCoverUpload" type="file" accept="image/*"><img class="image-preview" id="bookCoverPreview" src="${escapeHTML(book.cover_image || "assets/book-1.svg")}" alt="Preview"></div>
        <div class="field"><label>ထုတ်ဝေသည့်နှစ်</label><input name="published_year" type="number" min="1900" max="2100" value="${escapeHTML(book.published_year || new Date().getFullYear())}"></div>
        <div class="field"><label>Status</label><select name="status"><option${book.status === "Available" ? " selected" : ""}>Available</option><option${book.status === "Pre-order" ? " selected" : ""}>Pre-order</option><option${book.status === "Sold Out" ? " selected" : ""}>Sold Out</option></select></div>
        <div class="field"><label>Display order</label><input name="display_order" type="number" value="${escapeHTML(book.display_order || data.books.length + 1)}"></div>
        <div class="field"><label>Buy link</label><input name="buy_url" type="url" value="${escapeHTML(book.buy_url === "#" ? "" : book.buy_url || "")}" placeholder="https://..."></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-secondary" data-close-drawer>မလုပ်တော့ပါ</button><button class="btn btn-primary" type="submit">စာအုပ် သိမ်းမယ်</button></div>
    </form>`;
  }

  function editBook(id = "") {
    const book = data.books.find(item => item.id === id) || {};
    openDrawer(id ? "စာအုပ်ပြင်ရန်" : "စာအုပ်အသစ်ထည့်ရန်", bookForm(book));
    const url = $("#bookCoverUrl"), upload = $("#bookCoverUpload"), preview = $("#bookCoverPreview");
    url.addEventListener("input", () => preview.src = url.value || "assets/book-1.svg");
    upload.addEventListener("change", async () => { try { const image = await fileToDataURL(upload.files[0], 900, .86); if (image) { url.value = image; preview.src = image; } } catch (e) { showToast(e.message,true); } });
    $("#bookForm").addEventListener("submit", saveBookForm);
    $$('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
  }

  async function saveBookForm(event) {
    event.preventDefault();
    const book = Object.fromEntries(new FormData(event.currentTarget));
    try { await AuthorStore.saveBook(book); await reloadData(); closeDrawer(); showToast("စာအုပ်ကို သိမ်းပြီးပါပြီ။"); }
    catch (error) { showToast(error.message || "Save မရပါ။",true); }
  }

  async function removeBook(id) {
    const book = data.books.find(item => item.id === id); if (!book) return;
    const typed = prompt(`မှားမဖျက်မိစေရန် စာအုပ်အမည်ကို အတိအကျ ရိုက်ပါ။\n\n${book.title}`);
    if (typed !== book.title) { if (typed !== null) showToast("စာအုပ်အမည် မကိုက်ညီသဖြင့် မဖျက်ပါ။",true); return; }
    try { await AuthorStore.deleteBook(id); await reloadData(); showToast("စာအုပ်ကို ဖျက်ပြီးပါပြီ။"); } catch (error) { showToast(error.message,true); }
  }

  function postForm(post = {}) {
    return `<form id="postForm">
      <div class="form-grid">
        <input type="hidden" name="id" value="${escapeHTML(post.id || "")}">
        <div class="field full"><label>Blog ခေါင်းစဉ်</label><input name="title" required value="${escapeHTML(post.title || "")}"></div>
        <div class="field full"><label>အကျဉ်းချုပ်</label><textarea name="excerpt" rows="3">${escapeHTML(post.excerpt || "")}</textarea></div>
        <div class="field full"><label>စာအပြည့်အစုံ</label><textarea name="content" rows="13" required>${escapeHTML(post.content || "")}</textarea></div>
        <div class="field"><label>Cover image URL / path</label><input id="postImageUrl" name="image" value="${escapeHTML(post.image || "assets/blog-1.svg")}"></div>
        <div class="field"><label>Image upload</label><input id="postImageUpload" type="file" accept="image/*"><img class="table-thumb" style="width:160px;height:95px" id="postImagePreview" src="${escapeHTML(post.image || "assets/blog-1.svg")}" alt="Preview"></div>
        <div class="field"><label>တင်မည့်ရက်</label><input name="post_date" type="date" value="${escapeHTML(post.post_date || today())}"></div>
        <div class="field"><label>Status</label><select name="status"><option value="draft"${post.status === "draft" ? " selected" : ""}>Draft</option><option value="published"${post.status === "published" || !post.status ? " selected" : ""}>Published</option></select></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-secondary" data-close-drawer>မလုပ်တော့ပါ</button><button class="btn btn-primary" type="submit">Blog သိမ်းမယ်</button></div>
    </form>`;
  }

  function editPost(id = "") {
    const post = data.posts.find(item => item.id === id) || {};
    openDrawer(id ? "Blog ပြင်ရန်" : "Blog အသစ်ရေးရန်", postForm(post));
    const url = $("#postImageUrl"), upload = $("#postImageUpload"), preview = $("#postImagePreview");
    url.addEventListener("input", () => preview.src = url.value || "assets/blog-1.svg");
    upload.addEventListener("change", async () => { try { const image = await fileToDataURL(upload.files[0], 1400, .82); if (image) { url.value = image; preview.src = image; } } catch (e) { showToast(e.message,true); } });
    $("#postForm").addEventListener("submit", savePostForm);
    $$('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
  }

  async function savePostForm(event) {
    event.preventDefault();
    const post = Object.fromEntries(new FormData(event.currentTarget));
    try { await AuthorStore.savePost(post); await reloadData(); closeDrawer(); showToast(post.status === "published" ? "Blog ကို Publish လုပ်ပြီးပါပြီ။" : "Draft သိမ်းပြီးပါပြီ။"); }
    catch (error) { showToast(error.message || "Save မရပါ။",true); }
  }

  async function removePost(id) {
    const post = data.posts.find(item => item.id === id); if (!post) return;
    const typed = prompt(`မှားမဖျက်မိစေရန် Blog ခေါင်းစဉ်ကို အတိအကျ ရိုက်ပါ။\n\n${post.title}`);
    if (typed !== post.title) { if (typed !== null) showToast("ခေါင်းစဉ် မကိုက်ညီသဖြင့် မဖျက်ပါ။",true); return; }
    try { await AuthorStore.deletePost(id); await reloadData(); showToast("Blog ကို ဖျက်ပြီးပါပြီ။"); } catch (error) { showToast(error.message,true); }
  }

  function quoteForm(quote = {}) {
    return `<form id="quoteForm"><div class="form-grid"><input type="hidden" name="id" value="${escapeHTML(quote.id || "")}"><div class="field full"><label>Quote စာသား</label><textarea name="quote_text" rows="6" required>${escapeHTML(quote.quote_text || "")}</textarea></div><div class="field"><label>Source / စာအုပ်အမည်</label><input name="source" value="${escapeHTML(quote.source || "")}"></div><div class="field"><label>Display order</label><input name="display_order" type="number" value="${escapeHTML(quote.display_order || data.quotes.length + 1)}"></div></div><div class="form-actions"><button type="button" class="btn btn-secondary" data-close-drawer>မလုပ်တော့ပါ</button><button class="btn btn-primary" type="submit">Quote သိမ်းမယ်</button></div></form>`;
  }

  function editQuote(id = "") {
    const quote = data.quotes.find(item => item.id === id) || {};
    openDrawer(id ? "Quote ပြင်ရန်" : "Quote အသစ်ထည့်ရန်", quoteForm(quote));
    $("#quoteForm").addEventListener("submit", saveQuoteForm);
    $$('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
  }

  async function saveQuoteForm(event) {
    event.preventDefault();
    try { await AuthorStore.saveQuote(Object.fromEntries(new FormData(event.currentTarget))); await reloadData(); closeDrawer(); showToast("Quote သိမ်းပြီးပါပြီ။"); }
    catch (error) { showToast(error.message,true); }
  }

  async function removeQuote(id) {
    const quote = data.quotes.find(item => item.id === id); if (!quote) return;
    if (!confirm(`ဒီ Quote ကို ဖျက်မှာ သေချာပါသလား?\n\n“${quote.quote_text}”`)) return;
    try { await AuthorStore.deleteQuote(id); await reloadData(); showToast("Quote ဖျက်ပြီးပါပြီ။"); } catch (error) { showToast(error.message,true); }
  }

  async function initialize() {
    try {
      appMode = await AuthorStore.init();
      const live = appMode === "supabase";
      $("#loginModeBadge").classList.toggle("live", live);
      $("#loginModeBadge span:last-child").textContent = live ? "Supabase Live Mode" : "Browser Demo Mode";
      $("#supabaseLoginFields").hidden = !live;
      $("#demoLoginFields").hidden = live;
      $("#sidebarMode").textContent = live ? "Supabase Live" : "Demo Mode";
      $("#topbarMode").textContent = live ? "Changes publish to shared database" : "Changes save in this browser only";
      $("#dataModeNotice").textContent = live ? "Supabase Live Mode ဖြစ်သောကြောင့် JSON import/reset ကို ပိတ်ထားပါတယ်။ Database backup ကို Supabase dashboard ကနေ ပြုလုပ်ပါ။" : "Demo Mode: ပြင်ဆင်မှုတွေက ဒီ browser/device ထဲမှာပဲ သိမ်းမယ်။ တခြားလူတွေ၊ တခြားဖုန်းတွေမှာ မမြင်ရပါ။ Live publish အတွက် README အတိုင်း Supabase ချိတ်ပါ။";
      $("#exportButton").disabled = live; $("#importFile").disabled = live; $("#resetButton").disabled = live;
      if (await AuthorStore.hasSession()) await showAdmin();
    } catch (error) { showToast(error.message || "App စတင်၍မရပါ။",true); }
  }

  async function showAdmin() {
    $("#loginScreen").style.display = "none";
    $("#adminApp").classList.add("active");
    await reloadData();
  }

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await AuthorStore.signIn({ email:$("#adminEmail").value, password:$("#adminPassword").value, pin:$("#adminPin").value });
      await showAdmin(); showToast("Admin dashboard သို့ ဝင်ပြီးပါပြီ။");
    } catch (error) { showToast(error.message || "Login မအောင်မြင်ပါ။",true); }
  });

  $$(".admin-nav button").forEach(btn => btn.addEventListener("click", () => switchPage(btn.dataset.page)));
  $$('[data-page-jump]').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.pageJump)));
  $$('[data-new="book"]').forEach(btn => btn.addEventListener('click', () => editBook()));
  $$('[data-new="post"]').forEach(btn => btn.addEventListener('click', () => editPost()));
  $$('[data-new="quote"]').forEach(btn => btn.addEventListener('click', () => editQuote()));
  $$('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
  $("#adminMenuToggle").addEventListener("click", () => $("#adminSidebar").classList.toggle("open"));

  $("#settingsForm").addEventListener("submit", async event => {
    event.preventDefault();
    try { await AuthorStore.saveSettings(Object.fromEntries(new FormData(event.currentTarget))); await reloadData(); showToast("Site settings သိမ်းပြီးပါပြီ။"); }
    catch (error) { showToast(error.message || "Settings မသိမ်းနိုင်ပါ။",true); }
  });
  $("#profileImage").addEventListener("input", () => $("#profilePreview").src = $("#profileImage").value || "assets/author-portrait.svg");
  $("#profileUpload").addEventListener("change", async () => { try { const image = await fileToDataURL($("#profileUpload").files[0], 1100, .85); if (image) { $("#profileImage").value = image; $("#profilePreview").src = image; } } catch (error) { showToast(error.message,true); } });

  $("#exportButton").addEventListener("click", () => {
    try { const blob = new Blob([AuthorStore.exportLocalData()], {type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`author-studio-backup-${today()}.json`; a.click(); URL.revokeObjectURL(url); showToast("Backup export လုပ်ပြီးပါပြီ။"); } catch (error) { showToast(error.message,true); }
  });
  $("#importFile").addEventListener("change", async event => {
    const file = event.target.files[0]; if (!file) return;
    if (!confirm("Import လုပ်ရင် လက်ရှိ Demo data ကို အစားထိုးပါမယ်။ ဆက်လုပ်မလား?")) return;
    try { AuthorStore.importLocalData(await file.text()); await reloadData(); showToast("Backup import လုပ်ပြီးပါပြီ။"); } catch (error) { showToast(error.message,true); } finally { event.target.value=""; }
  });
  $("#resetButton").addEventListener("click", async () => {
    const typed = prompt("Demo data အားလုံး reset လုပ်ရန် RESET လို့ ရိုက်ပါ။"); if (typed !== "RESET") return;
    try { AuthorStore.resetLocalData(); await reloadData(); showToast("Demo data ကို reset လုပ်ပြီးပါပြီ။"); } catch (error) { showToast(error.message,true); }
  });
  $("#logoutButton").addEventListener("click", async () => { await AuthorStore.signOut(); location.reload(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  initialize();
})();
