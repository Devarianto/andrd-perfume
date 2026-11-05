/**
 * ============================================================================
 * KONFIGURASI UTAMA TOKO PARFUME "ANDRD" (config.js)
 * ============================================================================
 * Terintegrasi dengan ANDRD CMS (admin.html).
 * Perubahan yang disimpan di CMS akan otomatis diterapkan ke seluruh halaman.
 */

const DEFAULT_STORE_CONFIG = {
  // 1. IDENTITAS BRAND
  brandName: "ANDRD",
  brandLegalName: "ANDRD Studio Indonesia",
  tagline: "Scent as Memory",
  subTagline: "Extrait de Parfum — Diracik untuk iklim tropis.",
  domain: "https://andrd-perfume.vercel.app",

  // 2. KONTAK & WHATSAPP ADMIN (Gunakan awalan 628xxx tanpa + atau spasi)
  whatsappAdmin: "6281234567890",
  whatsappDisplay: "+62 812-3456-7890",
  email: "hello@andrdperfume.com",
  instagram: "@andrd.olfactory",
  tiktok: "@andrd.olfactory",
  youtube: "@andrd.olfactory",
  instagramUrl: "https://instagram.com",
  tiktokUrl: "https://tiktok.com",
  youtubeUrl: "https://youtube.com",
  address: "Kemang Timur Raya No. 48, Jakarta Selatan",
  operationalHours: "Senin – Sabtu, 09.00 – 18.00 WIB",

  // 3. PENGATURAN ORDER & PENGIRIMAN
  orderPrefix: "ANDRD",
  returnPolicyDays: 7,
  announcementText: "Free Vial 2ml Setiap Pembelian • Pengiriman Seluruh Indonesia",
  nonCodNotice: "Pembayaran via Transfer / QRIS setelah konfirmasi WhatsApp (Tanpa COD).",

  // 4. KONTEN VISUAL HERO SLIDER (Dapat diubah lewat CMS)
  heroSlides: [
    {
      eyebrow: "Signature Collection",
      title: "Scent as Memory.",
      desc: "Extrait de Parfum konsentrasi tinggi (25%–35%), diracik untuk ketahanan hingga 12 jam.",
      btnPrimaryText: "Belanja Sekarang",
      btnPrimaryLink: "products.html",
      btnSecondaryText: "01 Senja di Bali",
      btnSecondaryLink: "product.html?id=andrd-01",
      image: "" // Kosong = otomatis ambil gambar produk 1
    },
    {
      eyebrow: "Daily Freshness",
      title: "02 Embun Pagi.",
      desc: "Perpaduan segar Yuzu Jepang, White Tea, dan Bergamot untuk aktivitas sepanjang hari.",
      btnPrimaryText: "Lihat Produk",
      btnPrimaryLink: "product.html?id=andrd-02",
      btnSecondaryText: "Koleksi Citrus",
      btnSecondaryLink: "products.html?scent=Citrus",
      image: "" // Kosong = otomatis ambil gambar produk 2
    },
    {
      eyebrow: "Night Floral",
      title: "03 Malam Melati.",
      desc: "Sentuhan modern melati malam, tuberose lembut, dan kayu kasmir hangat.",
      btnPrimaryText: "Lihat Produk",
      btnPrimaryLink: "product.html?id=andrd-03",
      btnSecondaryText: "For Her",
      btnSecondaryLink: "products.html?gender=For+Her",
      image: "" // Kosong = otomatis ambil gambar produk 3
    }
  ],

  // 5. KONTEN KARTU SEGMENTASI (Dapat diubah lewat CMS)
  segments: [
    {
      gender: "For Her",
      title: "For Her",
      desc: "Floral, fruity & silky musk.",
      link: "products.html?gender=For+Her",
      image: ""
    },
    {
      gender: "For Him",
      title: "For Him",
      desc: "Smoked vetiver, cedar & espresso.",
      link: "products.html?gender=For+Him",
      image: ""
    },
    {
      gender: "Unisex",
      title: "Unisex",
      desc: "Sandalwood, yuzu & clean skin-scent.",
      link: "products.html?gender=Unisex",
      image: ""
    }
  ],

  // 6. PILIHAN KURIR PENGIRIMAN
  couriers: [
    { id: "JNE Reguler", label: "JNE Reguler (2-4 Hari)" },
    { id: "JNE YES", label: "JNE YES (1-2 Hari)" },
    { id: "J&T Express", label: "J&T Express (2-4 Hari)" },
    { id: "SiCepat REG", label: "SiCepat REG (2-4 Hari)" },
    { id: "SiCepat BEST", label: "SiCepat BEST (1-2 Hari)" },
    { id: "Paxel", label: "Paxel Sameday / Nextday" },
    { id: "Instant / Sameday", label: "GoSend / GrabExpress (Jakarta)" }
  ],

  // 7. KATEGORI AROMA (EXPLORE BY SCENT)
  scentCategories: [
    { id: "Citrus", name: "Citrus", subtitle: "Segar & cerah", accent: "#000000" },
    { id: "Floral", name: "Floral", subtitle: "Lembut & anggun", accent: "#000000" },
    { id: "Fruity", name: "Fruity", subtitle: "Manis & segar", accent: "#000000" },
    { id: "Woody & Vanilla", name: "Woody & Vanilla", subtitle: "Hangat & memikat", accent: "#000000" },
    { id: "Gourmand", name: "Gourmand", subtitle: "Kopi, cacao & tonka", accent: "#000000" },
    { id: "Musky", name: "Musky", subtitle: "Bersih & menyatu di kulit", accent: "#000000" }
  ],

  // 8. TESTIMONIAL PELANGGAN
  testimonials: [
    {
      name: "Nadia Kusuma",
      city: "Jakarta Selatan",
      rating: 5,
      productId: "andrd-01",
      productName: "01 Senja di Bali (50ml)",
      quote: "Wanginya beneran tahan seharian dari pagi ngantor sampai malam. Dry-down sandalwood dan vanillanya halus banget, gak bikin pusing sama sekali."
    },
    {
      name: "Raka Pradana",
      city: "Bandung",
      rating: 5,
      productId: "andrd-04",
      productName: "04 Kayu & Rupa (50ml)",
      quote: "Karakter woody smokey-nya berkelas, mirip parfum niche harga jutaan. Dapat free vial 2ml juga jadi bisa coba varian lain sebelum beli full size."
    },
    {
      name: "Clara Wijaya",
      city: "Surabaya",
      rating: 5,
      productId: "andrd-02",
      productName: "02 Embun Pagi (100ml)",
      quote: "Seger banget buat cuaca panas! Perpaduan yuzu dan white tea-nya clean, sering banget ditanyain teman kantor pakai parfum apa."
    }
  ]
};

// Gabungkan dengan konfigurasi yang disimpan dari CMS (localStorage) jika ada
let savedCmsConfig = {};
try {
  const rawCmsConfig = localStorage.getItem("andrd_cms_config_v1");
  if (rawCmsConfig) {
    savedCmsConfig = JSON.parse(rawCmsConfig);
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
      `Subtotal: ${orderData.formatCurrency(orderData.total)}`,
      `Ongkir: akan dikonfirmasi admin`,
      `Catatan: ${orderData.catatan || "-"}`,
      ``,
      `No. Order: #${orderData.orderNumber}`,
      `Mohon info total pembayaran dan nomor rekening. Terima kasih!`
    ].join("\n");
  },

  buildRestockMessage: function (productName, size) {
    const sizeText = size ? ` (${size})` : "";
    return `Halo ${this.brandName}, mohon kabari saya jika parfum *${productName}*${sizeText} sudah restock kembali. Terima kasih!`;
  },

  buildGeneralInquiryMessage: function () {
    return `Halo Admin ${this.brandName}, saya ingin bertanya mengenai rekomendasi parfum.`;
  }
});

window.DEFAULT_STORE_CONFIG = DEFAULT_STORE_CONFIG;
window.STORE_CONFIG = STORE_CONFIG;
