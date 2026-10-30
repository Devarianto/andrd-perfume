/**
 * ============================================================================
 * DATABASE PRODUK PARFUME "ANDRD" (products.js)
 * ============================================================================
 * Panduan Edit untuk Non-Programmer:
 * - Setiap objek di dalam array PRODUCTS mewakili 1 produk parfum.
 * - "status" dapat diisi: "ready" (Tersedia), "pre-order" (Pre-Order), atau "sold-out" (Habis).
 *   Jika "sold-out", tombol beli otomatis berubah menjadi "Kabari Saya" ke WhatsApp.
 * - "badge" dapat diisi: "Best Seller", "New", "Sale", atau null (tanpa badge).
 * - "gender" dapat diisi: "For Her", "For Him", atau "Unisex".
 * - "scentCategory" harus sesuai dengan kategori di config.js:
 *   "Citrus", "Floral", "Fruity", "Woody & Vanilla", "Gourmand", atau "Musky".
 * - "variants" berisi daftar ukuran botol dan harganya (dalam angka Rupiah tanpa titik).
 *   Isi "compareAtPrice" jika ingin menampilkan harga coret (diskon), atau null jika harga normal.
 */

const PRODUCTS = [
  {
    id: "andrd-01",
    name: "01 Senja di Bali",
    slug: "01-senja-di-bali",
    gender: "Unisex",
    scentCategory: "Woody & Vanilla",
    shortDescription: "Kehangatan kayu cendana Bali berpadu dengan vanilla Madagaskar dan sentuhan bergamot saat matahari terbenam.",
    description: "01 Senja di Bali menangkap momen magis ketika langit keemasan menyentuh pesisir Uluwatu. Dibuka dengan kesegaran Calabrian Bergamot dan kapulaga hangat, perlahan melebur ke dalam inti Creamy Sandalwood lokal dan diakhiri oleh pelukan Madagascar Vanilla serta Amber yang sensual dan tahan hingga 12 jam.",
    concentration: "Extrait de Parfum (30%)",
    longevity: "10 – 12 Jam",
    sillage: "Moderate to Strong",
    notes: {
      top: ["Calabrian Bergamot", "Pink Pepper", "Cardamom"],
      middle: ["Balinese Sandalwood", "Iris Butter", "Smoked Cedar"],
      base: ["Madagascar Vanilla", "Warm Amber", "White Musk"]
    },
    variants: [
      { size: "15ml", price: 149000, compareAtPrice: 175000 },
      { size: "50ml", price: 349000, compareAtPrice: 399000 },
      { size: "100ml", price: 549000, compareAtPrice: 620000 }
    ],
    images: [
      "assets/img/products/perfume-1-a.svg",
      "assets/img/products/perfume-1-b.svg"
    ],
    status: "ready",
    badge: "Best Seller",
    featured: true,
    seasonal: false
  },
  {
    id: "andrd-02",
    name: "02 Embun Pagi",
    slug: "02-embun-pagi",
    gender: "Unisex",
    scentCategory: "Citrus",
    shortDescription: "Kesegaran yuzu Jepang, pucuk teh putih pegunungan, dan bergamot yang jernih seperti udara pukul enam pagi.",
    description: "Dirancang khusus untuk iklim tropis Indonesia, 02 Embun Pagi adalah definisi kesegaran yang rapi dan berkelas. Perpaduan Yuzu segar dan Mandarin hijau membuka komposisi dengan ceria, diikuti ketenangan seduhan White Tea dan daun Mate yang menenangkan pikiran sepanjang hari.",
    concentration: "Extrait de Parfum (25%)",
    longevity: "8 – 10 Jam",
    sillage: "Moderate (Office Friendly)",
    notes: {
      top: ["Japanese Yuzu", "Crisp Bergamot", "Green Mandarin"],
      middle: ["Silver Needle White Tea", "Neroli Petals", "Petitgrain"],
      base: ["Clean Hinoki Wood", "Vetiver Root", "Sheer Ambroxan"]
    },
    variants: [
      { size: "15ml", price: 139000, compareAtPrice: null },
      { size: "50ml", price: 329000, compareAtPrice: null },
      { size: "100ml", price: 519000, compareAtPrice: null }
    ],
    images: [
      "assets/img/products/perfume-2-a.svg",
      "assets/img/products/perfume-2-b.svg"
    ],
    status: "ready",
    badge: "Best Seller",
    featured: true,
    seasonal: true
  },
  {
    id: "andrd-03",
    name: "03 Malam Melati",
    slug: "03-malam-melati",
    gender: "For Her",
    scentCategory: "Floral",
    shortDescription: "Buket melati malam Jawa dan tuberose lembut yang dibalut kasmir hangat nan anggun.",
    description: "Sebuah penghormatan modern terhadap bunga puspa bangsa. 03 Malam Melati tidak hadir sebagai melati tradisional yang tajam, melainkan diramu secara kontemporer bersama Indian Tuberose, buah pir segar, dan Cashmere Wood yang lembut bagaikan gaun sutra di malam hari.",
    concentration: "Extrait de Parfum (30%)",
    longevity: "10 – 12 Jam",
    sillage: "Strong & Radiant",
    notes: {
      top: ["Anjou Pear", "Mandarin Blossom", "White Peach"],
      middle: ["Javanese Sambac Jasmine", "Creamy Tuberose", "Orange Blossom"],
      base: ["Cashmere Wood", "Benzoin Resin", "Silky Vanilla"]
    },
    variants: [
      { size: "15ml", price: 149000, compareAtPrice: null },
      { size: "50ml", price: 359000, compareAtPrice: 389000 },
      { size: "100ml", price: 569000, compareAtPrice: 610000 }
    ],
    images: [
      "assets/img/products/perfume-3-a.svg",
      "assets/img/products/perfume-3-b.svg"
    ],
    status: "ready",
    badge: "Best Seller",
    featured: true,
    seasonal: false
  },
  {
    id: "andrd-04",
    name: "04 Kayu & Rupa",
    slug: "04-kayu-dan-rupa",
    gender: "For Him",
    scentCategory: "Woody & Vanilla",
    shortDescription: "Karakter maskulin yang tenang dari vetiver asap, kayu cedar Atlas, dan sentuhan amber gelap.",
    description: "04 Kayu & Rupa diciptakan untuk pribadi yang menghargai ketenangan dan karisma tanpa perlu berteriak. Akar wangi (Vetiver) dari Garut dipadukan dengan Atlas Cedarwood, kulit kayu manis, dan sejumput Vanilla kering yang meninggalkan jejak aroma misterius.",
    concentration: "Extrait de Parfum (32%)",
    longevity: "12+ Jam",
    sillage: "Strong",
    notes: [
      "Garut Vetiver, Black Pepper, Elemi Resin"
    ],
    notes: {
      top: ["Black Pepper", "Cardamom Pod", "Cypress Leaf"],
      middle: ["Smoked Garut Vetiver", "Atlas Cedarwood", "Guaiac Wood"],
      base: ["Dry Vanilla Pod", "Labdanum Amber", "Patchouli Leaf"]
    },
    variants: [
      { size: "15ml", price: 155000, compareAtPrice: null },
      { size: "50ml", price: 369000, compareAtPrice: null },
      { size: "100ml", price: 579000, compareAtPrice: null }
    ],
    images: [
      "assets/img/products/perfume-4-a.svg",
      "assets/img/products/perfume-4-b.svg"
    ],
    status: "ready",
    badge: "Best Seller",
    featured: true,
    seasonal: false
  },
  {
    id: "andrd-05",
    name: "05 Kulit Kedua",
    slug: "05-kulit-kedua",
    gender: "Unisex",
    scentCategory: "Musky",
    shortDescription: "Aroma skin-scent intim dari biji ambrette, iris pallida, dan white musk yang menyatu dengan suhu tubuh.",
    description: "Terinspirasi dari kehangatan kulit bersih setelah mandi air hangat. 05 Kulit Kedua menggunakan molekul Iso E Super dan Ambrette Seed alami yang bereaksi unik pada setiap pemakainya—menciptakan aura bersih, lembut, dan memikat dari jarak dekat.",
    concentration: "Extrait de Parfum (25%)",
    longevity: "8 – 10 Jam",
    sillage: "Intimate to Moderate",
    notes: {
      top: ["Ambrette Seed (Vegan Musk)", "Aldehydes", "Pink Peppercorn"],
      middle: ["Florentine Iris Pallida", "Violet Leaf", "Magnolia"],
      base: ["Velvet White Musk", "Ambroxan", "Blonde Woods"]
    },
    variants: [
      { size: "15ml", price: 139000, compareAtPrice: 159000 },
      { size: "50ml", price: 339000, compareAtPrice: 379000 },
      { size: "100ml", price: 529000, compareAtPrice: 589000 }
    ],
    images: [
      "assets/img/products/perfume-5-a.svg",
      "assets/img/products/perfume-5-b.svg"
    ],
    status: "ready",
    badge: "Sale",
    featured: false,
    seasonal: true
  },
  {
    id: "andrd-06",
    name: "06 Kopi & Tonka",
    slug: "06-kopi-dan-tonka",
    gender: "For Him",
    scentCategory: "Gourmand",
    shortDescription: "Seduhan espresso Arabika Gayo, dark cacao, dan panggang biji tonka yang kaya serta adiktif.",
    description: "Bukan aroma kopi manis biasa, 06 Kopi & Tonka adalah interpretasi olfaktori dari kedai kopi artisan di malam hujan. Ekstrak kopi Arabika Gayo yang pekat bertemu dengan Dark Cacao, Rum Accord (non-alkoholik), serta Roasted Tonka Bean yang memberikan kesan dewasa dan mewah.",
    concentration: "Extrait de Parfum (32%)",
    longevity: "12+ Jam",
    sillage: "Strong",
    notes: {
      top: ["Gayo Espresso Shot", "Bitter Almond", "Nutmeg"],
      middle: ["Dark Cacao Nib", "Hazelnut Praline", "Turkish Rose"],
      base: ["Roasted Tonka Bean", "Peruvian Balsam", "Sandalwood"]
    },
    variants: [
      { size: "15ml", price: 159000, compareAtPrice: null },
      { size: "50ml", price: 379000, compareAtPrice: null },
      { size: "100ml", price: 589000, compareAtPrice: null }
    ],
    images: [
      "assets/img/products/perfume-6-a.svg",
      "assets/img/products/perfume-6-b.svg"
    ],
    status: "pre-order",
    badge: "New",
    featured: false,
    seasonal: true
  },
  {
    id: "andrd-07",
    name: "07 Kebun Surya",
    slug: "07-kebun-surya",
    gender: "Unisex",
    scentCategory: "Citrus",
    shortDescription: "Perpaduan mandarin Mediterania, bunga neroli, dan daun fig di bawah sinar matahari pagi.",
    description: "Cerah, optimis, dan membangkitkan mood seketika. 07 Kebun Surya memadukan kulit jeruk Mandarin yang baru dikupas dengan bunga Neroli yang segar dan hijau daun pohon ara (Fig Leaf), menjadikannya teman terbaik untuk aktivitas luar ruang maupun bekerja.",
    concentration: "Extrait de Parfum (25%)",
    longevity: "7 – 9 Jam",
    sillage: "Moderate",
    notes: {
      top: ["Sun-ripened Mandarin", "Bitter Orange", "Lemon Zest"],
      middle: ["Tunisian Neroli", "Crushed Fig Leaf", "Petitgrain"],
      base: ["Haitian Vetiver", "Cedarwood", "Solar Musk"]
    },
    variants: [
      { size: "15ml", price: 135000, compareAtPrice: null },
      { size: "50ml", price: 319000, compareAtPrice: null },
      { size: "100ml", price: 499000, compareAtPrice: null }
    ],
    images: [
      "assets/img/products/perfume-7-a.svg",
      "assets/img/products/perfume-7-b.svg"
    ],
    status: "ready",
    badge: "New",
    featured: false,
    seasonal: true
  },
  {
    id: "andrd-08",
    name: "08 Buah Terlarang",
    slug: "08-buah-terlarang",
    gender: "For Her",
    scentCategory: "Fruity",
    shortDescription: "Manis segar buah fig hitam, red pear, dan blackcurrant dengan dasar kayu kasmir yang menggoda.",
    description: "08 Buah Terlarang mengeksplorasi sisi dewasa dari parfum beraroma buah. Alih-alih manis seperti permen, racikan ini menggabungkan Black Fig yang creamy, Red Pear yang renyah, dan anggur hitam (Cassis) di atas fondasi kayu Cedar dan Musk yang elegan.",
    concentration: "Extrait de Parfum (30%)",
    longevity: "9 – 11 Jam",
    sillage: "Moderate to Strong",
    notes: {
      top: ["Black Fig Nectar", "Crisp Red Pear", "Blackcurrant Bud"],
      middle: ["Peony Blossom", "Freesia", "Rosewater"],
      base: ["Cashmeran", "White Cedar", "Vanilla Bean"]
    },
    variants: [
      { size: "15ml", price: 145000, compareAtPrice: 165000 },
      { size: "50ml", price: 345000, compareAtPrice: 385000 },
      { size: "100ml", price: 539000, compareAtPrice: 599000 }
    ],
    images: [
      "assets/img/products/perfume-8-a.svg",
      "assets/img/products/perfume-8-b.svg"
    ],
    status: "ready",
    badge: "Sale",
    featured: false,
    seasonal: true
  },
  {
    id: "andrd-09",
    name: "09 Sutra Putih",
    slug: "09-sutra-putih",
    gender: "For Her",
    scentCategory: "Musky",
    shortDescription: "Kelembutan bunga kapas, putih mawar, dan clean linen musk yang menenangkan jiwa.",
    description: "Bayangkan berbaring di atas seprai linen putih bersih di pagi hari Minggu yang tenang. 09 Sutra Putih merangkai Cotton Flower, White Rose, dan Rice Steam accord menjadi wewangian lembut yang memberikan kesan rapi, bersih, dan effortlessly chic.",
    concentration: "Extrait de Parfum (28%)",
    longevity: "8 – 10 Jam",
    sillage: "Moderate",
    notes: {
      top: ["Fresh Aldehydes", "Steamed Rice Accord", "White Tea"],
      middle: ["Cotton Flower", "White Rose Petals", "Lily of the Valley"],
      base: ["Clean Linen Musk", "Heliotrope", "White Sandalwood"]
    },
    variants: [
      { size: "15ml", price: 139000, compareAtPrice: null },
      { size: "50ml", price: 335000, compareAtPrice: null },
      { size: "100ml", price: 525000, compareAtPrice: null }
    ],
    images: [
      "assets/img/products/perfume-9-a.svg",
      "assets/img/products/perfume-9-b.svg"
    ],
    status: "sold-out",
    badge: null,
    featured: false,
    seasonal: false
  },
  {
    id: "andrd-10",
    name: "10 Mawar Hitam",
    slug: "10-mawar-hitam",
    gender: "Unisex",
    scentCategory: "Floral",
    shortDescription: "Kombinasi mewah Damask Rose, rempah saffron, dan kayu gaharu (oud) Nusantara yang megah.",
    description: "Karya paling opulent dari koleksi ANDRD. 10 Mawar Hitam mempertemukan ribuan kelopak Damask Rose dengan rempah Saffron merah dan sentuhan Gaharu (Agarwood) Kalimantan yang dihaluskan bersama praline serta amber. Diproduksi dalam jumlah sangat terbatas setiap batch.",
    concentration: "Extrait de Parfum (35%)",
    longevity: "14+ Jam",
    sillage: "Strong & Majestic",
    notes: {
      top: ["Red Saffron", "Clove Bud", "Bergamot"],
      middle: ["Damask Rose Absolute", "Geranium", "Roasted Praline"],
      base: ["Kalimantan Agarwood (Oud)", "Dark Patchouli", "Golden Amber"]
    },
    variants: [
      { size: "15ml", price: 175000, compareAtPrice: null },
      { size: "50ml", price: 429000, compareAtPrice: null },
      { size: "100ml", price: 689000, compareAtPrice: null }
    ],
    images: [
      "assets/img/products/perfume-10-a.svg",
      "assets/img/products/perfume-10-b.svg"
    ],
    status: "sold-out",
    badge: "Best Seller",
    featured: false,
    seasonal: false
  }
];

// Ekspos ke global window agar mudah diakses semua halaman
window.PRODUCTS = PRODUCTS;
