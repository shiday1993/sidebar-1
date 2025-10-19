// Script jam
setInterval(() => {
  const now = new Date();

  const tgl = String(now.getDate()).padStart(2, "0");
  const bln = String(now.getMonth() + 1).padStart(2, "0");
  const thn = now.getFullYear();

  const jam = String(now.getHours()).padStart(2, "0");
  const menit = String(now.getMinutes()).padStart(2, "0");
  const detik = String(now.getSeconds()).padStart(2, "0");

  const waktu = `${tgl}/${bln}/${thn} at ${jam}:${menit}:${detik}`;

  document.getElementById("jamRealtime").innerText = waktu;
}, 1000);

function batal() {
  (window.location.href = "/antrol"), tampilkan("#antreanonline");
}


$(document).ready(function () {
  if (!$("#tanggal_dashboard").val()) {
    const today = new Date().toISOString().split("T")[0];
    $("#tanggal_dashboard").val(today);
    $("#tanggal_farmasi").val(today);
  }  
  antreanperhariini();
});

// === Antrean Perhari ini ===
  function antreanperhariini() {
    const tanggal = new Date().toISOString().slice(0, 10);
    const payload = { tanggal };
    const url = `antrean_pertanggal`;
    const method = "get";
    antrol_rs(url, method, payload, function (err, res) {
      if (err)
        return Swal.fire("Server Error", "Internal Server Error", "error");
      const meta = res.metadata || res.metaData || {};
      const { code, message } = meta;
      if (code === 200) {
        const hasil = res.response;
        console.log("Respon BPJS:", hasil);
        Swal.fire("", message, "success").then((result) => {
          saveSession("antreantanggal", hasil);
          if (result.isConfirmed) {
            renderTabelAntrean(hasil);
          }
        });
      } else if (code === 201 || code === 204) {
        Swal.fire("", message, "info").then((result) => {
          const hasil = getDummy("antreantanggal")?.response;
          saveSession("antreantanggal", hasil);
          if (result.isConfirmed) {
            renderTabelAntrean(hasil);
          }
        });
      } else {
        Swal.fire("", message || "Terjadi kesalahan", "error");
      }
    });
  }

//Fungsi antrean Per Tanggal
function getDokterMap() {
  const raw = localStorage.getItem("dataDokter") || getSession("dataDokter");
  const list = raw ? JSON.parse(raw) : [];
  const map = {};
  list.forEach((d) => {
    map[d.kodedokter] = d.namadokter;
  });
  return map;
}

[
  {
    jeniskunjungan: 1,
    nomorreferensi: "0137B0020825P000003",
    createdtime: 1759805073440,
    kodebooking: "071025INT001",
    norekammedis: "00000132",
    nik: "3201032802570002",
    nokapst: "0002042882695",
    noantrean: "KL-001",
    kodepoli: "INT",
    sumberdata: "Bridging Antrean",
    estimasidilayani: 1759803569120,
    kodedokter: 12007,
    jampraktek: "16:00-17:00",
    nohp: "085635228000",
    tanggal: "2025-10-07",
    ispeserta: true,
    status: "Belum dilayani",
  },
];

// ======================================================
// ---- Start of Fungsi Antrean Poli----
// ======================================================

// --- Render Tabel Antrean dengan FIFO ---
function renderTabelAntrean(data) {
  const list = data.list || data || [];
  const $tbody = $("#tabel-antrean tbody");
  $tbody.empty();

  if (list.length === 0) {
    $tbody.append(
      '<tr><td colspan="13" class="text-center">Tidak ada data.</td></tr>'
    );
    return;
  }

  const dokterMap = getDokterMap();
  // const poliMap = getPoliMap();
  const firstIndexByDokter = {}; // tracking pasien pertama per dokter
  const busyDokterSet = new Set(
    list.filter((a) => a.status === "Sedang Dilayani").map((a) => a.kodedokter)
  );

  list.forEach((item, index) => {
    const dok = dokterMap[item.kodedokter] || item.kodedokter || "-";
    const pasien = `<b>NIK : </b>${item.nik}<br>
                        <b>No. Peserta : </b>${item.nokapst}<br>
                        <b>No. RM : </b>${item.norekammedis}<br>`;
    const poli = item.kodepoli || "-";
    const dokter = dok || "-";
    const peserta = item.ispeserta == 1 ? "BPJS" : "Umum";
    const kodebooking = item.kodebooking;
    const noantrean = item.noantrean;
    const jamdaftar = "" || formatTimestamp(item.createdtime);
    const jampanggil = "" || formatTimestamp(item.estimasidilayani);
    const status = item.status;
    const sumber = item.sumberdata || "-";
    const cetakBtn = `<button class="btn btn-sm btn-secondary" data-cetak=${kodebooking} onclick="cetakAntreanPoli('${kodebooking}')">Cetak</button>`;

    let aksiBtn = "";

    // === Logika FIFO per Dokter ===
    if (status === "Belum dilayani") {
      // Dokter sedang melayani pasien lain
      if (busyDokterSet.has(item.kodedokter)) {
        aksiBtn = `<span class="badge bg-light text-muted">Menunggu</span>`;
      }
      // Pasien pertama untuk dokter ini
      else if (!firstIndexByDokter[item.kodedokter]) {
        firstIndexByDokter[item.kodedokter] = true;
        busyDokterSet.add(item.kodedokter);
        aksiBtn = `
                    <div class="d-grid gap-1">
                        <button class="btn btn-sm btn-success py-1" type="button"
                            onclick="panggilPasien('${kodebooking}','${item.kodedokter}')">
                            Panggil
                        </button>
                        <span id="timer-${kodebooking}" class="small text-muted">00:00:00</span>
                    </div>`;
      } else {
        aksiBtn = `<span class="badge bg-light text-muted">Menunggu</span>`;
      }
    } else {
      // status lain ditangani oleh helper
      aksiBtn = getAksiHTML(item, item.kodedokter, kodebooking);
    }

    const row = `
            <tr class='align-center' 
                data-kodebooking="${kodebooking}" 
                data-status="${status}" 
                data-kodedokter="${item.kodedokter}"
                data-noantrean="${noantrean}">                
                <td>${index + 1}</td>
                <td class="td-pasien" style="white-space: nowrap;">${pasien}</td>
                <td class="td-peserta">${peserta}</td>
                <td class="td-kodebooking">${kodebooking}</td>
                <td ><div class="td-noantrean">${noantrean}</div><div class="mt-1">${cetakBtn}</div></td>
                <td class="td-status">${status}</td>
                <td class="td-aksi" style="white-space: nowrap;">${aksiBtn}</td>
            </tr>
        `;
    $tbody.append(row);
  });
}

// --- Fungsi untuk mengatur tombol aksi berdasarkan status ---
function getAksiHTML(item, kodeDokter, kodebooking) {
  const status = item.status || "Belum dilayani";

  if (status === "Sedang Dilayani") {
    return `
            <div class="d-grid gap-1">
                <button class="btn btn-sm btn-info py-1" type="button"
                    onclick="selesaiPasien('${kodebooking}','${kodeDokter}')">Selesai</button>
                <button class="btn btn-sm btn-warning py-1" type="button"
                    onclick="lewatiPasien('${kodebooking}','${kodeDokter}')">Lewati</button>
                <button class="btn btn-sm btn-danger py-1" type="button"
                    onclick="batalPasien('${kodebooking}','${kodeDokter}')">Batal</button>
                <button class="btn btn-sm btn-success py-1" type="button"
                    onclick="panggilLagi('${kodebooking}','${kodeDokter}')">Panggil Lagi</button>
                <span id="timer-${kodebooking}" class="small text-muted">00:00:00</span>
            </div>`;
  }

  if (status === "Selesai Dilayani") {
    const total = item.totalWaktu || "-";
    return `<span class="badge bg-success">Selesai</span><br><small>Total: ${total}</small>`;
  }

  if (status === "Dilewati") {
    return `<span class="badge bg-warning text-dark">Dilewati</span>
        <div class="mt-1">
            <button class="btn btn-sm btn-success py-1"
                onclick="panggilLagi('${kodebooking}','${kodeDokter}')">Panggil Lagi</button>
        </div>`;
  }

  if (status === "Batal") {
    return `<span class="badge bg-danger">Batal</span>`;
  }

  return `<span class="badge bg-light text-muted">Menunggu</span>`;
}

// --- Variabel Global ---
let intervalId = {}; // { index: intervalId }
let startTime = {}; // { index: timestamp mulai panggil }
let endTime = {}; // { index: timestamp selesai }

// --- Format Durasi Helper ---
function formatDurasi(ms) {
  const s = Math.floor(ms / 1000);
  const jam = String(Math.floor(s / 3600)).padStart(2, "0");
  const menit = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const detik = String(s % 60).padStart(2, "0");
  return `${jam}:${menit}:${detik}`;
}

// --- Fungsi Auto-Refresh FIFO per Dokter ---
function refreshAntreanDokter(kodeDokter) {
  const $rows = $(`#tabel-antrean tbody tr[data-kodedokter='${kodeDokter}']`);
  let found = false;
  $rows.each(function (i, tr) {
    const $tr = $(tr);
    const status = $tr.attr("data-status");
    const kodebooking = $tr.attr("data-kodebooking"); // string tetap aman
    if (status === "Belum dilayani" && !found) {
      found = true;
      $tr.find(".td-aksi").html(`
                <div class="d-grid gap-1">
                    <button id="panggilpoli-${kodebooking}"
                        data-kodebooking="${kodebooking}"
                        data-kodedokter="${kodeDokter}"
                        class="btn btn-sm btn-success py-1" 
                        onclick="panggilPasien('${kodebooking}', '${kodeDokter}')">Panggil</button>
                    <span id="timer-${kodebooking}">00:00</span>                         
                </div>
            `);
    } else if (status === "Belum dilayani") {
      $tr
        .find(".td-aksi")
        .html(`<span class="badge bg-light text-muted">Menunggu</span>`);
    }
  });
}

// --- Fungsi Panggil Pasien (upgrade) ---
async function panggilPasien(kodebooking, kodeDokter) {
  const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
  if (!$row.length) return;

  // ubah status lokal
  $row.attr("data-status", "Sedang Dilayani");
  $row.find(".td-status").text("Sedang Dilayani");

  // --- Update backend ---
  const waktu = Date.now();
  const taskid = 6;
  
  try {
    const res = await  fetch("/antrol/antrean/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kodebooking, taskid, waktu, jenisresep:'' }),
    });
    const json =await res.json();
    if (json.metaData.code !== 200){
      return Swal.fire('', 'Pasien masih dalam pelayanan lain', 'info');
    }
  } catch (err) {
    console.error("Error update backend:", err);
  }
  
  // --- Jalankan TTS (text-to-speech) ---
  const noAntrean = $row.find(".td-noantrean").text().trim();
  const namaDokter = $row.find(".td-dokter").text().trim();
  speak(`Nomor antrean ${noAntrean}, silakan menuju ke ${namaDokter}`);

  // --- Timer Start ---
  if (intervalId[kodebooking]) clearInterval(intervalId[kodebooking]);
  startTime[kodebooking] = Date.now();
  intervalId[kodebooking] = setInterval(() => {
    const elapsed = Date.now() - startTime[kodebooking];
    $(`#timer-${kodebooking}`).text(formatDurasi(elapsed));
  }, 1000);

  // --- Ubah tombol aksi (menggunakan helper getAksiHTML) ---
  const item = {
    status: "Sedang Dilayani",
  };
  const aksiHTML = getAksiHTML(item, kodeDokter, kodebooking);
  $row.find(".td-aksi").html(aksiHTML);
}

function panggilLagi(kodebooking, kodeDokter) {
  const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
  const noAntrean = $row.find(".td-noantrean").text().trim();
  const namaDokter = $row.find(".td-dokter").text().trim();
  speak(`Nomor antrean ${noAntrean}, silakan menuju ke ${namaDokter}`);
}

// --- Fungsi Selesai Pasien (pakai kodebooking) ---
async function selesaiPasien(kodebooking, kodeDokter) {
  // stop timer
  if (intervalId[kodebooking]) {
    clearInterval(intervalId[kodebooking]);
    delete intervalId[kodebooking];
  }
  endTime[kodebooking] = Date.now();

  const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
  if (!$row.length) return;

  $row.attr("data-status", "Selesai Dilayani");
  $row.find(".td-status").text("Selesai Dilayani");

  const durasi = startTime[kodebooking]
    ? endTime[kodebooking] - startTime[kodebooking]
    : 0;
  $row.find(".td-aksi").html(`
        <span class="badge bg-secondary">Selesai</span>
        <div><small>Total: ${formatDurasi(durasi)}</small></div>
    `);

  const waktu = Math.floor(Date.now() / 1000); // pakai detik UNIX
  const taskid = 7;
  
  try {
    const res = await  fetch("/antrol/antrean/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kodebooking, taskid, waktu, jenisresep:'' }),
    });
    const json =await res.json();
    console.log("Selesai Poli response:", json);
  } catch (err) {
    console.error("Error update backend:", err);
  }
  // aktifkan pasien berikutnya untuk dokter ini
  refreshAntreanDokter(kodeDokter); // refresh tombol panggil

  // TODO: update ke server
}

// --- Fungsi Lewati Pasien ---
function lewatiPasien(kodebooking, kodeDokter) {
  // stop timer jika ada
  if (intervalId[kodebooking]) {
    clearInterval(intervalId[kodebooking]);
    delete intervalId[kodebooking];
  }

  const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
  if (!$row.length) return;

  // set status Dilewati
  $row.attr("data-status", "Dilewati");
  $row.find(".td-status").text("Dilewati");
  $row
    .find(".td-aksi")
    .html(`<span class="badge bg-warning text-dark">Dilewati</span>`);

  // refresh supaya pasien berikutnya untuk dokter yang sama dapat tombol Panggil
  refreshAntreanDokter(kodeDokter); // refresh tombol panggil

  // TODO: update ke server
}

// --- Fungsi Batal Pasien ---
async function batalPasien(kodebooking, kodeDokter) {
  // stop timer jika ada
  if (intervalId[kodebooking]) {
    clearInterval(intervalId[kodebooking]);
    delete intervalId[kodebooking];
  }
  
  const waktu = Math.floor(Date.now() / 1000); // pakai detik UNIX
  const taskid = 99;
  
  try {
    const res = await  fetch("/antrol/antrean/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kodebooking, taskid, waktu, jenisresep:'' }),
    });
    const json =await res.json();
    console.log("Batal Poli response:", json);
  } catch (err) {
    console.error("Error update backend:", err);
  }
  // hapus baris yang tepat
  $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`).remove();

  // refresh supaya tombol panggil muncul bila perlu
  refreshAntreanDokter(kodeDokter); // refresh tombol panggil

  // TODO: update ke server
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "id-ID";
  const voices = speechSynthesis.getVoices();
  const female = voices.find(
    (v) => v.lang.includes("id") && v.name.toLowerCase().includes("female")
  );
  if (female) utter.voice = female;
  speechSynthesis.speak(utter);
}

// -------------------- Cetak Thermal Antrean Poli (58mm) --------------------
function cetakAntreanPoli(kodebooking) {
  // cari baris antrean berdasarkan kodebooking
  const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
  if (!$row.length) {
    Swal.fire("", "Data antrean tidak ditemukan.", "info");
    return;
  }

  // ambil data dari atribut dan kolom tabel
  const nomor = $row.attr("data-noantrean") || "-";
  const dokter = $row.find(".td-dokter").text().trim() || "-";
  const poli = $row.find(".td-poli").text().trim() || "-";
  const now = new Date();
  const tanggal =
    now.toLocaleDateString("id-ID") +
    " " +
    now
      .toLocaleTimeString("id-ID", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, ":");

  // buka jendela cetak thermal
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Cetak Antrean Poli</title>
        <style>
          @page { size: 56mm auto; margin: 10px; }
          body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            margin: 0;
            padding: 8px;
            width: 58mm;
          }
          h1 {
            font-size: 42px;
            margin: 6px 0;
          }
          h2 {
            font-size: 18px;
            margin: 2px 0;
          }
            h3 {
            font-size: 16px;
            margin: 2px 0;
          }
          p {
            font-size: 12px;
            margin: 2px 0;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <h2><strong>KL KLINIK</strong></h2>
        <div class="line"></div>
        <p>Nomor Antrean</p>        
        <h1>${nomor}</h1>
        <h2>Farmasi</h2>
        <div class="line"></div>
        <p>${tanggal}</p>
        <b>Terima kasih</b>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

// ===================================================
// End of Fungsi Antrean Poli
// ===================================================


function antreantanggal() {
  const tanggal = $("#tanggal_dashboard").val();
  if (!tanggal) {
    Swal.fire("", "Harap Pilih Tanggal Terlebih Dahulu!.", "warning");
    return;
  }
  const payload = { tanggal };
  const url = `antrean_pertanggal`;
  const method = "get"; //ganti method dengan "get", "post", "put", "delete"

  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire("Server Error", "Internal Server Error", "error");
    const meta = res.metadata || res.metaData || {};
    const { code, message } = meta;
    if (code === 200) {
      const hasil = res.response;
      console.log("Respon BPJS:", hasil);
      Swal.fire("", message, "success").then((result) => {
        saveSession("antreantanggal", hasil);
        if (result.isConfirmed) {
          renderTabelAntrean(hasil);
        }
      });
    } else if (code === 201 || code === 204) {
      Swal.fire("", message, "info").then((result) => {
        const hasil = getDummy("antreantanggal")?.response;
        saveSession("antreantanggal", hasil);
        if (result.isConfirmed) {
          renderTabelAntrean(hasil);
        }
      });
    } else {
      Swal.fire("", message || "Terjadi kesalahan", "error");
    }
  });
}
