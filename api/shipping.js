/**
 * ============================================================================
 * VERCEL SERVERLESS API — CEK ONGKIR LIVE RAJAONGKIR V2 (PRODUCTION)
 * Endpoint: POST /api/shipping
 * ============================================================================
 * Menggunakan RajaOngkir Shipping Cost API v2 (https://rajaongkir.komerce.id/api/v1)
 * Mendukung level Kota/Kabupaten hingga Kecamatan seluruh Indonesia.
 */

const DEFAULT_RAJAONGKIR_SHIPPING_KEY = "e9OAevuO53232ceaff7b55fbmIKxmOOS";
// ID Kecamatan Kebayoran Baru / Kemang, Jakarta Selatan di RajaOngkir v2
const DEFAULT_ORIGIN_JAKARTA_SELATAN_ID = 17536;

// Daftar layanan paket reguler/ekspres/ekonomis yang relevan untuk produk parfum
// (Menyaring kargo motor/truk seperti JTR>200, T60, BIG, GOKIL, SPS, dll.)
const ALLOWED_SERVICES_BY_COURIER = {
  jne: ["REG", "CTC", "YES", "CTCYES", "OKE"],
  jnt: ["EZ", "REG"],
  sicepat: ["REG", "BEST", "HALU"],
  anteraja: ["REG", "ND", "ECO"],
  tiki: ["REG", "ONS", "ECO"],
  pos: ["POS REGULER", "POS NEXTDAY", "REGULER"],
  ninja: ["STANDARD", "REG"]
};

const COURIER_DISPLAY_NAMES = {
  jne: "JNE",
  jnt: "J&T",
  sicepat: "SiCepat",
  anteraja: "AnterAja",
  tiki: "TIKI",
  pos: "POS",
  ninja: "Ninja"
};

function normalizeAreaName(str) {
  return String(str || "")
    .toUpperCase()
    .replace(/\(.*?\)/g, "")
    .replace(/^(KOTA|KAB\.|KABUPATEN)\s+/i, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function findRajaOngkirV2DestinationId(apiKey, city, district) {
  const cleanCity = normalizeAreaName(city);
  const cleanDistrict =
    district && district !== "LAINNYA"
      ? String(district).split("/")[0].replace(/\(.*?\)/g, "").trim()
      : "";

  // 1. Cari spesifik Kecamatan + Kota agar tarif presisi sampai level kecamatan
  if (cleanDistrict && cleanCity) {
    const q1 = encodeURIComponent(`${cleanDistrict} ${cleanCity}`);
    const r1 = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${q1}&limit=8&offset=0`,
      { headers: { key: apiKey } }
    );
    if (r1.ok) {
      const d1 = await r1.json();
      const list1 = Array.isArray(d1.data) ? d1.data : [];
      const match1 = list1.find((item) => {
        const ic = normalizeAreaName(item.city_name || "");
        return ic === cleanCity || ic.includes(cleanCity) || cleanCity.includes(ic);
      });
      if (match1 && match1.id) return match1.id;
    }
  }

  // 2. Fallback cari berdasarkan Kota / Kabupaten
  if (cleanCity) {
    const q2 = encodeURIComponent(cleanCity);
    const r2 = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${q2}&limit=8&offset=0`,
      { headers: { key: apiKey } }
    );
    if (r2.ok) {
      const d2 = await r2.json();
      const list2 = Array.isArray(d2.data) ? d2.data : [];
      const match2 =
        list2.find((item) => {
          const ic = normalizeAreaName(item.city_name || "");
          return ic === cleanCity || ic.includes(cleanCity) || cleanCity.includes(ic);
        }) || list2[0];
      if (match2 && match2.id) return match2.id;
    }
  }

  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const apiKey = (
      body.apiKey ||
      process.env.RAJAONGKIR_API_KEY ||
      DEFAULT_RAJAONGKIR_SHIPPING_KEY
    ).trim();

    const originCity = body.originCity || "Jakarta Selatan";
    const destinationCity = body.destinationCity || "";
    const destinationDistrict = body.destinationDistrict || "";
    const weightGrams = Math.max(200, Number(body.weightGrams) || 1000);

    if (!apiKey || !destinationCity) {
      return res.status(200).json({ ok: false, source: "missing_params" });
    }

    // 1. Tentukan Origin ID (Default langsung 17536 Jakarta Selatan agar cepat tanpa request tambahan)
    let originId = DEFAULT_ORIGIN_JAKARTA_SELATAN_ID;
    if (normalizeAreaName(originCity) !== "JAKARTA SELATAN") {
      const foundOrigin = await findRajaOngkirV2DestinationId(apiKey, originCity, "");
      if (foundOrigin) originId = foundOrigin;
    }

    // 2. Cari Destination ID (Kecamatan / Kota Tujuan)
    const destId = await findRajaOngkirV2DestinationId(
      apiKey,
      destinationCity,
      destinationDistrict
    );
    if (!destId) {
      return res.status(200).json({ ok: false, source: "destination_not_found" });
    }

    // 3. Hitung Ongkir Live dari RajaOngkir Production v2
    const formBody = new URLSearchParams({
      origin: String(originId),
      destination: String(destId),
      weight: String(weightGrams),
      courier: "jne:jnt:sicepat:anteraja:tiki:pos:ninja"
    });

    const costRes = await fetch(
      "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost",
      {
        method: "POST",
        headers: {
          key: apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody.toString()
      }
    );

    if (!costRes.ok) {
      return res.status(200).json({ ok: false, source: "rajaongkir_http_error", status: costRes.status });
    }

    const costJson = await costRes.json();
    const rawList = Array.isArray(costJson.data) ? costJson.data : [];

    const seen = new Set();
    const filteredRates = [];

    rawList.forEach((item) => {
      const cCode = String(item.code || "").toLowerCase().trim();
      const srvRaw = String(item.service || "").trim();
      const srvUpper = srvRaw.toUpperCase();
      const cost = Number(item.cost) || 0;
      if (cost <= 0) return;

      const allowedList = ALLOWED_SERVICES_BY_COURIER[cCode];
      if (allowedList && !allowedList.includes(srvUpper)) {
        return;
      }

      const brand = COURIER_DISPLAY_NAMES[cCode] || cCode.toUpperCase();
      // Rapikan nama layanan (misal CTC -> REG untuk dalam kota JNE, Pos Reguler -> Reguler)
      let cleanService = srvRaw.replace(/^Pos\s+/i, "");
      if (cCode === "jne" && srvUpper === "CTC") cleanService = "REG";
      if (cCode === "jne" && srvUpper === "CTCYES") cleanService = "YES";

      const displayCode = `${brand} ${cleanService}`.trim();
      if (seen.has(displayCode)) return;
      seen.add(displayCode);

      let etdClean = String(item.etd || "")
        .replace(/days?/gi, "Hari")
        .replace(/^0\s*Hari$/i, "1 Hari")
        .trim();
      if (etdClean === "-") etdClean = "";

      filteredRates.push({
        code: displayCode,
        label: `${displayCode}${etdClean ? ` (${etdClean})` : ""}`,
        cost,
        isManual: false
      });
    });

    // Urutkan kurir populer lebih dulu lalu berdasarkan harga
    const priorityOrder = ["JNE REG", "J&T EZ", "SiCepat REG", "AnterAja REG", "SiCepat HALU", "JNE YES", "SiCepat BEST"];
    filteredRates.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.code);
      const idxB = priorityOrder.indexOf(b.code);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.cost - b.cost;
    });

    if (filteredRates.length > 0) {
      return res.status(200).json({
        ok: true,
        source: "rajaongkir_v2_production",
        rates: filteredRates
      });
    }

    return res.status(200).json({ ok: false, source: "no_matching_services" });
  } catch (err) {
    return res.status(200).json({ ok: false, source: "error", message: err.message });
  }
};
