// --- Global variable untuk tracking FIFO per dokter (berdasarkan nama dokter) ---
let firstIndexByDokter = {};

function mapStatus(status) {
    const statusMap = {
        0:  { label: "Menunggu", badge: "bg-light text-muted" },
        1:  { label: "Sedang Dilayani", badge: "bg-success"},
        2:  { label: "Selesai Dilayani", badge: "bg-info"},
        3:  { label: "Sedang Dilayani", badge: "bg-success"},
        4:  { label: "Selesai Dilayani", badge: "bg-info"},
        5:  { label: "Sedang Dilayani", badge: "bg-success"},
        6:  { label: "Selesai Dilayani", badge: "bg-info"},
        7:  { label: "Selesai Pelayanan", badge: "bg-primary"},
        99: { label: "Batal", badge: "bg-danger" },
    };
    const code = parseInt(status, 10);
    return statusMap[code] || { label: "Unknown", badge: "bg-light" };
}

async function getantrean() {
    try {
        const res = await fetch(`/antrol/antrean/tambah`);
        const data = await res.json();

        if (data.metaData && data.metaData.code !== 200) {
            alert(data.metaData.message || "Data tidak ditemukan");
            return;
        }
        console.log(data);
        firstIndexByDokter = {};
        const tbody = document.querySelector('#tabel-antrean-poli tbody');
        tbody.innerHTML = ''; // reset table        
        data.response.list.forEach((item, index) => {
            const noantrean = item.nomorantrean;
            const kodebooking = item.kodebooking;
            const status = mapStatus(item.taskid);
            const namaDokter = item.namadokter || "Tidak diketahui";
            let aksiBtn = "";
            if (status.label === "Menunggu") {
                // FIFO: hanya pasien pertama per nama dokter yang bisa dipanggil
                if (firstIndexByDokter[namaDokter] === undefined) {
                    firstIndexByDokter[namaDokter] = index;
                    aksiBtn = `
                        <div class="d-grid gap-1">
                            <button id="panggilpoli-${index}"
                                data-namadokter="${namaDokter}"
                                class="btn btn-sm btn-success py-1" 
                                onclick="panggilPasien('${kodebooking}', '${namaDokter}')">Panggil</button>
                            <span id="timer-${kodebooking}">00:00</span>                         
                        </div>
                    `;
                } else {
                    aksiBtn = `<span class="badge ${status.badge}">${status.label}</span>`;
                }
            } else if (status.label === "Sedang dilayani") {
                aksiBtn = `
                    <div class="d-grid gap-1">
                        <button class="btn btn-sm btn-info py-1"
                            onclick="selesaiPasien('${kodebooking}', ${index}, '${namaDokter}')">Selesai</button>
                        <button class="btn btn-sm btn-warning py-1"
                            onclick="lewatiPasien('${kodebooking}', ${index}, '${namaDokter}')">Lewati</button>
                        <button class="btn btn-sm btn-danger py-1"
                            onclick="batalPasien('${kodebooking}', ${index}, '${namaDokter}')">Batal</button>
                    </div>
                `;
            } else if (status.label === "Selesai Dilayani") {
                aksiBtn = `<span class="badge ${status.badge}">${status.label}</span>`;
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${noantrean}</td>
                <td>${kodebooking}</td>
                <td>Poli ${item.namapoli}</td>
                <td>${namaDokter}</td>
                <td>${item.jampraktek} WIB</td>
                <td>${item.estimasidilayani}</td>
                <td><span class="badge ${status.badge}">${status.label}</span></td>
                <td>${aksiBtn}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert('Terjadi error saat mengambil data antrean');
    }
}


function antreantanggal() {
    const tanggal = $("#tgl_dash-poli").val();
    if (!tanggal) { Swal.fire("", "Harap Pilih Tanggal Terlebih Dahulu!.", 'warning'); return; };
    const payload = { tanggal };
    const url = `antrean_pertanggal`;
    const method = "get"; 
    antrol_rs(url, method, payload, function (err, res) {
        if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
        const meta = res.metadata || res.metaData || {};
        const { code, message } = meta;
        if (code === 200) {
            const hasil = res.response;
            console.log("Respon BPJS:",hasil)
            Swal.fire('', message, 'success').then((result) => {
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else if (code === 201 || code === 204) {
            Swal.fire('', message, 'info').then((result) => {
                const hasil = getDummy("antreantanggal")?.response;
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else {
            Swal.fire('', message || 'Terjadi kesalahan', 'error');
        }
    });
};

// === Antrean Perhari ini ===
function antreanperhariini() {
    const tanggal = new Date().toISOString().slice(0, 10);
    const payload = { tanggal };
    const url = `antrean_pertanggal`;
    const method = "get"; 
    antrol_rs(url, method, payload, function (err, res) {
        if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
        const meta = res.metadata || res.metaData || {};
        const { code, message } = meta;
        if (code === 200) {
            const hasil = res.response;
            console.log("Respon BPJS:",hasil)
            Swal.fire('', message, 'success').then((result) => {
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else if (code === 201 || code === 204) {
            Swal.fire('', message, 'info').then((result) => {
                const hasil = getDummy("antreantanggal")?.response;
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else {
            Swal.fire('', message || 'Terjadi kesalahan', 'error');
        }
    });
};

// === Maping Dokter & Poli ===
function getDokterMap() {
    const raw = localStorage.getItem('dataDokter') || getSession('dataDokter');
    const list = raw ? JSON.parse(raw) : [];
    const map = {};
    list.forEach(d => {
        map[d.kodedokter] = d.namadokter;
    });
    return map;
}
function getPoliMap() {
    const raw = localStorage.getItem('dataPoli') || getSession('dataPoli');
    const list = raw ? JSON.parse(raw) : [];
    const map = {};
    list.forEach(d => {
        map[d.kodepoli] = d.namapoli;
    });
    return map;
}

// --- Render Tabel Antrean dengan FIFO ---
function renderTabelAntrean(data) {
    const list = data.list || data || [];
    const $tbody = $('#tabel-antrean-poli tbody');
    $tbody.empty();

    if (list.length === 0) {
        $tbody.append('<tr><td colspan="13" class="text-center">Tidak ada data.</td></tr>');
        return;
    }

    const dokterMap = getDokterMap();
    const poliMap = getPoliMap();
    const firstIndexByDokter = {}; // tracking pasien pertama per dokter
    const busyDokterSet = new Set(
        list.filter(a => a.status === "Sedang dilayani").map(a => a.kodedokter)
    );

    list.forEach((item, index) => {
        const dok = dokterMap[item.kodedokter] || item.kodedokter || '-';
        const pasien = `<b>NIK : </b>${item.nik}<br>
                        <b>No. Peserta : </b>${item.nokapst}<br>
                        <b>No. RM : </b>${item.norekammedis}<br>`;
        const poli = poliMap[item.kodepoli] || item.kodepoli || "-";
        const dokter = dok || '-';
        const peserta = item.ispeserta == 1 ? 'BPJS' : 'Umum';
        const kodebooking = item.kodebooking;
        const noantrean = item.noantrean;
        const jamdaftar = "" || formatTimestamp(item.createdtime);
        const jampanggil = "" || formatTimestamp(item.estimasidilayani);
        const status = item.status;
        const sumber = item.sumberdata || '-';
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
                        <button class="btn btn-sm btn-success py-1"
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
                <td class="td-poli">${poli}</td>
                <td class="td-dokter">${dokter}</td>
                <td class="td-peserta">${peserta}</td>
                <td class="td-kodebooking">${kodebooking}</td>
                <td class="td-noantrean">${noantrean}<div class="mt-1">${cetakBtn}</div></td>
                <td class="td-jamdaftar">${jamdaftar}</td>
                <td class="td-jampanggil">${jampanggil}</td>
                <td class="td-status">${status}</td>
                <td class="td-sumber">${sumber}</td>
                <td class="td-aksi" style="white-space: nowrap;">${aksiBtn}</td>
            </tr>
        `;
        $tbody.append(row);
    });
}

// --- Fungsi untuk mengatur tombol aksi berdasarkan status ---
function getAksiHTML(item, kodeDokter, kodebooking) {
    const status = item.status || "Belum dilayani";

    if (status === "Sedang dilayani") {
        return `
            <div class="d-grid gap-1">
                <button class="btn btn-sm btn-info py-1"
                    onclick="selesaiPasien('${kodebooking}','${kodeDokter}')">Selesai</button>
                <button class="btn btn-sm btn-warning py-1"
                    onclick="lewatiPasien('${kodebooking}','${kodeDokter}')">Lewati</button>
                <button class="btn btn-sm btn-danger py-1"
                    onclick="batalPasien('${kodebooking}','${kodeDokter}')">Batal</button>
                <button class="btn btn-sm btn-success py-1"
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

async function updatetaskid() {
    
    
}