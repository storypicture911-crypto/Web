(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
  const safeImage = (value, fallback) => safeUrl(value) || fallback;
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  let currentData = null;
  let sessionId = sessionStorage.getItem("author-visitor-session");
  let stopRealtime = () => {};

  if (!sessionId) {
    sessionId = uid();
    sessionStorage.setItem("author-visitor-session", sessionId);
  }

  const icons = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.1 0-5 1.9-5 5v2H6v4h3v7h4v-7h3.2l.8-4h-4V9c0-.7.3-1 1-1Z"></path></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3c.4 2.2 1.7 3.7 4 4v4c-1.5 0-2.8-.4-4-1.2v6.1a6.1 6.1 0 1 1-5.2-6V14a2.2 2.2 0 1 0 1.2 2V3h4Z"></path></svg>',
    telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 4-3 16-6-4-3 3-1-5-5-2 18-8Zm-12.4 9.3 1 3.3 1.3-2.2 5.8-6.1-8.1 5Z"></path></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>'
  };

  function safeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw || raw === "#") return "";
    if (/^(https?:|mailto:|data:image\/|data:application\/pdf)/i.test(raw)) return raw;
    if (/^(assets\/|\.\/|\/)/.test(raw)) return raw;
    return "";
  }

  function showToast(message, error = false) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.className = `toast show${error ? " error" : ""}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.className = "toast", 3200);
  }

  function formatDate(date) {
    try {
      return new Intl.DateTimeFormat("my-MM", { year:"numeric", month:"long", day:"numeric" }).format(new Date(`${date}T12:00:00`));
    } catch { return String(date || ""); }
  }

  function relativeDateLabel(date) {
    const target = new Date(`${date}T00:00:00`);
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.floor((startToday - target) / 86400000);
    if (diff <= 0) return "ယနေ့";
    if (diff <= 6) return "ယခုတစ်ပတ်";
    if (diff <= 30) return "ယခုလ";
    return "မှတ်တမ်းဟောင်း";
  }

  function formatPrice(book) {
    if (book.is_free) return "FREE";
    if (book.price == null || book.price === "") return "ဈေးနှုန်းမသတ်မှတ်ရသေး";
    const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(book.price));
    return `${amount} ${book.currency || "MMK"}`;
  }

  function statusClass(status) {
    return `status-${String(status || "available").toLowerCase().replace(/\s+/g, "-")}`;
  }

  function renderSettings(settings) {
    const s = settings || {};
    document.title = `${s.author_name || "စာရေးဆရာမ"} — Books & Journal`;
    $("#brandAuthor").textContent = s.author_name || "စာရေးဆရာမ";
    $("#heroTagline").textContent = s.tagline || "";
    $("#heroAuthorRole").textContent = s.author_role || "စာရေးဆရာမ";
    $("#heroQuote").textContent = s.hero_quote || "";
    $("#aboutAuthorName").textContent = s.author_name || "";
    $("#aboutBio").textContent = s.bio || "";
    $("#footerAuthor").textContent = s.author_name || "";
    $("#heroPortrait").src = safeImage(s.hero_image, "assets/author-hero.svg");
    $("#aboutPortrait").src = safeImage(s.about_image, "assets/author-about.svg");

    const socialItems = [
      ["facebook", "Facebook", safeUrl(s.facebook)],
      ["tiktok", "TikTok", safeUrl(s.tiktok)],
      ["instagram", "Instagram", safeUrl(s.instagram)],
      ["telegram", "Telegram", safeUrl(s.telegram)],
      ["email", "Email", s.email ? `mailto:${encodeURIComponent(s.email)}` : ""]
    ].filter(item => item[2]);

    $("#socialRow").innerHTML = socialItems.length
      ? socialItems.map(([type, label, href]) => `<a class="social-link" href="${escapeHTML(href)}" ${type !== "email" ? 'target="_blank" rel="noopener noreferrer"' : ""}>${icons[type]}<span>${label}</span></a>`).join("")
      : '<span class="social-empty">Social links မထည့်ရသေးပါ။</span>';
  }

  function renderBooks(books) {
    const sorted = [...(books || [])].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    const shelf = $("#bookshelf");
    shelf.innerHTML = sorted.length ? sorted.map(book => `
      <article class="book-item reveal">
        <button class="book-cover-button" type="button" data-book-id="${escapeHTML(book.id)}" aria-label="${escapeHTML(book.title)} details">
          <span class="book-cover-shell"><img src="${escapeHTML(safeImage(book.cover_image, "assets/book-1.svg"))}" alt="${escapeHTML(book.title)} book cover" loading="lazy"></span>
          ${book.is_free ? '<span class="free-ribbon">FREE READ</span>' : ""}
        </button>
        <div class="book-meta">
          <p class="book-category">${escapeHTML(book.category || "စာအုပ်")}</p>
          <h3>${escapeHTML(book.title)}</h3>
          <p>${escapeHTML(book.published_year || "")} · ${escapeHTML(book.subtitle || "")}</p>
          <div class="book-pills">
            <span class="price-pill ${book.is_free ? "price-free" : ""}">${escapeHTML(formatPrice(book))}</span>
            <span class="status-pill ${statusClass(book.status)}">${escapeHTML(book.status || "Available")}</span>
          </div>
        </div>
      </article>`).join("") : '<div class="empty-state">စာအုပ်မရှိသေးပါ။</div>';

    shelf.querySelectorAll("[data-book-id]").forEach(button => button.addEventListener("click", () => {
      const book = sorted.find(item => String(item.id) === button.dataset.bookId);
      if (book) {
        openBook(book);
        AuthorStore.trackContentView(sessionId, "book", book.id);
      }
    }));
  }

  function renderQuotes(quotes) {
    const sorted = [...(quotes || [])].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    $("#quotesGrid").innerHTML = sorted.length ? sorted.slice(0, 6).map(quote => `
      <article class="quote-paper reveal"><blockquote>${escapeHTML(quote.quote_text)}</blockquote><cite>— ${escapeHTML(quote.source || "စာရေးသူ၏မှတ်စု")}</cite></article>
    `).join("") : '<div class="empty-state">Quote မရှိသေးပါ။</div>';
  }

  function renderPosts(posts) {
    const sorted = [...(posts || [])].sort((a,b) => `${b.post_date || ""}${b.created_at || ""}`.localeCompare(`${a.post_date || ""}${a.created_at || ""}`));
    const grid = $("#blogGrid");
    grid.innerHTML = sorted.length ? sorted.slice(0, 12).map((post, index) => `
      <article class="post-card reveal">
        <div class="post-image">
          <img src="${escapeHTML(safeImage(post.image, "assets/blog-1.svg"))}" alt="" loading="lazy">
          ${index === 0 ? '<span class="newest-tag">NEWEST</span>' : ""}
        </div>
        <div class="post-body">
          <div class="post-label-row"><span class="post-date">${escapeHTML(formatDate(post.post_date))}</span><span class="relative-tag">${escapeHTML(relativeDateLabel(post.post_date))}</span></div>
          <p class="post-category">${escapeHTML(post.category || "Journal")}</p>
          <h3>${escapeHTML(post.title)}</h3>
          <p>${escapeHTML(post.excerpt || "")}</p>
          <button class="read-more" type="button" data-post-id="${escapeHTML(post.id)}">ဆက်ဖတ်မယ် →</button>
        </div>
      </article>`).join("") : '<div class="empty-state">Blog post မရှိသေးပါ။</div>';

    grid.querySelectorAll("[data-post-id]").forEach(button => button.addEventListener("click", () => {
      const post = sorted.find(item => String(item.id) === button.dataset.postId);
      if (post) {
        openPost(post);
        AuthorStore.trackContentView(sessionId, "post", post.id);
      }
    }));
  }

  function openBook(book) {
    const pdf = safeUrl(book.pdf_url);
    const buy = safeUrl(book.buy_url);
    const hasReader = Boolean(book.is_free && String(book.free_content || "").trim());
    $("#modalContent").innerHTML = `
      <div class="book-modal-grid">
        <div class="book-modal-cover"><img src="${escapeHTML(safeImage(book.cover_image, "assets/book-1.svg"))}" alt="${escapeHTML(book.title)}"></div>
        <div class="book-modal-copy">
          <div class="modal-tag-row"><span class="eyebrow">${escapeHTML(book.category || "စာအုပ်")}</span><span class="price-pill ${book.is_free ? "price-free" : ""}">${escapeHTML(formatPrice(book))}</span></div>
          <h2 id="modalTitle">${escapeHTML(book.title)}</h2>
          <p class="modal-subtitle">${escapeHTML(book.subtitle || "")}</p>
          <p>${escapeHTML(book.description || "")}</p>
          <div class="modal-actions">
            ${hasReader ? '<button class="btn btn-primary" id="readBookButton" type="button">စာကို တန်းဖတ်မယ်</button>' : ""}
            ${pdf ? '<button class="btn btn-secondary" id="openPdfButton" type="button">PDF ကို Web မှာဖတ်မယ်</button>' : ""}
            ${!book.is_free && buy ? `<a class="btn btn-primary" href="${escapeHTML(buy)}" target="_blank" rel="noopener noreferrer">ဝယ်ယူရန် →</a>` : ""}
            ${!hasReader && !pdf && !buy ? `<span class="status-pill ${statusClass(book.status)}">${escapeHTML(book.status || "Available")}</span>` : ""}
          </div>
        </div>
      </div>`;
    openModal();
    $("#readBookButton")?.addEventListener("click", () => openBookReader(book));
    $("#openPdfButton")?.addEventListener("click", () => openPdfReader(book));
  }

  function openBookReader(book) {
    $("#modalContent").innerHTML = `
      <article class="reader-view">
        <button class="reader-back" id="readerBack" type="button">← စာအုပ်အကြောင်း</button>
        <p class="eyebrow">FREE ONLINE READING</p>
        <h2 id="modalTitle">${escapeHTML(book.title)}</h2>
        <p class="reader-byline">${escapeHTML(book.subtitle || "")}</p>
        <div class="reader-content">${escapeHTML(book.free_content || "")}</div>
      </article>`;
    $("#readerBack").addEventListener("click", () => openBook(book));
  }

  function openPdfReader(book) {
    const pdf = safeUrl(book.pdf_url);
    if (!pdf) return;
    $("#modalContent").innerHTML = `
      <div class="pdf-reader">
        <div class="pdf-toolbar"><button class="reader-back" id="pdfBack" type="button">← စာအုပ်အကြောင်း</button><strong id="modalTitle">${escapeHTML(book.title)}</strong><a href="${escapeHTML(pdf)}" target="_blank" rel="noopener noreferrer">Tab အသစ်မှာဖွင့်ရန် ↗</a></div>
        <iframe src="${escapeHTML(pdf)}#toolbar=1&navpanes=0" title="${escapeHTML(book.title)} PDF"></iframe>
        <p class="pdf-fallback">Browser က PDF preview မပြရင် “Tab အသစ်မှာဖွင့်ရန်” ကိုနှိပ်ပါ။</p>
      </div>`;
    $("#pdfBack").addEventListener("click", () => openBook(book));
  }

  function openPost(post) {
    $("#modalContent").innerHTML = `
      <img class="post-modal-image" src="${escapeHTML(safeImage(post.image, "assets/blog-1.svg"))}" alt="">
      <article class="post-modal-copy">
        <div class="post-label-row"><span class="eyebrow">${escapeHTML(formatDate(post.post_date))}</span><span class="relative-tag">${escapeHTML(relativeDateLabel(post.post_date))}</span></div>
        <p class="post-category">${escapeHTML(post.category || "Journal")}</p>
        <h2 id="modalTitle">${escapeHTML(post.title)}</h2>
        <div class="post-content">${escapeHTML(post.content || post.excerpt || "")}</div>
      </article>`;
    openModal();
  }

  function openModal() {
    const modal = $("#contentModal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = $("#contentModal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function activateReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll(".reveal:not(.visible)").forEach(el => observer.observe(el));
  }

  function getDeviceId() {
    let id = localStorage.getItem("author-notification-device");
    if (!id) {
      id = uid();
      localStorage.setItem("author-notification-device", id);
    }
    return id;
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return null;
    try { return await navigator.serviceWorker.register("sw.js"); }
    catch (error) { console.warn("Service worker registration failed", error); return null; }
  }

  async function showBrowserNotification(post) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const title = "Blog အသစ်တင်ထားပါတယ်";
    const options = {
      body: post.title || "စာအသစ်တစ်ပုဒ် ဖတ်ရှုနိုင်ပါပြီ။",
      icon: safeImage(post.image, "assets/og-cover.svg"),
      badge: "assets/og-cover.svg",
      tag: `post-${post.id || Date.now()}`,
      data: { url: `${location.origin}${location.pathname}#journal` }
    };
    const registration = await navigator.serviceWorker?.ready.catch(() => null);
    if (registration) await registration.showNotification(title, options);
    else new Notification(title, options);
  }

  function updateNotificationButton() {
    const button = $("#notificationButton");
    const text = $("#notificationButtonText");
    if (!("Notification" in window)) {
      button.disabled = true;
      text.textContent = "ဒီ Browser မှာ Notification မရပါ";
      return;
    }
    if (Notification.permission === "granted") {
      button.classList.add("enabled");
      text.textContent = "Notification ဖွင့်ထားပါတယ်";
    } else if (Notification.permission === "denied") {
      button.classList.remove("enabled");
      text.textContent = "Browser Settings မှ ပြန်ဖွင့်ပါ";
    } else {
      button.classList.remove("enabled");
      text.textContent = "Notification ဖွင့်မယ်";
    }
  }

  async function enableNotifications() {
    if (!("Notification" in window)) return showToast("ဒီ Browser မှာ Notification မရပါ။", true);
    try {
      const permission = await Notification.requestPermission();
      updateNotificationButton();
      await AuthorStore.subscribeReader(null, getDeviceId(), permission);
      if (permission === "granted") {
        await registerServiceWorker();
        showToast("Blog အသစ်အတွက် Notification ဖွင့်ပြီးပါပြီ။");
        await showBrowserNotification({ title: "Notification အဆင်သင့်ဖြစ်ပါပြီ", id: "welcome" });
      } else {
        showToast("Notification ခွင့်မပြုထားပါ။", true);
      }
    } catch (error) {
      showToast(error.message || "Notification ဖွင့်မရပါ။", true);
    }
  }

  async function loadSite({ quiet = false } = {}) {
    try {
      currentData = await AuthorStore.getPublicData();
      renderSettings(currentData.settings);
      renderBooks(currentData.books || []);
      renderQuotes(currentData.quotes || []);
      renderPosts(currentData.posts || []);
      activateReveal();
      if (currentData.source === "fallback" && !quiet) showToast("Supabase schema.sql မ run ရသေးလို့ Preview data ကိုပြထားပါတယ်။", true);
    } catch (error) {
      console.error(error);
      showToast("Data ဖတ်၍မရပါ။ schema.sql နဲ့ config ကိုစစ်ပါ။", true);
    }
  }

  function renderImmediatePreview() {
    try {
      currentData = JSON.parse(JSON.stringify(AuthorStore.defaults));
      renderSettings(currentData.settings);
      renderBooks(currentData.books || []);
      renderQuotes(currentData.quotes || []);
      renderPosts(currentData.posts || []);
      activateReveal();
    } catch (error) {
      console.error("Immediate preview render failed", error);
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
    }
  }

  async function start() {
    // Never leave the public page blank while a network request is pending.
    renderImmediatePreview();

    try {
      await AuthorStore.init();
      await loadSite();
    } catch (error) {
      console.error("Site startup failed", error);
      showToast(AuthorStore.friendlyError?.(error) || "Live data မဖတ်နိုင်သေးပါ။ Preview data ကိုပြထားပါတယ်။", true);
    }

    AuthorStore.trackVisit(sessionId, location.pathname, document.referrer).catch(error => console.warn("Visit tracking failed", error));
    setInterval(() => AuthorStore.heartbeat(sessionId, location.pathname).catch(error => console.warn("Heartbeat failed", error)), 60000);
    registerServiceWorker();
    updateNotificationButton();
    stopRealtime = AuthorStore.subscribeToPublishedPosts(async post => {
      await loadSite({ quiet: true });
      await showBrowserNotification(post);
      showToast(`Blog အသစ် — ${post.title}`);
    });
  }

  function bindPublicEvents() {
    $("#menuToggle")?.addEventListener("click", () => {
      const nav = $("#siteNav");
      if (!nav) return;
      nav.classList.toggle("open");
      $("#menuToggle")?.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    document.querySelectorAll("#siteNav a").forEach(a => a.addEventListener("click", () => $("#siteNav")?.classList.remove("open")));
    document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
    $("#notificationButton")?.addEventListener("click", enableNotifications);
    $("#newsletterForm")?.addEventListener("submit", async event => {
      event.preventDefault();
      const input = $("#newsletterEmail");
      try {
        await AuthorStore.subscribeReader(input?.value.trim(), getDeviceId(), ("Notification" in window ? Notification.permission : "unsupported"));
        showToast("Email စာရင်းသွင်းပြီးပါပြီ။");
        event.currentTarget.reset();
      } catch (error) {
        showToast(AuthorStore.friendlyError?.(error) || error.message || "Subscribe လုပ်မရပါ။", true);
      }
    });
    window.addEventListener("author-data-changed", () => loadSite({ quiet: true }));
    window.addEventListener("beforeunload", () => stopRealtime());
    if ($("#year")) $("#year").textContent = new Date().getFullYear();
  }

  function boot() {
    bindPublicEvents();
    start();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
