# ANDRD — Website E-Commerce Parfum Lokal (Direct to WhatsApp Checkout)

Website toko online modern bergaya Shopify untuk brand parfum lokal **ANDRD** (*"Scent as Memory, Crafted in Small Batches"*). Dibangun menggunakan **HTML5, CSS3 (CSS Variables), dan Vanilla JavaScript (ES6+)** tanpa framework berat sehingga sangat cepat, ringan, dan mudah dikelola.

---

## 📁 Struktur Folder

```text
andrd-perfume/
├── index.html          # Halaman Utama (Hero slider, Best Seller, Segmentasi, Scent Count)
├── products.html       # Katalog Semua Produk + Filter Lengkap & Live Search
├── product.html        # Halaman Detail Produk + Varian Ukuran Dinamis + JSON-LD SEO
├── cart.html           # Halaman Keranjang Belanja Lengkap
├── checkout.html       # Halaman Form Pelanggan & Direct Checkout ke WhatsApp
├── about.html          # Tentang Brand & Filosofi
├── contact.html        # Kontak Studio & Konsultasi WhatsApp
├── policies.html       # Kebijakan Pengiriman, Retur 7 Hari, S&K, & Privasi
├── config.js           # PENGATURAN UTAMA (Nomor WA Admin, Nama Brand, Kurir, Template WA)
├── products.js         # DATABASE PRODUK (10 Parfum Dummy lengkap dengan status & harga)
├── sitemap.xml         # Sitemap SEO
└── assets/
    ├── css/
    │   └── style.css   # Stylesheet utama (CSS Variables untuk warna & font)
    ├── js/
    │   └── app.js      # Logika keranjang (localStorage), filter, & checkout WhatsApp
    └── img/
        ├── favicon.svg
        └── products/   # Ilustrasi botol parfum rasio 1:1 (utama & hover kedua)
```

---

## 🛠️ Panduan Edit untuk Non-Programmer

### 1. Cara Mengganti Nomor WhatsApp Admin & Teks Pengumuman
Buka file [`config.js`](./config.js) menggunakan Notepad / VS Code, lalu ubah bagian berikut:
```javascript
whatsappAdmin: "6281234567890", // Gunakan awalan 628 tanpa tanda + atau spasi
announcementText: "FREE 2ml Discovery Vial untuk setiap pembelian • Pengiriman ke seluruh Indonesia",
```

### 2. Cara Menambah / Mengubah Produk & Harga
Buka file [`products.js`](./products.js). Setiap parfum memiliki format berikut:
- `status`:
  - `"ready"` → Tombol beli aktif (**Tambah ke Keranjang**)
  - `"pre-order"` → Tampil badge Pre-Order & tombol **Ikut Pre-Order**
  - `"sold-out"` → Tombol beli otomatis nonaktif dan berganti menjadi tombol **"Kabari Saya"** yang langsung mengarah ke WhatsApp Admin.
- `variants`: Anda bebas mengubah ukuran (`15ml`, `50ml`, `100ml`), `price` (harga jual), dan `compareAtPrice` (harga coret/diskon, isi `null` jika tidak diskon).
- `images`: Masukkan foto produk rasio 1:1 di folder `assets/img/products/` (misal `.webp` atau `.jpg`), gambar pertama tampil utama dan gambar kedua tampil otomatis saat kursor diarahkan (*hover*).

### 3. Cara Mengganti Warna Tema Brand
Buka file [`assets/css/style.css`](./assets/css/style.css) pada baris paling atas (`:root`):
```css
:root {
  --color-primary: #181615; /* Warna utama teks & tombol (Charcoal Noir) */
  --color-accent: #9C7A54;  /* Warna aksen emas/bronze (Warm Bronze) */
  --color-bg: #FAF7F2;      /* Warna latar belakang (Warm Alabaster) */
  --color-bg-alt: #F2ECE1;  /* Warna latar seksi kedua (Soft Sand) */
}
```

---

## 🚀 Cara Deploy (Mengonlinekan Website)

### Opsi 1: Netlify (Gratis & Paling Mudah - Drag & Drop)
1. Buka [app.netlify.com/drop](https://app.netlify.com/drop) dan daftar/login.
2. Tarik (*drag and drop*) seluruh folder `andrd-perfume` ke halaman tersebut.
3. Website Anda langsung online dalam 10 detik dengan HTTPS gratis!

### Opsi 2: Vercel (Gratis & Cepat)
1. Upload folder ini ke repositori GitHub Anda, atau install Vercel CLI.
2. Login ke [vercel.com](https://vercel.com), klik **Add New Project**, pilih folder/repo `andrd-perfume`, lalu klik **Deploy** (tidak perlu build command karena murni HTML/CSS/JS statis).

### Opsi 3: Hosting Biasa (cPanel / Niagahoster / Rumahweb)
1. Buka **cPanel** → menu **File Manager**.
2. Masuk ke folder `public_html`.
3. Upload seluruh isi folder `andrd-perfume` (pastikan `index.html` berada langsung di dalam `public_html`).
