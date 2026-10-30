/**
 * ============================================================================
 * DATABASE PRODUK PARFUME "ANDRD" (products.js)
 * ============================================================================
 * Cara Ganti Gambar Produk:
 * Pada bagian "images", Anda dapat menggantinya dengan nama file foto Anda sendiri,
 * misalnya: ["assets/img/products/foto-1.jpg", "assets/img/products/foto-2.jpg"]
 */

function createBottleSvg(name, category, sub) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <rect width="800" height="800" fill="#F6F6F6"/>
    <ellipse cx="400" cy="650" rx="120" ry="10" fill="#000000" fill-opacity="0.05"/>
    <rect x="270" y="255" width="260" height="380" rx="28" fill="#FFFFFF" stroke="#E2E2E2" stroke-width="1"/>
    <rect x="282" y="315" width="236" height="308" rx="20" fill="#EFEFEF"/>
    <rect x="374" y="224" width="52" height="31" fill="#E5E5E5"/>
    <rect x="350" y="142" width="100" height="82" rx="14" fill="#111111"/>
    <rect x="302" y="352" width="196" height="210" rx="12" fill="#FFFFFF" stroke="#E5E5E5" stroke-width="0.8"/>
    <text x="400" y="396" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="5" fill="#111111">ANDRD</text>
    <line x1="340" y1="414" x2="460" y2="414" stroke="#E5E5E5" stroke-width="0.8"/>
    <text x="400" y="448" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="13.5" font-weight="600" letter-spacing="1.5" fill="#111111">${name.toUpperCase()}</text>
    <text x="400" y="472" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="500" letter-spacing="1" fill="#777777">${category}</text>
    <text x="400" y="518" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="10" font-weight="400" letter-spacing="1" fill="#666666">${sub}</text>
    <text x="400" y="540" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="9" font-weight="500" letter-spacing="2" fill="#999999">50 ML</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function createNotesSvg(name, notesText) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <rect width="800" height="800" fill="#F2F2F2"/>
    <rect x="90" y="90" width="620" height="620" rx="32" fill="#FFFFFF"/>
    <text x="400" y="240" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="5" fill="#111111">ANDRD</text>
    <text x="400" y="345" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" letter-spacing="2" fill="#111111">${name.toUpperCase()}</text>
    <text x="400" y="382" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="3" fill="#888888">KEY NOTES</text>
    <text x="400" y="465" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="15" font-weight="500" letter-spacing="0.5" fill="#222222">${notesText}</text>
    <text x="400" y="585" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="500" letter-spacing="2.5" fill="#888888">EXTRAIT DE PARFUM</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const DEFAULT_PRODUCTS = [
  {
    id: "andrd-01",
    name: "01 Senja di Bali",
    slug: "01-senja-di-bali",
    gender: "Unisex",
    scentCategory: "Woody & Vanilla",
    shortDescription: "Kehangatan cendana Bali berpadu dengan vanilla Madagaskar dan bergamot.",
    description: "01 Senja di Bali menangkap momen keemasan di pesisir Uluwatu. Dibuka dengan kesegaran Calabrian Bergamot dan kapulaga hangat, melebur ke dalam Creamy Sandalwood lokal dan diakhiri oleh Madagascar Vanilla serta Amber.",
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
      createBottleSvg("01 Senja di Bali", "Woody & Vanilla", "Extrait de Parfum"),
      createNotesSvg("01 Senja di Bali", "Bergamot  •  Sandalwood  •  Vanilla")
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
    shortDescription: "Kesegaran yuzu Jepang, teh putih pegunungan, dan bergamot yang jernih.",
    description: "Dirancang khusus untuk iklim tropis Indonesia, 02 Embun Pagi memadukan Yuzu segar dan Mandarin hijau, diikuti ketenangan seduhan White Tea yang menenangkan sepanjang hari.",
    concentration: "Extrait de Parfum (25%)",
    longevity: "8 – 10 Jam",
    sillage: "Moderate",
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
      createBottleSvg("02 Embun Pagi", "Citrus", "Extrait de Parfum"),
      createNotesSvg("02 Embun Pagi", "Yuzu  •  White Tea  •  Bergamot")
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
    shortDescription: "Buket melati malam Jawa dan tuberose lembut berbalut kayu kasmir.",
    description: "03 Malam Melati diramu secara kontemporer bersama Indian Tuberose, buah pir segar, dan Cashmere Wood yang lembut di malam hari.",
    concentration: "Extrait de Parfum (30%)",
    longevity: "10 – 12 Jam",
    sillage: "Strong",
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
      createBottleSvg("03 Malam Melati", "Floral", "Extrait de Parfum"),
      createNotesSvg("03 Malam Melati", "Night Jasmine  •  Tuberose  •  Cashmere")
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
    shortDescription: "Karakter tenang dari vetiver asap, kayu cedar Atlas, dan amber gelap.",
    description: "Akar wangi (Vetiver) dari Garut dipadukan dengan Atlas Cedarwood, kulit kayu manis, dan Vanilla kering yang berkarisma.",
    concentration: "Extrait de Parfum (32%)",
    longevity: "12+ Jam",
    sillage: "Strong",
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
      createBottleSvg("04 Kayu & Rupa", "Woody & Vanilla", "Extrait de Parfum"),
      createNotesSvg("04 Kayu & Rupa", "Smoked Vetiver  •  Cedar  •  Amber")
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
    shortDescription: "Skin-scent intim dari biji ambrette, iris pallida, dan white musk bersih.",
    description: "Menggunakan Ambrette Seed alami dan Florentine Iris yang menyatu lembut dengan suhu tubuh pemakainya.",
    concentration: "Extrait de Parfum (25%)",
    longevity: "8 – 10 Jam",
    sillage: "Intimate",
    notes: {
      top: ["Ambrette Seed", "Aldehydes", "Pink Peppercorn"],
      middle: ["Florentine Iris Pallida", "Violet Leaf", "Magnolia"],
      base: ["Velvet White Musk", "Ambroxan", "Blonde Woods"]
    },
    variants: [
      { size: "15ml", price: 139000, compareAtPrice: 159000 },
      { size: "50ml", price: 339000, compareAtPrice: 379000 },
      { size: "100ml", price: 529000, compareAtPrice: 589000 }
    ],
    images: [
      createBottleSvg("05 Kulit Kedua", "Musky", "Extrait de Parfum"),
      createNotesSvg("05 Kulit Kedua", "Ambrette Seed  •  Iris  •  White Musk")
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
    shortDescription: "Seduhan espresso Arabika Gayo, dark cacao, dan panggang biji tonka.",
    description: "Ekstrak kopi Arabika Gayo pekat bertemu dengan Dark Cacao dan Roasted Tonka Bean yang hangat serta dewasa.",
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
      createBottleSvg("06 Kopi & Tonka", "Gourmand", "Extrait de Parfum"),
      createNotesSvg("06 Kopi & Tonka", "Espresso  •  Dark Cacao  •  Tonka Bean")
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
    shortDescription: "Mandarin Mediterania, bunga neroli, dan daun fig di pagi hari.",
    description: "Memadukan kulit jeruk Mandarin segar dengan bunga Neroli dan daun pohon ara (Fig Leaf) yang cerah.",
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
      createBottleSvg("07 Kebun Surya", "Citrus", "Extrait de Parfum"),
      createNotesSvg("07 Kebun Surya", "Mandarin  •  Neroli  •  Vetiver")
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
    shortDescription: "Manis segar buah fig hitam, red pear, dan blackcurrant.",
    description: "Menggabungkan Black Fig yang lembut, Red Pear renyah, dan Cassis di atas fondasi kayu Cedar serta Musk.",
    concentration: "Extrait de Parfum (30%)",
    longevity: "9 – 11 Jam",
    sillage: "Moderate",
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
      createBottleSvg("08 Buah Terlarang", "Fruity", "Extrait de Parfum"),
      createNotesSvg("08 Buah Terlarang", "Black Fig  •  Red Pear  •  Pink Pepper")
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
    shortDescription: "Kelembutan bunga kapas, mawar putih, dan clean linen musk.",
    description: "Merangkai Cotton Flower, White Rose, dan Clean Linen Musk menjadi wewangian lembut yang bersih dan rapi.",
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
      createBottleSvg("09 Sutra Putih", "Musky", "Extrait de Parfum"),
      createNotesSvg("09 Sutra Putih", "Aldehydes  •  Cotton Flower  •  Musk")
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
    shortDescription: "Kombinasi Damask Rose, rempah saffron, dan kayu gaharu Nusantara.",
    description: "Mempertemukan Damask Rose dengan Saffron merah dan sentuhan Gaharu Kalimantan dalam batch terbatas.",
    concentration: "Extrait de Parfum (35%)",
    longevity: "14+ Jam",
    sillage: "Strong",
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
      createBottleSvg("10 Mawar Hitam", "Floral", "Extrait de Parfum"),
      createNotesSvg("10 Mawar Hitam", "Damask Rose  •  Saffron  •  Dark Oud")
    ],
    status: "sold-out",
    badge: "Best Seller",
    featured: false,
    seasonal: false
  }
];

let PRODUCTS = DEFAULT_PRODUCTS;
try {
  const rawCmsProducts = localStorage.getItem("andrd_cms_products_v1");
  if (rawCmsProducts) {
    const parsed = JSON.parse(rawCmsProducts);
    if (Array.isArray(parsed) && parsed.length > 0) {
      PRODUCTS = parsed;
    }
  }
} catch (e) {}

window.createBottleSvg = createBottleSvg;
window.createNotesSvg = createNotesSvg;
window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
window.PRODUCTS = PRODUCTS;
