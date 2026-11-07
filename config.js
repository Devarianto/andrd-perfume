/**
 * ============================================================================
 * KONFIGURASI UTAMA TOKO PARFUME "ANDRD" (config.js)
 * ============================================================================
 * Disesuaikan dengan Content Brief Resmi Client (CEDORA — ANDRD Eau de Parfum).
 * Terintegrasi dengan ANDRD CMS (admin.html).
 */

const DEFAULT_STORE_CONFIG = {
  // 1. IDENTITAS BRAND (THE ANDRD EXPERIENCE)
  brandName: "ANDRD",
  brandLegalName: "ANDRD Eau de Parfum",
  tagline: "Made to be remembered",
  subTagline: "Diciptakan untuk mereka yang menghargai karakter, detail, dan ekspresi diri.",
  domain: "https://andrd-perfume.vercel.app",

  // 2. KONTAK & WHATSAPP ADMIN (Gunakan awalan 628xxx tanpa + atau spasi)
  whatsappAdmin: "6281234567890",
  whatsappDisplay: "+62 812-3456-7890",
  email: "hello@andrdperfume.com",
  instagram: "@andrd.official",
  tiktok: "@andrd.official",
  youtube: "@andrd.official",
  instagramUrl: "https://instagram.com",
  tiktokUrl: "https://tiktok.com",
  youtubeUrl: "https://youtube.com",
  address: "Jl. Baladewa Kiri RT 15/RW 11, Tanah Tinggi, Johar Baru, Jakarta Pusat 10540",
  operationalHours: "Senin – Sabtu, 09.00 – 18.00 WIB",

  // 3. PENGATURAN ORDER & PENGIRIMAN (RAJAONGKIR LIVE + JABODETABEK MANUAL GOSEND/GRAB)
  orderPrefix: "ANDRD",
  originCity: "Johar Baru, Jakarta Pusat",
  rajaOngkirApiKey: "", // Server /api/shipping sudah aktif memakai Production API Key
  returnPolicyDays: 7,
  announcementText: "ANDRD Eau de Parfum • CEDORA 30 ML (Rp 109.000) • Pengiriman Seluruh Indonesia",
  nonCodNotice: "Pembayaran via Transfer / QRIS setelah konfirmasi WhatsApp (Tanpa COD).",

  // 4. KONTEN VISUAL HERO SLIDER (Menggunakan Foto Asli dari Brief Client)
  heroSlides: [
    {
      eyebrow: "ANDRD Eau de Parfum • 30 ML",
      title: "CEDORA.",
      desc: "A scent that speaks without saying a word. Perpaduan kesegaran Green Tea, keanggunan Cherry & Dark Rose, serta kehangatan Cedarwood.",
      btnPrimaryText: "Beli CEDORA — Rp 109.000",
      btnPrimaryLink: "product.html?id=andrd-cedora",
      btnSecondaryText: "Lihat Katalog",
      btnSecondaryLink: "products.html",
      image: "assets/img/products/cedora-bottle.jpg"
    },
    {
      eyebrow: "Fresh Woody Floral",
      title: "Find Your Identity.",
      desc: "CEDORA bukan sekadar tentang aroma. Ini tentang karakter, identitas, dan kesan yang kamu tinggalkan. Leave your impression.",
      btnPrimaryText: "Eksplor Karakter",
      btnPrimaryLink: "product.html?id=andrd-cedora",
      btnSecondaryText: "Tentang ANDRD",
      btnSecondaryLink: "about.html",
      image: "assets/img/products/cedora-hand.jpg"
    },
    {
      eyebrow: "The ANDRD Experience",
      title: "Made to be Remembered.",
      desc: "Diciptakan untuk mereka yang menghargai karakter, detail, dan ekspresi diri dalam setiap semprotan.",
      btnPrimaryText: "Pesan Sekarang",
      btnPrimaryLink: "product.html?id=andrd-cedora",
      btnSecondaryText: "Hubungi Kami",
      btnSecondaryLink: "contact.html",
      image: "assets/img/products/cedora-model-bw-1.jpg"
    }
  ],

  // 5. KONTEN KARTU KARAKTER AROMA CEDORA (Menggunakan Foto Model Asli dari Brief Client)
  segments: [
    {
      gender: "Unisex",
      title: "Top: Green Tea",
      desc: "Dibuka dengan kesegaran Green Tea yang memberikan kesan segar dan menenangkan.",
      link: "product.html?id=andrd-cedora",
      image: "assets/img/products/cedora-model-bw-1.jpg"
    },
    {
      gender: "Unisex",
      title: "Middle: Cherry & Dark Rose",
      desc: "Menghadirkan sentuhan aroma yang elegan, memberikan kedalaman serta karakter tersendiri.",
      link: "product.html?id=andrd-cedora",
      image: "assets/img/products/cedora-model-black.jpg"
    },
    {
      gender: "Unisex",
      title: "Base: Cedarwood",
      desc: "Memberikan kehangatan dengan nuansa woody yang menciptakan kesan mendalam dan berkesan.",
      link: "product.html?id=andrd-cedora",
      image: "assets/img/products/cedora-models-duo.jpg"
    }
  ],

  // 6. PILIHAN KURIR PENGIRIMAN
  couriers: [
    { id: "JNE Reguler", label: "JNE Reguler (1-3 Hari)" },
    { id: "JNE YES", label: "JNE YES (1 Hari)" },
    { id: "J&T Express", label: "J&T Express (1-3 Hari)" },
    { id: "SiCepat REG", label: "SiCepat REG (1-3 Hari)" },
    { id: "SiCepat BEST", label: "SiCepat BEST (1 Hari)" },
    { id: "Instant / Sameday", label: "GoSend / GrabExpress (Jabodetabek)" }
  ],

  // 7. KATEGORI AROMA & NOTES (EXPLORE BY SCENT)
  scentCategories: [
    { id: "Fresh Woody Floral", name: "Fresh Woody Floral", subtitle: "Signature keluarga aroma CEDORA", accent: "#000000" },
    { id: "Green Tea", name: "Top: Green Tea", subtitle: "Kesan awal segar & menenangkan", accent: "#000000" },
    { id: "Cherry & Dark Rose", name: "Middle: Cherry & Dark Rose", subtitle: "Sentuhan elegan & berkarakter", accent: "#000000" },
    { id: "Cedarwood", name: "Base: Cedarwood", subtitle: "Nuansa woody hangat & mendalam", accent: "#000000" }
  ],

  // 8. TESTIMONIAL PELANGGAN (CEDORA — 30 ML)
  testimonials: [
    {
      id: "rev-1",
      name: "Rizky Pratama",
      city: "Jakarta Pusat",
      rating: 5,
      productId: "andrd-cedora",
      productName: "CEDORA (30 ML)",
      quote: "First spray Green Tea-nya langsung berasa segar dan tenang. Begitu masuk ke middle notes Cherry & Dark Rose sampai dry-down Cedarwood, karakternya berkelas banget dengan harga Rp109.000.",
      date: "2026-11-01"
    },
    {
      id: "rev-2",
      name: "Dimas Aditya",
      city: "Bandung",
      rating: 5,
      productId: "andrd-cedora",
      productName: "CEDORA (30 ML)",
      quote: "Botol hitam doff-nya elegan dan travel-friendly ukuran 30 ML. Aroma Fresh Woody Floral-nya pas dipakai harian maupun acara malam, meninggalkan kesan yang kuat.",
      date: "2026-11-03"
    },
    {
      id: "rev-3",
      name: "Nadia Kusuma",
      city: "Surabaya",
      rating: 5,
      productId: "andrd-cedora",
      productName: "CEDORA (30 ML)",
      quote: "Perpaduan Dark Rose dan Cedarwood di CEDORA unik banget, ada sisi segar sekaligus hangat. Banyak yang nanya pakai parfum apa.",
      date: "2026-11-05"
    }
  ]
};

// Gabungkan dengan konfigurasi yang disimpan dari CMS (localStorage) jika ada,
// sekaligus migrasi otomatis jika localStorage masih menyimpan konten dummy lama ("Scent as Memory" / "01 Senja di Bali")
let savedCmsConfig = {};
try {
  const rawCmsConfig = localStorage.getItem("andrd_cms_config_v1");
  if (rawCmsConfig) {
    const parsed = JSON.parse(rawCmsConfig);
    const isLegacyConfig =
      parsed.tagline === "Scent as Memory" ||
      (Array.isArray(parsed.heroSlides) &&
        parsed.heroSlides.some((s) => s.title && (s.title.includes("Senja di Bali") || s.title.includes("Scent as Memory"))));

    if (isLegacyConfig) {
      localStorage.removeItem("andrd_cms_config_v1");
      localStorage.removeItem("andrd_cms_reviews_v1");
      savedCmsConfig = {};
    } else {
      savedCmsConfig = parsed;
      if (savedCmsConfig.address === "Kemang Timur Raya No. 48, Jakarta Selatan") {
        savedCmsConfig.address = DEFAULT_STORE_CONFIG.address;
      }
      if (savedCmsConfig.originCity === "Jakarta Selatan") {
        savedCmsConfig.originCity = DEFAULT_STORE_CONFIG.originCity;
      }
    }
  }

  const rawRev = localStorage.getItem("andrd_cms_reviews_v1");
  if (rawRev && rawRev.includes("Senja di Bali")) {
    localStorage.removeItem("andrd_cms_reviews_v1");
  }
} catch (e) {}

const STORE_CONFIG = Object.assign({}, DEFAULT_STORE_CONFIG, savedCmsConfig, {
  buildOrderMessage: function (orderData) {
    const itemsList = orderData.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.size}) x${item.qty} = ${orderData.formatCurrency(item.price * item.qty)}`
      )
      .join("\n");

    const subtotalVal = Number(orderData.subtotal != null ? orderData.subtotal : orderData.total) || 0;
    const shipCost = Number(orderData.shippingCost) || 0;
    const isManualShip = Boolean(orderData.isManualShipping);
    const weightInfo = orderData.weightKg ? ` (${orderData.weightKg} kg)` : "";

    const ongkirLine = isManualShip
      ? `Ongkir (${orderData.kurir}): Cek manual oleh Admin sesuai titik lokasi`
      : shipCost > 0
      ? `Ongkir (${orderData.kurir}${weightInfo}): ${orderData.formatCurrency(shipCost)}`
      : `Ongkir: akan dikonfirmasi admin`;

    const totalLine = isManualShip
      ? `*Total Sementara: ${orderData.formatCurrency(subtotalVal)} (+ Ongkir Instan)*`
      : shipCost > 0
      ? `*Total Pembayaran: ${orderData.formatCurrency(subtotalVal + shipCost)}*`
      : `*Subtotal: ${orderData.formatCurrency(subtotalVal)}*`;

    return [
      `Halo ${this.brandName}, saya ingin memesan:`,
      ``,
      `*DATA PELANGGAN*`,
      `Nama: ${orderData.nama}`,
      `Tanggal Lahir: ${orderData.tglLahir || "-"}`,
      `No. WhatsApp: ${orderData.wa}`,
      `Email: ${orderData.email || "-"}`,
      `Alamat: ${orderData.alamat}, ${orderData.kecamatan}, ${orderData.kota}, ${orderData.provinsi} ${orderData.kodepos}`,
      `Kurir: ${orderData.kurir}`,
      ``,
      `*DETAIL PESANAN*`,
      itemsList,
      ``,
      `Subtotal Produk: ${orderData.formatCurrency(subtotalVal)}`,
      ongkirLine,
      totalLine,
      `Catatan: ${orderData.catatan || "-"}`,
      ``,
      `No. Order: #${orderData.orderNumber}`,
      `Mohon info nomor rekening / QRIS untuk pembayaran. Terima kasih!`
    ].join("\n");
  },

  buildRestockMessage: function (productName, size) {
    const sizeText = size ? ` (${size})` : "";
    return `Halo ${this.brandName}, mohon kabari saya jika parfum *${productName}*${sizeText} sudah restock kembali. Terima kasih!`;
  },

  buildGeneralInquiryMessage: function () {
    return `Halo Admin ${this.brandName}, saya ingin bertanya mengenai parfum CEDORA (ANDRD Eau de Parfum).`;
  }
});

window.DEFAULT_STORE_CONFIG = DEFAULT_STORE_CONFIG;
window.STORE_CONFIG = STORE_CONFIG;
