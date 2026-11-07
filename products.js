/**
 * ============================================================================
 * DATABASE PRODUK PARFUME "ANDRD" (products.js)
 * ============================================================================
 * Disesuaikan dengan Content Brief Resmi Client:
 * - Brand: ANDRD
 * - Collection: CEDORA
 * - Product Type: Eau de Parfum
 * - Volume: 30 ML
 * - Price: Rp109.000
 * - Fragrance Family: Fresh Woody Floral
 * - Top Notes: Green Tea | Middle Notes: Cherry, Dark Rose | Base Notes: Cedarwood
 */

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createBottleSvg(name, category, sub) {
  const safeName = escapeXml(String(name || "").toUpperCase());
  const safeCat = escapeXml(category);
  const safeSub = escapeXml(sub || "Eau de Parfum");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <rect width="800" height="800" fill="#F6F6F6"/>
    <ellipse cx="400" cy="650" rx="120" ry="10" fill="#000000" fill-opacity="0.06"/>
    <rect x="270" y="255" width="260" height="380" rx="18" fill="#141414" stroke="#27272A" stroke-width="1"/>
    <rect x="350" y="138" width="100" height="117" rx="8" fill="#1A1A1A"/>
    <text x="400" y="425" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="400" letter-spacing="6" fill="#FFFFFF">ANDRD</text>
    <text x="400" y="472" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="2" fill="#D4D4D8">${safeName}</text>
    <text x="400" y="538" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="1.5" fill="#E4E4E7">${safeSub}</text>
    <text x="400" y="562" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="9.5" font-weight="500" letter-spacing="2" fill="#A1A1AA">${safeCat} • 30 ML</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function createNotesSvg(name, notesText) {
  const safeName = escapeXml(String(name || "").toUpperCase());
  const safeNotes = escapeXml(notesText);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <rect width="800" height="800" fill="#F2F2F2"/>
    <rect x="90" y="90" width="620" height="620" rx="32" fill="#FFFFFF"/>
    <text x="400" y="240" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="5" fill="#111111">ANDRD</text>
    <text x="400" y="345" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" letter-spacing="2" fill="#111111">${safeName}</text>
    <text x="400" y="382" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="3" fill="#888888">FRAGRANCE NOTES</text>
    <text x="400" y="465" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="15" font-weight="500" letter-spacing="0.5" fill="#222222">${safeNotes}</text>
    <text x="400" y="585" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="500" letter-spacing="2.5" fill="#888888">EAU DE PARFUM • 30 ML</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const DEFAULT_PRODUCTS = [
  {
    id: "andrd-cedora",
    name: "CEDORA",
    slug: "cedora",
    collection: "CEDORA",
    productType: "Eau de Parfum",
    gender: "Unisex",
    scentCategory: "Fresh Woody Floral",
    tagline: "A scent that speaks without saying a word.",
    shortDescription:
      "A scent that speaks without saying a word. Perpaduan aroma yang menghadirkan kesegaran Green Tea, keanggunan Cherry & Dark Rose, dan kehangatan Cedarwood dalam satu karakter.",
    description:
      "A scent that speaks without saying a word.\n\nCEDORA adalah perpaduan aroma yang menghadirkan kesegaran, keanggunan, dan kehangatan dalam satu karakter. Dibuka dengan kesegaran Green Tea yang memberikan kesan segar dan menenangkan. Kemudian Cherry dan Dark Rose menghadirkan sentuhan aroma yang elegan, memberikan kedalaman serta karakter tersendiri. Pada akhirnya, Cedarwood memberikan kehangatan dengan nuansa woody yang menciptakan kesan mendalam dan berkesan.\n\nCEDORA bukan sekadar tentang aroma. Ini tentang karakter, identitas, dan kesan yang kamu tinggalkan.\n\nFind your identity. Leave your impression.",
    concentration: "Eau de Parfum",
    longevity: "6 sampai 8 Jam",
    sillage: "Moderate to Strong",
    notes: {
      top: ["Green Tea"],
      middle: ["Cherry", "Dark Rose"],
      base: ["Cedarwood"]
    },
    variants: [
      { size: "30 ML", price: 109000, compareAtPrice: null }
    ],
    images: [
      "assets/img/products/cedora-bottle.jpg",
      "assets/img/products/cedora-hand.jpg",
      "assets/img/products/cedora-model-bw-1.jpg",
      "assets/img/products/cedora-model-bw-2.jpg",
      "assets/img/products/cedora-model-black.jpg",
      "assets/img/products/cedora-models-duo.jpg"
    ],
    status: "ready",
    badge: "Best Seller",
    featured: true,
    seasonal: true
  }
];

let PRODUCTS = DEFAULT_PRODUCTS;
try {
  const rawCmsProducts = localStorage.getItem("andrd_cms_products_v1");
  if (rawCmsProducts) {
    const parsed = JSON.parse(rawCmsProducts);
    // Migrasi otomatis jika localStorage masih menyimpan katalog dummy lama ("01 Senja di Bali")
    const isLegacyDummy =
      Array.isArray(parsed) &&
      parsed.some((p) => p.id === "andrd-01" || (p.name && p.name.includes("Senja di Bali")));
    if (isLegacyDummy) {
      localStorage.removeItem("andrd_cms_products_v1");
      PRODUCTS = DEFAULT_PRODUCTS;
    } else if (Array.isArray(parsed) && parsed.length > 0) {
      PRODUCTS = parsed;
    }
  }
} catch (e) {}

window.createBottleSvg = createBottleSvg;
window.createNotesSvg = createNotesSvg;
window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
window.PRODUCTS = PRODUCTS;
