/**
 * ============================================================================
 * CORE APPLICATION SCRIPT "ANDRD" (assets/js/app.js)
 * ============================================================================
 * Mengelola: Keranjang (localStorage), Render Produk, Header/Drawer,
 * Live Search, Detail Produk, Filter Katalog, dan Checkout ke WhatsApp.
 */

(function () {
  "use strict";

  const CART_STORAGE_KEY = "andrd_cart_v1";
  const LAST_ORDER_KEY = "andrd_last_order_v1";

  /* ==========================================================================
     1. HELPER & UTILITIES
     ========================================================================== */
  function formatRupiah(amount) {
    if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
    return "Rp " + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function sanitizeInput(str) {
    if (!str) return "";
    return String(str)
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  function buildWhatsAppUrl(phone, text) {
    const cleanPhone = String(phone || STORE_CONFIG.whatsappAdmin).replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  function generateOrderNumber() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = (window.STORE_CONFIG && STORE_CONFIG.orderPrefix) || "ANDRD";
    return `${prefix}-${yy}${mm}${dd}-${rand}`;
  }

  function normalizeIndonesianPhone(rawPhone) {
    const digits = String(rawPhone || "").replace(/[\s\-().+]/g, "");
    if (digits.startsWith("08")) {
      return "62" + digits.slice(1);
    }
    return digits;
  }

  function isValidIndonesianPhone(rawPhone) {
    const digits = String(rawPhone || "").replace(/[\s\-().+]/g, "");
    return /^(08|628)\d{8,12}$/.test(digits);
  }

  /* ==========================================================================
     2. KERANJANG BELANJA (LOCALSTORAGE)
     ========================================================================== */
  function getCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Gagal menyimpan keranjang:", e);
    }
    updateCartUI();
  }

  function addToCart(productId, size, qty = 1, openDrawer = true) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product || product.status === "sold-out") return false;

    const variant = product.variants.find((v) => v.size === size) || product.variants[0];
    const cart = getCart();
    const cartItemKey = `${product.id}__${variant.size}`;

    const existingIndex = cart.findIndex((item) => item.key === cartItemKey);
    if (existingIndex > -1) {
      cart[existingIndex].qty += Number(qty);
    } else {
      cart.push({
        key: cartItemKey,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: variant.size,
        price: variant.price,
        image: product.images[0],
        status: product.status,
        qty: Number(qty)
      });
    }

    saveCart(cart);
    showToast(`${product.name} (${variant.size}) ditambahkan ke keranjang.`);
    if (openDrawer) {
      toggleCartDrawer(true);
    }
    return true;
  }

  function updateCartQty(cartItemKey, newQty) {
    let cart = getCart();
    const qtyNum = Number(newQty);
    if (qtyNum <= 0) {
      cart = cart.filter((item) => item.key !== cartItemKey);
    } else {
      const idx = cart.findIndex((item) => item.key === cartItemKey);
      if (idx > -1) {
        cart[idx].qty = Math.min(qtyNum, 99);
      }
    }
    saveCart(cart);
  }

  function removeFromCart(cartItemKey) {
    const cart = getCart().filter((item) => item.key !== cartItemKey);
    saveCart(cart);
    showToast("Item dihapus dari keranjang.");
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }

  function getCartSubtotal() {
    return getCart().reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  }

  /* ==========================================================================
     3. TOAST NOTIFICATION
     ========================================================================== */
  function showToast(message) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <span>${sanitizeInput(message)}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 2800);
  }

  /* ==========================================================================
     4. RENDER KARTU PRODUK (REUSABLE)
     ========================================================================== */
  function renderProductCard(product) {
    const minVariant = product.variants.reduce(
      (min, v) => (v.price < min.price ? v : min),
      product.variants[0]
    );
    const defaultPerfumeSize = product.variants[1] ? product.variants[1].size : product.variants[0].size;

    const badgesHtml = [];
    if (product.status === "sold-out") {
      badgesHtml.push(`<span class="badge badge-soldout">Sold Out</span>`);
    } else if (product.status === "pre-order") {
      badgesHtml.push(`<span class="badge badge-preorder">Pre-Order</span>`);
    }
    if (product.badge) {
      const badgeClass =
        product.badge === "Best Seller"
          ? "badge-bestseller"
          : product.badge === "New"
          ? "badge-new"
          : "badge-sale";
      badgesHtml.push(`<span class="badge ${badgeClass}">${product.badge}</span>`);
    }

    const compareHtml = minVariant.compareAtPrice
      ? `<span class="price-compare">${formatRupiah(minVariant.compareAtPrice)}</span>`
      : "";

    const primaryImg = product.images[0];
    const secondaryImg = product.images[1] || product.images[0];
    const allTopNotes = product.notes && product.notes.top ? product.notes.top.join(" • ") : "";

    let actionButtonHtml = "";
    if (product.status === "sold-out") {
      const restockText = STORE_CONFIG.buildRestockMessage(product.name, "");
      const waUrl = buildWhatsAppUrl(STORE_CONFIG.whatsappAdmin, restockText);
      actionButtonHtml = `
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-restock" aria-label="Kabari saya saat ${product.name} restock">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          Kabari Saya
        </a>
      `;
    } else {
      const btnLabel = product.status === "pre-order" ? "+ Pre-Order" : "+ Keranjang";
      actionButtonHtml = `
        <button type="button" class="btn btn-primary js-quick-add" data-product-id="${product.id}" data-size="${defaultPerfumeSize}">
          ${btnLabel} (${defaultPerfumeSize})
        </button>
      `;
    }

    return `
      <article class="product-card" data-product-id="${product.id}">
        <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-media" aria-label="Lihat detail ${product.name}">
          <div class="product-badges">${badgesHtml.join("")}</div>
          <img src="${primaryImg}" alt="${product.name} - ${product.scentCategory} Extrait de Parfum" class="product-img-primary" loading="lazy" width="400" height="400">
          <img src="${secondaryImg}" alt="Komposisi notes aroma ${product.name}" class="product-img-secondary" loading="lazy" width="400" height="400">
        </a>
        <div class="product-body">
          <div class="product-meta">${product.gender} • ${product.scentCategory}</div>
          <h3 class="product-title">
            <a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a>
          </h3>
          <p class="product-notes-preview">${allTopNotes}</p>
          <div class="product-price-wrap">
            <span class="price-from-label">Mulai dari</span>
            <span class="price-current">${formatRupiah(minVariant.price)}</span>
            ${compareHtml}
          </div>
          <div class="product-card-actions">
            ${actionButtonHtml}
          </div>
        </div>
      </article>
    `;
  }

  /* ==========================================================================
     5. HEADER, FOOTER, CART DRAWER & FLOATING WA INJECTION
     ========================================================================== */
  function injectGlobalShell() {
    // 1. Announcement Bar
    const announcementEl = document.getElementById("announcementBar");
    if (announcementEl) {
      announcementEl.textContent = STORE_CONFIG.announcementText;
    }

    // 2. Non-COD Banner
    document.querySelectorAll(".js-non-cod-banner").forEach((el) => {
      el.innerHTML = `
        <div class="container">
          <strong>INFO PEMBAYARAN RESMI:</strong> ${STORE_CONFIG.nonCodNotice}
        </div>
      `;
    });

    // 3. Header
    const headerEl = document.getElementById("siteHeader");
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const isCatalogue = window.location.search.includes("view=catalogue");

    if (headerEl) {
      headerEl.innerHTML = `
        <div class="container header-inner">
          <button type="button" class="mobile-menu-btn" id="openMobileMenuBtn" aria-label="Buka Menu Navigasi">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="15" y2="18"></line>
            </svg>
          </button>

          <a href="index.html" class="brand-logo" aria-label="${STORE_CONFIG.brandName} Beranda">${STORE_CONFIG.brandName}</a>

          <nav class="main-nav" aria-label="Menu Utama">
            <a href="index.html" class="nav-link ${currentPath === "index.html" ? "active" : ""}">Home</a>
            <a href="products.html" class="nav-link ${currentPath === "products.html" && !isCatalogue ? "active" : ""}">Products</a>
            <a href="products.html?view=catalogue" class="nav-link ${isCatalogue ? "active" : ""}">Catalogue</a>
            <a href="about.html" class="nav-link ${currentPath === "about.html" ? "active" : ""}">About</a>
            <a href="contact.html" class="nav-link ${currentPath === "contact.html" ? "active" : ""}">Contact</a>
          </nav>

          <div class="header-actions">
            <button type="button" class="icon-btn" id="toggleSearchBtn" aria-label="Cari Parfum">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button type="button" class="icon-btn" id="openCartDrawerBtn" aria-label="Buka Keranjang Belanja">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span class="cart-badge js-cart-badge">0</span>
            </button>
          </div>
        </div>

        <!-- Live Search Overlay -->
        <div class="search-overlay" id="searchOverlay" aria-hidden="true">
          <div class="container">
            <div class="search-input-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="search" id="liveSearchInput" placeholder="Cari nama parfum, aroma (mis. vanilla, citrus, melati, kopi)..." autocomplete="off">
              <button type="button" id="closeSearchBtn" aria-label="Tutup Pencarian" style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Tutup ✕</button>
            </div>
            <div class="live-search-results" id="liveSearchResults"></div>
          </div>
        </div>
      `;
    }

    // 4. Mobile Menu & Cart Drawer Injection
    const drawersWrapper = document.createElement("div");
    drawersWrapper.innerHTML = `
      <!-- Mobile Nav Drawer -->
      <div class="mobile-nav-drawer" id="mobileNavDrawer" aria-hidden="true">
        <div class="drawer-backdrop" id="closeMobileNavBackdrop"></div>
        <div class="mobile-nav-panel">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="brand-logo" style="font-size:24px;">${STORE_CONFIG.brandName}</span>
            <button type="button" id="closeMobileMenuBtn" aria-label="Tutup Menu" style="padding:8px;font-size:18px;">✕</button>
          </div>
          <nav class="mobile-nav-links" aria-label="Menu Mobile">
            <a href="index.html">Home</a>
            <a href="products.html">All Products</a>
            <a href="products.html?view=catalogue">Scent Catalogue</a>
            <a href="about.html">Our Story</a>
            <a href="contact.html">Contact & Studio</a>
            <a href="policies.html"> Kebijakan & Pengiriman</a>
          </nav>
          <div style="margin-top:auto;padding-top:24px;font-size:12.5px;color:var(--color-text-muted);">
            <p style="font-weight:600;color:var(--color-primary);margin-bottom:4px;">Butuh Bantuan Aroma?</p>
            <p>${STORE_CONFIG.operationalHours}</p>
          </div>
        </div>
      </div>

      <!-- Slide-over Cart Drawer -->
      <aside class="cart-drawer" id="cartDrawer" aria-hidden="true" aria-label="Keranjang Belanja">
        <div class="drawer-backdrop" id="closeCartBackdrop"></div>
        <div class="cart-drawer-panel">
          <div class="cart-drawer-header">
            <h2 style="font-size:22px;">Keranjang (<span class="js-cart-badge">0</span>)</h2>
            <button type="button" id="closeCartDrawerBtn" aria-label="Tutup Keranjang" style="font-size:18px;padding:6px;">✕</button>
          </div>
          <div class="cart-drawer-body" id="cartDrawerItems"></div>
          <div class="cart-drawer-footer" id="cartDrawerFooter">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:13px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.08em;">Subtotal</span>
              <strong style="font-size:18px;" id="cartDrawerSubtotal">Rp 0</strong>
            </div>
            <p style="font-size:11.5px;color:var(--color-text-muted);margin-bottom:14px;">Ongkos kirim dihitung oleh Admin via WhatsApp setelah checkout.</p>
            <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:10px;">
              <a href="cart.html" class="btn btn-outline" style="padding:12px 10px;">Lihat Keranjang</a>
              <a href="checkout.html" class="btn btn-primary" id="drawerCheckoutBtn" style="padding:12px 10px;">Lanjut Checkout</a>
            </div>
          </div>
        </div>
      </aside>
    `;
    document.body.appendChild(drawersWrapper);

    // 5. Floating WhatsApp Button (General Inquiry)
    const floatingWa = document.createElement("a");
    floatingWa.href = buildWhatsAppUrl(
      STORE_CONFIG.whatsappAdmin,
      STORE_CONFIG.buildGeneralInquiryMessage()
    );
    floatingWa.target = "_blank";
    floatingWa.rel = "noopener noreferrer";
    floatingWa.className = "floating-wa";
    floatingWa.setAttribute("aria-label", "Konsultasi Aroma via WhatsApp");
    floatingWa.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <span>Tanya Fragrance Concierge</span>
    `;
    document.body.appendChild(floatingWa);

    // 6. Footer Injection
    const footerEl = document.getElementById("siteFooter");
    if (footerEl) {
      const waConsultUrl = buildWhatsAppUrl(
        STORE_CONFIG.whatsappAdmin,
        STORE_CONFIG.buildGeneralInquiryMessage()
      );
      footerEl.innerHTML = `
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="index.html" class="footer-brand">${STORE_CONFIG.brandName}</a>
              <p style="font-size:13.5px;color:#C2BBB2;margin-bottom:16px;max-width:340px;">
                ${STORE_CONFIG.tagline}. ${STORE_CONFIG.subTagline}
              </p>
              <p style="font-size:12.5px;color:#9E978F;">
                ${STORE_CONFIG.address}<br>
                WhatsApp: <a href="${waConsultUrl}" target="_blank" rel="noopener" style="color:#FAF7F2;text-decoration:underline;">${STORE_CONFIG.whatsappDisplay}</a>
              </p>
            </div>

            <div>
              <h3 class="footer-heading">Koleksi</h3>
              <ul class="footer-links">
                <li><a href="products.html">Semua Parfum</a></li>
                <li><a href="products.html?gender=For+Her">For Her</a></li>
                <li><a href="products.html?gender=For+Him">For Him</a></li>
                <li><a href="products.html?gender=Unisex">Unisex</a></li>
                <li><a href="products.html?view=catalogue">Katalog Aroma</a></li>
              </ul>
            </div>

            <div>
              <h3 class="footer-heading">Informasi & Kebijakan</h3>
              <ul class="footer-links">
                <li><a href="about.html">Tentang ${STORE_CONFIG.brandName}</a></li>
                <li><a href="contact.html">Hubungi Kami</a></li>
                <li><a href="policies.html#pengiriman">Kebijakan Pengiriman</a></li>
                <li><a href="policies.html#pengembalian">Garansi & Retur (${STORE_CONFIG.returnPolicyDays} Hari)</a></li>
                <li><a href="policies.html#syarat">Syarat & Ketentuan</a></li>
                <li><a href="policies.html#privasi">Kebijakan Privasi</a></li>
              </ul>
            </div>

            <div>
              <h3 class="footer-heading">Jurnal Olfaktori</h3>
              <p style="font-size:13px;color:#C2BBB2;">Dapatkan undangan rilis batch terbatas dan panduan layering aroma.</p>
              <form class="newsletter-form" id="newsletterForm">
                <input type="email" placeholder="Alamat email Anda" required aria-label="Alamat email newsletter">
                <button type="submit" class="btn btn-primary" style="background:var(--color-accent);border-color:var(--color-accent);padding:10px 16px;">Daftar</button>
              </form>
              <div style="margin-top:18px;display:flex;gap:14px;font-size:12.5px;color:#C2BBB2;">
                <a href="https://instagram.com" target="_blank" rel="noopener">Instagram (${STORE_CONFIG.instagram})</a>
                <span>•</span>
                <a href="https://tiktok.com" target="_blank" rel="noopener">TikTok</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} ${STORE_CONFIG.brandLegalName}. Seluruh hak cipta dilindungi.</span>
            <span> Pembayaran Resmi via Konfirmasi WhatsApp • Tanpa COD</span>
          </div>
        </div>
      `;

      const newsForm = document.getElementById("newsletterForm");
      if (newsForm) {
        newsForm.addEventListener("submit", function (e) {
          e.preventDefault();
          newsForm.reset();
          showToast("Terima kasih telah bergabung di Jurnal Olfaktori ANDRD.");
        });
      }
    }

    bindShellEvents();
    updateCartUI();
  }

  function toggleCartDrawer(open) {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    if (open) {
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
    } else {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
    }
  }

  function updateCartUI() {
    const cart = getCart();
    const count = getCartCount();
    const subtotal = getCartSubtotal();

    document.querySelectorAll(".js-cart-badge").forEach((el) => {
      el.textContent = count;
    });

    const drawerItemsEl = document.getElementById("cartDrawerItems");
    const drawerSubtotalEl = document.getElementById("cartDrawerSubtotal");
    const drawerCheckoutBtn = document.getElementById("drawerCheckoutBtn");

    if (drawerSubtotalEl) {
      drawerSubtotalEl.textContent = formatRupiah(subtotal);
    }

    if (drawerItemsEl) {
      if (cart.length === 0) {
        drawerItemsEl.innerHTML = `
          <div style="text-align:center;padding:48px 16px;">
            <p style="font-family:var(--font-heading);font-size:22px;margin-bottom:8px;">Keranjang Anda Kosong</p>
            <p style="font-size:13.5px;color:var(--color-text-muted);margin-bottom:20px;">Temukan aroma signature yang dirancang untuk karakter Anda.</p>
            <a href="products.html" class="btn btn-primary">Jelajahi Parfum</a>
          </div>
        `;
        if (drawerCheckoutBtn) {
          drawerCheckoutBtn.style.pointerEvents = "none";
          drawerCheckoutBtn.style.opacity = "0.5";
        }
      } else {
        if (drawerCheckoutBtn) {
          drawerCheckoutBtn.style.pointerEvents = "auto";
          drawerCheckoutBtn.style.opacity = "1";
        }
        drawerItemsEl.innerHTML = cart
          .map(
            (item) => `
            <div class="cart-item">
              <a href="product.html?id=${encodeURIComponent(item.productId)}">
                <img src="${item.image}" alt="${item.name}">
              </a>
              <div>
                <div style="display:flex;justify-content:space-between;gap:8px;">
                  <a href="product.html?id=${encodeURIComponent(item.productId)}" style="font-weight:600;font-size:14px;">${item.name}</a>
                  <button type="button" class="js-remove-item" data-key="${item.key}" aria-label="Hapus ${item.name}" style="color:var(--color-text-muted);font-size:13px;">✕</button>
                </div>
                <div style="font-size:12px;color:var(--color-text-muted);margin:2px 0 8px;">Ukuran: ${item.size} ${item.status === "pre-order" ? "• Pre-Order" : ""}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div class="qty-control" style="height:30px;">
                    <button type="button" class="qty-btn js-qty-dec" data-key="${item.key}" data-qty="${item.qty - 1}" style="width:28px;height:28px;">−</button>
                    <span style="padding:0 8px;font-size:13px;font-weight:600;">${item.qty}</span>
                    <button type="button" class="qty-btn js-qty-inc" data-key="${item.key}" data-qty="${item.qty + 1}" style="width:28px;height:28px;">+</button>
                  </div>
                  <strong style="font-size:13.5px;">${formatRupiah(item.price * item.qty)}</strong>
                </div>
              </div>
            </div>
          `
          )
          .join("");
      }
    }

    // Jika sedang di halaman cart.html, perbarui juga tabelnya
    if (document.getElementById("cartPageContainer")) {
      renderCartPage();
    }
  }

  function bindShellEvents() {
    // Scroll shadow
    window.addEventListener("scroll", () => {
      const header = document.getElementById("siteHeader");
      if (header) {
        header.classList.toggle("scrolled", window.scrollY > 10);
      }
    });

    // Mobile Nav
    const mobileNav = document.getElementById("mobileNavDrawer");
    const openMobileBtn = document.getElementById("openMobileMenuBtn");
    const closeMobileBtn = document.getElementById("closeMobileMenuBtn");
    const closeMobileBackdrop = document.getElementById("closeMobileNavBackdrop");

    if (openMobileBtn && mobileNav) {
      openMobileBtn.addEventListener("click", () => mobileNav.classList.add("open"));
    }
    if (closeMobileBtn && mobileNav) {
      closeMobileBtn.addEventListener("click", () => mobileNav.classList.remove("open"));
    }
    if (closeMobileBackdrop && mobileNav) {
      closeMobileBackdrop.addEventListener("click", () => mobileNav.classList.remove("open"));
    }

    // Cart Drawer
    const openCartBtn = document.getElementById("openCartDrawerBtn");
    const closeCartBtn = document.getElementById("closeCartDrawerBtn");
    const closeCartBackdrop = document.getElementById("closeCartBackdrop");

    if (openCartBtn) openCartBtn.addEventListener("click", () => toggleCartDrawer(true));
    if (closeCartBtn) closeCartBtn.addEventListener("click", () => toggleCartDrawer(false));
    if (closeCartBackdrop) closeCartBackdrop.addEventListener("click", () => toggleCartDrawer(false));

    // Live Search
    const toggleSearchBtn = document.getElementById("toggleSearchBtn");
    const closeSearchBtn = document.getElementById("closeSearchBtn");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchInput = document.getElementById("liveSearchInput");
    const searchResults = document.getElementById("liveSearchResults");

    if (toggleSearchBtn && searchOverlay) {
      toggleSearchBtn.addEventListener("click", () => {
        const isOpen = searchOverlay.classList.toggle("open");
        if (isOpen && searchInput) {
          setTimeout(() => searchInput.focus(), 80);
        }
      });
    }
    if (closeSearchBtn && searchOverlay) {
      closeSearchBtn.addEventListener("click", () => searchOverlay.classList.remove("open"));
    }

    if (searchInput && searchResults) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 1) {
          searchResults.innerHTML = "";
          return;
        }
        const matched = PRODUCTS.filter((p) => {
          const allNotes = [
            ...(p.notes.top || []),
            ...(p.notes.middle || []),
            ...(p.notes.base || [])
          ].join(" ");
          return (
            p.name.toLowerCase().includes(q) ||
            p.scentCategory.toLowerCase().includes(q) ||
            p.gender.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            allNotes.toLowerCase().includes(q)
          );
        });

        if (matched.length === 0) {
          searchResults.innerHTML = `<p style="font-size:13.5px;color:var(--color-text-muted);padding:8px 0;">Tidak ditemukan parfum untuk kata kunci "${sanitizeInput(q)}".</p>`;
        } else {
          searchResults.innerHTML = matched
            .slice(0, 6)
            .map(
              (p) => `
              <a href="product.html?id=${encodeURIComponent(p.id)}" class="search-result-item">
                <img src="${p.images[0]}" alt="${p.name}">
                <div>
                  <div style="font-weight:700;font-size:14.5px;">${p.name}</div>
                  <div style="font-size:12px;color:var(--color-text-muted);">${p.gender} • ${p.scentCategory}</div>
                  <div style="font-size:12.5px;font-weight:600;color:var(--color-accent);">Mulai ${formatRupiah(p.variants[0].price)}</div>
                </div>
              </a>
            `
            )
            .join("");
        }
      });
    }

    // Delegated Events for Quick Add & Cart Item Controls
    document.body.addEventListener("click", (e) => {
      const quickAddBtn = e.target.closest(".js-quick-add");
      if (quickAddBtn) {
        e.preventDefault();
        const pid = quickAddBtn.getAttribute("data-product-id");
        const size = quickAddBtn.getAttribute("data-size");
        addToCart(pid, size, 1, true);
        return;
      }

      const decBtn = e.target.closest(".js-qty-dec");
      if (decBtn) {
        updateCartQty(decBtn.getAttribute("data-key"), Number(decBtn.getAttribute("data-qty")));
        return;
      }

      const incBtn = e.target.closest(".js-qty-inc");
      if (incBtn) {
        updateCartQty(incBtn.getAttribute("data-key"), Number(incBtn.getAttribute("data-qty")));
        return;
      }

      const remBtn = e.target.closest(".js-remove-item");
      if (remBtn) {
        removeFromCart(remBtn.getAttribute("data-key"));
        return;
      }
    });
  }

  /* ==========================================================================
     6. HOME PAGE CONTROLLER (index.html)
     ========================================================================== */
  function initHomePage() {
    // A. Hero Slider (3 slides, autoplay, dots, touch swipe)
    const track = document.getElementById("heroTrack");
    const dots = document.querySelectorAll(".hero-dot");
    if (track && dots.length > 0) {
      let currentSlide = 0;
      const slideCount = dots.length;
      let autoPlayTimer = null;

      function goToSlide(index) {
        currentSlide = (index + slideCount) % slideCount;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((d, idx) => d.classList.toggle("active", idx === currentSlide));
      }

      function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 5500);
      }

      function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
      }

      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
          startAutoPlay();
        });
      });

      // Touch swipe support on mobile
      let touchStartX = 0;
      track.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
          stopAutoPlay();
        },
        { passive: true }
      );
      track.addEventListener(
        "touchend",
        (e) => {
          const diff = e.changedTouches[0].screenX - touchStartX;
          if (Math.abs(diff) > 45) {
            if (diff < 0) goToSlide(currentSlide + 1);
            else goToSlide(currentSlide - 1);
          }
          startAutoPlay();
        },
        { passive: true }
      );

      startAutoPlay();
    }

    // B. Best Seller / Featured Grid
    const featuredGrid = document.getElementById("featuredProductsGrid");
    if (featuredGrid) {
      const featuredProducts = PRODUCTS.filter((p) => p.featured).slice(0, 4);
      featuredGrid.innerHTML = featuredProducts.map(renderProductCard).join("");
    }

    // C. Fresh Picks / Seasonal Carousel
    const seasonalTrack = document.getElementById("seasonalCarouselTrack");
    if (seasonalTrack) {
      const seasonalProducts = PRODUCTS.filter((p) => p.seasonal);
      seasonalTrack.innerHTML = seasonalProducts.map(renderProductCard).join("");

      const prevBtn = document.getElementById("carouselPrevBtn");
      const nextBtn = document.getElementById("carouselNextBtn");
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
          seasonalTrack.scrollBy({ left: -300, behavior: "smooth" });
        });
        nextBtn.addEventListener("click", () => {
          seasonalTrack.scrollBy({ left: 300, behavior: "smooth" });
        });
      }
    }

    // D. Explore by Scent (Automatic Product Count from PRODUCTS)
    const scentGrid = document.getElementById("exploreScentGrid");
    if (scentGrid && STORE_CONFIG.scentCategories) {
      scentGrid.innerHTML = STORE_CONFIG.scentCategories
        .map((cat) => {
          const count = PRODUCTS.filter((p) => p.scentCategory === cat.id).length;
          return `
            <a href="products.html?scent=${encodeURIComponent(cat.id)}" class="scent-card" style="--scent-accent:${cat.accent}">
              <div class="scent-top">
                <h3 class="scent-name">${cat.name}</h3>
                <span class="scent-count">${count} Produk</span>
              </div>
              <p class="scent-desc">${cat.subtitle}</p>
            </a>
          `;
        })
        .join("");
    }
  }

  /* ==========================================================================
     7. PRODUCTS & CATALOGUE PAGE CONTROLLER (products.html)
     ========================================================================== */
  function initProductsPage() {
    const gridEl = document.getElementById("catalogProductsGrid");
    if (!gridEl) return;

    const searchInput = document.getElementById("catalogSearchInput");
    const sortSelect = document.getElementById("catalogSortSelect");
    const priceRangeInput = document.getElementById("catalogPriceRange");
    const priceRangeLabel = document.getElementById("catalogPriceLabel");
    const resetBtn = document.getElementById("resetFiltersBtn");
    const countLabel = document.getElementById("catalogCountLabel");
    const pageTitle = document.getElementById("catalogPageTitle");
    const scentCheckboxes = document.querySelectorAll('input[name="filterScent"]');
    const genderCheckboxes = document.querySelectorAll('input[name="filterGender"]');
    const sizeCheckboxes = document.querySelectorAll('input[name="filterSize"]');

    // Read URL Query Parameters
    const params = new URLSearchParams(window.location.search);
    const paramGender = params.get("gender");
    const paramScent = params.get("scent");
    const paramQuery = params.get("q");
    const isCatalogueView = params.get("view") === "catalogue";

    if (isCatalogueView && pageTitle) {
      pageTitle.textContent = "Olfactory Scent Catalogue";
    }
    if (paramGender) {
      genderCheckboxes.forEach((cb) => {
        if (cb.value.toLowerCase() === paramGender.toLowerCase()) cb.checked = true;
      });
    }
    if (paramScent) {
      scentCheckboxes.forEach((cb) => {
        if (cb.value.toLowerCase() === paramScent.toLowerCase()) cb.checked = true;
      });
    }
    if (paramQuery && searchInput) {
      searchInput.value = paramQuery;
    }

    function applyFilters() {
      const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      const sortBy = sortSelect ? sortSelect.value : "featured";
      const maxPrice = priceRangeInput ? Number(priceRangeInput.value) : 700000;

      if (priceRangeLabel) {
        priceRangeLabel.textContent = formatRupiah(maxPrice);
      }

      const selectedScents = Array.from(scentCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

      const selectedGenders = Array.from(genderCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

      const selectedSizes = Array.from(sizeCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

      let filtered = PRODUCTS.filter((p) => {
        // Search query
        if (q) {
          const notesStr = [
            ...(p.notes.top || []),
            ...(p.notes.middle || []),
            ...(p.notes.base || [])
          ]
            .join(" ")
            .toLowerCase();
          const matchText =
            p.name.toLowerCase().includes(q) ||
            p.scentCategory.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            notesStr.includes(q);
          if (!matchText) return false;
        }

        // Scent Category
        if (selectedScents.length > 0 && !selectedScents.includes(p.scentCategory)) {
          return false;
        }

        // Gender
        if (selectedGenders.length > 0 && !selectedGenders.includes(p.gender)) {
          return false;
        }

        // Size & Price
        const matchingVariants = p.variants.filter((v) => {
          const sizeMatch = selectedSizes.length === 0 || selectedSizes.includes(v.size);
          const priceMatch = v.price <= maxPrice;
          return sizeMatch && priceMatch;
        });

        return matchingVariants.length > 0;
      });

      // Sorting
      filtered.sort((a, b) => {
        const minA = a.variants[0].price;
        const minB = b.variants[0].price;
        if (sortBy === "price-asc") return minA - minB;
        if (sortBy === "price-desc") return minB - minA;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        // Default: featured first
        return Number(b.featured) - Number(a.featured);
      });

      if (countLabel) {
        countLabel.textContent = `Menampilkan ${filtered.length} dari ${PRODUCTS.length} parfum`;
      }

      if (filtered.length === 0) {
        gridEl.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:56px 20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);">
            <h3 style="font-size:24px;margin-bottom:8px;">Tidak Ada Parfum yang Sesuai Filter</h3>
            <p style="color:var(--color-text-muted);margin-bottom:18px;">Coba ubah rentang harga atau hapus beberapa filter kategori aroma.</p>
            <button type="button" class="btn btn-outline" id="emptyResetBtn">Reset Semua Filter</button>
          </div>
        `;
        const emptyReset = document.getElementById("emptyResetBtn");
        if (emptyReset) emptyReset.addEventListener("click", resetAllFilters);
      } else {
        gridEl.innerHTML = filtered.map(renderProductCard).join("");
      }
    }

    function resetAllFilters() {
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "featured";
      if (priceRangeInput) priceRangeInput.value = "700000";
      scentCheckboxes.forEach((cb) => (cb.checked = false));
      genderCheckboxes.forEach((cb) => (cb.checked = false));
      sizeCheckboxes.forEach((cb) => (cb.checked = false));
      applyFilters();
    }

    [searchInput, sortSelect, priceRangeInput].forEach((el) => {
      if (el) el.addEventListener("input", applyFilters);
    });
    [...scentCheckboxes, ...genderCheckboxes, ...sizeCheckboxes].forEach((cb) => {
      cb.addEventListener("change", applyFilters);
    });
    if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);

    applyFilters();
  }

  /* ==========================================================================
     8. PRODUCT DETAIL PAGE CONTROLLER (product.html) + JSON-LD SCHEMA
     ========================================================================== */
  function initProductDetailPage() {
    const container = document.getElementById("productDetailContainer");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const slugParam = params.get("slug");

    const product =
      PRODUCTS.find((p) => p.id === idParam || p.slug === slugParam) || PRODUCTS[0];

    // Update Document Title & Meta Description dynamically
    document.title = `${product.name} (${product.scentCategory}) — ${STORE_CONFIG.brandName} Extrait de Parfum`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", `${product.name}: ${product.shortDescription}`);
    }

    // Default selected variant: 50ml (index 1) or first variant
    let selectedVariant = product.variants[1] || product.variants[0];

    const statusBadgeHtml =
      product.status === "sold-out"
        ? `<span class="badge badge-soldout">Sold Out</span>`
        : product.status === "pre-order"
        ? `<span class="badge badge-preorder">Pre-Order (Dikirim 5-7 Hari Kerja)</span>`
        : `<span class="badge" style="background:var(--color-success);color:#fff;">Ready Stock</span>`;

    container.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span>/</span>
        <a href="products.html">Products</a>
        <span>/</span>
        <a href="products.html?scent=${encodeURIComponent(product.scentCategory)}">${product.scentCategory}</a>
        <span>/</span>
        <strong style="color:var(--color-primary);">${product.name}</strong>
      </nav>

      <div class="product-detail-grid">
        <!-- Galeri Gambar -->
        <div>
          <div class="gallery-main">
            <img src="${product.images[0]}" alt="${product.name}" id="detailMainImage" width="600" height="600">
          </div>
          <div class="gallery-thumbs">
            ${product.images
              .map(
                (img, idx) => `
              <button type="button" class="gallery-thumb ${idx === 0 ? "active" : ""}" data-img="${img}" aria-label="Gambar ${idx + 1}">
                <img src="${img}" alt="Thumbnail ${idx + 1} ${product.name}">
              </button>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Informasi & Form Pembelian -->
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:var(--color-accent);font-weight:700;">
              ${product.gender} • ${product.scentCategory}
            </span>
            ${statusBadgeHtml}
            ${product.badge ? `<span class="badge badge-bestseller">${product.badge}</span>` : ""}
          </div>

          <h1 class="detail-title">${product.name}</h1>
          <p style="color:var(--color-text-muted);margin-bottom:18px;">${product.shortDescription}</p>

          <div class="detail-price-box">
            <span class="detail-price" id="detailDynamicPrice">${formatRupiah(selectedVariant.price)}</span>
            <span class="detail-compare" id="detailDynamicCompare">
              ${selectedVariant.compareAtPrice ? formatRupiah(selectedVariant.compareAtPrice) : ""}
            </span>
          </div>

          <!-- Pilihan Varian Ukuran -->
          <div>
            <label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
              Pilih Ukuran Botol: <span id="selectedSizeLabel" style="color:var(--color-accent);">${selectedVariant.size}</span>
            </label>
            <div class="variant-selector" id="variantSelector">
              ${product.variants
                .map(
                  (v) => `
                <button type="button" class="variant-btn ${v.size === selectedVariant.size ? "active" : ""}" data-size="${v.size}">
                  ${v.size}
                </button>
              `
                )
                .join("")}
            </div>
          </div>

          <!-- Jumlah & Tombol Aksi -->
          <div id="detailActionArea"></div>

          <!-- Spesifikasi Singkat -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px;background:var(--color-bg-alt);border-radius:var(--radius-sm);margin-bottom:20px;font-size:12px;">
            <div>
              <span style="color:var(--color-text-muted);display:block;">Konsentrasi</span>
              <strong>${product.concentration}</strong>
            </div>
            <div>
              <span style="color:var(--color-text-muted);display:block;">Ketahanan</span>
              <strong>${product.longevity}</strong>
            </div>
            <div>
              <span style="color:var(--color-text-muted);display:block;">Jejak Aroma</span>
              <strong>${product.sillage}</strong>
            </div>
          </div>

          <!-- Accordion Informasi Lengkap -->
          <div class="accordion" id="detailAccordion">
            <div class="accordion-item open">
              <button type="button" class="accordion-trigger">
                <span>Deskripsi Karakter Aroma</span>
                <span>−</span>
              </button>
              <div class="accordion-content">
                <p>${product.description}</p>
              </div>
            </div>

            <div class="accordion-item open">
              <button type="button" class="accordion-trigger">
                <span>Piramida Notes Aroma</span>
                <span>−</span>
              </button>
              <div class="accordion-content">
                <div class="notes-pyramid">
                  <div class="note-tier">
                    <strong style="color:var(--color-primary);display:block;font-size:12px;text-transform:uppercase;">Top Notes ( kesan pertama 0-15 menit )</strong>
                    <span>${product.notes.top.join(", ")}</span>
                  </div>
                  <div class="note-tier">
                    <strong style="color:var(--color-primary);display:block;font-size:12px;text-transform:uppercase;">Middle / Heart Notes ( karakter inti 15 menit - 4 jam )</strong>
                    <span>${product.notes.middle.join(", ")}</span>
                  </div>
                  <div class="note-tier">
                    <strong style="color:var(--color-primary);display:block;font-size:12px;text-transform:uppercase;">Base Notes ( jejak akhir hingga 12 jam )</strong>
                    <span>${product.notes.base.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button type="button" class="accordion-trigger">
                <span>Cara Pemakaian & Penyimpanan</span>
                <span>+</span>
              </button>
              <div class="accordion-content">
                <p>Semprotkan dengan jarak 15–20 cm pada titik nadi (pergelangan tangan, leher, belakang telinga, atau lipatan siku) setelah menggunakan pelembap/lotion tanpa aroma. Jangan menggosok pergelangan tangan setelah disemprot agar molekul top notes tidak pecah. Simpan di tempat sejuk dan terhindar dari sinar matahari langsung.</p>
              </div>
            </div>

            <div class="accordion-item">
              <button type="button" class="accordion-trigger">
                <span>Pengiriman, Free Vial & Garansi Retur</span>
                <span>+</span>
              </button>
              <div class="accordion-content">
                <p>Setiap pembelian botol ukuran apa pun mendapatkan <strong>Free 2ml Discovery Vial</strong>. Dikemas aman dengan honeycomb wrap tebal. Garansi penggantian baru ${STORE_CONFIG.returnPolicyDays} hari jika botol pecah atau sprayer macet saat diterima (wajib menyertakan video unboxing tanpa jeda).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    function renderActionArea() {
      const actionEl = document.getElementById("detailActionArea");
      if (!actionEl) return;

      if (product.status === "sold-out") {
        const waMsg = STORE_CONFIG.buildRestockMessage(product.name, selectedVariant.size);
        const waHref = buildWhatsAppUrl(STORE_CONFIG.whatsappAdmin, waMsg);
        actionEl.innerHTML = `
          <div style="padding:16px;border:1px dashed var(--color-accent);background:var(--color-surface);border-radius:var(--radius-sm);margin-bottom:20px;">
            <p style="font-size:13.5px;margin-bottom:12px;color:var(--color-text-muted);">
              Mohon maaf, <strong>${product.name} (${selectedVariant.size})</strong> sedang habis terjual. Klik tombol di bawah untuk mendapatkan notifikasi prioritas via WhatsApp saat batch baru tersedia.
            </p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button type="button" class="btn btn-primary" disabled style="flex:1;">Sold Out</button>
              <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="flex:1.4;">
                Kabari Saya via WhatsApp
              </a>
            </div>
          </div>
        `;
      } else {
        const ctaLabel =
          product.status === "pre-order" ? "Ikut Pre-Order — Tambah ke Keranjang" : "Tambah ke Keranjang";
        actionEl.innerHTML = `
          <div class="qty-action-row">
            <div class="qty-control">
              <button type="button" class="qty-btn" id="detailQtyMinus" aria-label="Kurangi jumlah">−</button>
              <input type="number" id="detailQtyInput" class="qty-input" value="1" min="1" max="50" aria-label="Jumlah botol">
              <button type="button" class="qty-btn" id="detailQtyPlus" aria-label="Tambah jumlah">+</button>
            </div>
            <button type="button" class="btn btn-primary" id="detailAddToCartBtn" style="flex:1;">
              ${ctaLabel}
            </button>
          </div>
        `;

        const qtyInput = document.getElementById("detailQtyInput");
        document.getElementById("detailQtyMinus").addEventListener("click", () => {
          qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
        });
        document.getElementById("detailQtyPlus").addEventListener("click", () => {
          qtyInput.value = Math.min(50, Number(qtyInput.value) + 1);
        });
        document.getElementById("detailAddToCartBtn").addEventListener("click", () => {
          const qty = Math.max(1, Number(qtyInput.value) || 1);
          addToCart(product.id, selectedVariant.size, qty, true);
        });
      }
    }

    renderActionArea();

    // Thumbnail switching
    container.querySelectorAll(".gallery-thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".gallery-thumb").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("detailMainImage").src = btn.getAttribute("data-img");
      });
    });

    // Variant size switching (dynamic price)
    container.querySelectorAll(".variant-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const size = btn.getAttribute("data-size");
        selectedVariant = product.variants.find((v) => v.size === size) || product.variants[0];
        container.querySelectorAll(".variant-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        document.getElementById("selectedSizeLabel").textContent = selectedVariant.size;
        document.getElementById("detailDynamicPrice").textContent = formatRupiah(
          selectedVariant.price
        );
        document.getElementById("detailDynamicCompare").textContent = selectedVariant.compareAtPrice
          ? formatRupiah(selectedVariant.compareAtPrice)
          : "";
        renderActionArea();
      });
    });

    // Accordion toggle
    container.querySelectorAll(".accordion-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.parentElement;
        const isOpen = item.classList.toggle("open");
        trigger.querySelector("span:last-child").textContent = isOpen ? "−" : "+";
      });
    });

    // Related Products
    const relatedGrid = document.getElementById("relatedProductsGrid");
    if (relatedGrid) {
      const related = PRODUCTS.filter(
        (p) =>
          p.id !== product.id &&
          (p.scentCategory === product.scentCategory || p.gender === product.gender)
      ).slice(0, 4);
      relatedGrid.innerHTML = related.map(renderProductCard).join("");
    }

    // Inject Schema.org Product JSON-LD
    injectProductSchema(product);
  }

  function injectProductSchema(product) {
    const existing = document.getElementById("productSchemaJsonLd");
    if (existing) existing.remove();

    const availabilityMap = {
      ready: "https://schema.org/InStock",
      "pre-order": "https://schema.org/PreOrder",
      "sold-out": "https://schema.org/OutOfStock"
    };

    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: `${STORE_CONFIG.brandName} ${product.name}`,
      image: product.images.map((img) => `${STORE_CONFIG.domain}/${img}`),
      description: product.description,
      sku: product.id,
      brand: {
        "@type": "Brand",
        name: STORE_CONFIG.brandName
      },
      offers: product.variants.map((v) => ({
        "@type": "Offer",
        name: `${product.name} - ${v.size}`,
        priceCurrency: "IDR",
        price: v.price,
        availability: availabilityMap[product.status] || "https://schema.org/InStock",
        url: window.location.href
      }))
    };

    const script = document.createElement("script");
    script.id = "productSchemaJsonLd";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }

  /* ==========================================================================
     9. FULL CART PAGE CONTROLLER (cart.html)
     ========================================================================== */
  function renderCartPage() {
    const container = document.getElementById("cartPageContainer");
    if (!container) return;

    const cart = getCart();
    const subtotal = getCartSubtotal();

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:64px 20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <h2 style="font-size:32px;margin-bottom:10px;">Keranjang Belanja Anda Kosong</h2>
          <p style="color:var(--color-text-muted);margin-bottom:24px;">Belum ada parfum yang dipilih. Mari temukan wangi yang mewakili cerita Anda.</p>
          <a href="products.html" class="btn btn-primary">Mulai Belanja</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="checkout-grid">
        <div class="checkout-card">
          <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid var(--color-border);">
            <h2 style="font-size:24px;">Daftar Item (${getCartCount()})</h2>
            <button type="button" id="clearCartPageBtn" style="font-size:12.5px;color:var(--color-danger);text-decoration:underline;">Kosongkan Keranjang</button>
          </div>
          <div>
            ${cart
              .map(
                (item) => `
              <div class="cart-item" style="grid-template-columns:88px 1fr;align-items:center;">
                <a href="product.html?id=${encodeURIComponent(item.productId)}">
                  <img src="${item.image}" alt="${item.name}" style="width:88px;height:88px;">
                </a>
                <div>
                  <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                    <div>
                      <a href="product.html?id=${encodeURIComponent(item.productId)}" style="font-family:var(--font-heading);font-size:20px;font-weight:700;">${item.name}</a>
                      <div style="font-size:13px;color:var(--color-text-muted);">Ukuran Botol: <strong>${item.size}</strong> • Harga satuan: ${formatRupiah(item.price)}</div>
                    </div>
                    <button type="button" class="js-remove-item" data-key="${item.key}" style="font-size:12.5px;color:var(--color-danger);">Hapus</button>
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
                    <div class="qty-control">
                      <button type="button" class="qty-btn js-qty-dec" data-key="${item.key}" data-qty="${item.qty - 1}">−</button>
                      <span style="padding:0 12px;font-weight:600;">${item.qty}</span>
                      <button type="button" class="qty-btn js-qty-inc" data-key="${item.key}" data-qty="${item.qty + 1}">+</button>
                    </div>
                    <strong style="font-size:16px;">${formatRupiah(item.price * item.qty)}</strong>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="checkout-card">
          <h2 style="font-size:24px;margin-bottom:16px;">Ringkasan Pesanan</h2>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14.5px;">
            <span>Subtotal Produk</span>
            <strong>${formatRupiah(subtotal)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;color:var(--color-text-muted);">
            <span>Free Discovery Vial (2ml)</span>
            <span style="color:var(--color-success);font-weight:600;">GRATIS</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid var(--color-border);font-size:14px;color:var(--color-text-muted);">
            <span>Estimasi Ongkos Kirim</span>
            <span>Dikonfirmasi via WhatsApp</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px;">
            <span style="font-weight:700;text-transform:uppercase;font-size:13px;">Total Sementara</span>
            <strong style="font-size:22px;color:var(--color-primary);">${formatRupiah(subtotal)}</strong>
          </div>
          <a href="checkout.html" class="btn btn-primary btn-block">Lanjut ke Checkout</a>
          <a href="products.html" class="btn btn-outline btn-block" style="margin-top:10px;">Tambah Parfum Lain</a>
        </div>
      </div>
    `;

    const clearBtn = document.getElementById("clearCartPageBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        clearCart();
      });
    }
  }

  /* ==========================================================================
     10. CHECKOUT DIRECT KE WHATSAPP CONTROLLER (checkout.html)
     ========================================================================== */
  function initCheckoutPage() {
    const form = document.getElementById("whatsappCheckoutForm");
    const summaryEl = document.getElementById("checkoutSummaryItems");
    const subtotalEl = document.getElementById("checkoutSubtotalAmount");
    const courierSelect = document.getElementById("custKurir");
    if (!form || !summaryEl) return;

    // Populate Couriers from config.js
    if (courierSelect && STORE_CONFIG.couriers) {
      courierSelect.innerHTML =
        `<option value="">-- Pilih Ekspedisi Pengiriman --</option>` +
        STORE_CONFIG.couriers
          .map((c) => `<option value="${c.id}">${c.label}</option>`)
          .join("");
    }

    const cart = getCart();
    const subtotal = getCartSubtotal();

    if (cart.length === 0) {
      summaryEl.innerHTML = `
        <div style="padding:20px;background:var(--color-bg);border-radius:var(--radius-sm);text-align:center;">
          <p style="margin-bottom:12px;">Keranjang Anda masih kosong.</p>
          <a href="products.html" class="btn btn-primary">Pilih Parfum Terlebih Dahulu</a>
        </div>
      `;
      const submitBtn = document.getElementById("submitCheckoutBtn");
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    // Render Read-only Order Summary
    summaryEl.innerHTML = cart
      .map(
        (item, idx) => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-border);font-size:13.5px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;border-radius:4px;border:1px solid var(--color-border);">
            <div>
              <div style="font-weight:700;">${idx + 1}. ${item.name}</div>
              <div style="font-size:12px;color:var(--color-text-muted);">Ukuran ${item.size} × ${item.qty}</div>
            </div>
          </div>
          <strong>${formatRupiah(item.price * item.qty)}</strong>
        </div>
      `
      )
      .join("");

    if (subtotalEl) {
      subtotalEl.textContent = formatRupiah(subtotal);
    }

    // Validation Logic (Realtime & Submit)
    const fields = {
      nama: {
        el: document.getElementById("custNama"),
        validate: (v) => v.length >= 3,
        msg: "Nama lengkap wajib diisi (minimal 3 karakter)."
      },
      wa: {
        el: document.getElementById("custWa"),
        validate: (v) => isValidIndonesianPhone(v),
        msg: "Masukkan nomor WhatsApp Indonesia yang valid (awalan 08xx atau 628xx, min. 10 digit)."
      },
      email: {
        el: document.getElementById("custEmail"),
        validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        msg: "Format alamat email tidak valid."
      },
      alamat: {
        el: document.getElementById("custAlamat"),
        validate: (v) => v.length >= 10,
        msg: "Alamat lengkap wajib diisi (nama jalan, nomor rumah, RT/RW)."
      },
      kecamatan: {
        el: document.getElementById("custKecamatan"),
        validate: (v) => v.length >= 2,
        msg: "Kecamatan wajib diisi."
      },
      kota: {
        el: document.getElementById("custKota"),
        validate: (v) => v.length >= 2,
        msg: "Kota / Kabupaten wajib diisi."
      },
      provinsi: {
        el: document.getElementById("custProvinsi"),
        validate: (v) => v.length >= 2,
        msg: "Provinsi wajib diisi."
      },
      kodepos: {
        el: document.getElementById("custKodepos"),
        validate: (v) => /^\d{5}$/.test(v),
        msg: "Kode pos wajib berupa 5 digit angka."
      },
      kurir: {
        el: document.getElementById("custKurir"),
        validate: (v) => v.length > 0,
        msg: "Silakan pilih salah satu kurir pengiriman."
      },
      terms: {
        el: document.getElementById("custTerms"),
        validate: () => document.getElementById("custTerms").checked,
        msg: "Anda wajib menyetujui Syarat & Ketentuan pemesanan."
      }
    };

    function validateField(key) {
      const item = fields[key];
      if (!item || !item.el) return true;
      const val = item.el.type === "checkbox" ? item.el.checked : sanitizeInput(item.el.value);
      const valid = item.validate(val);
      const group = item.el.closest(".form-group");
      const errEl = group ? group.querySelector(".error-msg") : null;

      if (!valid) {
        item.el.classList.add("invalid");
        if (group) group.classList.add("has-error");
        if (errEl) errEl.textContent = item.msg;
      } else {
        item.el.classList.remove("invalid");
        if (group) group.classList.remove("has-error");
      }
      return valid;
    }

    // Bind realtime validation
    Object.keys(fields).forEach((key) => {
      const el = fields[key].el;
      if (!el) return;
      el.addEventListener("input", () => validateField(key));
      el.addEventListener("blur", () => validateField(key));
      el.addEventListener("change", () => validateField(key));
    });

    let isSubmitting = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      let allValid = true;
      let firstInvalidEl = null;

      Object.keys(fields).forEach((key) => {
        const ok = validateField(key);
        if (!ok) {
          allValid = false;
          if (!firstInvalidEl) firstInvalidEl = fields[key].el;
        }
      });

      if (!allValid) {
        showToast("Mohon lengkapi data yang bertanda merah.");
        if (firstInvalidEl) firstInvalidEl.focus();
        return;
      }

      const currentCart = getCart();
      if (currentCart.length === 0) {
        showToast("Keranjang Anda kosong.");
        return;
      }

      // Lock submit button to prevent double submission
      isSubmitting = true;
      const submitBtn = document.getElementById("submitCheckoutBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Menyiapkan Pesanan ke WhatsApp...";
      }

      const orderNumber = generateOrderNumber();
      const orderPayload = {
        orderNumber: orderNumber,
        nama: sanitizeInput(fields.nama.el.value),
        wa: normalizeIndonesianPhone(sanitizeInput(fields.wa.el.value)),
        email: sanitizeInput(fields.email.el.value) || "-",
        alamat: sanitizeInput(fields.alamat.el.value),
        kecamatan: sanitizeInput(fields.kecamatan.el.value),
        kota: sanitizeInput(fields.kota.el.value),
        provinsi: sanitizeInput(fields.provinsi.el.value),
        kodepos: sanitizeInput(fields.kodepos.el.value),
        kurir: sanitizeInput(fields.kurir.el.value),
        catatan: sanitizeInput(document.getElementById("custCatatan").value) || "-",
        items: currentCart,
        total: getCartSubtotal(),
        formatCurrency: formatRupiah
      };

      const messageText = STORE_CONFIG.buildOrderMessage(orderPayload);
      const whatsappUrl = buildWhatsAppUrl(STORE_CONFIG.whatsappAdmin, messageText);

      // Save last order for reference
      try {
        localStorage.setItem(
          LAST_ORDER_KEY,
          JSON.stringify({ orderNumber, whatsappUrl, messageText, timestamp: Date.now() })
        );
      } catch (err) {}

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      // Show Thank You Modal with fallback button
      const modal = document.getElementById("thankYouModal");
      const modalOrderNo = document.getElementById("modalOrderNumber");
      const modalFallbackLink = document.getElementById("modalFallbackWaBtn");
      const copyOrderBtn = document.getElementById("modalCopyOrderBtn");

      if (modalOrderNo) modalOrderNo.textContent = `#${orderNumber}`;
      if (modalFallbackLink) modalFallbackLink.href = whatsappUrl;
      if (copyOrderBtn) {
        copyOrderBtn.onclick = () => {
          navigator.clipboard.writeText(messageText).then(() => {
            showToast("Format pesanan berhasil disalin!");
          });
        };
      }
      if (modal) {
        modal.classList.add("open");
      }

      // Clear shopping cart after successful order creation
      clearCart();
    });
  }

  /* ==========================================================================
     11. SCROLL REVEAL OBSERVER
     ========================================================================== */
  function initScrollReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
  }

  /* ==========================================================================
     INITIALIZE ON DOM READY
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    injectGlobalShell();
    initHomePage();
    initProductsPage();
    initProductDetailPage();
    renderCartPage();
    initCheckoutPage();
    initScrollReveal();
  });
})();
