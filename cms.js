/**
 * ============================================================================
 * ANDRD CMS ENGINE — FULL CONTENT, PRODUCT, ORDER & ROLE MANAGEMENT (cms.js)
 * ============================================================================
 * Fitur Utama:
 * 1. Autentikasi & Role-Based Access Control (Super Admin, Editor, Admin CS, Viewer)
 * 2. CRUD Produk Lengkap + Upload & Kompresi Gambar Otomatis (Canvas WebP/JPEG)
 * 3. Editor Konten Visual (Hero Banner Slider 3 Slide, Kartu Segmentasi, Announcement)
 * 4. Manajemen Pesanan WhatsApp (Order Status Tracker & Follow-up WA)
 * 5. Manajemen User & Role Permission Matrix + Activity Log
 * 6. Pengaturan Toko, Download products.js / config.js, & Direct Publish ke GitHub/Vercel
 */

(function () {
  "use strict";

  const KEYS = {
    PRODUCTS: "andrd_cms_products_v1",
    CONFIG: "andrd_cms_config_v1",
    REVIEWS: "andrd_cms_reviews_v1",
    USERS: "andrd_cms_users_v1",
    SESSION: "andrd_cms_session_v1",
    ORDERS: "andrd_cms_orders_v1",
    LOGS: "andrd_cms_logs_v1",
    GH_TOKEN: "andrd_cms_gh_token_v1"
  };

  /* ==========================================================================
     1. DEFINISI ROLE & HAK AKSES (RBAC PERMISSIONS)
     ========================================================================== */
  const ROLE_PERMISSIONS = {
    "Super Admin": {
      label: "Super Admin",
      badgeBg: "#111111",
      badgeColor: "#FFFFFF",
      desc: "Akses penuh ke seluruh produk, konten gambar, pesanan, user/role, dan pengaturan sistem.",
      canEditProducts: true,
      canDeleteProducts: true,
      canEditStock: true,
      canEditContent: true,
      canManageOrders: true,
      canEditSettings: true,
      canManageUsers: true,
      canPublish: true
    },
    Editor: {
      label: "Content Editor",
      badgeBg: "#3F3F46",
      badgeColor: "#FFFFFF",
      desc: "Dapat menambah/mengedit produk, mengganti gambar produk, serta mengubah gambar & teks banner.",
      canEditProducts: true,
      canDeleteProducts: false,
      canEditStock: true,
      canEditContent: true,
      canManageOrders: false,
      canEditSettings: false,
      canManageUsers: false,
      canPublish: true
    },
    "Admin CS": {
      label: "Admin CS / Kasir",
      badgeBg: "#52525B",
      badgeColor: "#FFFFFF",
      desc: "Mengelola pesanan pelanggan dari WhatsApp dan mengubah status stok produk (Ready / Pre-Order / Sold Out).",
      canEditProducts: false,
      canDeleteProducts: false,
      canEditStock: true,
      canEditContent: false,
      canManageOrders: true,
      canEditSettings: false,
      canManageUsers: false,
      canPublish: false
    },
    Viewer: {
      label: "Viewer (Read-Only)",
      badgeBg: "#E4E4E7",
      badgeColor: "#27272A",
      desc: "Hanya dapat melihat dashboard, daftar produk, dan laporan pesanan tanpa bisa mengubah data.",
      canEditProducts: false,
      canDeleteProducts: false,
      canEditStock: false,
      canEditContent: false,
      canManageOrders: false,
      canEditSettings: false,
      canManageUsers: false,
      canPublish: false
    }
  };

  const DEFAULT_USERS = [
    {
      id: "usr-1",
      name: "Devarianto (Owner)",
      email: "admin@andrd.com",
      pin: "123456",
      role: "Super Admin",
      active: true
    },
    {
      id: "usr-2",
      name: "Nadia Visual",
      email: "editor@andrd.com",
      pin: "123456",
      role: "Editor",
      active: true
    },
    {
      id: "usr-3",
      name: "Raka Concierge",
      email: "cs@andrd.com",
      pin: "123456",
      role: "Admin CS",
      active: true
    },
    {
      id: "usr-4",
      name: "Tamu Auditor",
      email: "viewer@andrd.com",
      pin: "123456",
      role: "Viewer",
      active: true
    }
  ];

  /* ==========================================================================
     2. STATE & STORAGE HELPERS
     ========================================================================== */
  function formatRupiah(amount) {
    if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
    return "Rp " + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function getProducts() {
    try {
      const raw = localStorage.getItem(KEYS.PRODUCTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(window.DEFAULT_PRODUCTS || window.PRODUCTS || []));
  }

  function saveProducts(list, logMessage) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(list));
    window.PRODUCTS = list;
    if (logMessage) addActivityLog(logMessage);
  }

  function getConfig() {
    const base = JSON.parse(JSON.stringify(window.DEFAULT_STORE_CONFIG || window.STORE_CONFIG || {}));
    try {
      const raw = localStorage.getItem(KEYS.CONFIG);
      if (raw) {
        return Object.assign(base, JSON.parse(raw));
      }
    } catch (e) {}
    return base;
  }

  function saveConfig(cfg, logMessage) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(cfg));
    Object.assign(window.STORE_CONFIG, cfg);
    if (logMessage) addActivityLog(logMessage);
  }

  function getReviews() {
    try {
      const raw = localStorage.getItem(KEYS.REVIEWS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    const cfg = getConfig();
    if (Array.isArray(cfg.testimonials)) {
      return JSON.parse(JSON.stringify(cfg.testimonials));
    }
    return [];
  }

  function saveReviews(list, logMessage) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(list));
    const cfg = getConfig();
    cfg.testimonials = list;
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(cfg));
    if (window.STORE_CONFIG) {
      window.STORE_CONFIG.testimonials = list;
    }
    if (logMessage) addActivityLog(logMessage);
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem(KEYS.USERS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return JSON.parse(JSON.stringify(DEFAULT_USERS));
  }

  function saveUsers(users, logMessage) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    if (logMessage) addActivityLog(logMessage);
  }

  function getOrders() {
    try {
      const raw = localStorage.getItem(KEYS.ORDERS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Seed 2 contoh pesanan awal agar tidak kosong saat pertama dibuka
    const sampleOrders = [
      {
        orderNumber: "ANDRD-261030-A8F2",
        createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        status: "Paid",
        nama: "Nadira Prameswari",
        wa: "6281298765432",
        email: "nadira@email.com",
        alamat: "Jl. Senopati No. 18, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12190",
        kurir: "Paxel",
        catatan: "Request free vial 02 Embun Pagi",
        items: [{ name: "01 Senja di Bali", size: "50ml", qty: 1, price: 349000 }],
        total: 349000
      },
      {
        orderNumber: "ANDRD-261030-K3M9",
        createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
        status: "Pending",
        nama: "Dimas Anggara",
        wa: "6281311223344",
        email: "-",
        alamat: "Jl. Dago No. 88, Coblong, Bandung, Jawa Barat 40135",
        kurir: "JNE Reguler",
        catatan: "-",
        items: [{ name: "04 Kayu & Rupa", size: "100ml", qty: 1, price: 579000 }],
        total: 579000
      }
    ];
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(sampleOrders));
    return sampleOrders;
  }

  function saveOrders(orders, logMessage) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    if (logMessage) addActivityLog(logMessage);
  }

  function getLogs() {
    try {
      const raw = localStorage.getItem(KEYS.LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function addActivityLog(action) {
    const session = getSession();
    const actor = session ? `${session.name} (${session.role})` : "System";
    const logs = getLogs();
    logs.unshift({
      time: new Date().toLocaleString("id-ID"),
      actor: actor,
      action: action
    });
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 50)));
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    if (!user) {
      localStorage.removeItem(KEYS.SESSION);
    } else {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    }
  }

  function getCurrentPerms() {
    const s = getSession();
    if (!s) return ROLE_PERMISSIONS.Viewer;
    return ROLE_PERMISSIONS[s.role] || ROLE_PERMISSIONS.Viewer;
  }

  /* ==========================================================================
     3. IMAGE COMPRESSOR (UPLOAD GAMBAR DARI HP/LAPTOP -> BASE64 RINGAN)
     ========================================================================== */
  function compressImageFile(file, maxWidth = 800, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error("File tidak ditemukan"));
      // Jika file SVG, baca langsung sebagai Data URL
      if (file.type === "image/svg+xml") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          // Crop persegi 1:1 tengah secara cerdas untuk gambar produk/banner
          const size = Math.min(w, h);
          const sx = (w - size) / 2;
          const sy = (h - size) / 2;
          const outSize = Math.min(size, maxWidth);

          canvas.width = outSize;
          canvas.height = outSize;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#F6F6F6";
          ctx.fillRect(0, 0, outSize, outSize);
          ctx.drawImage(img, sx, sy, size, size, 0, 0, outSize, outSize);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ==========================================================================
     4. TOAST NOTIFICATION CMS
     ========================================================================== */
  function cmsToast(msg) {
    let container = document.getElementById("cmsToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "cmsToastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span>${msg}</span><span>✓</span>`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 220);
    }, 2500);
  }

  /* ==========================================================================
     5. LOGIN & AUTHENTICATION SCREEN
     ========================================================================== */
  function renderAuthOrApp() {
    const session = getSession();
    const authScreen = document.getElementById("cmsAuthScreen");
    const appScreen = document.getElementById("cmsAppScreen");
    if (!authScreen || !appScreen) return;

    if (!session) {
      authScreen.style.display = "flex";
      appScreen.style.display = "none";
      renderLoginQuickAccounts();
    } else {
      authScreen.style.display = "none";
      appScreen.style.display = "grid";
      initCmsDashboard();
    }
  }

  function renderLoginQuickAccounts() {
    const box = document.getElementById("quickDemoAccounts");
    if (!box) return;
    const users = getUsers().filter((u) => u.active);
    box.innerHTML = users
      .map(
        (u) => `
        <button type="button" class="cms-demo-acc-btn" data-email="${u.email}" data-pin="${u.pin}">
          <div style="text-align:left;">
            <div style="font-weight:600;font-size:12.5px;">${u.name}</div>
            <div style="font-size:11px;color:var(--color-text-muted);">${u.email}</div>
          </div>
          <span class="badge" style="background:${(ROLE_PERMISSIONS[u.role] || {}).badgeBg || "#111"};color:${(ROLE_PERMISSIONS[u.role] || {}).badgeColor || "#fff"};">
            ${u.role}
          </span>
        </button>
      `
      )
      .join("");

    box.querySelectorAll(".cms-demo-acc-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("loginEmail").value = btn.getAttribute("data-email");
        document.getElementById("loginPin").value = btn.getAttribute("data-pin");
        handleLoginSubmit();
      });
    });
  }

  function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pin = document.getElementById("loginPin").value.trim();
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email && u.pin === pin);

    if (!found) {
      cmsToast("Email atau PIN salah!");
      return;
    }
    if (!found.active) {
      cmsToast("Akun ini sedang dinonaktifkan oleh Super Admin.");
      return;
    }

    setSession(found);
    addActivityLog(`Login ke CMS sebagai ${found.role}`);
    cmsToast(`Selamat datang, ${found.name}`);
    renderAuthOrApp();
  }

  /* ==========================================================================
     6. MAIN CMS DASHBOARD & TABS
     ========================================================================== */
  let activeTab = "overview";

  function initCmsDashboard() {
    const session = getSession();
    const perms = getCurrentPerms();

    // Header profile & Quick Role Switcher
    document.getElementById("cmsCurrentUserName").textContent = session.name;
    document.getElementById("cmsCurrentUserRole").textContent = session.role;

    const roleSwitcher = document.getElementById("cmsQuickRoleSwitcher");
    if (roleSwitcher) {
      const users = getUsers().filter((u) => u.active);
      roleSwitcher.innerHTML = users
        .map(
          (u) =>
            `<option value="${u.id}" ${u.id === session.id ? "selected" : ""}>Simulasi Role: ${u.role} (${u.name.split(" ")[0]})</option>`
        )
        .join("");

      roleSwitcher.onchange = function () {
        const target = users.find((u) => u.id === roleSwitcher.value);
        if (target) {
          setSession(target);
          cmsToast(`Beralih ke Role: ${target.role}`);
          initCmsDashboard();
        }
      };
    }

    // Apply role visibility on sidebar tabs
    document.querySelectorAll(".cms-nav-btn").forEach((btn) => {
      const tab = btn.getAttribute("data-tab");
      let allowed = true;
      if (tab === "content" && !perms.canEditContent && session.role === "Admin CS") allowed = false;
      if (tab === "users" && !perms.canManageUsers) allowed = false;
      if (tab === "settings" && !perms.canEditSettings && !perms.canPublish) allowed = false;
      btn.style.display = allowed ? "flex" : "none";
    });

    switchTab(activeTab);
  }

  function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll(".cms-nav-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".cms-tab-panel").forEach((p) => {
      p.classList.toggle("active", p.id === `tab-${tabId}`);
    });

    if (tabId === "overview") renderOverviewTab();
    if (tabId === "products") renderProductsTab();
    if (tabId === "content") renderContentTab();
    if (tabId === "orders") renderOrdersTab();
    if (tabId === "reviews") renderReviewsTab();
    if (tabId === "users") renderUsersTab();
    if (tabId === "settings") renderSettingsTab();
  }

  /* ==========================================================================
     TAB A: OVERVIEW DASHBOARD
     ========================================================================== */
  function renderOverviewTab() {
    const products = getProducts();
    const orders = getOrders();
    const logs = getLogs();
    const session = getSession();
    const perms = getCurrentPerms();

    const readyCount = products.filter((p) => p.status === "ready").length;
    const poCount = products.filter((p) => p.status === "pre-order").length;
    const soldCount = products.filter((p) => p.status === "sold-out").length;
    const totalRevenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    document.getElementById("statTotalProducts").textContent = products.length;
    document.getElementById("statStockBreakdown").textContent = `${readyCount} Ready • ${poCount} PO • ${soldCount} Habis`;
    document.getElementById("statTotalOrders").textContent = orders.length;
    document.getElementById("statTotalRevenue").textContent = formatRupiah(totalRevenue);
    document.getElementById("statActiveRole").textContent = session.role;
    document.getElementById("statRoleDesc").textContent = perms.desc;

    const logsEl = document.getElementById("cmsActivityLogs");
    if (logsEl) {
      if (logs.length === 0) {
        logsEl.innerHTML = `<p style="color:var(--color-text-muted);font-size:12.5px;">Belum ada aktivitas tercatat.</p>`;
      } else {
        logsEl.innerHTML = logs
          .slice(0, 10)
          .map(
            (l) => `
            <div style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--color-border);font-size:12.5px;">
              <div><strong>${l.actor}</strong> — ${l.action}</div>
              <span style="color:var(--color-text-muted);white-space:nowrap;font-size:11.5px;">${l.time}</span>
            </div>
          `
          )
          .join("");
      }
    }
  }

  /* ==========================================================================
     TAB B: MANAJEMEN PRODUK & UPLOAD GAMBAR
     ========================================================================== */
  function renderProductsTab() {
    const products = getProducts();
    const perms = getCurrentPerms();
    const searchVal = (document.getElementById("cmsProductSearch")?.value || "").toLowerCase();

    const addBtn = document.getElementById("openAddProductModalBtn");
    if (addBtn) {
      addBtn.style.display = perms.canEditProducts ? "inline-flex" : "none";
    }

    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchVal) ||
        p.scentCategory.toLowerCase().includes(searchVal) ||
        p.gender.toLowerCase().includes(searchVal)
    );

    const listEl = document.getElementById("cmsProductsTableBody");
    if (!listEl) return;

    listEl.innerHTML = filtered
      .map((p) => {
        const minPrice = p.variants && p.variants[0] ? formatRupiah(p.variants[0].price) : "Rp 0";
        const sizesStr = (p.variants || []).map((v) => v.size).join(", ");
        return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:12px;">
                <img src="${p.images[0]}" alt="${p.name}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;background:#F6F6F6;flex-shrink:0;">
                <div>
                  <div style="font-weight:600;font-size:13.5px;">${p.name}</div>
                  <div style="font-size:11.5px;color:var(--color-text-muted);">${p.gender} • ${p.scentCategory}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-weight:600;font-size:13px;">Mulai ${minPrice}</div>
              <div style="font-size:11px;color:var(--color-text-muted);">${sizesStr}</div>
            </td>
            <td>
              <select class="select-control js-quick-status" data-id="${p.id}" style="padding:6px 10px;font-size:12px;width:auto;" ${!perms.canEditStock ? "disabled" : ""}>
                <option value="ready" ${p.status === "ready" ? "selected" : ""}>Ready Stock</option>
                <option value="pre-order" ${p.status === "pre-order" ? "selected" : ""}>Pre-Order</option>
                <option value="sold-out" ${p.status === "sold-out" ? "selected" : ""}>Sold Out</option>
              </select>
            </td>
            <td>
              <span class="badge ${p.badge ? "badge-bestseller" : "badge-soldout"}">${p.badge || "Tanpa Badge"}</span>
            </td>
            <td>
              <div style="display:flex;gap:6px;justify-content:flex-end;">
                ${
                  perms.canEditProducts
                    ? `<button type="button" class="btn btn-outline js-edit-product" data-id="${p.id}" style="padding:7px 12px;font-size:11.5px;">Edit & Gambar</button>`
                    : `<span style="font-size:11.5px;color:var(--color-text-muted);">View Only</span>`
                }
                ${
                  perms.canDeleteProducts
                    ? `<button type="button" class="btn btn-outline js-delete-product" data-id="${p.id}" style="padding:7px 10px;font-size:11.5px;color:var(--color-danger);">Hapus</button>`
                    : ""
                }
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // Bind quick status change
    listEl.querySelectorAll(".js-quick-status").forEach((sel) => {
      sel.addEventListener("change", () => {
        const id = sel.getAttribute("data-id");
        const all = getProducts();
        const item = all.find((x) => x.id === id);
        if (item) {
          item.status = sel.value;
          saveProducts(all, `Ubah status stok "${item.name}" menjadi ${sel.value}`);
          cmsToast(`Status ${item.name} → ${sel.value}`);
        }
      });
    });

    // Bind edit product
    listEl.querySelectorAll(".js-edit-product").forEach((btn) => {
      btn.addEventListener("click", () => {
        openProductModal(btn.getAttribute("data-id"));
      });
    });

    // Bind delete product
    listEl.querySelectorAll(".js-delete-product").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const all = getProducts();
        const target = all.find((x) => x.id === id);
        if (target && confirm(`Hapus parfum "${target.name}"?`)) {
          const updated = all.filter((x) => x.id !== id);
          saveProducts(updated, `Menghapus produk "${target.name}"`);
          renderProductsTab();
          cmsToast(`${target.name} dihapus`);
        }
      });
    });
  }

  /* ==========================================================================
     MODAL TAMBAH / EDIT PRODUK & UPLOAD GAMBAR
     ========================================================================== */
  let editingProductId = null;
  let tempImage1 = "";
  let tempImage2 = "";

  function openProductModal(productId = null) {
    const modal = document.getElementById("cmsProductModal");
    if (!modal) return;

    const all = getProducts();
    const prod = productId ? all.find((p) => p.id === productId) : null;
    editingProductId = prod ? prod.id : null;

    document.getElementById("productModalTitle").textContent = prod
      ? `Edit Produk: ${prod.name}`
      : "Tambah Produk Parfum Baru";

    document.getElementById("prodName").value = prod ? prod.name : "";
    document.getElementById("prodGender").value = prod ? prod.gender : "Unisex";
    document.getElementById("prodCategory").value = prod ? prod.scentCategory : "Woody & Vanilla";
    document.getElementById("prodStatus").value = prod ? prod.status : "ready";
    document.getElementById("prodBadge").value = prod && prod.badge ? prod.badge : "";
    document.getElementById("prodFeatured").checked = prod ? Boolean(prod.featured) : true;
    document.getElementById("prodSeasonal").checked = prod ? Boolean(prod.seasonal) : true;
    document.getElementById("prodShortDesc").value = prod ? prod.shortDescription : "";
    document.getElementById("prodFullDesc").value = prod ? prod.description : "";
    document.getElementById("prodLongevity").value = prod ? prod.longevity : "10 – 12 Jam";
    document.getElementById("prodSillage").value = prod ? prod.sillage : "Moderate to Strong";

    document.getElementById("prodTopNotes").value =
      prod && prod.notes && prod.notes.top ? prod.notes.top.join(", ") : "Bergamot, Pink Pepper";
    document.getElementById("prodMiddleNotes").value =
      prod && prod.notes && prod.notes.middle ? prod.notes.middle.join(", ") : "Sandalwood, Iris";
    document.getElementById("prodBaseNotes").value =
      prod && prod.notes && prod.notes.base ? prod.notes.base.join(", ") : "Vanilla, White Musk";

    // Variants (15ml, 50ml, 100ml)
    const v1 = prod && prod.variants[0] ? prod.variants[0] : { size: "15ml", price: 149000, compareAtPrice: null };
    const v2 = prod && prod.variants[1] ? prod.variants[1] : { size: "50ml", price: 349000, compareAtPrice: null };
    const v3 = prod && prod.variants[2] ? prod.variants[2] : { size: "100ml", price: 549000, compareAtPrice: null };

    document.getElementById("v1Size").value = v1.size;
    document.getElementById("v1Price").value = v1.price;
    document.getElementById("v1Compare").value = v1.compareAtPrice || "";

    document.getElementById("v2Size").value = v2.size;
    document.getElementById("v2Price").value = v2.price;
    document.getElementById("v2Compare").value = v2.compareAtPrice || "";

    document.getElementById("v3Size").value = v3.size;
    document.getElementById("v3Price").value = v3.price;
    document.getElementById("v3Compare").value = v3.compareAtPrice || "";

    // Images
    const defaultImg1 = window.createBottleSvg
      ? window.createBottleSvg(prod ? prod.name : "NEW SCENT", prod ? prod.scentCategory : "Extrait", "Extrait de Parfum")
      : "";
    const defaultImg2 = window.createNotesSvg
      ? window.createNotesSvg(prod ? prod.name : "NEW SCENT", "Bergamot  •  Sandalwood  •  Vanilla")
      : "";

    tempImage1 = prod && prod.images[0] ? prod.images[0] : defaultImg1;
    tempImage2 = prod && prod.images[1] ? prod.images[1] : defaultImg2;

    updateProductModalImagePreviews();
    modal.classList.add("open");
  }

  function updateProductModalImagePreviews() {
    const prev1 = document.getElementById("prodImg1Preview");
    const prev2 = document.getElementById("prodImg2Preview");
    if (prev1) prev1.src = tempImage1;
    if (prev2) prev2.src = tempImage2;
  }

  function handleSaveProductForm(e) {
    e.preventDefault();
    const name = document.getElementById("prodName").value.trim();
    if (!name) {
      cmsToast("Nama produk wajib diisi!");
      return;
    }

    const category = document.getElementById("prodCategory").value;
    const topArr = document
      .getElementById("prodTopNotes")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const midArr = document
      .getElementById("prodMiddleNotes")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const baseArr = document
      .getElementById("prodBaseNotes")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const variants = [];
    [1, 2, 3].forEach((idx) => {
      const sz = document.getElementById(`v${idx}Size`).value.trim();
      const pr = Number(document.getElementById(`v${idx}Price`).value);
      const cp = Number(document.getElementById(`v${idx}Compare`).value) || null;
      if (sz && pr > 0) {
        variants.push({ size: sz, price: pr, compareAtPrice: cp });
      }
    });

    if (variants.length === 0) {
      cmsToast("Minimal 1 ukuran & harga wajib diisi!");
      return;
    }

    const all = getProducts();
    const newObj = {
      id: editingProductId || "andrd-" + Date.now().toString().slice(-4),
      name: name,
      slug: slugify(name),
      gender: document.getElementById("prodGender").value,
      scentCategory: category,
      shortDescription: document.getElementById("prodShortDesc").value.trim(),
      description: document.getElementById("prodFullDesc").value.trim(),
      concentration: "Extrait de Parfum (30%)",
      longevity: document.getElementById("prodLongevity").value.trim() || "10 – 12 Jam",
      sillage: document.getElementById("prodSillage").value.trim() || "Moderate",
      notes: {
        top: topArr.length ? topArr : ["Bergamot"],
        middle: midArr.length ? midArr : ["Sandalwood"],
        base: baseArr.length ? baseArr : ["Vanilla"]
      },
      variants: variants,
      images: [tempImage1, tempImage2 || tempImage1],
      status: document.getElementById("prodStatus").value,
      badge: document.getElementById("prodBadge").value || null,
      featured: document.getElementById("prodFeatured").checked,
      seasonal: document.getElementById("prodSeasonal").checked
    };

    if (editingProductId) {
      const idx = all.findIndex((p) => p.id === editingProductId);
      if (idx > -1) all[idx] = newObj;
      saveProducts(all, `Mengedit produk "${name}"`);
    } else {
      all.unshift(newObj);
      saveProducts(all, `Menambah produk baru "${name}"`);
    }

    document.getElementById("cmsProductModal").classList.remove("open");
    renderProductsTab();
    cmsToast(`Produk "${name}" berhasil disimpan!`);
  }

  /* ==========================================================================
     TAB C: MANAJEMEN KONTEN & GAMBAR BANNER (HERO SLIDER & SEGMENTASI)
     ========================================================================== */
  function renderContentTab() {
    const cfg = getConfig();
    const products = getProducts();

    document.getElementById("cmsAnnouncementInput").value = cfg.announcementText || "";

    // Render 3 Hero Slides Editor
    const heroBox = document.getElementById("cmsHeroSlidesEditor");
    if (heroBox) {
      const slides = cfg.heroSlides || [];
      heroBox.innerHTML = slides
        .map((s, idx) => {
          const fallbackImg = products[idx] ? products[idx].images[0] : "";
          const currentImg = s.image || fallbackImg;
          return `
            <div class="checkout-card" style="background:#FFFFFF;border:1px solid var(--color-border);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <strong style="font-size:14px;">Hero Banner Slide #${idx + 1}</strong>
                <span class="badge badge-soldout">Rasio 1:1</span>
              </div>

              <div style="display:grid;grid-template-columns:96px 1fr;gap:14px;align-items:center;margin-bottom:14px;">
                <img src="${currentImg}" id="heroSlidePreview_${idx}" alt="Slide ${idx + 1}" style="width:96px;height:96px;object-fit:cover;border-radius:12px;background:#F6F6F6;">
                <div>
                  <label class="btn btn-outline" style="cursor:pointer;margin-bottom:6px;width:100%;">
                    Upload Gambar Slide #${idx + 1}
                    <input type="file" accept="image/*" class="js-upload-hero-img" data-idx="${idx}" style="display:none;">
                  </label>
                  <button type="button" class="btn btn-outline js-reset-hero-img" data-idx="${idx}" style="width:100%;font-size:11px;padding:6px;">
                    Gunakan Gambar Botol Default
                  </button>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>Label Kecil (Eyebrow)</label>
                  <input type="text" class="form-control" id="heroEyebrow_${idx}" value="${s.eyebrow || ""}">
                </div>
                <div class="form-group">
                  <label>Judul Utama Slide</label>
                  <input type="text" class="form-control" id="heroTitle_${idx}" value="${s.title || ""}">
                </div>
                <div class="form-group">
                  <label>Deskripsi Singkat</label>
                  <textarea rows="2" class="form-control" id="heroDesc_${idx}">${s.desc || ""}</textarea>
                </div>
                <div class="form-grid form-grid-2">
                  <div class="form-group">
                    <label>Teks Tombol Utama</label>
                    <input type="text" class="form-control" id="heroBtn1Text_${idx}" value="${s.btnPrimaryText || ""}">
                  </div>
                  <div class="form-group">
                    <label>Link Tombol Utama</label>
                    <input type="text" class="form-control" id="heroBtn1Link_${idx}" value="${s.btnPrimaryLink || "products.html"}">
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      // Bind Hero Image Upload
      heroBox.querySelectorAll(".js-upload-hero-img").forEach((input) => {
        input.addEventListener("change", async (e) => {
          const idx = Number(input.getAttribute("data-idx"));
          const file = e.target.files[0];
          if (!file) return;
          const dataUrl = await compressImageFile(file, 720, 0.82);
          cfg.heroSlides[idx].image = dataUrl;
          document.getElementById(`heroSlidePreview_${idx}`).src = dataUrl;
          cmsToast(`Gambar Slide #${idx + 1} siap disimpan!`);
        });
      });

      heroBox.querySelectorAll(".js-reset-hero-img").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-idx"));
          cfg.heroSlides[idx].image = "";
          const fb = products[idx] ? products[idx].images[0] : "";
          document.getElementById(`heroSlidePreview_${idx}`).src = fb;
          cmsToast(`Slide #${idx + 1} dikembalikan ke botol default.`);
        });
      });
    }

    // Render 3 Segmentation Cards Editor
    const segBox = document.getElementById("cmsSegmentsEditor");
    if (segBox) {
      const segs = cfg.segments || [];
      const fbIdx = [2, 3, 0];
      segBox.innerHTML = segs
        .map((seg, idx) => {
          const fbImg = products[fbIdx[idx]] ? products[fbIdx[idx]].images[0] : "";
          const currentImg = seg.image || fbImg;
          return `
            <div class="checkout-card" style="background:#FFFFFF;border:1px solid var(--color-border);">
              <strong style="font-size:14px;display:block;margin-bottom:10px;">Kartu Kategori: ${seg.gender}</strong>
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <img src="${currentImg}" id="segPreview_${idx}" alt="${seg.title}" style="width:72px;height:72px;border-radius:10px;object-fit:cover;background:#F6F6F6;">
                <label class="btn btn-outline" style="cursor:pointer;flex:1;">
                  Ganti Gambar Background
                  <input type="file" accept="image/*" class="js-upload-seg-img" data-idx="${idx}" style="display:none;">
                </label>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Judul Kartu</label>
                  <input type="text" class="form-control" id="segTitle_${idx}" value="${seg.title || ""}">
                </div>
                <div class="form-group">
                  <label>Subjudul Singkat</label>
                  <input type="text" class="form-control" id="segDesc_${idx}" value="${seg.desc || ""}">
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      segBox.querySelectorAll(".js-upload-seg-img").forEach((input) => {
        input.addEventListener("change", async (e) => {
          const idx = Number(input.getAttribute("data-idx"));
          const file = e.target.files[0];
          if (!file) return;
          const dataUrl = await compressImageFile(file, 640, 0.8);
          cfg.segments[idx].image = dataUrl;
          document.getElementById(`segPreview_${idx}`).src = dataUrl;
          cmsToast(`Gambar kartu ${cfg.segments[idx].gender} diubah!`);
        });
      });
    }

    // Bind Save Content Button
    const saveContentBtn = document.getElementById("saveContentBtn");
    if (saveContentBtn) {
      saveContentBtn.onclick = function () {
        cfg.announcementText = document.getElementById("cmsAnnouncementInput").value.trim();
        (cfg.heroSlides || []).forEach((s, idx) => {
          s.eyebrow = document.getElementById(`heroEyebrow_${idx}`).value.trim();
          s.title = document.getElementById(`heroTitle_${idx}`).value.trim();
          s.desc = document.getElementById(`heroDesc_${idx}`).value.trim();
          s.btnPrimaryText = document.getElementById(`heroBtn1Text_${idx}`).value.trim();
          s.btnPrimaryLink = document.getElementById(`heroBtn1Link_${idx}`).value.trim();
        });
        (cfg.segments || []).forEach((seg, idx) => {
          seg.title = document.getElementById(`segTitle_${idx}`).value.trim();
          seg.desc = document.getElementById(`segDesc_${idx}`).value.trim();
        });
        saveConfig(cfg, "Memperbarui konten visual Hero Banner & Kartu Segmentasi");
        cmsToast("Konten & gambar banner berhasil disimpan!");
      };
    }
  }

  /* ==========================================================================
     TAB D: MANAJEMEN PESANAN WHATSAPP (ORDERS)
     ========================================================================== */
  function renderOrdersTab() {
    const orders = getOrders();
    const perms = getCurrentPerms();
    const tbody = document.getElementById("cmsOrdersTableBody");
    if (!tbody) return;

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;">Belum ada pesanan masuk.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders
      .map((o) => {
        const itemsSummary = (o.items || [])
          .map((i) => `${i.name} (${i.size}) x${i.qty}`)
          .join(", ");
        const waFollowupMsg = `Halo Kak ${o.nama}, kami dari Admin ${STORE_CONFIG.brandName} mengonfirmasi pesanan *#${o.orderNumber}* (${itemsSummary}) dengan subtotal ${formatRupiah(o.total)}.`;
        const waLink = `https://wa.me/${String(o.wa).replace(/\D/g, "")}?text=${encodeURIComponent(waFollowupMsg)}`;

        return `
          <tr>
            <td>
              <strong style="font-size:13px;">#${o.orderNumber}</strong>
              <div style="font-size:11px;color:var(--color-text-muted);">${new Date(o.createdAt).toLocaleDateString("id-ID")}</div>
            </td>
            <td>
              <div style="font-weight:600;font-size:13px;">${o.nama}</div>
              <div style="font-size:11.5px;color:var(--color-text-muted);">${o.wa} • ${o.kurir}</div>
            </td>
            <td style="max-width:240px;">
              <div style="font-size:12.5px;">${itemsSummary}</div>
              <div style="font-size:11px;color:var(--color-text-muted);">${o.alamat}</div>
            </td>
            <td><strong>${formatRupiah(o.total)}</strong></td>
            <td>
              <select class="select-control js-order-status" data-order="${o.orderNumber}" style="padding:6px 10px;font-size:12px;width:auto;" ${!perms.canManageOrders ? "disabled" : ""}>
                <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending (Menunggu)</option>
                <option value="Paid" ${o.status === "Paid" ? "selected" : ""}>Paid (Sudah Bayar)</option>
                <option value="Shipped" ${o.status === "Shipped" ? "selected" : ""}>Shipped (Dikirim)</option>
                <option value="Completed" ${o.status === "Completed" ? "selected" : ""}>Completed (Selesai)</option>
                <option value="Cancelled" ${o.status === "Cancelled" ? "selected" : ""}>Cancelled (Batal)</option>
              </select>
            </td>
            <td>
              <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-primary" style="padding:7px 12px;font-size:11.5px;">
                Chat Pembeli
              </a>
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll(".js-order-status").forEach((sel) => {
      sel.addEventListener("change", () => {
        const orderNo = sel.getAttribute("data-order");
        const all = getOrders();
        const target = all.find((x) => x.orderNumber === orderNo);
        if (target) {
          target.status = sel.value;
          saveOrders(all, `Ubah status order #${orderNo} ke ${sel.value}`);
          cmsToast(`Order #${orderNo} → ${sel.value}`);
        }
      });
    });
  }

  /* ==========================================================================
     TAB D2: MANAJEMEN ULASAN & RATING PELANGGAN (CRUD REVIEWS)
     ========================================================================== */
  function renderReviewsTab() {
    const reviews = getReviews();
    const tbody = document.getElementById("cmsReviewsTableBody");
    const addBtn = document.getElementById("openAddReviewModalBtn");
    const perms = getCurrentPerms();

    if (addBtn) {
      addBtn.style.display = perms.canEditContent || perms.canManageOrders ? "inline-flex" : "none";
    }
    if (!tbody) return;

    if (reviews.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:32px;color:var(--color-text-muted);">
            Belum ada ulasan pelanggan. Klik "+ Tambah Ulasan Baru" untuk menambahkan.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = reviews
      .map((r, idx) => {
        const revId = r.id || `rev-idx-${idx}`;
        const starsCount = Math.min(5, Math.max(1, Number(r.rating) || 5));
        const starsStr = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);
        const canModify = perms.canEditContent || perms.canManageOrders || perms.canEditProducts;
        return `
          <tr>
            <td>
              <div style="font-weight:600;font-size:13.5px;">${r.name || "-"}</div>
              <div style="font-size:12px;color:var(--color-text-muted);">${r.city || "-"} ${r.date ? "• " + r.date : ""}</div>
            </td>
            <td style="font-size:12.5px;font-weight:500;">
              ${r.productName || "-"}
            </td>
            <td>
              <span style="font-size:13.5px;letter-spacing:0.06em;color:#111;">${starsStr}</span>
              <div style="font-size:11px;color:var(--color-text-muted);">${starsCount} / 5</div>
            </td>
            <td style="font-size:13px;max-width:340px;line-height:1.5;">
              “${r.quote || ""}”
            </td>
            <td style="text-align:right;white-space:nowrap;">
              ${
                canModify
                  ? `
                <button type="button" class="btn btn-outline js-cms-edit-review" data-id="${revId}" style="padding:6px 12px;font-size:11.5px;margin-right:4px;">
                  Edit
                </button>
                <button type="button" class="btn btn-outline js-cms-del-review" data-id="${revId}" style="padding:6px 12px;font-size:11.5px;color:#DC2626;border-color:#FECACA;">
                  Hapus
                </button>
              `
                  : `<span style="font-size:11.5px;color:var(--color-text-muted);">Read-Only</span>`
              }
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll(".js-cms-edit-review").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-id");
        const all = getReviews();
        const found = all.find((r, i) => (r.id || `rev-idx-${i}`) === targetId);
        if (found) openReviewModal(found, targetId);
      });
    });

    tbody.querySelectorAll(".js-cms-del-review").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-id");
        const all = getReviews();
        const found = all.find((r, i) => (r.id || `rev-idx-${i}`) === targetId);
        if (!found) return;
        if (confirm(`Hapus komentar ulasan dari "${found.name}"?`)) {
          const updated = all.filter((r, i) => (r.id || `rev-idx-${i}`) !== targetId);
          saveReviews(updated, `Menghapus ulasan pelanggan "${found.name}"`);
          renderReviewsTab();
          cmsToast("Ulasan berhasil dihapus.");
        }
      });
    });
  }

  function openReviewModal(review, fallbackId) {
    const modal = document.getElementById("cmsReviewModal");
    const titleEl = document.getElementById("cmsReviewModalTitle");
    const prodSelect = document.getElementById("cmsRevProduct");
    if (!modal) return;

    const products = getProducts();
    if (prodSelect) {
      prodSelect.innerHTML = products
        .map((p) => `<option value="${p.id}">${p.name} (50ml)</option>`)
        .join("");
    }

    if (review) {
      titleEl.textContent = "Edit Komentar & Rating Ulasan";
      document.getElementById("cmsRevEditId").value = review.id || fallbackId || "";
      document.getElementById("cmsRevName").value = review.name || "";
      document.getElementById("cmsRevCity").value = review.city || "";
      if (prodSelect && review.productId) prodSelect.value = review.productId;
      document.getElementById("cmsRevRating").value = String(review.rating || 5);
      document.getElementById("cmsRevQuote").value = review.quote || "";
    } else {
      titleEl.textContent = "Tambah Ulasan Pelanggan Baru";
      document.getElementById("cmsRevEditId").value = "";
      document.getElementById("cmsRevName").value = "";
      document.getElementById("cmsRevCity").value = "";
      if (prodSelect && products[0]) prodSelect.value = products[0].id;
      document.getElementById("cmsRevRating").value = "5";
      document.getElementById("cmsRevQuote").value = "";
    }

    modal.classList.add("open");
  }

  function handleSaveReviewForm(e) {
    e.preventDefault();
    const editId = document.getElementById("cmsRevEditId").value.trim();
    const name = document.getElementById("cmsRevName").value.trim();
    const city = document.getElementById("cmsRevCity").value.trim();
    const productId = document.getElementById("cmsRevProduct").value;
    const products = getProducts();
    const selectedProd = products.find((p) => p.id === productId) || products[0];
    const productName = selectedProd ? `${selectedProd.name} (50ml)` : "ANDRD Extrait";
    const rating = Math.min(5, Math.max(1, Number(document.getElementById("cmsRevRating").value) || 5));
    const quote = document.getElementById("cmsRevQuote").value.trim();

    if (!name || !city || !quote) return;

    const all = getReviews();
    if (editId) {
      const idx = all.findIndex((r, i) => (r.id || `rev-idx-${i}`) === editId);
      if (idx !== -1) {
        all[idx] = Object.assign({}, all[idx], {
          id: editId.startsWith("rev-idx-") ? "rev-" + Date.now() : editId,
          name,
          city,
          productId,
          productName,
          rating,
          quote
        });
        saveReviews(all, `Mengedit ulasan pelanggan "${name}"`);
        cmsToast("Komentar ulasan berhasil diperbarui!");
      }
    } else {
      all.unshift({
        id: "rev-" + Date.now(),
        name,
        city,
        productId,
        productName,
        rating,
        quote,
        date: new Date().toISOString().slice(0, 10)
      });
      saveReviews(all, `Menambahkan ulasan pelanggan baru "${name}"`);
      cmsToast("Ulasan baru berhasil ditambahkan!");
    }

    document.getElementById("cmsReviewModal").classList.remove("open");
    renderReviewsTab();
  }

  /* ==========================================================================
     TAB E: MANAJEMEN USER & ROLE (RBAC)
     ========================================================================== */
  function renderUsersTab() {
    const users = getUsers();
    const tbody = document.getElementById("cmsUsersTableBody");
    if (!tbody) return;

    tbody.innerHTML = users
      .map((u) => {
        const roleInfo = ROLE_PERMISSIONS[u.role] || ROLE_PERMISSIONS.Viewer;
        return `
          <tr>
            <td>
              <div style="font-weight:600;font-size:13.5px;">${u.name}</div>
              <div style="font-size:12px;color:var(--color-text-muted);">${u.email}</div>
            </td>
            <td>
              <select class="select-control js-user-role" data-id="${u.id}" style="padding:6px 10px;font-size:12px;width:auto;">
                <option value="Super Admin" ${u.role === "Super Admin" ? "selected" : ""}>Super Admin</option>
                <option value="Editor" ${u.role === "Editor" ? "selected" : ""}>Editor (Konten & Produk)</option>
                <option value="Admin CS" ${u.role === "Admin CS" ? "selected" : ""}>Admin CS (Order & Stok)</option>
                <option value="Viewer" ${u.role === "Viewer" ? "selected" : ""}>Viewer (Read-Only)</option>
              </select>
            </td>
            <td>
              <code style="background:var(--color-bg-alt);padding:3px 8px;border-radius:6px;font-size:12px;">${u.pin}</code>
            </td>
            <td>
              <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:12.5px;">
                <input type="checkbox" class="js-user-active" data-id="${u.id}" ${u.active ? "checked" : ""}>
                <span>${u.active ? "Aktif" : "Nonaktif"}</span>
              </label>
            </td>
            <td style="font-size:12px;color:var(--color-text-muted);max-width:240px;">
              ${roleInfo.desc}
            </td>
            <td>
              ${
                u.id !== "usr-1"
                  ? `<button type="button" class="btn btn-outline js-delete-user" data-id="${u.id}" style="padding:6px 10px;font-size:11px;color:var(--color-danger);">Hapus</button>`
                  : `<span style="font-size:11px;color:var(--color-text-muted);">Owner</span>`
              }
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll(".js-user-role").forEach((sel) => {
      sel.addEventListener("change", () => {
        const id = sel.getAttribute("data-id");
        const all = getUsers();
        const u = all.find((x) => x.id === id);
        if (u) {
          u.role = sel.value;
          saveUsers(all, `Mengubah role "${u.name}" menjadi ${sel.value}`);
          renderUsersTab();
          cmsToast(`Role ${u.name} diubah ke ${sel.value}`);
        }
      });
    });

    tbody.querySelectorAll(".js-user-active").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.getAttribute("data-id");
        const all = getUsers();
        const u = all.find((x) => x.id === id);
        if (u) {
          u.active = cb.checked;
          saveUsers(all, `Mengubah status aktif "${u.name}"`);
          renderUsersTab();
        }
      });
    });

    tbody.querySelectorAll(".js-delete-user").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const all = getUsers().filter((x) => x.id !== id);
        saveUsers(all, `Menghapus user ID ${id}`);
        renderUsersTab();
        cmsToast("User dihapus");
      });
    });
  }

  /* ==========================================================================
     TAB F: PENGATURAN TOKO, EXPORT FILE & AUTO-PUBLISH KE GITHUB/VERCEL
     ========================================================================== */
  function renderSettingsTab() {
    const cfg = getConfig();
    document.getElementById("setBrandName").value = cfg.brandName || "ANDRD";
    document.getElementById("setTagline").value = cfg.tagline || "";
    document.getElementById("setWaAdmin").value = cfg.whatsappAdmin || "";
    document.getElementById("setWaDisplay").value = cfg.whatsappDisplay || "";
    document.getElementById("setInstagram").value = cfg.instagram || "";
    document.getElementById("setAddress").value = cfg.address || "";
    document.getElementById("setHours").value = cfg.operationalHours || "";
    document.getElementById("setGhToken").value = localStorage.getItem(KEYS.GH_TOKEN) || "";
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buildExportedProductsJs() {
    const products = getProducts();
    return `/**
 * DATABASE PRODUK "ANDRD" — Diekspor dari ANDRD CMS (${new Date().toLocaleString("id-ID")})
 */
const DEFAULT_PRODUCTS = ${JSON.stringify(products, null, 2)};

let PRODUCTS = DEFAULT_PRODUCTS;
try {
  const rawCmsProducts = localStorage.getItem("andrd_cms_products_v1");
  if (rawCmsProducts) {
    const parsed = JSON.parse(rawCmsProducts);
    if (Array.isArray(parsed) && parsed.length > 0) PRODUCTS = parsed;
  }
} catch (e) {}

window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
window.PRODUCTS = PRODUCTS;
`;
  }

  function buildExportedConfigJs() {
    const cfg = getConfig();
    return `/**
 * KONFIGURASI TOKO "ANDRD" — Diekspor dari ANDRD CMS (${new Date().toLocaleString("id-ID")})
 */
const DEFAULT_STORE_CONFIG = ${JSON.stringify(cfg, null, 2)};

let savedCmsConfig = {};
try {
  const rawCmsConfig = localStorage.getItem("andrd_cms_config_v1");
  if (rawCmsConfig) savedCmsConfig = JSON.parse(rawCmsConfig);
} catch (e) {}

const STORE_CONFIG = Object.assign({}, DEFAULT_STORE_CONFIG, savedCmsConfig, {
  buildOrderMessage: function (orderData) {
    const itemsList = orderData.items
      .map((item, index) => (index + 1) + ". " + item.name + " (" + item.size + ") x" + item.qty + " = " + orderData.formatCurrency(item.price * item.qty))
      .join("\\n");
    return [
      "Halo " + this.brandName + ", saya ingin memesan:",
      "",
      "*DATA PELANGGAN*",
      "Nama: " + orderData.nama,
      "No. WhatsApp: " + orderData.wa,
      "Email: " + (orderData.email || "-"),
      "Alamat: " + orderData.alamat + ", " + orderData.kecamatan + ", " + orderData.kota + ", " + orderData.provinsi + " " + orderData.kodepos,
      "Kurir: " + orderData.kurir,
      "",
      "*DETAIL PESANAN*",
      itemsList,
      "",
      "Subtotal: " + orderData.formatCurrency(orderData.total),
      "Ongkir: akan dikonfirmasi admin",
      "Catatan: " + (orderData.catatan || "-"),
      "",
      "No. Order: #" + orderData.orderNumber,
      "Mohon info total pembayaran dan nomor rekening. Terima kasih!"
    ].join("\\n");
  },
  buildRestockMessage: function (productName, size) {
    const sizeText = size ? " (" + size + ")" : "";
    return "Halo " + this.brandName + ", mohon kabari saya jika parfum *" + productName + "*" + sizeText + " sudah restock kembali. Terima kasih!";
  },
  buildGeneralInquiryMessage: function () {
    return "Halo Admin " + this.brandName + ", saya ingin bertanya mengenai rekomendasi parfum.";
  }
});

window.DEFAULT_STORE_CONFIG = DEFAULT_STORE_CONFIG;
window.STORE_CONFIG = STORE_CONFIG;
`;
  }

  async function publishFileToGitHub(repo, path, contentStr, token, commitMessage) {
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    };

    // Get existing file SHA if present
    let sha = undefined;
    const getRes = await fetch(apiUrl, { headers });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }

    const base64Content = btoa(unescape(encodeURIComponent(contentStr)));
    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: sha
      })
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      throw new Error(errData.message || `Gagal upload ${path} (${putRes.status})`);
    }
  }

  /* ==========================================================================
     7. BIND ALL CMS EVENTS ON DOM READY
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("cmsLoginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);

    const logoutBtn = document.getElementById("cmsLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        setSession(null);
        renderAuthOrApp();
      });
    }

    // Sidebar navigation
    document.querySelectorAll(".cms-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.getAttribute("data-tab"));
      });
    });

    // Product Search
    const prodSearch = document.getElementById("cmsProductSearch");
    if (prodSearch) {
      prodSearch.addEventListener("input", renderProductsTab);
    }

    // Add Product Modal Open/Close
    const openAddBtn = document.getElementById("openAddProductModalBtn");
    if (openAddBtn) {
      openAddBtn.addEventListener("click", () => openProductModal(null));
    }
    const closeProdModalBtn = document.getElementById("closeProductModalBtn");
    if (closeProdModalBtn) {
      closeProdModalBtn.addEventListener("click", () => {
        document.getElementById("cmsProductModal").classList.remove("open");
      });
    }

    // Upload Product Image 1 & 2
    const fileInput1 = document.getElementById("prodImg1File");
    if (fileInput1) {
      fileInput1.addEventListener("change", async (e) => {
        if (!e.target.files[0]) return;
        tempImage1 = await compressImageFile(e.target.files[0], 720, 0.82);
        updateProductModalImagePreviews();
        cmsToast("Gambar utama berhasil dimuat!");
      });
    }

    const fileInput2 = document.getElementById("prodImg2File");
    if (fileInput2) {
      fileInput2.addEventListener("change", async (e) => {
        if (!e.target.files[0]) return;
        tempImage2 = await compressImageFile(e.target.files[0], 720, 0.82);
        updateProductModalImagePreviews();
        cmsToast("Gambar kedua (hover) berhasil dimuat!");
      });
    }

    // Auto Generate Bottle SVG in Modal
    const genSvgBtn = document.getElementById("generateAutoBottleSvgBtn");
    if (genSvgBtn) {
      genSvgBtn.addEventListener("click", () => {
        const name = document.getElementById("prodName").value.trim() || "ANDRD";
        const cat = document.getElementById("prodCategory").value || "Extrait";
        const top = document.getElementById("prodTopNotes").value.trim() || "Signature Notes";
        if (window.createBottleSvg && window.createNotesSvg) {
          tempImage1 = window.createBottleSvg(name, cat, "Extrait de Parfum");
          tempImage2 = window.createNotesSvg(name, top.replace(/,/g, "  •  "));
          updateProductModalImagePreviews();
          cmsToast("Ilustrasi botol otomatis dibuat!");
        }
      });
    }

    // Save Product Form
    const prodForm = document.getElementById("cmsProductForm");
    if (prodForm) {
      prodForm.addEventListener("submit", handleSaveProductForm);
    }

    // Add / Edit Review Modal & Form
    const openAddRevBtn = document.getElementById("openAddReviewModalBtn");
    if (openAddRevBtn) {
      openAddRevBtn.addEventListener("click", () => openReviewModal(null));
    }
    const closeRevModalBtn = document.getElementById("closeCmsReviewModalBtn");
    if (closeRevModalBtn) {
      closeRevModalBtn.addEventListener("click", () => {
        document.getElementById("cmsReviewModal").classList.remove("open");
      });
    }
    const revForm = document.getElementById("cmsReviewForm");
    if (revForm) {
      revForm.addEventListener("submit", handleSaveReviewForm);
    }

    // Add New Staff User Form
    const addUserForm = document.getElementById("cmsAddUserForm");
    if (addUserForm) {
      addUserForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("newUserName").value.trim();
        const email = document.getElementById("newUserEmail").value.trim().toLowerCase();
        const pin = document.getElementById("newUserPin").value.trim();
        const role = document.getElementById("newUserRole").value;
        if (!name || !email || !pin) return;

        const all = getUsers();
        all.push({
          id: "usr-" + Date.now().toString().slice(-4),
          name,
          email,
          pin,
          role,
          active: true
        });
        saveUsers(all, `Menambahkan staf baru "${name}" (${role})`);
        addUserForm.reset();
        renderUsersTab();
        cmsToast(`User ${name} (${role}) berhasil ditambahkan!`);
      });
    }

    // Save Store Settings Form
    const settingsForm = document.getElementById("cmsSettingsForm");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const cfg = getConfig();
        cfg.brandName = document.getElementById("setBrandName").value.trim();
        cfg.tagline = document.getElementById("setTagline").value.trim();
        cfg.whatsappAdmin = document.getElementById("setWaAdmin").value.trim().replace(/\D/g, "");
        cfg.whatsappDisplay = document.getElementById("setWaDisplay").value.trim();
        cfg.instagram = document.getElementById("setInstagram").value.trim();
        cfg.address = document.getElementById("setAddress").value.trim();
        cfg.operationalHours = document.getElementById("setHours").value.trim();
        saveConfig(cfg, "Memperbarui pengaturan identitas & WhatsApp toko");
        cmsToast("Pengaturan toko berhasil disimpan!");
      });
    }

    // Export products.js & config.js
    const dlProductsBtn = document.getElementById("downloadProductsJsBtn");
    if (dlProductsBtn) {
      dlProductsBtn.addEventListener("click", () => {
        downloadTextFile("products.js", buildExportedProductsJs());
        cmsToast("File products.js berhasil diunduh!");
      });
    }

    const dlConfigBtn = document.getElementById("downloadConfigJsBtn");
    if (dlConfigBtn) {
      dlConfigBtn.addEventListener("click", () => {
        downloadTextFile("config.js", buildExportedConfigJs());
        cmsToast("File config.js berhasil diunduh!");
      });
    }

    // Direct Publish to GitHub / Vercel
    const publishGhBtn = document.getElementById("publishToGitHubBtn");
    if (publishGhBtn) {
      publishGhBtn.addEventListener("click", async () => {
        const token = document.getElementById("setGhToken").value.trim();
        const repo = document.getElementById("setGhRepo").value.trim() || "Devarianto/andrd-perfume";
        if (!token) {
          cmsToast("Masukkan GitHub Personal Access Token terlebih dahulu!");
          return;
        }
        localStorage.setItem(KEYS.GH_TOKEN, token);
        publishGhBtn.disabled = true;
        publishGhBtn.textContent = "Mempublish ke GitHub & Vercel...";
        try {
          await publishFileToGitHub(
            repo,
            "products.js",
            buildExportedProductsJs(),
            token,
            "CMS Auto-Publish: Update products.js"
          );
          await publishFileToGitHub(
            repo,
            "config.js",
            buildExportedConfigJs(),
            token,
            "CMS Auto-Publish: Update config.js"
          );
          addActivityLog(`Publish otomatis ke GitHub (${repo})`);
          cmsToast("Berhasil! Website Vercel akan ter-update dalam 15 detik.");
        } catch (err) {
          cmsToast("Gagal publish: " + err.message);
        } finally {
          publishGhBtn.disabled = false;
          publishGhBtn.textContent = "Publish Langsung ke GitHub & Vercel";
        }
      });
    }

    // Reset CMS Data to Default
    const resetCmsBtn = document.getElementById("resetCmsDataBtn");
    if (resetCmsBtn) {
      resetCmsBtn.addEventListener("click", () => {
        if (confirm("Kembalikan seluruh produk & konten ke bawaan awal?")) {
          localStorage.removeItem(KEYS.PRODUCTS);
          localStorage.removeItem(KEYS.CONFIG);
          localStorage.removeItem(KEYS.REVIEWS);
          addActivityLog("Reset data produk & konfigurasi ke default");
          cmsToast("Data dikembalikan ke bawaan awal.");
          location.reload();
        }
      });
    }

    renderAuthOrApp();
  });
})();
