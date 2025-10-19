$(document).ready(function () {
  listLoket();
  loadAntrean();
});

function reload() {
  location.reload();
}
let antreanList = [];
let prefixCounter = [];
let startTime = {};
let endTime = {};
let timers = {};

function simpanData() {
  saveSession("antreanList", antreanList);
  saveSession("prefixCounter", prefixCounter);
  localSession("startTime", startTime);
  localSession("endTime", endTime);
}

function formatDurasi(ms) {
  const s = Math.floor(ms / 1000);
  const jam = String(Math.floor(s / 3600)).padStart(2, "0");
  const menit = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const detik = String(s % 60).padStart(2, "0");
  return `${jam}:${menit}:${detik}`;
}

// -------- Loket --------
function renderLoket() {
  const loketList = getSession("loket"); // array of {id, nama}
  const tbody = document.querySelector("#tabel-loket tbody");
  tbody.innerHTML = "";

  loketList.forEach((loket, i) => {
    tbody.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${loket.nama}</td>
            <td >
            <div class="input-group input-group-sm g-2">
                <input type="text" class="form-control" 
                   id="loketUpdate-${loket.id}" 
                   value="${loket.nama}"/>
                <button class="btn btn-sm btn-warning" 
                        data-id=${loket.id}
                        onclick="updateLoket(${loket.id})"
                        > Update
                </button>
                 <button class="btn btn-sm btn-danger" 
                        data-id=${loket.id}
                        onclick="hapusLoket(${loket.id})"
                        > Hapus
                </button>
                </div>
            </td>
        </tr>`;
  });
}

async function listLoket() {
  try {
    let res = await fetch("/loket", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let result = await res.json();
    console.log(result);
    if (result.metaData.code === 200) {
      saveSession("loket", result.response);
      renderLoket();
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function tambahLoket() {
  const data = { loket: document.getElementById("loketInput").value };
  if (!data) return;
  try {
    let res = await fetch("/loket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    let result = await res.json();
    console.log(result);

    if (result.metaData.code === 200) {
      Swal.fire("", "Loket ditambahkan: " + result.response.nama, "success");
      listLoket();
    } else {
      Swal.fire("", result.metaData.message, "info");
      console.warn("Gagal: " + json.metaData.message);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function hapusLoket(id) {
  const data = { id: id };
  if (!data) return;
  try {
    let res = await fetch("/loket", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    let result = await res.json();
    console.log(result);

    if (result.metaData.code === 200) {
      Swal.fire("", "Loket dihapus.", "success");
      listLoket();
    } else {
      console.warn("Gagal: " + json.metaData.message);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function updateLoket(id) {
  const loket = document.getElementById(`loketUpdate-${id}`).value || "";
  const data = { id: id, loket: loket };
  if (!data) return;
  try {
    let res = await fetch("/loket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    let result = await res.json();
    console.log(result);

    if (result.metaData.code === 200) {
      Swal.fire("", "Update Sukses", "success");
      listLoket();
    } else {
      console.warn("Gagal: " + json.metaData.message);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// function ubahLoket(i, loket) {
//   antreanList[i].loket = loket;
//   simpanData();

// }
function ubahLoket(i, loket) {
  antreanList[i].loket = loket;
  simpanData();

  // render ulang kolom aksi di baris ini
  const row = document.querySelector("#tabel-antrean tbody").children[i];
  if (!row) return;

  // bikin ulang busyLoket + firstIndexByLoket biar konsisten
  const busyLoket = new Set(
    antreanList
      .filter((a) => a.status === "sedang dilayani" && a.loket)
      .map((a) => a.loket)
  );
  const firstIndexByLoket = {};

  const aksi = getAksiHTML(antreanList[i], i, busyLoket, firstIndexByLoket);

  row.children[4].innerHTML = aksi;
}

// ------ Handler Antrean Loket CS ----
async function loadAntrean() {
  try {
    const res = await fetch("/antreancs/ambil");
    const data = await res.json();

    // reset antreanList
    antreanList = [];
    saveSession("antreanList", data.response.antrean);
    // isi antrean
    const listAntrean = Array.isArray(data.response.antrean)
      ? data.response.antrean
      : [];
    const loketList = Array.isArray(data.response.loket)
      ? data.response.loket.map((l) => l.nama)
      : [];

    listAntrean.forEach((a) =>
      antreanList.push({
        id: a.id,
        nomor: a.nomor,
        status: a.status || "menunggu",
        loket: a.loket || "",
        waktu_panggil: a.waktu_panggil,
      })
    );

    if (data.metaData.code !== 200 || antreanList.length === 0) {
      Swal.fire("", "Belum Ada Antrean Untuk Hari Ini.", "info");
      return;
    }

    // sort nomor antrean biar urut
    antreanList.sort((a, b) => {
      const na = parseInt(a.nomor.replace(/\D/g, "")) || 0;
      const nb = parseInt(b.nomor.replace(/\D/g, "")) || 0;
      return na - nb;
    });

    // ===== RENDER TABEL =====
    const tbody = document.querySelector("#tabel-antrean tbody");
    tbody.innerHTML = "";

    const busyLoket = new Set(
      antreanList
        .filter((a) => a.status === "sedang dilayani" && a.loket)
        .map((a) => a.loket)
    );
    const firstIndexByLoket = {};

    antreanList.forEach((a, i) => {
      const aksi = getAksiHTML(a, i, busyLoket, firstIndexByLoket);
      const loketDropdown = `
            <select class="form-select form-select-sm" 
                    ${
                      a.status === "sedang dilayani" || a.status === "selesai"
                        ? "disabled"
                        : ""
                    } 
                    onchange="ubahLoket(${i}, this.value)">
                <option value="">Pilih Loket</option>
                ${loketList
                  .map(
                    (l) => `
                    <option value="${l}" ${
                      a.loket === l ? "selected" : ""
                    }>${l}</option>
                `
                  )
                  .join("")}
            </select>`;

      console.log("isi status", a.status);

      const start = a.waktu_panggil ? new Date(a.waktu_panggil) : null;
      let timerText = `<span id="timer-${a.nomor}">00:00:00</span>`;
      // hanya tampil & jalan kalau status sedang dilayani
      if (start && a.status === "sedang dilayani") {
        timerText = `<span id="timer-${a.nomor}">${formatDurasi(
          Date.now() - start
        )}</span>`;

        if (!timers[a.nomor]) {
          timers[a.nomor] = setInterval(() => {
            const el = document.getElementById(`timer-${a.nomor}`);
            if (el) el.textContent = formatDurasi(Date.now() - start);
          }, 1000);
        }
      } else {
        deleteTimer(a); // fungsi yang tadi kamu bikin
      }

      const cetak = `<button class="btn btn-sm btn-secondary" data-cetak=${a.id} onclick="cetakAntrean(${a.id})">Cetak</button>`;
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td style="width:5%">${i + 1}</td>
                <td style="width:10%">${a.nomor}</td>
                <td style="width:30%">${loketDropdown}</td>
                <td style="width:15%">${a.status}</td>
                <td style="width:20%">${aksi}</td>
                <td style="width:10%">${timerText}</td>
                <td style="width:10%">${cetak}</td>
            `;
      tbody.appendChild(tr);

      // kelola timer sesuai status
      if (a.status === "sedang dilayani" && start) {
        startTimer(a);
      } else {
        stopTimer(a);
      }
    });
  } catch (err) {
    console.error(err);
    Swal.fire("", "Belum Ada Antrean Untuk Hari Ini.", "info");
  }
}

async function tambahAntrean() {
  const prefix = document.getElementById("prefixInput").value || "";
  if (!prefix) return Swal.fire("", "Prefix Belum terisi", "info");

  try {
    let res = await fetch("/antreancs/ambil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix }),
    });
    let json = await res.json();

    if (!json.response?.nomor) throw new Error("Gagal ambil nomor");

    Swal.fire("", "Antrean ditambahkan", "success").then(() => loadAntrean());

    console.log("Nomor antrean baru:", json.response.nomor);
  } catch (err) {
    console.error("Error tambah antrean:", err);
  }
}

async function panggilAntrean(id, loket) {
  if (!loket) return Swal.fire("", "Silahkan pilih loket.", "info");
  // cari antrean berdasarkan id
  let a = antreanList.find((x) => x.id === id);
  if (!a) {
    console.error("Antrean tidak ditemukan untuk id:", id);
    return;
  }

  // update lokal
  a.status = "sedang dilayani";
  a.loket = loket;

  // handle timer
  if (a.waktu_panggil) {
    startTimer(a);
  } else {
    stopTimer(a); // jaga2 kalau sebelumnya nyala
  }

  // update ke backend
  try {
    let res = await fetch("/antreancs/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, loket: a.loket }),
    });
    let json = await res.json();
    simpanData();
    loadAntrean();
    console.log("Update response:", json);
    if (json.metaData.code === 200) {
      speak(`Nomor antrean ${a.nomor}, silakan menuju ke ${a.loket}`);
    } else {
      Swal.fire("", json.metaData.message, "info");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// polling setiap 3 detik supaya semua user sinkron
// setInterval(listantrean, 3000);

async function updateStatusAntrean(id, status) {
  const data = { id: id, status: status };
  try {
    let res = await fetch("/antreancs/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    let json = await res.json();
    loadAntrean();
    console.log(json);
  } catch (err) {
    console.error("Error:", err);
  }
}

function selesaiAntrean(id) {
  // kirim ke backend
  fetch("/antreancs/selesai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }), // id dikirim via body
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      loadAntrean();
    })
    .catch((err) => console.error(err));
}

function panggilLagi(id) {
  let a = antreanList.find((x) => x.id === id);
  if (!a) return;
  if (a.status === "sedang dilayani") {
    speak(`Nomor antrean ${a.nomor}, silakan menuju ${a.loket}`);
  } else if (a.status === "dilewati") {
    panggilAntrean(a.id, a.loket);
  }
}

function lewatiAntrean(id) {
  let a = antreanList.find((x) => x.id === id);
  if (!a) return;
  a.status = "dilewati";
  if (timers[a.nomor]) {
    clearInterval(timers[a.nomor]);
    delete timers[a.nomor];
  }
  simpanData();
  updateStatusAntrean(a.id, a.status); // pakai id
}

function batalAntrean(id) {
  // kirim ke backend
  fetch("/antreancs/selesai", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }), // id dikirim via body
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      loadAntrean();
    })
    .catch((err) => console.error(err));
  stopTimer(a);
}

// --- Handler Aksi ---
function getAksiHTML(a, i, busyLoket, firstIndexByLoket) {
  let aksi = "";
  if (a.status === "menunggu") {
    // jika belum pilih loket tampilkan pesan pilih
    if (!a.loket) {
      aksi = `<span class="badge bg-secondary">Pilih Loket</span>`;
    }
    // jika loket sedang dilayani, tetap menunggu (tidak boleh panggil)
    else if (busyLoket.has(a.loket)) {
      aksi = `<span class="badge bg-secondary">Menunggu</span>`;
    }
    // jika loket tidak sibuk dan ini adalah antrian pertama Menunggu untuk loket tsb => tombol Panggil
    else if (firstIndexByLoket[a.loket] === undefined) {
      firstIndexByLoket[a.loket] = i;
      aksi = `<button class="btn btn-sm btn-success" onclick="panggilAntrean(${a.id}, '${a.loket}')">Panggil</button>`;
    } else {
      aksi = `<span class="badge bg-secondary">Menunggu</span>`;
    }
  } else if (a.status === "sedang dilayani") {
    aksi = `
        <button class="btn btn-sm btn-info" onclick="selesaiAntrean(${a.id})">Selesai</button>
        <button class="btn btn-sm btn-warning" onclick="lewatiAntrean(${a.id})">Lewati</button>
        <button class="btn btn-sm btn-danger" onclick="batalAntrean(${a.id})">Batal</button>
        <button class="btn btn-sm btn-success" onclick="panggilLagi(${a.id})">Panggil Lagi</button>
      `;
  } else if (a.status === "selesai") {
    aksi = `<span class="badge bg-success">Selesai</span><br><small>Total: ${
      a.totalWaktu || "-"
    }</small>`;
  } else if (a.status === "dilewati") {
    aksi = `<span class="badge bg-warning text-dark">Dilewati</span>
        <button class="btn btn-sm btn-success" onclick="panggilLagi(${a.id})">Panggil Lagi</button>`;
  } else if (a.status === "batal") {
    aksi = `<span class="badge bg-danger">Batal</span>`;
  }
  return aksi;
}

// --- Handler Timer ---
function startTimer(a) {
  if (!a.waktu_panggil) return;
  if (timers[a.nomor]) clearInterval(timers[a.nomor]);

  timers[a.nomor] = setInterval(() => {
    const el = document.getElementById(`timer-${a.nomor}`);
    if (el) {
      let mulai = new Date(a.waktu_panggil);
      let durasi = Date.now() - mulai.getTime();
      el.textContent = formatDurasi(durasi);
    }
  }, 1000);
}

function deleteTimer(a) {
  if (timers[a.nomor]) {
    clearInterval(timers[a.nomor]);
    delete timers[a.nomor];
  }
}
function stopTimer(a) {
  if (timers[a.nomor]) {
    clearInterval(timers[a.nomor]);
    delete timers[a.nomor];
  }
}

// --- Init: render + restore timers untuk yang masih "Sedang Dilayani" ---

function cetakAntrean(id) {
  const antreanList = getSession("antreanList");

  // cari antrean yg id-nya sesuai
  const antre = antreanList.find((x) => x.id === id);
  if (!antre) {
    alert("Data antrean tidak ditemukan!");
    return;
  }
  const nomor = antre.nomor;
  const loket = antre.loket || "-";
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
  const total = getTotalAntrean();
  const tunggu = getWaktuTunggu(nomor);

  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Cetak Antrean</title>
        <style>
          @page { size: 56mm auto; margin: 20px; } 
          body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            margin: 0;
            padding: 10px;
            width: 58mm;
          }
          h1 {
            font-size: 42px;
            margin: 10px 0;
          }
          h2 {
            font-size: 20px;
            margin: 5px 0;
          }
          p {
            font-size: 12px;
            margin: 3px 0;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
        </style>
      </head>
       <body>
            <h2><strong>KL KLINIK</strong></h2>
            <div class="line"></div>
            <p>Nomor Antrean</p>
            <h1>${nomor}</h1>
            <h2>${loket}</h2>
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

// -------- TTS --------
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

function formatDurasi(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// --- handler lain ---
function getTotalAntrean() {
  const antreanList = getSession("antreanList") || [];
  return antreanList.filter((a) => a.status !== "selesai").length;
}

function getWaktuTunggu(nomor) {
  const antreanList = getSession("antreanList") || [];
  // urutkan sesuai antrean
  const sorted = [...antreanList].sort((a, b) =>
    a.nomor.localeCompare(b.nomor)
  );
  const index = sorted.findIndex((a) => a.nomor === nomor);

  if (index === -1) return "-";

  const rataMenit = 5; // rata-rata 5 menit per pasien
  const estimasi = index * rataMenit;
  return `${estimasi} menit`;
}
