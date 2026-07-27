(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const safeImage = value => value || "assets/book-1.svg";
  const statusClass = status => `status-${String(status || "available").toLowerCase().replace(/\s+/g, "-")}`;
  let currentData = null;

  function showToast(message, error = false) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.className = `toast show${error ? " error" : ""}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.className = "toast", 2800);
  }

  function formatDate(date) {
    try { return new Intl.DateTimeFormat("my-MM", { year:"numeric", month:"long", day:"numeric" }).format(new Date(`${date}T00:00:00`)); }
    catch { return date || ""; }
  }

  function renderSettings(settings) {
    document.title = `${settings.author_name || "စာရေးဆရာမ"} — Books & Journal`;
    $("#brandAuthor").textContent = settings.author_name || "စာရေးဆရာမ";
    $("#heroTagline").textContent = settings.tagline || "";
    $("#heroAuthorRole").textContent = settings.author_role || "စာရေးဆရာမ";
    $("#heroQuote").textContent = settings.hero_quote || "";
    $("#aboutAuthorName").textContent = settings.author_name || "";
    $("#aboutBio").textContent = settings.bio || "";
    $("#footerAuthor").textContent = settings.author_name || "";
    const image = settings.profile_image || "assets/author-portrait.svg";
    $("#heroPortrait").src = image;
    $("#aboutPortrait").src = image;
    $("#instagramLink").href = settings.instagram || "#";
    $("#facebookLink").href = settings.facebook || "#";
    $("#emailLink").href = `mailto:${settings.email || ""}`;
  }

  function renderBooks(books) {
    const shelf = $("#bookshelf");
    const sorted = [...books].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    shelf.innerHTML = sorted.length ? sorted.map(book => `
      <article class="book-item reveal">
        <button class="book-cover-button" type="button" data-book-id="${escapeHTML(book.id)}" aria-label="${escapeHTML(book.title)} details">
          <span class="book-cover-shell"><img src="${escapeHTML(safeImage(book.cover_image))}" alt="${escapeHTML(book.title)} book cover" loading="lazy"></span>
        </button>
        <div class="book-meta">
          <h3>${escapeHTML(book.title)}</h3>
          <p>${escapeHTML(book.published_year || "")} · ${escapeHTML(book.subtitle || "")}</p>
          <span class="status-pill ${statusClass(book.status)}">${escapeHTML(book.status || "Available")}</span>
        </div>
      </article>`).join("") : `<div class="empty-state">စာအုပ်မရှိသေးပါ။ Admin page မှ စာအုပ်အသစ် ထည့်နိုင်ပါတယ်။</div>`;

    shelf.querySelectorAll("[data-book-id]").forEach(button => button.addEventListener("click", () => {
      const book = books.find(item => item.id === button.dataset.bookId);
      if (book) openBook(book);
    }));
  }

  function renderQuotes(quotes) {
    const grid = $("#quotesGrid");
    const sorted = [...quotes].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    grid.innerHTML = sorted.length ? sorted.slice(0, 6).map(quote => `
      <article class="quote-paper reveal">
        <blockquote>${escapeHTML(quote.quote_text)}</blockquote>
        <cite>— ${escapeHTML(quote.source || "စာရေးသူ၏မှတ်စု")}</cite>
      </article>`).join("") : `<div class="empty-state">Quote မရှိသေးပါ။</div>`;
  }

  function renderPosts(posts) {
    const grid = $("#blogGrid");
    const sorted = [...posts].sort((a,b) => String(b.post_date).localeCompare(String(a.post_date)));
    grid.innerHTML = sorted.length ? sorted.slice(0, 9).map(post => `
      <article class="post-card reveal">
        <div class="post-image"><img src="${escapeHTML(post.image || "assets/blog-1.svg")}" alt="" loading="lazy"></div>
        <div class="post-body">
          <span class="post-date">${escapeHTML(formatDate(post.post_date))}</span>
          <h3>${escapeHTML(post.title)}</h3>
          <p>${escapeHTML(post.excerpt || "")}</p>
          <button class="read-more" data-post-id="${escapeHTML(post.id)}">ဆက်ဖတ်မယ် →</button>
        </div>
      </article>`).join("") : `<div class="empty-state">Blog post မရှိသေးပါ။ Admin page မှ အသစ်တင်နိုင်ပါတယ်။</div>`;

    grid.querySelectorAll("[data-post-id]").forEach(button => button.addEventListener("click", () => {
      const post = posts.find(item => item.id === button.dataset.postId);
      if (post) openPost(post);
    }));
  }

  function openBook(book) {
    $("#modalContent").innerHTML = `
      <div class="book-modal-grid">
        <div class="book-modal-cover"><img src="${escapeHTML(safeImage(book.cover_image))}" alt="${escapeHTML(book.title)}"></div>
        <div class="book-modal-copy">
          <p class="eyebrow">${escapeHTML(book.published_year || "")} · ${escapeHTML(book.status || "")}</p>
          <h2>${escapeHTML(book.title)}</h2>
          <p><strong>${escapeHTML(book.subtitle || "")}</strong></p>
          <p>${escapeHTML(book.description || "")}</p>
          ${book.buy_url && book.buy_url !== "#" ? `<a class="btn btn-primary" href="${escapeHTML(book.buy_url)}" target="_blank" rel="noopener">ဝယ်ယူရန် →</a>` : `<span class="status-pill ${statusClass(book.status)}">${escapeHTML(book.status || "Available")}</span>`}
        </div>
      </div>`;
    openModal();
  }

  function openPost(post) {
    $("#modalContent").innerHTML = `
      <img class="post-modal-image" src="${escapeHTML(post.image || "assets/blog-1.svg")}" alt="">
      <article class="post-modal-copy">
        <p class="eyebrow">${escapeHTML(formatDate(post.post_date))}</p>
        <h2>${escapeHTML(post.title)}</h2>
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
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold:.08 });
    document.querySelectorAll(".reveal:not(.visible)").forEach(el => observer.observe(el));
  }

  async function loadSite() {
    try {
      await AuthorStore.init();
      currentData = await AuthorStore.getPublicData();
      renderSettings(currentData.settings);
      renderBooks(currentData.books || []);
      renderQuotes(currentData.quotes || []);
      renderPosts(currentData.posts || []);
      activateReveal();
    } catch (error) {
      console.error(error);
      showToast("Data ဖတ်၍မရပါ။ Config ကို စစ်ဆေးပါ။", true);
    }
  }

  $("#menuToggle").addEventListener("click", () => {
    const nav = $("#siteNav");
    nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", nav.classList.contains("open"));
  });
  document.querySelectorAll("#siteNav a").forEach(a => a.addEventListener("click", () => $("#siteNav").classList.remove("open")));
  document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
  $("#newsletterForm").addEventListener("submit", event => {
    event.preventDefault();
    showToast("Subscribe လုပ်ထားပါတယ် (Demo only)");
    event.currentTarget.reset();
  });
  window.addEventListener("author-data-changed", loadSite);
  $("#year").textContent = new Date().getFullYear();
  loadSite();
})();
