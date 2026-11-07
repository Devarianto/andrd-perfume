/**
 * ============================================================================
 * CORE APPLICATION SCRIPT "ANDRD" (assets/js/app.js)
 * ============================================================================
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
    showToast(`${product.name} (${variant.size}) ditambahkan`);
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
    showToast("Item dihapus");
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.2s ease";
      setTimeout(() => toast.remove(), 220);
    }, 2400);
  }

  /* ==========================================================================
     4. RENDER KARTU PRODUK (CLEAN & SIMPLE)
     ========================================================================== */
  function renderSocialIconsHtml(extraClass) {
    const igUrl = STORE_CONFIG.instagramUrl || "https://instagram.com";
    const ttUrl = STORE_CONFIG.tiktokUrl || "https://tiktok.com";
    const ytUrl = STORE_CONFIG.youtubeUrl || "https://youtube.com";
    return `
      <div class="social-icon-group ${extraClass || ""}">
        <a href="${igUrl}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="Instagram" title="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
        <a href="${ttUrl}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="TikTok" title="TikTok">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
          </svg>
        </a>
        <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="YouTube" title="YouTube">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        </a>
      </div>
    `;
  }

  function renderProductCard(product) {
    const minVariant = product.variants.reduce(
      (min, v) => (v.price < min.price ? v : min),
      product.variants[0]
    );
    const defaultPerfumeSize = product.variants[1] ? product.variants[1].size : product.variants[0].size;

    const badgesHtml = [];
    if (product.status === "sold-out") {
      badgesHtml.push(`<span class="badge badge-soldout">SOLD OUT</span>`);
    } else if (product.status === "pre-order") {
      badgesHtml.push(`<span class="badge badge-preorder">PRE ORDER</span>`);
    } else if (product.badge) {
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

    const basketSvg = `
      <svg class="cart-overlay-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 10l2-6h8l2 6"></path>
        <path d="M3 10h18l-1.5 9.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 10z"></path>
        <line x1="9" y1="14" x2="9" y2="17"></line>
        <line x1="12" y1="14" x2="12" y2="17"></line>
        <line x1="15" y1="14" x2="15" y2="17"></line>
      </svg>
    `;

    let overlayCartButtonHtml = "";
    if (product.status === "sold-out") {
      const restockText = STORE_CONFIG.buildRestockMessage(product.name, "");
      const waUrl = buildWhatsAppUrl(STORE_CONFIG.whatsappAdmin, restockText);
      overlayCartButtonHtml = `
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="product-cart-overlay-btn" aria-label="Kabari saya saat ${product.name} restock">
          ${basketSvg}
          <span>Kabari Saya</span>
        </a>
      `;
    } else {
      const btnLabel = product.status === "pre-order" ? "Pre-Order" : "Add to cart";
      overlayCartButtonHtml = `
        <button type="button" class="product-cart-overlay-btn js-quick-add" data-product-id="${product.id}" data-size="${defaultPerfumeSize}" aria-label="Add to cart ${product.name}">
          ${basketSvg}
          <span>${btnLabel}</span>
        </button>
      `;
    }

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-media">
          <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-media-link" aria-label="${product.name}">
            <div class="product-badges">${badgesHtml.join("")}</div>
            <img src="${primaryImg}" alt="${product.name}" class="product-img-primary" loading="lazy" width="400" height="400">
            <img src="${secondaryImg}" alt="${product.name} Notes" class="product-img-secondary" loading="lazy" width="400" height="400">
          </a>
          ${overlayCartButtonHtml}
        </div>
        <div class="product-body">
          <div class="product-meta">Extrait de Parfum</div>
          <h3 class="product-title">
            <a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a>
          </h3>
          <div class="product-price-wrap">
            <span class="price-current">${formatRupiah(minVariant.price)}</span>
            ${compareHtml}
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

    // 2. Header
    const headerEl = document.getElementById("siteHeader");
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const isCatalogue = window.location.search.includes("view=catalogue");

    if (headerEl) {
      headerEl.innerHTML = `
        <div class="container header-inner">
          <button type="button" class="mobile-menu-btn" id="openMobileMenuBtn" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <line x1="3" y1="7" x2="21" y2="7"></line>
              <line x1="3" y1="12" x2="17" y2="12"></line>
              <line x1="3" y1="17" x2="21" y2="17"></line>
            </svg>
          </button>

          <a href="index.html" class="brand-logo" aria-label="${STORE_CONFIG.brandName}">${STORE_CONFIG.brandName}</a>

          <nav class="main-nav" aria-label="Menu Utama">
            <a href="index.html" class="nav-link ${currentPath === "index.html" ? "active" : ""}">Home</a>
            <a href="products.html" class="nav-link ${(currentPath === "products.html" || currentPath === "product.html") && !isCatalogue ? "active" : ""}">Product</a>
            <a href="products.html?view=catalogue" class="nav-link nav-hidden" hidden style="display:none !important;">Catalogue</a>
            <a href="about.html" class="nav-link nav-hidden" hidden style="display:none !important;">About</a>
            <a href="contact.html" class="nav-link ${currentPath === "contact.html" ? "active" : ""}">Contact</a>
            <a href="policies.html" class="nav-link nav-hidden" hidden style="display:none !important;">Policies</a>
          </nav>

          <div class="header-actions">
            <button type="button" class="icon-btn" id="toggleSearchBtn" aria-label="Cari">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button type="button" class="icon-btn" id="openCartDrawerBtn" aria-label="Keranjang">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="search" id="liveSearchInput" placeholder="Cari parfum atau notes aroma..." autocomplete="off">
              <button type="button" id="closeSearchBtn" aria-label="Tutup" style="font-size:12px;font-weight:600;">✕</button>
            </div>
            <div class="live-search-results" id="liveSearchResults"></div>
          </div>
        </div>
      `;
    }

    // 3. Mobile Menu & Cart Drawer
    const drawersWrapper = document.createElement("div");
    drawersWrapper.innerHTML = `
      <!-- Mobile Nav Drawer -->
      <div class="mobile-nav-drawer" id="mobileNavDrawer" aria-hidden="true">
        <div class="drawer-backdrop" id="closeMobileNavBackdrop"></div>
        <div class="mobile-nav-panel">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="brand-logo" style="font-size:18px;">${STORE_CONFIG.brandName}</span>
            <button type="button" id="closeMobileMenuBtn" aria-label="Tutup" style="padding:6px;font-size:16px;">✕</button>
          </div>
          <nav class="mobile-nav-links" aria-label="Menu Mobile">
            <a href="index.html" class="${currentPath === "index.html" ? "active" : ""}">Home</a>
            <a href="products.html" class="${(currentPath === "products.html" || currentPath === "product.html") && !isCatalogue ? "active" : ""}">Product</a>
            <a href="products.html?view=catalogue" class="nav-hidden" hidden style="display:none !important;">Catalogue</a>
            <a href="about.html" class="nav-hidden" hidden style="display:none !important;">About</a>
            <a href="contact.html" class="${currentPath === "contact.html" ? "active" : ""}">Contact</a>
            <a href="policies.html" class="nav-hidden" hidden style="display:none !important;">Policies</a>
          </nav>

          <div class="mobile-nav-footer">
            <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:10px;">Ikuti Kami</div>
            ${renderSocialIconsHtml("mobile-social-icons")}
          </div>
        </div>
      </div>

      <!-- Slide-over Cart Drawer -->
      <aside class="cart-drawer" id="cartDrawer" aria-hidden="true" aria-label="Keranjang Belanja">
        <div class="drawer-backdrop" id="closeCartBackdrop"></div>
        <div class="cart-drawer-panel">
          <div class="cart-drawer-header">
            <h2 style="font-size:17px;">Keranjang (<span class="js-cart-badge">0</span>)</h2>
            <button type="button" id="closeCartDrawerBtn" aria-label="Tutup" style="font-size:16px;padding:6px;">✕</button>
          </div>
          <div class="cart-drawer-body" id="cartDrawerItems"></div>
          <div class="cart-drawer-footer" id="cartDrawerFooter">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span style="font-size:12.5px;color:var(--color-text-muted);">Subtotal</span>
              <strong style="font-size:16px;" id="cartDrawerSubtotal">Rp 0</strong>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:8px;">
              <a href="cart.html" class="btn btn-outline">Keranjang</a>
              <a href="checkout.html" class="btn btn-primary" id="drawerCheckoutBtn">Checkout</a>
            </div>
          </div>
        </div>
      </aside>

      <!-- Modal Tulis Ulasan & Rating Pelanggan -->
      <div class="modal-backdrop" id="customerReviewModal" aria-hidden="true">
        <div class="modal-box" style="text-align:left;max-width:460px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <h2 style="font-size:18px;">Tulis Ulasan Anda</h2>
            <button type="button" id="closeReviewModalBtn" aria-label="Tutup" style="font-size:18px;padding:4px 8px;">✕</button>
          </div>
          <form id="customerReviewForm">
            <div class="form-grid">
              <div class="form-group">
                <label>Rating Kepuasan <span class="req-star">*</span></label>
                <div class="star-rating-picker" id="reviewStarPicker">
                  <button type="button" class="star-pick-btn active" data-val="1" aria-label="1 Bintang">★</button>
                  <button type="button" class="star-pick-btn active" data-val="2" aria-label="2 Bintang">★</button>
                  <button type="button" class="star-pick-btn active" data-val="3" aria-label="3 Bintang">★</button>
                  <button type="button" class="star-pick-btn active" data-val="4" aria-label="4 Bintang">★</button>
                  <button type="button" class="star-pick-btn active" data-val="5" aria-label="5 Bintang">★</button>
                  <span class="star-pick-label" id="reviewStarLabel">5 / 5 (Sangat Puas)</span>
                </div>
                <input type="hidden" id="reviewRatingValue" value="5">
              </div>

              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label for="reviewUserName">Nama Anda <span class="req-star">*</span></label>
                  <input type="text" id="reviewUserName" class="form-control" placeholder="Contoh: Nadia K." required>
                </div>
                <div class="form-group">
                  <label for="reviewUserCity">Kota / Domisili <span class="req-star">*</span></label>
                  <input type="text" id="reviewUserCity" class="form-control" placeholder="Contoh: Jakarta" required>
                </div>
              </div>

              <div class="form-group">
                <label for="reviewProductId">Produk yang Diulas <span class="req-star">*</span></label>
                <select id="reviewProductId" class="select-control" required>
                  ${PRODUCTS.map((p) => `<option value="${p.id}" data-name="${p.name} (50ml)">${p.name}</option>`).join("")}
                </select>
              </div>

              <div class="form-group">
                <label for="reviewQuoteText">Komentar / Ulasan <span class="req-star">*</span></label>
                <textarea id="reviewQuoteText" class="textarea-control" rows="3" placeholder="Ceritakan pengalaman Anda dengan aroma dan ketahanan parfum ini..." required></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;">
                Kirim Ulasan
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(drawersWrapper);

    // 4. Floating WhatsApp Button
    const floatingWa = document.createElement("a");
    floatingWa.href = buildWhatsAppUrl(
      STORE_CONFIG.whatsappAdmin,
      STORE_CONFIG.buildGeneralInquiryMessage()
    );
    floatingWa.target = "_blank";
    floatingWa.rel = "noopener noreferrer";
    floatingWa.className = "floating-wa";
    floatingWa.setAttribute("aria-label", "Chat WhatsApp");
    floatingWa.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <span>Chat Admin</span>
    `;
    document.body.appendChild(floatingWa);

    // 5. Footer Injection (Mobile Dropdown + Social Icons)
    const footerEl = document.getElementById("siteFooter");
    if (footerEl) {
      const waConsultUrl = buildWhatsAppUrl(
        STORE_CONFIG.whatsappAdmin,
        STORE_CONFIG.buildGeneralInquiryMessage()
      );
      footerEl.innerHTML = `
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand-col">
              <a href="index.html" class="footer-brand">${STORE_CONFIG.brandName}</a>
              <p style="font-size:13.5px;margin-bottom:8px;max-width:280px;">
                <strong>${STORE_CONFIG.tagline}.</strong> ${STORE_CONFIG.subTagline}
              </p>
              ${STORE_CONFIG.address ? `<p style="font-size:12.5px;color:var(--color-text-muted);margin-bottom:8px;max-width:280px;line-height:1.5;">${STORE_CONFIG.address}</p>` : ""}
              <p style="font-size:13px;margin-bottom:14px;">
                WA: <a href="${waConsultUrl}" target="_blank" rel="noopener" style="color:var(--color-primary);font-weight:500;">${STORE_CONFIG.whatsappDisplay}</a>
              </p>
              ${renderSocialIconsHtml("footer-social-icons")}
            </div>

            <div class="footer-accordion">
              <button type="button" class="footer-heading footer-accordion-btn js-footer-accordion-btn" aria-expanded="false">
                <span>Koleksi</span>
                <span class="footer-plus-icon" aria-hidden="true">+</span>
              </button>
              <div class="footer-accordion-panel">
                <ul class="footer-links">
                  <li><a href="products.html">Semua Parfum</a></li>
                  <li><a href="products.html?gender=For+Her">For Her</a></li>
                  <li><a href="products.html?gender=For+Him">For Him</a></li>
                  <li><a href="products.html?gender=Unisex">Unisex</a></li>
                </ul>
              </div>
            </div>

            <div class="footer-accordion">
              <button type="button" class="footer-heading footer-accordion-btn js-footer-accordion-btn" aria-expanded="false">
                <span>Informasi</span>
                <span class="footer-plus-icon" aria-hidden="true">+</span>
              </button>
              <div class="footer-accordion-panel">
                <ul class="footer-links">
                  <li><a href="about.html">Tentang Kami</a></li>
                  <li><a href="contact.html">Kontak</a></li>
                  <li><a href="policies.html#pengiriman">Pengiriman</a></li>
                  <li><a href="policies.html#pengembalian">Retur 7 Hari</a></li>
                  <li><a href="policies.html#syarat">Syarat &amp; Ketentuan</a></li>
                </ul>
              </div>
            </div>

            <div class="footer-accordion">
              <button type="button" class="footer-heading footer-accordion-btn js-footer-accordion-btn" aria-expanded="false">
                <span>Newsletter</span>
                <span class="footer-plus-icon" aria-hidden="true">+</span>
              </button>
              <div class="footer-accordion-panel">
                <p style="font-size:13px;margin-bottom:8px;">Info rilis batch terbatas.</p>
                <form class="newsletter-form" id="newsletterForm">
                  <input type="email" placeholder="Email Anda" required aria-label="Email">
                  <button type="submit" class="btn btn-primary" style="padding:9px 14px;">Ikuti</button>
                </form>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} ${STORE_CONFIG.brandName}.</span>
            ${renderSocialIconsHtml("footer-bottom-icons")}
          </div>
        </div>
      `;

      const newsForm = document.getElementById("newsletterForm");
      if (newsForm) {
        newsForm.addEventListener("submit", function (e) {
          e.preventDefault();
          newsForm.reset();
          showToast("Terima kasih telah bergabung.");
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
          <div style="text-align:center;padding:44px 16px;">
            <p style="font-weight:600;font-size:15px;margin-bottom:6px;">Keranjang Kosong</p>
            <p style="font-size:12.5px;color:var(--color-text-muted);margin-bottom:18px;">Belum ada produk yang dipilih.</p>
            <a href="products.html" class="btn btn-primary">Lihat Produk</a>
          </div>
        `;
        if (drawerCheckoutBtn) {
          drawerCheckoutBtn.style.pointerEvents = "none";
          drawerCheckoutBtn.style.opacity = "0.4";
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
                  <a href="product.html?id=${encodeURIComponent(item.productId)}" style="font-weight:600;font-size:13.5px;">${item.name}</a>
                  <button type="button" class="js-remove-item" data-key="${item.key}" aria-label="Hapus" style="color:var(--color-text-muted);font-size:12px;">✕</button>
                </div>
                <div style="font-size:11.5px;color:var(--color-text-muted);margin:2px 0 8px;">${item.size}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div class="qty-control" style="height:28px;">
                    <button type="button" class="qty-btn js-qty-dec" data-key="${item.key}" data-qty="${item.qty - 1}" style="width:26px;height:28px;">−</button>
                    <span style="padding:0 6px;font-size:12px;font-weight:600;">${item.qty}</span>
                    <button type="button" class="qty-btn js-qty-inc" data-key="${item.key}" data-qty="${item.qty + 1}" style="width:26px;height:28px;">+</button>
                  </div>
                  <strong style="font-size:13px;">${formatRupiah(item.price * item.qty)}</strong>
                </div>
              </div>
            </div>
          `
          )
          .join("");
      }
    }

    if (document.getElementById("cartPageContainer")) {
      renderCartPage();
    }
  }

  function bindShellEvents() {
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
            allNotes.toLowerCase().includes(q)
          );
        });

        if (matched.length === 0) {
          searchResults.innerHTML = `<p style="font-size:12.5px;color:var(--color-text-muted);padding:6px 0;">Tidak ditemukan untuk "${sanitizeInput(q)}".</p>`;
        } else {
          searchResults.innerHTML = matched
            .slice(0, 6)
            .map(
              (p) => `
              <a href="product.html?id=${encodeURIComponent(p.id)}" class="search-result-item">
                <img src="${p.images[0]}" alt="${p.name}">
                <div>
                  <div style="font-weight:600;font-size:13.5px;">${p.name}</div>
                  <div style="font-size:11.5px;color:var(--color-text-muted);">${p.scentCategory} • ${formatRupiah(p.variants[0].price)}</div>
                </div>
              </a>
            `
            )
            .join("");
        }
      });
    }

    // Delegated Events for Quick Add, Footer Accordion & Cart Item Controls
    document.body.addEventListener(
      "touchstart",
      (e) => {
        const card = e.target.closest(".product-card");
        if (card) {
          document.querySelectorAll(".product-card.is-active").forEach((el) => {
            if (el !== card) el.classList.remove("is-active");
          });
          card.classList.add("is-active");
        } else {
          document.querySelectorAll(".product-card.is-active").forEach((el) => {
            el.classList.remove("is-active");
          });
        }
      },
      { passive: true }
    );

    document.body.addEventListener("click", (e) => {
      const footerAccBtn = e.target.closest(".js-footer-accordion-btn");
      if (footerAccBtn) {
        if (window.innerWidth < 768) {
          const accItem = footerAccBtn.closest(".footer-accordion");
          if (accItem) {
            const isOpen = accItem.classList.toggle("open");
            footerAccBtn.setAttribute("aria-expanded", String(isOpen));
          }
        }
        return;
      }

      const quickAddBtn = e.target.closest(".js-quick-add");
      if (quickAddBtn) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll(".product-cart-overlay-btn.is-selected").forEach((el) => {
          if (el !== quickAddBtn) el.classList.remove("is-selected");
        });
        quickAddBtn.classList.add("is-selected");
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

      const openReviewBtn = e.target.closest(".js-open-review-modal");
      if (openReviewBtn) {
        const modal = document.getElementById("customerReviewModal");
        if (modal) {
          const preselectProd = openReviewBtn.getAttribute("data-product-id");
          const prodSelect = document.getElementById("reviewProductId");
          if (preselectProd && prodSelect) {
            prodSelect.value = preselectProd;
          }
          modal.classList.add("open");
          modal.setAttribute("aria-hidden", "false");
        }
        return;
      }
    });

    // Review Modal Events (Star Rating Picker & Form Submit)
    const reviewModal = document.getElementById("customerReviewModal");
    const closeReviewBtn = document.getElementById("closeReviewModalBtn");
    const starPicker = document.getElementById("reviewStarPicker");
    const ratingValInput = document.getElementById("reviewRatingValue");
    const starLabel = document.getElementById("reviewStarLabel");
    const reviewForm = document.getElementById("customerReviewForm");

    const starDescriptions = {
      1: "1 / 5 (Kurang Sesuai)",
      2: "2 / 5 (Cukup)",
      3: "3 / 5 (Baik)",
      4: "4 / 5 (Puas)",
      5: "5 / 5 (Sangat Puas)"
    };

    if (closeReviewBtn && reviewModal) {
      closeReviewBtn.addEventListener("click", () => {
        reviewModal.classList.remove("open");
        reviewModal.setAttribute("aria-hidden", "true");
      });
    }
    if (reviewModal) {
      reviewModal.addEventListener("click", (e) => {
        if (e.target === reviewModal) {
          reviewModal.classList.remove("open");
          reviewModal.setAttribute("aria-hidden", "true");
        }
      });
    }

    if (starPicker && ratingValInput) {
      starPicker.querySelectorAll(".star-pick-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.getAttribute("data-val")) || 5;
          ratingValInput.value = String(val);
          starPicker.querySelectorAll(".star-pick-btn").forEach((b) => {
            const bVal = Number(b.getAttribute("data-val"));
            b.classList.toggle("active", bVal <= val);
          });
          if (starLabel) starLabel.textContent = starDescriptions[val] || `${val} / 5`;
        });
      });
    }

    if (reviewForm) {
      reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = (document.getElementById("reviewUserName").value || "").trim();
        const city = (document.getElementById("reviewUserCity").value || "").trim();
        const prodSelect = document.getElementById("reviewProductId");
        const productId = prodSelect ? prodSelect.value : "andrd-cedora";
        const selectedProd = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
        const defaultSize = selectedProd && selectedProd.variants && selectedProd.variants[0] ? selectedProd.variants[0].size : "30 ML";
        const productName = selectedProd ? `${selectedProd.name} (${defaultSize})` : "CEDORA (30 ML)";
        const rating = Math.min(5, Math.max(1, Number(ratingValInput ? ratingValInput.value : 5) || 5));
        const quote = (document.getElementById("reviewQuoteText").value || "").trim();

        if (!name || !city || !quote) return;

        const allReviews = getReviews();
        allReviews.unshift({
          id: "rev-" + Date.now(),
          name,
          city,
          rating,
          productId,
          productName,
          quote,
          date: new Date().toISOString().slice(0, 10)
        });
        saveReviews(allReviews);

        reviewForm.reset();
        if (ratingValInput) ratingValInput.value = "5";
        if (starPicker) {
          starPicker.querySelectorAll(".star-pick-btn").forEach((b) => b.classList.add("active"));
        }
        if (starLabel) starLabel.textContent = starDescriptions[5];

        if (reviewModal) {
          reviewModal.classList.remove("open");
          reviewModal.setAttribute("aria-hidden", "true");
        }

        renderHomeTestimonials();
        renderProductDetailReviews(productId);
        showToast("Terima kasih! Ulasan Anda berhasil ditambahkan.");
      });
    }
  }

  /* ==========================================================================
     5B. CUSTOMER REVIEWS & TESTIMONIALS STORAGE HELPERS
     ========================================================================== */
  const REVIEWS_STORAGE_KEY = "andrd_cms_reviews_v1";

  function getReviews() {
    try {
      const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    if (Array.isArray(STORE_CONFIG.testimonials)) {
      return JSON.parse(JSON.stringify(STORE_CONFIG.testimonials));
    }
    return [];
  }

  function saveReviews(list) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
    STORE_CONFIG.testimonials = list;
    try {
      const rawCfg = localStorage.getItem("andrd_cms_config_v1");
      const cfg = rawCfg ? JSON.parse(rawCfg) : {};
      cfg.testimonials = list;
      localStorage.setItem("andrd_cms_config_v1", JSON.stringify(cfg));
    } catch (e) {}
  }

  function renderReviewCardsHtml(reviewsList) {
    if (!reviewsList || reviewsList.length === 0) {
      return `
        <div style="grid-column:1/-1;text-align:center;padding:32px 16px;background:var(--color-bg-alt);border-radius:var(--radius-md);color:var(--color-text-muted);font-size:14px;">
          Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
        </div>
      `;
    }
    return reviewsList
      .map((item) => {
        const starsCount = Math.min(5, Math.max(1, Number(item.rating) || 5));
        const starsStr = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);
        const initial = (item.name || "A").trim().charAt(0).toUpperCase();
        const productLink = item.productId
          ? `<a href="product.html?id=${encodeURIComponent(item.productId)}">${sanitizeInput(item.productName || "")}</a>`
          : sanitizeInput(item.productName || "");
        return `
          <article class="testimonial-card">
            <div class="testimonial-top">
              <span class="testimonial-stars" aria-label="Rating ${starsCount} dari 5">${starsStr}</span>
              <span class="testimonial-verified">Verified Buyer</span>
            </div>
            <p class="testimonial-quote">“${sanitizeInput(item.quote || "")}”</p>
            <div class="testimonial-footer">
              <div class="testimonial-avatar" aria-hidden="true">${initial}</div>
              <div class="testimonial-author-info">
                <strong class="testimonial-name">${sanitizeInput(item.name || "")}</strong>
                <span class="testimonial-meta">${sanitizeInput(item.city || "")}${item.productName ? " • " + productLink : ""}</span>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderHomeTestimonials() {
    const testimonialsGrid = document.getElementById("testimonialsGrid");
    if (!testimonialsGrid) return;

    const reviews = getReviews();
    testimonialsGrid.innerHTML = renderReviewCardsHtml(reviews);

    const ratingTextEl = document.getElementById("testimonialRatingText");
    if (ratingTextEl) {
      if (reviews.length === 0) {
        ratingTextEl.textContent = "Belum ada ulasan";
      } else {
        const avg = (
          reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length
        ).toFixed(1);
        ratingTextEl.textContent = `${avg} / 5.0 (${reviews.length} Ulasan)`;
      }
    }
  }

  function renderProductDetailReviews(productId) {
    const detailRevGrid = document.getElementById("productDetailReviewsGrid");
    const detailRevSummary = document.getElementById("productDetailReviewsSummary");
    if (!detailRevGrid) return;

    const allReviews = getReviews();
    const prodReviews = allReviews.filter((r) => r.productId === productId);
    const listToShow = prodReviews.length > 0 ? prodReviews : allReviews.slice(0, 3);

    detailRevGrid.innerHTML = renderReviewCardsHtml(listToShow);
    if (detailRevSummary) {
      if (listToShow.length > 0) {
        const avg = (
          listToShow.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / listToShow.length
        ).toFixed(1);
        detailRevSummary.textContent = `★ ${avg} / 5.0 (${prodReviews.length > 0 ? prodReviews.length + " Ulasan Produk Ini" : allReviews.length + " Ulasan Toko"})`;
      } else {
        detailRevSummary.textContent = "Belum ada ulasan";
      }
    }
  }

  /* ==========================================================================
     6. HOME PAGE CONTROLLER (index.html)
     ========================================================================== */
  function initHomePage() {
    const track = document.getElementById("heroTrack");

    // Render Hero Slides dinamis dari STORE_CONFIG.heroSlides (CMS)
    if (track && Array.isArray(STORE_CONFIG.heroSlides) && STORE_CONFIG.heroSlides.length > 0) {
      track.innerHTML = STORE_CONFIG.heroSlides
        .map((slide, idx) => {
          const fallbackProduct = PRODUCTS[idx] || PRODUCTS[0];
          const imgSrc = slide.image || (fallbackProduct ? fallbackProduct.images[0] : "");
          const titleTag = idx === 0 ? "h1" : "h2";
          return `
            <div class="hero-slide">
              <div class="hero-content">
                <span class="hero-eyebrow">${slide.eyebrow || ""}</span>
                <${titleTag} class="hero-title">${slide.title || ""}</${titleTag}>
                <p class="hero-desc">${slide.desc || ""}</p>
                <div class="hero-actions">
                  <a href="${slide.btnPrimaryLink || "products.html"}" class="btn btn-primary">${slide.btnPrimaryText || "Belanja"}</a>
                  ${
                    slide.btnSecondaryText
                      ? `<a href="${slide.btnSecondaryLink || "products.html"}" class="btn btn-outline">${slide.btnSecondaryText}</a>`
                      : ""
                  }
                </div>
              </div>
              <div class="hero-visual">
                <img src="${imgSrc}" alt="${slide.title || "ANDRD"}" width="340" height="340">
              </div>
            </div>
          `;
        })
        .join("");
    }

    // Render Kartu Segmentasi dinamis dari STORE_CONFIG.segments (CMS)
    const segmentGrid = document.querySelector(".segment-grid");
    if (segmentGrid && Array.isArray(STORE_CONFIG.segments) && STORE_CONFIG.segments.length > 0 && document.getElementById("featuredProductsGrid")) {
      const fallbackIndices = [2, 3, 0];
      segmentGrid.innerHTML = STORE_CONFIG.segments
        .map((seg, idx) => {
          const fbProd = PRODUCTS[fallbackIndices[idx]] || PRODUCTS[0];
          const segImg = seg.image || (fbProd ? fbProd.images[0] : "");
          return `
            <a href="${seg.link || `products.html?gender=${encodeURIComponent(seg.gender)}`}" class="segment-card">
              <img src="${segImg}" alt="${seg.title}" class="segment-bg" loading="lazy">
              <div class="segment-overlay">
                <h3 class="segment-title">${seg.title}</h3>
                <p class="segment-desc">${seg.desc}</p>
                <span class="segment-link">Eksplor →</span>
              </div>
            </a>
          `;
        })
        .join("");
    }

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
        autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
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
          if (Math.abs(diff) > 40) {
            if (diff < 0) goToSlide(currentSlide + 1);
            else goToSlide(currentSlide - 1);
          }
          startAutoPlay();
        },
        { passive: true }
      );

      startAutoPlay();
    }

    const featuredGrid = document.getElementById("featuredProductsGrid");
    if (featuredGrid) {
      const featuredProducts = PRODUCTS.filter((p) => p.featured).slice(0, 4);
      if (featuredProducts.length === 1) {
        const p = featuredProducts[0];
        const v = p.variants[0] || { size: "30 ML", price: 109000 };
        featuredGrid.classList.add("featured-single-spotlight");
        featuredGrid.innerHTML = `
          ${renderProductCard(p)}
          <div class="cedora-brief-card">
            <span class="section-eyebrow" style="margin-bottom:4px;">${STORE_CONFIG.brandName} ${p.concentration || "Eau de Parfum"} • ${v.size}</span>
            <h3 style="font-size:clamp(22px, 3.5vw, 30px);font-weight:600;margin-bottom:2px;letter-spacing:-0.02em;">${p.name}</h3>
            <p style="font-size:15px;font-weight:500;color:var(--color-primary);margin-bottom:10px;">A scent that speaks without saying a word.</p>
            <p style="font-size:14px;color:var(--color-text-muted);line-height:1.65;margin-bottom:14px;">
              <strong>${p.name}</strong> adalah perpaduan aroma yang menghadirkan kesegaran, keanggunan, dan kehangatan dalam satu karakter. Dibuka dengan kesegaran <strong>Green Tea</strong> yang memberikan kesan segar dan menenangkan. Kemudian <strong>Cherry</strong> dan <strong>Dark Rose</strong> menghadirkan sentuhan aroma yang elegan, memberikan kedalaman serta karakter tersendiri. Pada akhirnya, <strong>Cedarwood</strong> memberikan kehangatan dengan nuansa woody yang menciptakan kesan mendalam dan berkesan.
            </p>
            <div class="cedora-info-grid">
              <div><span>Brand</span><strong>${STORE_CONFIG.brandName}</strong></div>
              <div><span>Collection</span><strong>${p.name}</strong></div>
              <div><span>Product Type</span><strong>${p.concentration || "Eau de Parfum"}</strong></div>
              <div><span>Volume</span><strong>${v.size}</strong></div>
              <div><span>Price</span><strong>${formatRupiah(v.price)}</strong></div>
              <div><span>Fragrance Family</span><strong>${p.scentCategory}</strong></div>
            </div>
            <p style="font-size:13.5px;font-weight:500;color:var(--color-primary);margin:14px 0 18px;">
              “${p.name} bukan sekadar tentang aroma. Ini tentang karakter, identitas, dan kesan yang kamu tinggalkan. <em>Find your identity. Leave your impression.</em>”
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              <button type="button" class="btn btn-primary js-quick-add" data-product-id="${p.id}" data-size="${v.size}">
                Tambah ke Keranjang (${formatRupiah(v.price)})
              </button>
              <a href="product.html?id=${p.id}" class="btn btn-outline">Detail Produk</a>
            </div>
          </div>
        `;
      } else {
        featuredGrid.classList.remove("featured-single-spotlight");
        featuredGrid.innerHTML = featuredProducts.map(renderProductCard).join("");
      }
    }

    const seasonalTrack = document.getElementById("seasonalCarouselTrack");
    if (seasonalTrack) {
      const seasonalProducts = PRODUCTS.filter((p) => p.seasonal);
      if (PRODUCTS.length === 1 && PRODUCTS[0].images && PRODUCTS[0].images.length > 1) {
        const p = PRODUCTS[0];
        const lookbookCaptions = [
          { title: "CEDORA 30 ML", sub: "ANDRD Eau de Parfum • Rp 109.000" },
          { title: "A Scent That Speaks", sub: "Without saying a word." },
          { title: "Find Your Identity", sub: "Top Notes: Green Tea" },
          { title: "Leave Your Impression", sub: "Middle Notes: Cherry & Dark Rose" },
          { title: "Character & Detail", sub: "Base Notes: Cedarwood" },
          { title: "Made to be Remembered", sub: "The ANDRD Experience" }
        ];
        seasonalTrack.innerHTML = p.images
          .map((imgSrc, idx) => {
            const cap = lookbookCaptions[idx] || { title: p.name, sub: "ANDRD Eau de Parfum" };
            return `
              <a href="product.html?id=${p.id}" class="product-card" style="text-decoration:none;">
                <div class="product-media">
                  <img src="${imgSrc}" alt="${cap.title}" class="product-img-primary" style="opacity:1 !important;" loading="lazy">
                </div>
                <div class="product-body">
                  <div class="product-meta">${cap.sub}</div>
                  <h3 class="product-title">${cap.title}</h3>
                </div>
              </a>
            `;
          })
          .join("");
      } else {
        seasonalTrack.innerHTML = seasonalProducts.map(renderProductCard).join("");
      }

      const prevBtn = document.getElementById("carouselPrevBtn");
      const nextBtn = document.getElementById("carouselNextBtn");
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
          seasonalTrack.scrollBy({ left: -280, behavior: "smooth" });
        });
        nextBtn.addEventListener("click", () => {
          seasonalTrack.scrollBy({ left: 280, behavior: "smooth" });
        });
      }
    }

    const scentGrid = document.getElementById("exploreScentGrid");
    if (scentGrid && STORE_CONFIG.scentCategories) {
      scentGrid.innerHTML = STORE_CONFIG.scentCategories
        .map((cat) => {
          const count = PRODUCTS.filter((p) => {
            if (p.scentCategory === cat.id) return true;
            const allNotes = [...(p.notes.top || []), ...(p.notes.middle || []), ...(p.notes.base || [])]
              .join(" ")
              .toLowerCase();
            return cat.id
              .toLowerCase()
              .split(/[&,]/)
              .some((part) => part.trim() && allNotes.includes(part.trim()));
          }).length;
          const targetHref =
            PRODUCTS.length === 1
              ? `product.html?id=${encodeURIComponent(PRODUCTS[0].id)}`
              : `products.html?q=${encodeURIComponent(cat.id)}`;
          return `
            <a href="${targetHref}" class="scent-card">
              <div class="scent-top">
                <h3 class="scent-name">${cat.name}</h3>
                <span class="scent-count">${count}</span>
              </div>
              <p class="scent-desc">${cat.subtitle}</p>
            </a>
          `;
        })
        .join("");
    }

    renderHomeTestimonials();
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
    const mobileFilterBtn = document.getElementById("mobileFilterToggleBtn");
    const mobileFilterText = document.getElementById("mobileFilterBtnText");
    const filterPanel = document.getElementById("catalogFilterPanel");

    const scentCheckboxes = document.querySelectorAll('input[name="filterScent"]');
    const genderCheckboxes = document.querySelectorAll('input[name="filterGender"]');
    const sizeCheckboxes = document.querySelectorAll('input[name="filterSize"]');

    // Toggle Filter on Mobile
    if (mobileFilterBtn && filterPanel) {
      mobileFilterBtn.addEventListener("click", () => {
        const isOpen = filterPanel.classList.toggle("open");
        mobileFilterBtn.setAttribute("aria-expanded", String(isOpen));
      });
    }

    // Read URL Query Parameters
    const params = new URLSearchParams(window.location.search);
    const paramGender = params.get("gender");
    const paramScent = params.get("scent");
    const paramQuery = params.get("q");
    const isCatalogueView = params.get("view") === "catalogue";

    if (isCatalogueView && pageTitle) {
      pageTitle.textContent = "Katalog Aroma";
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
      const maxSliderVal = priceRangeInput ? Number(priceRangeInput.max) || 500000 : 500000;
      const maxPrice = priceRangeInput ? Number(priceRangeInput.value) : maxSliderVal;

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

      // Update mobile filter badge count
      const activeFilterCount =
        selectedScents.length +
        selectedGenders.length +
        selectedSizes.length +
        (q ? 1 : 0) +
        (maxPrice < maxSliderVal ? 1 : 0);

      if (mobileFilterText) {
        mobileFilterText.textContent =
          activeFilterCount > 0 ? `Filter (${activeFilterCount})` : "Filter";
      }

      let filtered = PRODUCTS.filter((p) => {
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
            notesStr.includes(q);
          if (!matchText) return false;
        }

        if (selectedScents.length > 0 && !selectedScents.includes(p.scentCategory)) {
          return false;
        }

        if (selectedGenders.length > 0 && !selectedGenders.includes(p.gender)) {
          return false;
        }

        const matchingVariants = p.variants.filter((v) => {
          const sizeMatch = selectedSizes.length === 0 || selectedSizes.includes(v.size);
          const priceMatch = v.price <= maxPrice;
          return sizeMatch && priceMatch;
        });

        return matchingVariants.length > 0;
      });

      filtered.sort((a, b) => {
        const minA = a.variants[0].price;
        const minB = b.variants[0].price;
        if (sortBy === "price-asc") return minA - minB;
        if (sortBy === "price-desc") return minB - minA;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return Number(b.featured) - Number(a.featured);
      });

      if (countLabel) {
        countLabel.textContent = `${filtered.length} produk`;
      }

      if (filtered.length === 0) {
        gridEl.classList.remove("featured-single-spotlight");
        gridEl.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:44px 16px;background:var(--color-bg-alt);border-radius:var(--radius-md);">
            <p style="font-weight:600;margin-bottom:6px;">Produk tidak ditemukan</p>
            <button type="button" class="btn btn-outline" id="emptyResetBtn" style="margin-top:8px;">Reset Filter</button>
          </div>
        `;
        const emptyReset = document.getElementById("emptyResetBtn");
        if (emptyReset) emptyReset.addEventListener("click", resetAllFilters);
      } else if (filtered.length === 1 && PRODUCTS.length === 1) {
        const p = filtered[0];
        const v = p.variants[0] || { size: "30 ML", price: 109000 };
        gridEl.classList.add("featured-single-spotlight");
        gridEl.innerHTML = `
          ${renderProductCard(p)}
          <div class="cedora-brief-card">
            <span class="section-eyebrow" style="margin-bottom:4px;">${STORE_CONFIG.brandName} ${p.concentration || "Eau de Parfum"} • ${v.size}</span>
            <h2 style="font-size:clamp(20px, 3vw, 26px);font-weight:600;margin-bottom:2px;">${p.name}</h2>
            <p style="font-size:14.5px;font-weight:500;color:var(--color-primary);margin-bottom:10px;">A scent that speaks without saying a word.</p>
            <p style="font-size:13.5px;color:var(--color-text-muted);line-height:1.65;margin-bottom:14px;">
              Dibuka dengan kesegaran <strong>Green Tea</strong> yang menenangkan, dilanjutkan oleh <strong>Cherry &amp; Dark Rose</strong> yang elegan dan berkarakter, serta ditutup oleh kehangatan <strong>Cedarwood</strong> yang mendalam.
            </p>
            <div class="cedora-info-grid">
              <div><span>Top Notes</span><strong>${(p.notes.top || []).join(", ")}</strong></div>
              <div><span>Middle Notes</span><strong>${(p.notes.middle || []).join(", ")}</strong></div>
              <div><span>Base Notes</span><strong>${(p.notes.base || []).join(", ")}</strong></div>
              <div><span>Volume</span><strong>${v.size}</strong></div>
              <div><span>Harga</span><strong>${formatRupiah(v.price)}</strong></div>
              <div><span>Fragrance Family</span><strong>${p.scentCategory}</strong></div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;">
              <button type="button" class="btn btn-primary js-quick-add" data-product-id="${p.id}" data-size="${v.size}">
                Tambah ke Keranjang (${formatRupiah(v.price)})
              </button>
              <a href="product.html?id=${p.id}" class="btn btn-outline">Lihat Detail</a>
            </div>
          </div>
        `;
      } else {
        gridEl.classList.remove("featured-single-spotlight");
        gridEl.innerHTML = filtered.map(renderProductCard).join("");
      }
    }

    function resetAllFilters() {
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "featured";
      if (priceRangeInput) priceRangeInput.value = priceRangeInput.max || "500000";
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

    document.title = `${product.name} | ${STORE_CONFIG.brandName}`;

    let selectedVariant = product.variants[1] || product.variants[0];

    const statusBadgeHtml =
      product.status === "sold-out"
        ? `<span class="badge badge-soldout">Sold Out</span>`
        : product.status === "pre-order"
        ? `<span class="badge badge-preorder">Pre-Order</span>`
        : `<span class="badge badge-bestseller">Ready</span>`;

    container.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span>/</span>
        <a href="products.html">Products</a>
        <span>/</span>
        <strong style="color:var(--color-primary);">${product.name}</strong>
      </nav>

      <div class="product-detail-grid">
        <div>
          <div class="gallery-main">
            <img src="${product.images[0]}" alt="${product.name}" id="detailMainImage" width="600" height="600">
          </div>
          <div class="gallery-thumbs">
            ${product.images
              .map(
                (img, idx) => `
              <button type="button" class="gallery-thumb ${idx === 0 ? "active" : ""}" data-img="${img}" aria-label="Gambar ${idx + 1}">
                <img src="${img}" alt="${product.name}">
              </button>
            `
              )
              .join("")}
          </div>
        </div>

        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:11.5px;color:var(--color-text-muted);font-weight:500;">
              ${product.gender} • ${product.scentCategory}
            </span>
            ${statusBadgeHtml}
          </div>

          <h1 class="detail-title">${product.name}</h1>
          <p style="color:var(--color-text-muted);font-size:13.5px;margin-bottom:16px;">${product.shortDescription}</p>

          <div class="detail-price-box">
            <span class="detail-price" id="detailDynamicPrice">${formatRupiah(selectedVariant.price)}</span>
            <span class="detail-compare" id="detailDynamicCompare">
              ${selectedVariant.compareAtPrice ? formatRupiah(selectedVariant.compareAtPrice) : ""}
            </span>
          </div>

          <div>
            <label style="font-size:12px;font-weight:600;">
              Ukuran: <span id="selectedSizeLabel">${selectedVariant.size}</span>
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

          <div id="detailActionArea"></div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px;background:var(--color-bg-alt);border-radius:var(--radius-sm);margin-bottom:16px;font-size:11.5px;">
            <div>
              <span style="color:var(--color-text-muted);display:block;">Product Type</span>
              <strong>${product.concentration || "Eau de Parfum"}</strong>
            </div>
            <div>
              <span style="color:var(--color-text-muted);display:block;">Volume</span>
              <strong>${selectedVariant.size}</strong>
            </div>
            <div>
              <span style="color:var(--color-text-muted);display:block;">Fragrance Family</span>
              <strong>${product.scentCategory}</strong>
            </div>
          </div>

          <div class="accordion" id="detailAccordion">
            <div class="accordion-item open">
              <button type="button" class="accordion-trigger">
                <span>Fragrance Notes</span>
                <span>−</span>
              </button>
              <div class="accordion-content">
                <div class="notes-pyramid">
                  <div class="note-tier">
                    <strong style="color:var(--color-primary);display:block;font-size:11px;">Top Notes</strong>
                    <span>${product.notes.top.join(", ")}</span>
                  </div>
                  <div class="note-tier">
                    <strong style="color:var(--color-primary);display:block;font-size:11px;">Middle Notes</strong>
                    <span>${product.notes.middle.join(", ")}</span>
                  </div>
                  <div class="note-tier">
                    <strong style="color:var(--color-primary);display:block;font-size:11px;">Base Notes</strong>
                    <span>${product.notes.base.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion-item open">
              <button type="button" class="accordion-trigger">
                <span>Deskripsi &amp; Product Information</span>
                <span>−</span>
              </button>
              <div class="accordion-content">
                <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">
                  ${String(product.description || "")
                    .split(/\n\n+/)
                    .map((para) => `<p>${sanitizeInput(para)}</p>`)
                    .join("")}
                </div>
                <div class="cedora-info-grid" style="margin-top:10px;">
                  <div><span>Brand</span><strong>${STORE_CONFIG.brandName}</strong></div>
                  <div><span>Collection</span><strong>${product.name}</strong></div>
                  <div><span>Product Type</span><strong>${product.concentration || "Eau de Parfum"}</strong></div>
                  <div><span>Volume</span><strong>${selectedVariant.size}</strong></div>
                  <div><span>Price</span><strong>${formatRupiah(selectedVariant.price)}</strong></div>
                  <div><span>Fragrance Family</span><strong>${product.scentCategory}</strong></div>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button type="button" class="accordion-trigger">
                <span>The ANDRD Experience &amp; Pengiriman</span>
                <span>+</span>
              </button>
              <div class="accordion-content">
                <p style="margin-bottom:8px;"><strong>Diciptakan untuk mereka yang menghargai karakter, detail, dan ekspresi diri. ANDRD. Made to be remembered.</strong></p>
                <p>Semprotkan pada titik nadi (pergelangan tangan, leher, atau belakang telinga) dengan jarak 15 cm. Pengiriman ke seluruh Indonesia dengan perhitungan ongkir otomatis dan garansi retur ${STORE_CONFIG.returnPolicyDays} hari.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ulasan & Rating Pelanggan di Halaman Produk -->
      <div style="margin-top:48px;padding-top:36px;border-top:1px solid var(--color-border);">
        <div class="section-header testimonial-section-header" style="margin-bottom:20px;">
          <div>
            <span class="section-eyebrow">Customer Reviews</span>
            <h2 class="section-title" style="font-size:22px;">Ulasan Pelanggan</h2>
          </div>
          <div class="testimonial-header-actions">
            <div class="testimonial-summary-badge">
              <span id="productDetailReviewsSummary">★ 5.0 / 5.0</span>
            </div>
            <button type="button" class="btn btn-primary js-open-review-modal" data-product-id="${product.id}" style="padding:10px 18px;font-size:13px;">
              + Tulis Ulasan
            </button>
          </div>
        </div>
        <div class="testimonial-grid" id="productDetailReviewsGrid"></div>
      </div>
    `;

    function renderActionArea() {
      const actionEl = document.getElementById("detailActionArea");
      if (!actionEl) return;

      if (product.status === "sold-out") {
        const waMsg = STORE_CONFIG.buildRestockMessage(product.name, selectedVariant.size);
        const waHref = buildWhatsAppUrl(STORE_CONFIG.whatsappAdmin, waMsg);
        actionEl.innerHTML = `
          <div style="margin-bottom:18px;display:flex;gap:8px;">
            <button type="button" class="btn btn-outline" disabled style="flex:1;">Sold Out</button>
            <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1.4;">
              Kabari Saya via WA
            </a>
          </div>
        `;
      } else {
        const ctaLabel =
          product.status === "pre-order" ? "Pre-Order" : "Tambah ke Keranjang";
        actionEl.innerHTML = `
          <div class="qty-action-row">
            <div class="qty-control">
              <button type="button" class="qty-btn" id="detailQtyMinus" aria-label="Kurangi">−</button>
              <input type="number" id="detailQtyInput" class="qty-input" value="1" min="1" max="50" aria-label="Jumlah">
              <button type="button" class="qty-btn" id="detailQtyPlus" aria-label="Tambah">+</button>
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

    container.querySelectorAll(".gallery-thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".gallery-thumb").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("detailMainImage").src = btn.getAttribute("data-img");
      });
    });

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

    container.querySelectorAll(".accordion-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.parentElement;
        const isOpen = item.classList.toggle("open");
        trigger.querySelector("span:last-child").textContent = isOpen ? "−" : "+";
      });
    });

    const relatedGrid = document.getElementById("relatedProductsGrid");
    if (relatedGrid) {
      const related = PRODUCTS.filter(
        (p) =>
          p.id !== product.id &&
          (p.scentCategory === product.scentCategory || p.gender === product.gender)
      ).slice(0, 4);
      if (related.length > 0) {
        relatedGrid.innerHTML = related.map(renderProductCard).join("");
      } else if (product.images && product.images.length > 1) {
        const galleryItems = [
          { img: product.images[1], title: "A Scent That Speaks", sub: "Without saying a word" },
          { img: product.images[2] || product.images[0], title: "Top: Green Tea", sub: "Segar & menenangkan" },
          { img: product.images[3] || product.images[1], title: "Middle: Cherry & Dark Rose", sub: "Elegan & berkarakter" },
          { img: product.images[5] || product.images[4] || product.images[0], title: "Base: Cedarwood", sub: "Hangat & mendalam" }
        ];
        relatedGrid.innerHTML = galleryItems
          .map(
            (g) => `
            <div class="product-card">
              <div class="product-media">
                <img src="${g.img}" alt="${g.title}" class="product-img-primary" style="opacity:1 !important;" loading="lazy">
              </div>
              <div class="product-body">
                <div class="product-meta">${g.sub}</div>
                <h3 class="product-title">${g.title}</h3>
              </div>
            </div>
          `
          )
          .join("");
      }
    }

    renderProductDetailReviews(product.id);
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
        <div style="text-align:center;padding:56px 20px;background:var(--color-bg-alt);border-radius:var(--radius-lg);">
          <h2 style="font-size:22px;margin-bottom:6px;">Keranjang Kosong</h2>
          <p style="color:var(--color-text-muted);margin-bottom:20px;">Belum ada produk di keranjang Anda.</p>
          <a href="products.html" class="btn btn-primary">Mulai Belanja</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="checkout-grid">
        <div class="checkout-card">
          <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--color-border);">
            <h2 style="font-size:18px;">Item (${getCartCount()})</h2>
            <button type="button" id="clearCartPageBtn" style="font-size:12px;color:var(--color-text-muted);text-decoration:underline;">Kosongkan</button>
          </div>
          <div>
            ${cart
              .map(
                (item) => `
              <div class="cart-item" style="grid-template-columns:76px 1fr;align-items:center;">
                <a href="product.html?id=${encodeURIComponent(item.productId)}">
                  <img src="${item.image}" alt="${item.name}" style="width:76px;height:76px;">
                </a>
                <div>
                  <div style="display:flex;justify-content:space-between;gap:8px;">
                    <div>
                      <a href="product.html?id=${encodeURIComponent(item.productId)}" style="font-size:15px;font-weight:600;">${item.name}</a>
                      <div style="font-size:12px;color:var(--color-text-muted);">${item.size} • ${formatRupiah(item.price)}</div>
                    </div>
                    <button type="button" class="js-remove-item" data-key="${item.key}" style="font-size:12px;color:var(--color-text-muted);">✕</button>
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                    <div class="qty-control" style="background:#FFFFFF;">
                      <button type="button" class="qty-btn js-qty-dec" data-key="${item.key}" data-qty="${item.qty - 1}">−</button>
                      <span style="padding:0 10px;font-weight:600;">${item.qty}</span>
                      <button type="button" class="qty-btn js-qty-inc" data-key="${item.key}" data-qty="${item.qty + 1}">+</button>
                    </div>
                    <strong style="font-size:14.5px;">${formatRupiah(item.price * item.qty)}</strong>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="checkout-card">
          <h2 style="font-size:18px;margin-bottom:14px;">Ringkasan</h2>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13.5px;">
            <span>Subtotal</span>
            <strong>${formatRupiah(subtotal)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:var(--color-text-muted);">
            <span>Free Vial 2ml</span>
            <span>Gratis</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--color-border);font-size:13px;color:var(--color-text-muted);">
            <span>Ongkir</span>
            <span>Info via WhatsApp</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:18px;">
            <span style="font-weight:600;font-size:13px;">Total</span>
            <strong style="font-size:19px;">${formatRupiah(subtotal)}</strong>
          </div>
          <a href="checkout.html" class="btn btn-primary btn-block">Lanjut ke Checkout</a>
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
  const WILAYAH_INDONESIA = {
    "DKI Jakarta": {
      "Jakarta Selatan": ["Kebayoran Baru", "Kebayoran Lama", "Cilandak", "Tebet", "Setiabudi", "Mampang Prapatan", "Pancoran", "Pasar Minggu", "Jagakarsa", "Pesanggrahan"],
      "Jakarta Pusat": ["Menteng", "Tanah Abang", "Gambir", "Sawah Besar", "Kemayoran", "Senen", "Cempaka Putih", "Johar Baru"],
      "Jakarta Barat": ["Kebon Jeruk", "Kembangan", "Palmerah", "Grogol Petamburan", "Cengkareng", "Kalideres", "Taman Sari", "Tambora"],
      "Jakarta Timur": ["Duren Sawit", "Jatinegara", "Kramat Jati", "Matraman", "Pulo Gadung", "Cakung", "Cipayung", "Ciracas", "Makasar", "Pasar Rebo"],
      "Jakarta Utara": ["Kelapa Gading", "Penjaringan", "Pademangan", "Tanjung Priok", "Koja", "Cilincing"],
      "Kepulauan Seribu": ["Kepulauan Seribu Selatan", "Kepulauan Seribu Utara"]
    },
    "Banten": {
      "Kota Tangerang Selatan": ["Bintaro / Pondok Aren", "BSD / Serpong", "Serpong Utara", "Ciputat", "Ciputat Timur", "Pamulang", "Setu"],
      "Kota Tangerang": ["Ciledug", "Karawaci", "Cipondoh", "Tangerang", "Batuceper", "Benda", "Cibodas", "Jatiuwung", "Karangtengah", "Larangan", "Neglasari", "Periuk", "Pinang"],
      "Kab. Tangerang": ["Kelapa Dua", "Pagedangan", "Cisauk", "Curug", "Cikupa", "Balaraja", "Pasar Kemis", "Tigaraksa", "Kosambi", "Sepatan"],
      "Kota Serang": ["Serang", "Cipocok Jaya", "Curug", "Kasemen", "Taktakan", "Walantaka"],
      "Kota Cilegon": ["Cilegon", "Cibeber", "Citangkil", "Ciwandan", "Gerogol", "Jombang", "Pulomerak", "Purwakarta"],
      "Kab. Lebak": ["Rangkasbitung", "Cibadak", "Maja", "Malingping", "Bayah"],
      "Kab. Pandeglang": ["Pandeglang", "Majasari", "Karangtanjung", "Labuan", "Carita"]
    },
    "Jawa Barat": {
      "Kota Bandung": ["Coblong", "Bandung Wetan", "Sumur Bandung", "Sukajadi", "Cidadap", "Cicendo", "Andir", "Antapani", "Arcamanik", "Buahbatu", "Lengkong", "Regol", "Ujungberung"],
      "Kota Bekasi": ["Bekasi Selatan", "Bekasi Barat", "Bekasi Timur", "Bekasi Utara", "Medan Satria", "Rawalumbu", "Pondok Gede", "Jatiasih", "Jatisampurna", "Mustika Jaya", "Bantargebang", "Pondok Melati"],
      "Kota Depok": ["Margonda / Beji", "Cinere", "Cimanggis", "Pancoran Mas", "Sukmajaya", "Sawangan", "Limo", "Cilodong", "Cipayung", "Tapos", "Bojongsari"],
      "Kota Bogor": ["Bogor Tengah", "Bogor Selatan", "Bogor Timur", "Bogor Utara", "Bogor Barat", "Tanah Sareal"],
      "Kab. Bogor": ["Cibinong", "Sentul / Babakan Madang", "Cileungsi", "Gunung Putri", "Ciawi", "Megamendung", "Cisarua", "Bojong Gede", "Parung", "Ciomas"],
      "Kab. Bekasi": ["Cikarang Barat", "Cikarang Pusat", "Cikarang Selatan", "Cikarang Utara", "Cikarang Timur", "Tambun Selatan", "Tambun Utara", "Babelan", "Cibitung"],
      "Kab. Bandung": ["Margahayu", "Margaasih", "Dayeuhkolot", "Bojongsoang", "Cileunyi", "Rancaekek", "Soreang", "Ciwidey", "Pangalengan", "Lembang (KBB)"],
      "Kota Cirebon": ["Kejaksan", "Kesambi", "Lemahwungkuk", "Harjamukti", "Pekalipan"],
      "Kota Tasikmalaya": ["Cihideung", "Tawang", "Cipedes", "Indihiang", "Kawalu"],
      "Kab. Garut": ["Garut Kota", "Tarogong Kidul", "Tarogong Kaler", "karangpawitan", "Leles"],
      "Kab. Karawang": ["Karawang Barat", "Karawang Timur", "Telukjambe Timur", "Telukjambe Barat", "Klari", "Cikampek"]
    },
    "Jawa Tengah": {
      "Kota Semarang": ["Semarang Tengah", "Semarang Selatan", "Semarang Barat", "Semarang Timur", "Semarang Utara", "Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati", "Mijen", "Ngaliyan", "Pedurungan", "Tembalang", "Tugu"],
      "Kota Surakarta (Solo)": ["Laweyan", "Serengan", "Pasar Kliwon", "Jebres", "Banjarsari"],
      "Kota Magelang": ["Magelang Tengah", "Magelang Utara", "Magelang Selatan"],
      "Kota Pekalongan": ["Pekalongan Barat", "Pekalongan Timur", "Pekalongan Utara", "Pekalongan Selatan"],
      "Kota Tegal": ["Tegal Barat", "Tegal Timur", "Tegal Selatan", "Margadana"],
      "Kab. Banyumas (Purwokerto)": ["Purwokerto Timur", "Purwokerto Barat", "Purwokerto Utara", "Purwokerto Selatan", "Sokaraja", "Baturaden"],
      "Kab. Kudus": ["Kota Kudus", "Jati", "Bae", "Kaliwungu", "Gebog"],
      "Kab. Jepara": ["Jepara", "Tahunan", "Batealit", "Mayong", "Pecangaan"],
      "Kab. Klaten": ["Klaten Tengah", "Klaten Utara", "Klaten Selatan", "Prambanan", "Delanggu"]
    },
    "DI Yogyakarta": {
      "Kota Yogyakarta": ["Gondokusuman", "Jetis", "Danurejan", "Gedongtengen", "Gondomanan", "Kotagede", "Kraton", "Mantrijeron", "Mergangsan", "Ngampilan", "Pakualaman", "Tegalrejo", "Umbulharjo", "Wirobrajan"],
      "Kab. Sleman": ["Depok", "Mlati", "Gamping", "Ngaglik", "Godean", "Kalasan", "Sleman", "Pakem", "Prambanan"],
      "Kab. Bantul": ["Banguntapan", "Kasihan", "Sewon", "Bantul", "Jetis", "Piyungan", "Sedayu"],
      "Kab. Kulon Progo": ["Wates", "Temon", "Pengasih", "Sentolo"],
      "Kab. Gunungkidul": ["Wonosari", "Playen", "Karangmojo", "Semanu"]
    },
    "Jawa Timur": {
      "Kota Surabaya": ["Gubeng", "Wonokromo", "Tegalsari", "Genteng", "Sukolilo", "Rungkut", "Sawahan", "Dukuh Pakis", "Wiyung", "Gayungan", "Jambangan", "Tenggilis Mejoyo", "Mulyorejo", "Tambaksari", "Kenjeran"],
      "Kota Malang": ["Klojen", "Lowokwaru", "Blimbing", "Sukun", "Kedungkandang"],
      "Kab. Sidoarjo": ["Sidoarjo", "Waru", "Taman", "Gedangan", "Buduran", "Candi", "Krian", "Sedati"],
      "Kab. Gresik": ["Gresik", "Kebomas", "Manyar", "Menganti", "Driyorejo"],
      "Kota Batu": ["Batu", "Bumiaji", "Junrejo"],
      "Kota Kediri": ["Kota Kediri", "Mojoroto", "Pesantren"],
      "Kab. Jember": ["Sumbersari", "Kaliwates", "Patrang", "Ambulu", "Tanggul"],
      "Kab. Banyuwangi": ["Banyuwangi", "Giri", "Glagah", "Kabat", "Genteng", "Rogojampi"]
    },
    "Bali": {
      "Kota Denpasar": ["Denpasar Selatan", "Denpasar Barat", "Denpasar Timur", "Denpasar Utara"],
      "Kab. Badung": ["Kuta", "Kuta Selatan (Jimbaran/Uluwatu)", "Kuta Utara (Canggu/Kerobokan)", "Mengwi", "Abiansemal", "Petang"],
      "Kab. Gianyar": ["Ubud", "Sukawati", "Gianyar", "Blahbatuh", "Tampaksiring", "Tegallalang", "Payangan"],
      "Kab. Tabanan": ["Tabanan", "Kediri", "Kerambitan", "Baturiti"],
      "Kab. Buleleng": ["Singaraja / Buleleng", "Sukasada", "Seririt", "Banjar"]
    },
    "Sumatera Utara": {
      "Kota Medan": ["Medan Baru", "Medan Petisah", "Medan Polonia", "Medan Kota", "Medan Sunggal", "Medan Selayang", "Medan Johor", "Medan Helvetia", "Medan Area", "Medan Barat", "Medan Timur"],
      "Kota Binjai": ["Binjai Kota", "Binjai Barat", "Binjai Timur", "Binjai Selatan", "Binjai Utara"],
      "Kab. Deli Serdang": ["Percut Sei Tuan", "Tanjung Morawa", "Lubuk Pakam", "Sunggal", "Pancur Batu"]
    },
    "Sumatera Barat": {
      "Kota Padang": ["Padang Barat", "Padang Timur", "Padang Utara", "Padang Selatan", "Kuranji", "Koto Tangah", "Nanggalo", "Lubuk Begalung"],
      "Kota Bukittinggi": ["Guguk Panjang", "Mandiangin Koto Selayan", "Aur Birugo Tigo Baleh"]
    },
    "Riau & Kepulauan Riau": {
      "Kota Pekanbaru": ["Sukajadi", "Marpoyan Damai", "Tampan / Tuah Madani", "Bukit Raya", "Payung Sekaki", "Senapelan", "Lima Puluh", "Sail", "Tenayan Raya"],
      "Kota Batam": ["Batam Kota", "Lubuk Baja", "Nagoya", "Batu Ampar", "Bengkong", "Sekupang", "Sagulung", "Sei Beduk", "Nongsa"],
      "Kota Tanjungpinang": ["Tanjungpinang Kota", "Tanjungpinang Barat", "Tanjungpinang Timur", "Bukit Bestari"]
    },
    "Sumatera Selatan & Lampung": {
      "Kota Palembang": ["Ilir Barat I", "Ilir Timur I", "Ilir Timur II", "Sukarami", "Kemuning", "Sako", "Seberang Ulu I", "Kalidoni", "Bukit Kecil"],
      "Kota Bandar Lampung": ["Tanjung Karang Pusat", "Enggal", "Kedaton", "Rajabasa", "Sukarame", "Way Halim", "Teluk Betung Selatan", "Teluk Betung Utara"]
    },
    "Kalimantan Timur": {
      "Kota Balikpapan": ["Balikpapan Selatan", "Balikpapan Kota", "Balikpapan Tengah", "Balikpapan Utara", "Balikpapan Barat", "Balikpapan Timur"],
      "Kota Samarinda": ["Samarinda Kota", "Samarinda Ulu", "Samarinda Ilir", "Samarinda Utara", "Sungai Kunjang", "Sungai Pinang"],
      "Kota Bontang": ["Bontang Utara", "Bontang Selatan", "Bontang Barat"]
    },
    "Kalimantan Selatan, Barat & Tengah": {
      "Kota Banjarmasin": ["Banjarmasin Tengah", "Banjarmasin Utara", "Banjarmasin Selatan", "Banjarmasin Timur", "Banjarmasin Barat"],
      "Kota Banjarbaru": ["Banjarbaru Utara", "Banjarbaru Selatan", "Landasan Ulin", "Liang Anggang", "Cempaka"],
      "Kota Pontianak": ["Pontianak Kota", "Pontianak Selatan", "Pontianak Tenggara", "Pontianak Barat", "Pontianak Timur", "Pontianak Utara"],
      "Kota Palangka Raya": ["Pahandut", "Jekan Raya", "Sabangau", "Bukit Batu"]
    },
    "Sulawesi Selatan & Utara": {
      "Kota Makassar": ["Panakkukang", "Rappocini", "Tamalate", "Ujung Pandang", "Mamajang", "Mariso", "Biringkanaya", "Tamalanrea", "Manggala", "Wajo"],
      "Kota Manado": ["Wenang", "Sario", "Malalayang", "Wanea", "Tikala", "Mapanget", "Paal Dua"],
      "Kota Kendari": ["Mandonga", "Kadia", "Wua-Wua", "Poasia", "Baruga"],
      "Kota Palu": ["Palu Selatan", "Palu Timur", "Palu Barat", "Palu Utara", "Mantikulore"]
    },
    "NTB, NTT, Maluku & Papua": {
      "Kota Mataram": ["Mataram", "Ampenan", "Cakranegara", "Selaparang", "Sekarbela", "Sandubaya"],
      "Kota Kupang": ["Oebobo", "Kelapa Lima", "Kota Raja", "Kota Lama", "Alak", "Maulafa"],
      "Kota Ambon": ["Sirimau", "Nusaniwe", "Baguala", "Teluk Ambon"],
      "Kota Jayapura": ["Jayapura Utara", "Jayapura Selatan", "Abepura", "Heram", "Muara Tami"]
    }
  };

  // Daftar Kota/Kabupaten Area JABODETABEK (Opsi GoSend & GrabExpress Manual HANYA muncul di area ini)
  const JABODETABEK_CITIES = [
    "Jakarta Selatan",
    "Jakarta Pusat",
    "Jakarta Barat",
    "Jakarta Timur",
    "Jakarta Utara",
    "Kota Bogor",
    "Kab. Bogor",
    "Kota Depok",
    "Kota Tangerang",
    "Kota Tangerang Selatan",
    "Kab. Tangerang",
    "Kota Bekasi",
    "Kab. Bekasi"
  ];

  function isJabodetabekCity(kota) {
    return JABODETABEK_CITIES.includes(kota);
  }

  function calculateCartWeightGrams(cartItems) {
    let grams = 80; // Berat box + bubble wrap pengaman botol kaca
    (cartItems || []).forEach((item) => {
      const sizeStr = String(item.size || "").toLowerCase();
      let unitGram = 280; // Default 50ml
      if (sizeStr.includes("15")) unitGram = 120;
      else if (sizeStr.includes("30")) unitGram = 200;
      else if (sizeStr.includes("100")) unitGram = 450;
      grams += unitGram * (Number(item.qty) || 1);
    });
    return Math.max(200, grams);
  }

  // Tabel Tarif Dasar Domestik (per 1 kg dari Jakarta) — Digunakan instan jika API Key RajaOngkir belum diisi
  const DOMESTIC_BASE_RATE_PER_KG = {
    "Jakarta Selatan": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Jakarta Pusat": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Jakarta Barat": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Jakarta Timur": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Jakarta Utara": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Kepulauan Seribu": { reg: 15000, yes: 24000, etd: "2-3 Hari" },
    "Kota Tangerang Selatan": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Kota Tangerang": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Kab. Tangerang": { reg: 11000, yes: 19000, etd: "1-2 Hari" },
    "Kota Depok": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Kota Bekasi": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Kab. Bekasi": { reg: 11000, yes: 19000, etd: "1-2 Hari" },
    "Kota Bogor": { reg: 11000, yes: 19000, etd: "1-2 Hari" },
    "Kab. Bogor": { reg: 11000, yes: 19000, etd: "1-2 Hari" },
    "Kota Bandung": { reg: 12000, yes: 22000, etd: "1-2 Hari" },
    "Kab. Bandung": { reg: 13000, yes: 24000, etd: "2-3 Hari" },
    "Kab. Karawang": { reg: 12000, yes: 21000, etd: "1-2 Hari" },
    "Kota Cirebon": { reg: 15000, yes: 26000, etd: "2-3 Hari" },
    "Kota Tasikmalaya": { reg: 16000, yes: 27000, etd: "2-3 Hari" },
    "Kab. Garut": { reg: 15000, yes: 26000, etd: "2-3 Hari" },
    "Kota Serang": { reg: 13000, yes: 22000, etd: "1-2 Hari" },
    "Kota Cilegon": { reg: 14000, yes: 24000, etd: "1-2 Hari" },
    "Kota Semarang": { reg: 19000, yes: 32000, etd: "2-3 Hari" },
    "Kota Surakarta (Solo)": { reg: 20000, yes: 34000, etd: "2-3 Hari" },
    "Kota Yogyakarta": { reg: 20000, yes: 34000, etd: "2-3 Hari" },
    "Kab. Sleman": { reg: 20000, yes: 34000, etd: "2-3 Hari" },
    "Kab. Bantul": { reg: 20000, yes: 34000, etd: "2-3 Hari" },
    "Kota Surabaya": { reg: 22000, yes: 37000, etd: "2-3 Hari" },
    "Kota Malang": { reg: 25000, yes: 40000, etd: "2-3 Hari" },
    "Kab. Sidoarjo": { reg: 23000, yes: 38000, etd: "2-3 Hari" },
    "Kota Denpasar": { reg: 30000, yes: 48000, etd: "2-4 Hari" },
    "Kab. Badung": { reg: 30000, yes: 48000, etd: "2-4 Hari" },
    "Kab. Gianyar": { reg: 32000, yes: 50000, etd: "3-4 Hari" },
    "Kota Medan": { reg: 37000, yes: 56000, etd: "3-4 Hari" },
    "Kota Padang": { reg: 35000, yes: 52000, etd: "3-4 Hari" },
    "Kota Pekanbaru": { reg: 34000, yes: 50000, etd: "3-4 Hari" },
    "Kota Batam": { reg: 35000, yes: 52000, etd: "3-4 Hari" },
    "Kota Palembang": { reg: 26000, yes: 42000, etd: "2-3 Hari" },
    "Kota Bandar Lampung": { reg: 22000, yes: 36000, etd: "2-3 Hari" },
    "Kota Balikpapan": { reg: 42000, yes: 62000, etd: "3-4 Hari" },
    "Kota Samarinda": { reg: 45000, yes: 65000, etd: "3-5 Hari" },
    "Kota Banjarmasin": { reg: 38000, yes: 56000, etd: "3-4 Hari" },
    "Kota Pontianak": { reg: 36000, yes: 54000, etd: "3-4 Hari" },
    "Kota Makassar": { reg: 44000, yes: 64000, etd: "3-4 Hari" },
    "Kota Manado": { reg: 54000, yes: 76000, etd: "3-5 Hari" },
    "Kota Mataram": { reg: 36000, yes: 54000, etd: "3-4 Hari" },
    "Kota Kupang": { reg: 62000, yes: 86000, etd: "4-6 Hari" },
    "Kota Ambon": { reg: 68000, yes: 94000, etd: "4-6 Hari" },
    "Kota Jayapura": { reg: 95000, yes: 125000, etd: "5-7 Hari" }
  };

  const PROVINCE_DEFAULT_RATE = {
    "DKI Jakarta": { reg: 10000, yes: 18000, etd: "1-2 Hari" },
    "Banten": { reg: 14000, yes: 24000, etd: "2-3 Hari" },
    "Jawa Barat": { reg: 15000, yes: 26000, etd: "2-3 Hari" },
    "Jawa Tengah": { reg: 21000, yes: 35000, etd: "2-3 Hari" },
    "DI Yogyakarta": { reg: 21000, yes: 35000, etd: "2-3 Hari" },
    "Jawa Timur": { reg: 25000, yes: 40000, etd: "2-4 Hari" },
    "Bali": { reg: 32000, yes: 50000, etd: "3-4 Hari" },
    "Sumatera Utara": { reg: 39000, yes: 58000, etd: "3-5 Hari" },
    "Sumatera Barat": { reg: 36000, yes: 54000, etd: "3-5 Hari" },
    "Riau & Kepulauan Riau": { reg: 36000, yes: 54000, etd: "3-5 Hari" },
    "Sumatera Selatan & Lampung": { reg: 26000, yes: 42000, etd: "2-4 Hari" },
    "Kalimantan Timur": { reg: 45000, yes: 65000, etd: "3-5 Hari" },
    "Kalimantan Selatan, Barat & Tengah": { reg: 40000, yes: 58000, etd: "3-5 Hari" },
    "Sulawesi Selatan & Utara": { reg: 48000, yes: 68000, etd: "3-5 Hari" },
    "NTB, NTT, Maluku & Papua": { reg: 68000, yes: 92000, etd: "4-7 Hari" }
  };

  function getBuiltinDomesticRates(provinsi, kota, weightGrams) {
    const kg = Math.max(1, Math.ceil((Number(weightGrams) || 1000) / 1000));
    const base =
      DOMESTIC_BASE_RATE_PER_KG[kota] ||
      PROVINCE_DEFAULT_RATE[provinsi] ||
      { reg: 25000, yes: 40000, etd: "2-4 Hari" };

    return [
      {
        code: "JNE REG",
        label: `JNE REG (${base.etd})`,
        cost: base.reg * kg,
        isManual: false
      },
      {
        code: "JNE YES",
        label: `JNE YES (1-2 Hari)`,
        cost: base.yes * kg,
        isManual: false
      },
      {
        code: "TIKI REG",
        label: `TIKI REG (${base.etd})`,
        cost: Math.max(9000, (base.reg - 1000) * kg),
        isManual: false
      },
      {
        code: "POS Reguler",
        label: `POS Reguler (${base.etd})`,
        cost: Math.max(9000, (base.reg - 1500) * kg),
        isManual: false
      }
    ];
  }

  async function fetchRajaOngkirOrBuiltinRates(provinsi, kota, kecamatan, weightGrams) {
    const apiKey = (STORE_CONFIG.rajaOngkirApiKey || "").trim();
    const originCity = STORE_CONFIG.originCity || "Johar Baru, Jakarta Pusat";

    // Panggil endpoint Vercel /api/shipping jika berjalan di web server (http/https)
    if (window.location.protocol.startsWith("http")) {
      try {
        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            originCity,
            destinationCity: kota,
            destinationDistrict: kecamatan,
            weightGrams
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok && Array.isArray(data.rates) && data.rates.length > 0) {
            return data.rates;
          }
        }
      } catch (e) {
        // Otomatis lanjut ke tarif domestik bawaan jika offline / tanpa API key
      }
    }

    return getBuiltinDomesticRates(provinsi, kota, weightGrams);
  }

  function initCheckoutPage() {
    const form = document.getElementById("whatsappCheckoutForm");
    const summaryEl = document.getElementById("checkoutSummaryItems");
    const subtotalEl = document.getElementById("checkoutSubtotalAmount");
    const weightLabelEl = document.getElementById("checkoutWeightLabel");
    const shippingAmountEl = document.getElementById("checkoutShippingAmount");
    const grandTotalEl = document.getElementById("checkoutGrandTotalAmount");
    const courierSelect = document.getElementById("custKurir");
    const courierHintEl = document.getElementById("courierJabodetabekHint");
    if (!form || !summaryEl) return;

    const cart = getCart();
    const subtotal = getCartSubtotal();
    const weightGrams = calculateCartWeightGrams(cart);
    const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));

    let selectedShippingCost = 0;
    let selectedShippingManual = false;
    let latestRateReqId = 0;

    if (weightLabelEl) {
      weightLabelEl.textContent = `${weightKg} kg (${weightGrams} gr)`;
    }

    function updateOrderTotalsDisplay() {
      if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);

      if (!courierSelect || !courierSelect.value) {
        if (shippingAmountEl) shippingAmountEl.textContent = "Pilih kurir";
        if (grandTotalEl) grandTotalEl.textContent = formatRupiah(subtotal);
        return;
      }

      const selectedOpt = courierSelect.options[courierSelect.selectedIndex];
      selectedShippingManual = selectedOpt && selectedOpt.getAttribute("data-manual") === "true";
      selectedShippingCost = selectedOpt ? Number(selectedOpt.getAttribute("data-cost") || 0) : 0;

      if (selectedShippingManual) {
        if (shippingAmountEl) shippingAmountEl.textContent = "Cek Manual via WA";
        if (grandTotalEl) grandTotalEl.textContent = `${formatRupiah(subtotal)} + Ongkir`;
      } else {
        if (shippingAmountEl) shippingAmountEl.textContent = formatRupiah(selectedShippingCost);
        if (grandTotalEl) grandTotalEl.textContent = formatRupiah(subtotal + selectedShippingCost);
      }
    }

    async function refreshCourierDropdown() {
      const prov = provSelect ? provSelect.value : "";
      const kota = kotaSelect ? kotaSelect.value : "";
      let kec = kecSelect ? kecSelect.value : "";
      if (kec === "LAINNYA" && kecManual && kecManual.value.trim()) {
        kec = kecManual.value.trim();
      }

      if (!courierSelect) return;

      if (!prov || !kota) {
        courierSelect.innerHTML = `<option value="">Pilih Kota atau Kabupaten Dahulu untuk Cek Ongkir</option>`;
        courierSelect.disabled = true;
        if (courierHintEl) {
          courierHintEl.textContent = "Pilih Provinsi dan Kota/Kabupaten untuk menampilkan harga ongkir otomatis.";
        }
        updateOrderTotalsDisplay();
        return;
      }

      const reqId = ++latestRateReqId;
      const targetLabel = kec && kec !== "LAINNYA" ? `${kec}, ${kota}` : kota;
      courierSelect.disabled = true;
      courierSelect.innerHTML = `<option value="">Menghitung ongkir live ke ${targetLabel}...</option>`;

      const autoRates = await fetchRajaOngkirOrBuiltinRates(prov, kota, kec, weightGrams);
      if (reqId !== latestRateReqId) return;
      const inJabodetabek = isJabodetabekCity(kota);

      const optionsHtml = [`<option value="">Pilih Layanan Kurir</option>`];

      // 1. Opsi Ekspedisi Reguler / Nextday dengan Harga Otomatis (RajaOngkir)
      autoRates.forEach((rate) => {
        optionsHtml.push(
          `<option value="${rate.code}" data-cost="${rate.cost}" data-manual="false">${rate.label} (${formatRupiah(rate.cost)})</option>`
        );
      });

      // 2. Opsi GoSend & GrabExpress Manual HANYA JIKA Alamat User di JABODETABEK
      if (inJabodetabek) {
        optionsHtml.push(
          `<option value="GoSend Instant / Sameday" data-cost="0" data-manual="true">GoSend Instant / Sameday (Tarif Manual via Admin WA)</option>`
        );
        optionsHtml.push(
          `<option value="GrabExpress Instant / Sameday" data-cost="0" data-manual="true">GrabExpress Instant / Sameday (Tarif Manual via Admin WA)</option>`
        );
      }

      courierSelect.innerHTML = optionsHtml.join("");
      courierSelect.disabled = false;

      // Pilih otomatis kurir reguler pertama agar user langsung melihat total harga
      if (autoRates.length > 0) {
        courierSelect.selectedIndex = 1;
      }

      if (courierHintEl) {
        courierHintEl.textContent = inJabodetabek
          ? `✓ Area Jabodetabek (${kota}): Tersedia ongkir otomatis & opsi GoSend/GrabExpress (tarif manual via WA).`
          : `✓ Pengiriman ke ${kota}: Harga ongkir terhitung otomatis (${weightKg} kg). Opsi GoSend/Grab hanya untuk Jabodetabek.`;
      }

      updateOrderTotalsDisplay();
    }

    // Populate Cascading Wilayah Dropdowns (Provinsi -> Kota/Kabupaten -> Kecamatan)
    const provSelect = document.getElementById("custProvinsi");
    const kotaSelect = document.getElementById("custKota");
    const kecSelect = document.getElementById("custKecamatan");
    const kecManual = document.getElementById("custKecamatanManual");

    if (provSelect && kotaSelect && kecSelect) {
      const provList = Object.keys(WILAYAH_INDONESIA);
      provSelect.innerHTML =
        `<option value="">Pilih Provinsi</option>` +
        provList.map((p) => `<option value="${p}">${p}</option>`).join("");

      provSelect.addEventListener("change", () => {
        const selectedProv = provSelect.value;
        kecSelect.innerHTML = `<option value="">Pilih Kota atau Kabupaten Dahulu</option>`;
        kecSelect.disabled = true;
        if (kecManual) kecManual.style.display = "none";

        if (!selectedProv || !WILAYAH_INDONESIA[selectedProv]) {
          kotaSelect.innerHTML = `<option value="">Pilih Provinsi Dahulu</option>`;
          kotaSelect.disabled = true;
          refreshCourierDropdown();
          return;
        }

        const kotaList = Object.keys(WILAYAH_INDONESIA[selectedProv]);
        kotaSelect.innerHTML =
          `<option value="">Pilih Kota / Kabupaten</option>` +
          kotaList.map((k) => `<option value="${k}">${k}</option>`).join("");
        kotaSelect.disabled = false;
        refreshCourierDropdown();
      });

      kotaSelect.addEventListener("change", () => {
        const selectedProv = provSelect.value;
        const selectedKota = kotaSelect.value;
        if (kecManual) kecManual.style.display = "none";

        if (!selectedProv || !selectedKota || !WILAYAH_INDONESIA[selectedProv][selectedKota]) {
          kecSelect.innerHTML = `<option value="">Pilih Kota atau Kabupaten Dahulu</option>`;
          kecSelect.disabled = true;
          refreshCourierDropdown();
          return;
        }

        const kecList = WILAYAH_INDONESIA[selectedProv][selectedKota];
        kecSelect.innerHTML =
          `<option value="">Pilih Kecamatan</option>` +
          kecList.map((kc) => `<option value="${kc}">${kc}</option>`).join("") +
          `<option value="LAINNYA">Lainnya (Ketik Manual)</option>`;
        kecSelect.disabled = false;
        refreshCourierDropdown();
      });

      kecSelect.addEventListener("change", () => {
        if (kecManual) {
          kecManual.style.display = kecSelect.value === "LAINNYA" ? "block" : "none";
          if (kecSelect.value === "LAINNYA") kecManual.focus();
        }
        if (kecSelect.value && kecSelect.value !== "LAINNYA") {
          refreshCourierDropdown();
        }
      });

      if (kecManual) {
        kecManual.addEventListener("change", () => {
          if (kecSelect.value === "LAINNYA" && kecManual.value.trim()) {
            refreshCourierDropdown();
          }
        });
      }
    }

    if (courierSelect) {
      courierSelect.addEventListener("change", updateOrderTotalsDisplay);
    }

    if (cart.length === 0) {
      summaryEl.innerHTML = `
        <div style="padding:18px;background:#FFFFFF;border-radius:var(--radius-sm);text-align:center;">
          <p style="margin-bottom:10px;font-size:14px;">Keranjang kosong.</p>
          <a href="products.html" class="btn btn-primary">Pilih Produk</a>
        </div>
      `;
      const submitBtn = document.getElementById("submitCheckoutBtn");
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    summaryEl.innerHTML = cart
      .map(
        (item, idx) => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--color-border);font-size:14px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${item.image}" alt="${item.name}" style="width:46px;height:46px;border-radius:8px;">
            <div>
              <div style="font-weight:600;">${idx + 1}. ${item.name}</div>
              <div style="font-size:12.5px;color:var(--color-text-muted);">${item.size} × ${item.qty}</div>
            </div>
          </div>
          <strong>${formatRupiah(item.price * item.qty)}</strong>
        </div>
      `
      )
      .join("");

    updateOrderTotalsDisplay();

    const fields = {
      nama: {
        el: document.getElementById("custNama"),
        validate: (v) => v.length >= 3,
        msg: "Nama wajib diisi."
      },
      tglLahir: {
        el: document.getElementById("custTglLahir"),
        validate: (v) => v.length >= 6,
        msg: "Tanggal lahir wajib dipilih."
      },
      wa: {
        el: document.getElementById("custWa"),
        validate: (v) => isValidIndonesianPhone(v),
        msg: "Nomor WA tidak valid (08xx / 628xx, min. 10 digit)."
      },
      email: {
        el: document.getElementById("custEmail"),
        validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        msg: "Format email tidak valid."
      },
      provinsi: {
        el: document.getElementById("custProvinsi"),
        validate: (v) => v.length >= 2,
        msg: "Silakan pilih provinsi."
      },
      kota: {
        el: document.getElementById("custKota"),
        validate: (v) => v.length >= 2,
        msg: "Silakan pilih kota / kabupaten."
      },
      kecamatan: {
        el: document.getElementById("custKecamatan"),
        validate: (v) => {
          if (v === "LAINNYA") {
            return (kecManual ? kecManual.value.trim().length : 0) >= 2;
          }
          return v.length >= 2;
        },
        msg: "Silakan pilih kecamatan."
      },
      kodepos: {
        el: document.getElementById("custKodepos"),
        validate: (v) => /^\d{5}$/.test(v),
        msg: "Kode pos wajib 5 digit angka."
      },
      alamat: {
        el: document.getElementById("custAlamat"),
        validate: (v) => v.length >= 10,
        msg: "Alamat lengkap wajib diisi."
      },
      kurir: {
        el: document.getElementById("custKurir"),
        validate: (v) => v.length > 0,
        msg: "Pilih kurir pengiriman."
      },
      terms: {
        el: document.getElementById("custTerms"),
        validate: () => document.getElementById("custTerms").checked,
        msg: "Wajib menyetujui S&K."
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
        showToast("Mohon lengkapi data pengiriman.");
        if (firstInvalidEl) firstInvalidEl.focus();
        return;
      }

      const currentCart = getCart();
      if (currentCart.length === 0) return;

      isSubmitting = true;
      const submitBtn = document.getElementById("submitCheckoutBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengarahkan ke WhatsApp...";
      }

      const selectedKec =
        fields.kecamatan.el.value === "LAINNYA" && kecManual
          ? sanitizeInput(kecManual.value)
          : sanitizeInput(fields.kecamatan.el.value);

      const currentSubtotal = getCartSubtotal();
      const grandTotal = selectedShippingManual
        ? currentSubtotal
        : currentSubtotal + selectedShippingCost;

      const orderNumber = generateOrderNumber();
      const orderPayload = {
        orderNumber: orderNumber,
        nama: sanitizeInput(fields.nama.el.value),
        tglLahir: sanitizeInput(fields.tglLahir.el.value),
        wa: normalizeIndonesianPhone(sanitizeInput(fields.wa.el.value)),
        email: sanitizeInput(fields.email.el.value) || "-",
        alamat: sanitizeInput(fields.alamat.el.value),
        kecamatan: selectedKec,
        kota: sanitizeInput(fields.kota.el.value),
        provinsi: sanitizeInput(fields.provinsi.el.value),
        kodepos: sanitizeInput(fields.kodepos.el.value),
        kurir: sanitizeInput(fields.kurir.el.value),
        catatan: sanitizeInput(document.getElementById("custCatatan").value) || "-",
        items: currentCart,
        subtotal: currentSubtotal,
        shippingCost: selectedShippingCost,
        isManualShipping: selectedShippingManual,
        weightKg: weightKg,
        total: grandTotal,
        formatCurrency: formatRupiah
      };

      const messageText = STORE_CONFIG.buildOrderMessage(orderPayload);
      const whatsappUrl = buildWhatsAppUrl(STORE_CONFIG.whatsappAdmin, messageText);

      try {
        localStorage.setItem(
          LAST_ORDER_KEY,
          JSON.stringify({ orderNumber, whatsappUrl, messageText, timestamp: Date.now() })
        );
        const rawOrders = localStorage.getItem("andrd_cms_orders_v1");
        const cmsOrders = rawOrders ? JSON.parse(rawOrders) : [];
        cmsOrders.unshift({
          orderNumber: orderPayload.orderNumber,
          createdAt: new Date().toISOString(),
          status: "Pending",
          nama: orderPayload.nama,
          tglLahir: orderPayload.tglLahir,
          wa: orderPayload.wa,
          email: orderPayload.email,
          alamat: `${orderPayload.alamat}, ${orderPayload.kecamatan}, ${orderPayload.kota}, ${orderPayload.provinsi} ${orderPayload.kodepos}`,
          kurir: orderPayload.kurir,
          catatan: orderPayload.catatan,
          items: orderPayload.items,
          total: orderPayload.total
        });
        localStorage.setItem("andrd_cms_orders_v1", JSON.stringify(cmsOrders));
      } catch (err) {}

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      const modal = document.getElementById("thankYouModal");
      const modalOrderNo = document.getElementById("modalOrderNumber");
      const modalFallbackLink = document.getElementById("modalFallbackWaBtn");
      const copyOrderBtn = document.getElementById("modalCopyOrderBtn");

      if (modalOrderNo) modalOrderNo.textContent = `#${orderNumber}`;
      if (modalFallbackLink) modalFallbackLink.href = whatsappUrl;
      if (copyOrderBtn) {
        copyOrderBtn.onclick = () => {
          navigator.clipboard.writeText(messageText).then(() => {
            showToast("Pesanan disalin!");
          });
        };
      }
      if (modal) {
        modal.classList.add("open");
      }

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
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
  }

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
