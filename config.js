/**
 * ============================================================================
 * KONFIGURASI UTAMA TOKO PARFUME "ANDRD" (config.js)
 * ============================================================================
 */

const STORE_CONFIG = {
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
  address: "Kemang Timur Raya No. 48, Jakarta Selatan",
  operationalHours: "Senin – Sabtu, 09.00 – 18.00 WIB",

  // 3. PENGATURAN ORDER & PENGIRIMAN
  orderPrefix: "ANDRD",
  returnPolicyDays: 7,
  announcementText: "Free Vial 2ml Setiap Pembelian • Pengiriman Seluruh Indonesia",
  nonCodNotice: "Pembayaran via Transfer / QRIS setelah konfirmasi WhatsApp (Tanpa COD).",

  // 4. PILIHAN KURIR PENGIRIMAN
  couriers: [
    { id: "JNE Reguler", label: "JNE Reguler (2-4 Hari)" },
    { id: "JNE YES", label: "JNE YES (1-2 Hari)" },
    { id: "J&T Express", label: "J&T Express (2-4 Hari)" },
    { id: "SiCepat REG", label: "SiCepat REG (2-4 Hari)" },
    { id: "SiCepat BEST", label: "SiCepat BEST (1-2 Hari)" },
    { id: "Paxel", label: "Paxel Sameday / Nextday" },
    { id: "Instant / Sameday", label: "GoSend / GrabExpress (Jakarta)" }
  ],

  // 5. KATEGORI AROMA (EXPLORE BY SCENT)
  scentCategories: [
    { id: "Citrus", name: "Citrus", subtitle: "Segar & cerah", accent: "#000000" },
    { id: "Floral", name: "Floral", subtitle: "Lembut & anggun", accent: "#000000" },
    { id: "Fruity", name: "Fruity", subtitle: "Manis & segar", accent: "#000000" },
    { id: "Woody & Vanilla", name: "Woody & Vanilla", subtitle: "Hangat & memikat", accent: "#000000" },
    { id: "Gourmand", name: "Gourmand", subtitle: "Kopi, cacao & tonka", accent: "#000000" },
    { id: "Musky", name: "Musky", subtitle: "Bersih & menyatu di kulit", accent: "#000000" }
  ],

  // 6. TEMPLATE PESAN WHATSAPP OTOMATIS
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
};

window.STORE_CONFIG = STORE_CONFIG;
