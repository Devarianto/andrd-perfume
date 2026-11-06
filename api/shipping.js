/**
 * ============================================================================
 * VERCEL SERVERLESS API — CEK ONGKIR OTOMATIS RAJAONGKIR (GRATIS / STARTER & V2)
 * Endpoint: POST /api/shipping
 * ============================================================================
 * Mendukung:
 * 1. RajaOngkir Komerce API v2 (https://rajaongkir.komerce.id/api/v1)
 * 2. RajaOngkir Classic Starter API (https://api.rajaongkir.com/starter)
 * Jika API Key belum diisi atau gagal, frontend otomatis memakai tabel tarif
 * domestik bawaan sehingga checkout tidak pernah error.
 */

// Mapping nama Kota/Kabupaten ke ID Kota RajaOngkir Classic Starter
const RAJAONGKIR_CITY_IDS = {
  "Jakarta Selatan": "153",
  "Jakarta Pusat": "152",
  "Jakarta Barat": "151",
  "Jakarta Timur": "154",
  "Jakarta Utara": "155",
  "Kepulauan Seribu": "189",
  "Kota Tangerang Selatan": "457",
  "Kota Tangerang": "456",
  "Kab. Tangerang": "455",
  "Kota Serang": "403",
  "Kota Cilegon": "106",
  "Kab. Lebak": "232",
  "Kab. Pandeglang": "331",
  "Kota Bandung": "23",
  "Kab. Bandung": "22",
  "Kota Bekasi": "55",
  "Kab. Bekasi": "54",
  "Kota Depok": "115",
  "Kota Bogor": "79",
  "Kab. Bogor": "78",
  "Kota Cirebon": "108",
  "Kota Tasikmalaya": "469",
  "Kab. Garut": "126",
  "Kab. Karawang": "171",
  "Kota Semarang": "399",
  "Kota Surakarta (Solo)": "445",
  "Kota Magelang": "250",
  "Kota Pekalongan": "349",
  "Kota Tegal": "472",
  "Kab. Banyumas (Purwokerto)": "41",
  "Kab. Kudus": "209",
  "Kab. Jepara": "163",
  "Kab. Klaten": "196",
  "Kota Yogyakarta": "501",
  "Kab. Sleman": "419",
  "Kab. Bantul": "39",
  "Kab. Kulon Progo": "210",
  "Kab. Gunungkidul": "135",
  "Kota Surabaya": "444",
  "Kota Malang": "256",
  "Kab. Sidoarjo": "409",
  "Kab. Gresik": "133",
  "Kota Batu": "51",
  "Kota Kediri": "179",
  "Kab. Jember": "160",
  "Kab. Banyuwangi": "42",
  "Kota Denpasar": "114",
  "Kab. Badung": "17",
  "Kab. Gianyar": "128",
  "Kab. Tabanan": "447",
  "Kab. Buleleng": "94",
  "Kota Medan": "278",
  "Kota Binjai": "70",
  "Kab. Deli Serdang": "112",
  "Kota Padang": "318",
  "Kota Bukittinggi": "93",
  "Kota Pekanbaru": "350",
  "Kota Batam": "48",
  "Kota Tanjungpinang": "461",
  "Kota Palembang": "327",
  "Kota Bandar Lampung": "21",
  "Kota Balikpapan": "19",
  "Kota Samarinda": "387",
  "Kota Bontang": "89",
  "Kota Banjarmasin": "36",
  "Kota Banjarbaru": "35",
  "Kota Pontianak": "365",
  "Kota Palangka Raya": "326",
  "Kota Makassar": "254",
  "Kota Manado": "267",
  "Kota Kendari": "182",
  "Kota Palu": "329",
  "Kota Mataram": "276",
  "Kota Kupang": "213",
  "Kota Ambon": "14",
  "Kota Jayapura": "158"
};

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
    const apiKey = (body.apiKey || process.env.RAJAONGKIR_API_KEY || "").trim();
    const originCity = body.originCity || "Jakarta Selatan";
    const destinationCity = body.destinationCity || "";
    const destinationDistrict = body.destinationDistrict || "";
    const weightGrams = Math.max(100, Number(body.weightGrams) || 1000);

    if (!apiKey) {
      return res.status(200).json({
        ok: false,
        source: "no_api_key",
        message: "API Key RajaOngkir belum diisi, menggunakan tarif otomatis bawaan."
      });
    }

    // 1. Coba RajaOngkir Komerce API v2 terlebih dahulu
    try {
      const searchQuery = encodeURIComponent(
        destinationDistrict && destinationDistrict !== "LAINNYA"
          ? `${destinationDistrict} ${destinationCity.replace(/^(Kota|Kab\.)\s+/i, "")}`
          : destinationCity.replace(/^(Kota|Kab\.)\s+/i, "")
      );
      const originSearch = encodeURIComponent(originCity.replace(/^(Kota|Kab\.)\s+/i, ""));

      const [origDestRes, targetDestRes] = await Promise.all([
        fetch(
          `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${originSearch}&limit=1&offset=0`,
          { headers: { key: apiKey } }
        ),
        fetch(
          `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${searchQuery}&limit=1&offset=0`,
          { headers: { key: apiKey } }
        )
      ]);

      if (origDestRes.ok && targetDestRes.ok) {
        const origData = await origDestRes.json();
        const targetData = await targetDestRes.json();
        const origId = origData && origData.data && origData.data[0] ? origData.data[0].id : null;
        const destId = targetData && targetData.data && targetData.data[0] ? targetData.data[0].id : null;

        if (origId && destId) {
          const formBody = new URLSearchParams({
            origin: String(origId),
            destination: String(destId),
            weight: String(weightGrams),
            courier: "jne:pos:tiki"
          });

          const costRes = await fetch("https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost", {
            method: "POST",
            headers: {
              key: apiKey,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formBody.toString()
          });

          if (costRes.ok) {
            const costJson = await costRes.json();
            if (costJson && Array.isArray(costJson.data) && costJson.data.length > 0) {
              const rates = costJson.data.slice(0, 8).map((item) => ({
                code: `${(item.code || "").toUpperCase()} ${item.service || ""}`.trim(),
                label: `${(item.code || "").toUpperCase()} ${item.service || ""}${item.etd ? ` (${item.etd})` : ""}`,
                cost: Number(item.cost) || 0,
                isManual: false
              }));
              return res.status(200).json({ ok: true, source: "rajaongkir_v2", rates });
            }
          }
        }
      }
    } catch (v2Err) {
      // Lanjut fallback ke endpoint RajaOngkir Starter Classic
    }

    // 2. Fallback ke RajaOngkir Starter Classic API (https://api.rajaongkir.com/starter/cost)
    const originId = RAJAONGKIR_CITY_IDS[originCity] || "153";
    const destId = RAJAONGKIR_CITY_IDS[destinationCity];
    if (!destId) {
      return res.status(200).json({ ok: false, source: "city_unmapped" });
    }

    const couriers = ["jne", "tiki", "pos"];
    const classicRequests = couriers.map((c) => {
      const params = new URLSearchParams({
        origin: originId,
        destination: destId,
        weight: String(weightGrams),
        courier: c
      });
      return fetch("https://api.rajaongkir.com/starter/cost", {
        method: "POST",
        headers: {
          key: apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    });

    const classicResponses = await Promise.all(classicRequests);
    const classicRates = [];
    classicResponses.forEach((resp) => {
      const results =
        resp && resp.rajaongkir && Array.isArray(resp.rajaongkir.results)
          ? resp.rajaongkir.results
          : [];
      results.forEach((courierObj) => {
        const cCode = (courierObj.code || "").toUpperCase();
        (courierObj.costs || []).forEach((srv) => {
          const costItem = srv.cost && srv.cost[0];
          if (costItem && costItem.value) {
            const etdClean = (costItem.etd || "").replace(/hari/gi, "").trim();
            classicRates.push({
              code: `${cCode} ${srv.service}`,
              label: `${cCode} ${srv.service}${etdClean ? ` (${etdClean} Hari)` : ""}`,
              cost: Number(costItem.value),
              isManual: false
            });
          }
        });
      });
    });

    if (classicRates.length > 0) {
      return res.status(200).json({ ok: true, source: "rajaongkir_starter", rates: classicRates });
    }

    return res.status(200).json({ ok: false, source: "empty_rates" });
  } catch (err) {
    return res.status(200).json({ ok: false, source: "error", message: err.message });
  }
};
