/**
 * ============================================================================
 * KONFIGURASI UTAMA TOKO PARFUME "ANDRD" (config.js)
 * ============================================================================
 * File ini berisi pengaturan utama website yang mudah diubah tanpa perlu
 * mengerti pemrograman. Cukup ubah teks di dalam tanda kutip ("...").
 */

const STORE_CONFIG = {
  // 1. IDENTITAS BRAND
  brandName: "ANDRD",
  brandLegalName: "ANDRD Olfactory Studio Indonesia",
  tagline: "Scent as Memory, Crafted in Small Batches",
  subTagline: "Fine Extrait de Parfum — Diracik dengan konsentrasi tinggi untuk karakter tropis Indonesia.",
  domain: "https://andrdperfume.com",

  // 2. KONTAK & WHATSAPP ADMIN
  // PENTING: Gunakan format kode negara 628xxx (tanpa tanda + atau spasi)
  whatsappAdmin: "6281234567890",
  whatsappDisplay: "+62 812-3456-7890",
  email: "concierge@andrdperfume.com",
  instagram: "@andrd.olfactory",
  tiktok: "@andrd.olfactory",
  address: "Jl. Kemang Timur Raya No. 48, Jakarta Selatan 12730, Indonesia",
  operationalHours: "Senin – Sabtu, 09.00 – 18.00 WIB",

  // 3. PENGATURAN ORDER & PENGIRIMAN
  orderPrefix: "ANDRD", // Format No. Order: ANDRD-YYMMDD-XXXX
  returnPolicyDays: 7,  // Garansi retur (hari)
  announcementText: "FREE 2ml Discovery Vial untuk setiap pembelian • Pengiriman ke seluruh Indonesia",
  nonCodNotice: "Tanpa COD — Pembayaran dilakukan via Transfer Bank / QRIS resmi setelah konfirmasi pesanan & ongkos kirim bersama Admin di WhatsApp.",

  // 4. PILIHAN KURIR PENGIRIMAN
  couriers: [
    { id: "JNE Reguler", label: "JNE Reguler (Estimasi 2-4 Hari)" },
    { id: "JNE YES", label: "JNE YES - Yakin Esok Sampai (1-2 Hari)" },
    { id: "J&T Express", label: "J&T Express (Estimasi 2-4 Hari)" },
    { id: "SiCepat REG", label: "SiCepat REG (Estimasi 2-4 Hari)" },
    { id: "SiCepat BEST", label: "SiCepat BEST - Besok Sampai Tujuan" },
    { id: "Paxel Sameday", label: "Paxel Sameday / Nextday (Jabodetabek & Kota Besar)" },
    { id: "GoSend / GrabExpress", label: "Instant / Sameday (Khusus Area Jakarta)" }
  ],

  // 5. KATEGORI AROMA (EXPLORE BY SCENT)
  scentCategories: [
    {
      id: "Citrus",
      name: "Citrus",
      subtitle: "Segar, cerah, dan membangkitkan semangat dari ekstrak bergamot & yuzu",
      accent: "#D9A441"
    },
    {
      id: "Floral",
      name: "Floral",
      subtitle: "Anggun dan romantis dari kelopak melati malam, tuberose, dan mawar Damaskus",
      accent: "#C87D75"
    },
    {
      id: "Fruity",
      name: "Fruity",
      subtitle: "Manis segar buah pir matang, fig Mediterranean, dan blackcurrant",
      accent: "#B85D6F"
    },
    {
      id: "Woody & Vanilla",
      name: "Woody & Vanilla",
      subtitle: "Hangat, dewasa, dan memikat dengan sandalwood, cedar, serta vanilla Madagaskar",
      accent: "#8C6239"
    },
    {
      id: "Gourmand",
      name: "Gourmand",
      subtitle: "Kaya dan adiktif dengan sentuhan roasted tonka, praline, dan espresso",
      accent: "#734B32"
    },
    {
      id: "Musky",
      name: "Musky",
      subtitle: "Skin-scent intim yang bersih, lembut, dan menyatu alami dengan kulit",
      accent: "#7E827A"
    }
  ],

  // 6. TEMPLATE PESAN WHATSAPP OTOMATIS
  // Template untuk Checkout Pesanan
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

  // Template untuk Permintaan Restock ("Kabari Saya" saat Sold Out)
  buildRestockMessage: function (productName, size) {
    const sizeText = size ? ` ukuran ${size}` : "";
    return `Halo ${this.brandName}, saya tertarik dengan parfum *${productName}*${sizeText} yang sedang Sold Out. Mohon kabari saya jika sudah restock kembali ya. Terima kasih!`;
  },

  // Template untuk Pertanyaan Umum (Floating WA Button)
  buildGeneralInquiryMessage: function () {
    return `Halo Admin ${this.brandName}, saya ingin berkonsultasi mengenai rekomendasi aroma parfum yang cocok untuk saya.`;
  }
};

// Ekspos ke global window agar dapat diakses semua script
window.STORE_CONFIG = STORE_CONFIG;
