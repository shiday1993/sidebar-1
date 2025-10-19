document.addEventListener("DOMContentLoaded", function () {
  tampilkanData();
  const statusKawin = document.getElementById("statuskawin");
  const rowSuamiIstri = document.getElementById("status_sudah_kawin");

  function cekStatusKawin() {
    if (statusKawin.textContent.trim() === "Kawin") {
      rowSuamiIstri.classList.remove("d-none"); // tampilkan
    } else {
      rowSuamiIstri.classList.add("d-none"); // sembunyikan
    }
  }

  // Jalankan pertama kali setelah data tampil
  cekStatusKawin();

  // Awasi perubahan isi status
  const observer = new MutationObserver(cekStatusKawin);
  observer.observe(statusKawin, {
    childList: true,
    characterData: true,
    subtree: true
  });
});

function tampilkanData() {
  const agamaMap = {
    0: 'Tidak diisi',
    1: 'Islam',
    2: 'Kristen',
    3: 'Katolik',
    4: 'Hindu',
    5: 'Buddha',
    6: 'Konghucu'
  };

  const statusMap = {
    0: "Tidak diisi",
    1: "Belum Kawin",
    2: "Kawin",
    3: "Cerai Hidup",
    4: "Cerai Mati"
  }
  const pendidikanMap = {
    0: 'Tidak diisi',
    1: "Belum Sekolah",
    2: "SD",
    3: "SMP",
    4: "SMA/SMK/SLTA",
    5: "Diploma",
    6: "Sarjana",
    7: "Pasca Sarjana",
    8: "Doktor",
    9: "Tidak Tamat/Tidak Sekolah"
  };
  const pekerjaanMap = {
    0: "Tidak diisi",
    1: "PNS",
    2: "Pegawai Swasta",
    3: "Wiraswasta",
    4: "Freelancer",
    5: "Ibu Rumah Tangga",
    6: "Tidak Bekerja",
    7: "Lainnya"
  }
  const data = getSession('previewpendaftaran');
  if (!data) {
    console.error("Data previewpendaftaran tidak ditemukan di session.");
    return;
  }
  const agama = data.agama != null ? data.agama : 0;  // default ke 0
  const pendidikan = data.pendidikan != null ? data.pendidikan : 0;
  const status = data.status != null ? data.status : 0;
  const pekerjaan = data.pekerjaan != null ? data.pekerjaan : 0;
  // Kolom kiri
  document.getElementById("no_RM").innerText = data.noRm || "-";
  document.getElementById("jenis_pasien").innerText = data.tipe_pasien || "-";
  document.getElementById("no_ktp").innerText = data.nik || "-";
  document.getElementById("nomor_kartu_JKN").innerText = data.nomorkartu || "-";
  document.getElementById("nomor_kartu_asuransi").innerText = data.noka_asuransi || "-";
  document.getElementById("nama_pasien").innerText = data.nama || "-";
  document.getElementById("tempat_lahir").innerText = data.tempatlahir || "-";
  document.getElementById("tgl_lahir").innerText = data.tanggallahir || "-";
  document.getElementById("jenis_kelamin").innerText = data.jeniskelamin || "-";
  document.getElementById("golongandarah").innerText = data.golongandarah || "-";
  document.getElementById("rhesus").innerText = data.rhesus || "-";
  document.getElementById("agama").innerText = agamaMap[agama] || "-";
  document.getElementById("nama_ayah").innerText = data.ayah || "-";
  document.getElementById("nama_ibu").innerText = data.ibu || "-";
  document.getElementById("alamat_jalan").innerText = data.jalan || "-";
  document.getElementById("rt").innerText = data.rt || "-";
  document.getElementById("rw").innerText = data.rw || "-";
  document.getElementById("kodekelurahan").innerText = data.kelurahan || data.kodekel || "-";
  document.getElementById("kodekecamatan").innerText = data.kecamatan || data.kodekec || "-";
  document.getElementById("kodekabupaten").innerText = data.kabupaten || data.kodedati2 || "-";
  document.getElementById("kodeprovinsi").innerText = data.provinsi || data.kodeprop || "-";

  // Kolom kanan
  document.getElementById("statuskawin").innerText = statusMap[status] || "-";
  document.getElementById("nama_pasangan").innerText = data.namapasangan || "-";
  document.getElementById("telepon").innerText = data.nohp || "-";
  document.getElementById("email").innerText = data.email || "-";
  document.getElementById("pendidikan").innerText = pendidikanMap[pendidikan] || "-";
  document.getElementById("pekerjaan").innerText = pekerjaanMap[pekerjaan]|| "-";

  // Kalau ada referensi, bisa digabungin jadi string
  if (data.referensi && Array.isArray(data.referensi)) {
    const refEl = document.getElementById("referensi");
    if (refEl) {
      refEl.innerText = data.referensi.join(", ");
    }
  }
}


// tanggal otomatis

const today = new Date();
const options = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta'
};

document.getElementById("today-date").textContent =
  today.toLocaleDateString('id-ID', options);



const canvas = document.getElementById("signature-pad");
const signaturePad = new SignaturePad(canvas);

// Tombol hapus
document.getElementById("clear").addEventListener("click", () => {
  signaturePad.clear();
});

// Saat submit form, isi input hidden dengan base64 dari canvas
// document.getElementById("ttdForm").addEventListener("submit", function (e) {
//   if (signaturePad.isEmpty()) {
//     e.preventDefault();
//     alert("Tanda tangan masih kosong!");
//   } else {
//     document.getElementById("ttd").value = signaturePad.toDataURL("image/png");
//   }
// });


// Save Tanda tangan
document.getElementById('SimpanUpdateData').addEventListener('click', async function () {
  // 1. Cek tanda tangan
  if (signaturePad.isEmpty()) {
    Swal.fire("Tanda tangan masih kosong!", '', 'warning');
    return;
  }

  try {
    // 2. Ambil tanda tangan & session
    const signatureData = signaturePad.toDataURL('image/png');
    const dataraw = getSession('previewpendaftaran') || {};
    const payload = { ...dataraw, signature: signatureData };

    const peserta = getSession("datapeserta") || {};
    const rawrujukan = getSession("datarujukan") || {};
    const rujukan = rawrujukan?.rujukan || rawrujukan || {};
    const pasien = getSession("datapasien") || {};
    const antrean = getSession("dataantrean") || {};

    let data = { data: { ...peserta, ...rujukan, ...pasien, ...antrean } };

    // Hapus session lama
    clearSession('datarujukan');
    clearSession('datapeserta');
    clearSession('dataantrean');
    saveSession('datapasien', data);

    // 3. Update pasien ke server dulu
    const resUpdate = await fetch('/peserta/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resUpdate.ok) throw new Error('Gagal menyimpan data pasien');
    const resultJson = await resUpdate.json();
    const codeUpdate = Number(resultJson.metaData?.code);
    const msgUpdate = resultJson.metaData?.message || 'Terjadi kesalahan';

    if (codeUpdate !== 200) {
      if (codeUpdate === 409) {
        Swal.fire('', msgUpdate, 'warning');
      } else {
        Swal.fire('Error', msgUpdate, 'error');
      }
      return;
    }

    // Update session datapasien dengan data terbaru
    saveSession('datapasien', resultJson.response);
    const pasienBaru = resultJson.response?.data || {};

    // 4. Cek tipe pasien JKN → nomor kartu wajib
    if (pasienBaru.tipe_pasien === "JKN") {
      if (!pasienBaru.nomorkartu || pasienBaru.nomorkartu.trim() === "") {
        Swal.fire('Peringatan', 'Nomor kartu pasien JKN belum terisi!', 'warning');
        return;
      }
    }

    // 5. Konfirmasi kirim antrean
    const resultSwal = await Swal.fire({
      title: 'Kirim antrean?',
      text: 'Data antrean akan dikirim ke server.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, kirim',
      cancelButtonText: 'Batal'
    });

    if (!resultSwal.isConfirmed) return;

    // 6. Kirim antrean ke server
    await tambahAntreanKlinik();

    // 7. Sukses semua, tampilkan form & redirect
    Swal.fire('Berhasil!', 'Antrean berhasil dikirim.', 'success').then(() => {
      tampilkan("#formantrean");
      window.location.href = '/sep/antrean?target=formantrean';
    });

  } catch (err) {
    console.error(err);
    Swal.fire('Error', err.message || 'Gagal menyimpan data.', 'error');
  }
});

async function tambahAntreanKlinik() {
  const data = getSession('datapasien')?.data || {};
  const kodedokter = $("#pilihDokterBpjs").val() || $("#pilihDokterUmum").val();
  const jampraktek = $("#jampraktekdokterbpjs").val() || $("#jampraktekdokterUmum").val();
  const kodepoli = $("#kodePoliBpjs").val() || $("#kodePoliUmum").val();

  const tglPeriksa = new Date().toISOString().slice(0, 10);
  const payload = {
    nomorkartu: data.nomorkartu,
    nik: data.nik,
    nohp: data.nohp,
    kodepoli: kodepoli,
    norm: data.norm,
    tanggalperiksa: tglPeriksa,
    kodedokter: kodedokter,
    jampraktek: jampraktek,
    jeniskunjungan: data.jeniskunjungan,
    jenispasien: data.tipe_pasien,
    nomorreferensi: data.noKunjungan
  };
  // console.log(payload);
  try {
    const res = await fetch('/antrol/antrean/tambah', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();       // <- await penting
    const meta = result.metaData || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';

    if (code === 200) {
      // gabungkan data lama dengan kodedokter & jampraktek
      const i = result.response;
      const updated = {
        ...getSession('datapasien'),
        data: { ...data, ...i, kodedokter, jampraktek, tglPeriksa, kodepoli }
      };
      saveSession('datapasien', updated);
      isiFormBooking();
      // Swal.fire('Berhasil', msg, 'success');
    } else {
      Swal.fire('Info', msg, 'warning');
    }
  } catch (e) {
    console.error('Error fetch pasien:', e);
    Swal.fire('Error', e.message, 'error');
  }
}