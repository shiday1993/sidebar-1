function batal() {
  window.location.replace("/sep/antrean");
};
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("/sep/antrean")) {

    const params = new URLSearchParams(window.location.search);
    const target = params.get("target");

    if (target) {
      isiFormBooking();
      tampilkan(`#${target}`);
    } else {
      // Tidak ada query target -> clear session dan tampilkan modal
      sessionStorage.clear();
      const myModal = new mdb.Modal(document.getElementById("modalPeserta"));
      myModal.show();
    }
  }
});

function antreanPesertaBaru() {
  const baru = { info: 'baru', pasienbaru: '1' };
  saveSession("infopeserta", baru);
  setTimeout(() => {
    const myModal = mdb.Modal.getInstance(
      document.getElementById("modalPeserta")
    );
    myModal.hide();
  }, 300);
  tampilkan("#antreanpesertabaru");
}
function antreanPesertaLama() {
  const lama = { info: 'lama', pasienbaru: '0' };
  saveSession("infopeserta", lama);
  setTimeout(() => {
    const myModal = mdb.Modal.getInstance(
      document.getElementById("modalPeserta")
    );
    myModal.hide();
  }, 300);
  tampilkan("#antreanpesertalama");
}

function cari_peserta() {
  const pilih = $('input[name="pilihkartu"]:checked').val();
  const today = new Date().toISOString().slice(0, 10);
  const nomor = $("#nomorkartu").val();
  const tglSEP = $("#tanggalsep").val() || today;

  const config =
    pilih === "nik"
      ? {
        url: "peserta_nik",
        payload: { nik: nomor, tglSEP },
        sessionKey: "pesertanik",
      }
      : {
        url: "peserta_bpjs",
        payload: { nokartu: nomor, tglSEP },
        sessionKey: "pesertabpjs",
      };

  vclaim_baru(config.url, "get", config.payload, function (err, res) {
    if (err) return Swal.fire("Server Error", "Internal Server Error", "error");

    const meta = res?.metaData || res?.metadata || {};
    const code = parseInt(meta.code);
    const msg = meta.message || "Terjadi kesalahan";

    if (code === 200) {
      Swal.fire(msg, "", "success").then(() => {
        saveSession(config.sessionKey, res.response);
        rendertabelpeserta(res.response, pilih);
        getRujukan(res.response.peserta.noKartu);
        tampilkanmodalpeserta();
      });
    } else if (code === 201) {
      Swal.fire(msg, "", "info");
    } else {
      Swal.fire("", msg, "error");
    }
  });
}

let modalPesertaInstance;
function tampilkanmodalpeserta() {
  const $modal = $("#modal-peserta");
  modalPesertaInstance = new mdb.Modal($modal[0]);
  modalPesertaInstance.show();
}
function tutupmodal() {
  if (modalPesertaInstance) modalPesertaInstance.hide();
}
function rendertabelpeserta(data, tipe) {
  saveSession("datapeserta", data);
  // console.log("Render tabel tipe:", tipe, data);
  const sex =
    data.peserta.sex === "L"
      ? "Laki-laki"
      : data.peserta.sex === "P"
        ? "Perempuan"
        : "-";
  let p = data.peserta;
  let hak = data.peserta.hakKelas.keterangan;
  let umur = data.peserta.umur;

  if (!data) return;
  $("#nama").text(p.nama || "-");
  $("#status").text(p.statusPeserta.keterangan || "-");
  $("#jenisKelamin").text(sex || "-");
  $("#tanggalLahir").text(p.tglLahir || "-");
  $("#umurSaatPelayanan").text(umur.umurSaatPelayanan || "-");
  $("#noKartuBPJS").text(p.noKartu || "-");
  $("#noKTP").text(p.nik || "-");
  $("#noRekamMedis").text(p.mr.noRM || "-");
  $("#asalRujukan").text(p.prolanis || "-");
  $("#hakKelas").text(hak || "-");
  $("#jenisPeserta").text(p.jenisPeserta.keterangan || "-");
  $("#tglTMT").text(p.tglTMT || "-");
  $("#tglTAT").text(p.tglTAT || "-");
}

async function pesertadipilih() {
  if (modalPesertaInstance) modalPesertaInstance.hide();
  // const data = gabungdata();
  await isiFormPendaftaran();
  tampilkan("#formpendaftaranpeserta");
}

function gabungdata() {
  const peserta = getSession("datapeserta");
  const rujukan = getSession("datarujukan");
  const pasien = getSession("datapasien");
  const antrean = getSession("dataantrean");
  return { ...peserta, ...rujukan, ...pasien, ...antrean };
}

async function daftarpasienbaru(data) {
  try {
    const res = await fetch('/peserta/tambah', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    // saveSession('norm', result.response.noRm);
    return result; // penting! biar bisa dipakai di previewpendaftaran
  } catch (error) {
    Swal.fire('',)
    console.error('Error:', error);
    throw error; // biar ditangkap try..catch di previewpendaftaran
  }
}

async function isiFormPendaftaran() {
  const peserta = getSession("datapeserta")?.peserta || {};
  const rawrujukan = getSession("datarujukan") || {};
  const rujukan = rawrujukan?.rujukan || rawrujukan || {};
  const pasien = getSession("datapasien") || {};
  const antrean = getSession("dataantrean") || {};
  let data = { ...peserta, ...rujukan, ...pasien, ...antrean };
  clearSession('datarujukan');
  clearSession('datapeserta');
  clearSession('dataantrean');
  clearSession('pesertabpjs');
  saveSession('datapasien', data);
  if ($.isEmptyObject(data)) return;
  // Nomor Kartu
  if (data.noKartu) $("#nomor_kartu").val(data.noKartu);

  // KTP & Nama
  if (data.nik) $("#no_ktp").val(data.nik);
  if (data.nama) $("#nama_lengkap").val(data.nama);

  // Tempat & Tanggal Lahir
  if (data.tempat_lahir) $("#tempat_lahir").val(data.tempat_lahir);
  if (data.tglLahir) $("#tgl_lahir").val(data.tglLahir);

  // Jenis Kelamin
  if (data.sex) $(`input[name='jenis_kelamin'][value='${data.sex}']`).prop("checked", true);
  // Telepon & Email
  if (data.mr.noTelepon) $("#telepon").val(data.mr.noTelepon);
}

function isiFormBooking() {
  const data = getSession('datapasien')?.data || {};
  const info = getSession('infopeserta') || "";
  const today = new Date().toISOString().slice(0, 10);

  if (!data) return;
  const sex =
    data.jeniskelamin === "L"
      ? "Laki-laki"
      : data.jeniskelamin === "P"
        ? "Perempuan"
        : "-";
  const value = (info === 'baru') ? 0 : (info === 'lama') ? 1 : null;
  // console.log('data: ', data);
  // Isi Form Pendaftaran Peserta Baru
  $("#nama_lengkap").val(data.nama || "");
  // $("#tempat_lahir").val(data.nama || "");
  $("#tgl_lahir").val(data.tanggallahir || "");
  $("input[name='jenis_kelamin'][value='" + sex + "']").prop("checked", true);
  $("#telepon").val(data.nohp || "");
  $("#jenis_pasien").val(data.tipe_pasien || "JKN");
  $("#no_ktp").val(data.nik || "");
  $("#nomor_kartu").val(data.nomorkartu || "");

  // Isi Form Antrean
  $("#p_kodebooking").val(data.kodebooking || "");
  $("#p_jenispasien").val(data.tipe_pasien || "JKN");
  $("#p_noKartu").val(data.nomorkartu || "");
  $("#p_nik").val(data.nik || "");
  $("#p_nohp").val(data.nohp || "");
  $("#p_kodepoli").val(data.kodepoli || "");
  $("#p_namapoli").val(data.namapoli || "");
  $("#p_pasienbaru").val(value || "");
  $("#p_norm").val(data.norm || "");
  $("#p_tanggalperiksa").val(today || data.tglKunjungan || "");
  $("#p_kodedokter").val(data.kodedokter || "");
  $("#p_namadokter").val(data.namadokter || "");
  $("#p_jampraktek").val(data.jampraktek || "");
  $("#p_jeniskunjungan").val(data.jeniskunjungan || "");
  $("#p_nomorreferensi").val(data.noKunjungan || "");
  $("#p_nomorantrean").val(data.nomorantrean || "");
  $("#p_angkaantrean").val(data.angkaantrean || "");
  $("#p_estimasidilayani").val(data.estimasidilayani || "");
  $("#kuotajkn").val(data.kuotajkn || "");
  $("#sisakuotajkn").val(data.sisakuotajkn || "");
  $("#kuotanonjkn").val(data.kuotanonjkn || "");
  $("#sisakuotanonjkn").val(data.sisakuotanonjkn != null ? data.sisakuotanonjkn : "");
  $("#p_keterangan").val(data.keterangan || "");
  $(
    "#nama_lengkap, #tgl_lahir, #telepon, #jenis_pasien, #no_ktp, #nomor_kartu," +
    "#p_kodebooking, #p_jenispasien, #p_noKartu, #p_nik, #p_nohp, #p_kodepoli, #p_namapoli," +
    "#p_norm, #p_tanggalperiksa, #p_kodedokter, #p_namadokter, #p_jampraktek," +
    "#p_jeniskunjungan, #p_nomorreferensi, #p_nomorantrean, #p_angkaantrean, #p_estimasidilayani," +
    "#kuotajkn, #sisakuotajkn, #kuotanonjkn, #sisakuotanonjkn"
  ).each(function () {
    if ($(this).val() && $(this).val().trim() !== "") {
      $(this).prop("disabled", true);
    }
  });

}

function getRujukan(data) {
  const nokartu = data;
  const url = "v_rujukanbynoka";
  const payload = { NoKartu: nokartu };
  vclaim_baru(url, "get", payload, function (err, res) {
    if (err) return Swal.fire("Server Error", "Internal Server Error", "error");
    const meta = res?.metaData || res?.metadata || {};
    const code = parseInt(meta.code);
    const msg = meta.message || "Terjadi kesalahan";
    if (code === 200) {
      saveSession("datarujukan", res.response);
    } else {
      Swal.fire("", msg, "error");
      console.error("error :", res);
    }
  });
}

$("#btnGenerate").on("click", function () {
  const data = {
    kodebooking: $("#p_kodebooking").val(),
    jenispasien: $("#p_jenispasien").val(),
    nomorkartu: $("#p_noKartu").val(),
    nik: $("#p_nik").val(),
    nohp: $("#p_nohp").val(),
    kodepoli: $("#p_kodepoli").val(),
    namapoli: $("#p_namapoli").val(),
    pasienbaru: parseInt($("#p_pasienbaru").val()),
    norm: $("#p_norm").val(),
    tanggalperiksa: $("#p_tanggalperiksa").val(),
    kodedokter: parseInt($("#p_kodedokter").val()),
    namadokter: $("#p_namadokter").val(),
    jampraktek: $("#p_jampraktek").val(),
    jeniskunjungan: parseInt($("#p_jeniskunjungan").val()),
    nomorreferensi: $("#p_nomorreferensi").val(),
    nomorantrean: $("#p_nomorantrean").val(),
    angkaantrean: parseInt($("#p_angkaantrean").val()),
    estimasidilayani: parseInt($("#p_estimasidilayani").val()),
    kuotajkn: parseInt($("#kuotajkn").val()),
    sisakuotajkn: parseInt($("#sisakuotajkn").val()),
    kuotanonjkn: parseInt($("#kuotanonjkn").val()),
    sisakuotanonjkn: parseInt($("#sisakuotanonjkn").val()),
    keterangan: $("#p_keterangan").val(),
  };

  $("#hasilJSON").text(JSON.stringify(data, null, 4));
});

// js nomor kartu
document.getElementById("jenis_pasien").addEventListener("change", function () {
  const value = this.value;

  // hide semua dulu
  document.getElementById("nomor_kartu_JKN").classList.add("d-none");
  document.getElementById("nomor_kartu_asuransi").classList.add("d-none");

  // tampilkan sesuai pilihan
  if (value === "JKN") {
    document.getElementById("nomor_kartu_JKN").classList.remove("d-none");
  } else if (value === "Asuransi") {
    document.getElementById("nomor_kartu_asuransi").classList.remove("d-none");
  }
});

// JS nama suami/istri
document.getElementById("statuskawin").addEventListener("change", function () {
  const value = this.value;

  // hide semua dulu
  document.getElementById("status_sudah_kawin").classList.add("d-none");

  // tampilkan sesuai pilihan
  if (value === "2") {
    document.getElementById("status_sudah_kawin").classList.remove("d-none");
  }
});

//
async function previewpendaftaran() {
  // Checkbox Referensi
  const referensi = [];
  if ($("#referensi_instagram").is(":checked")) referensi.push("Instagram");
  if ($("#referensi_facebook").is(":checked")) referensi.push("Facebook");
  if ($("#referensi_website").is(":checked")) referensi.push("Website");
  if ($("#referensi_tiktok").is(":checked")) referensi.push("Tiktok");
  if ($("#referensi_lainnya").is(":checked")) referensi.push("Lainnya");

  const data = {
    tipe_pasien: $("#jenis_pasien").val(),
    nomorkartu: $("#nomor_kartu").val(),
    noka_asuransi: $("#noka_asuransi").val(),
    nik: $("#no_ktp").val(),
    nama: $("#nama_lengkap").val(),
    ayah: $("#nama_ayah").val(),
    ibu: $("#nama_ibu").val(),
    tempatlahir: $("#tempat_lahir").val(),
    tanggallahir: $("#tgl_lahir").val(),
    jeniskelamin: $("input[name='jenis_kelamin']:checked").val(),
    golongandarah: $("#golongandarah").val(),
    rhesus: $("#rhesus").val(),
    agama: $("#agama").val(),
    jalan: $("#alamat_jalan").val(),
    rt: $("#rt").val(),
    rw: $("#rw").val(),
    kodekel: $("#kodekelurahan").val(),
    kelurahan: $("#kelurahan").val(),
    kodekec: $("#kodekecamatan").val(),
    kecamatan: $("#kecamatan").val(),
    kodedati2: $("#kodekabupaten").val(),
    kabupaten: $("#kabupaten").val(),
    kodeprop: $("#kodeprovinsi").val(),
    provinsi: $("#provinsi").val(),
    nohp: $("#telepon").val(),
    email: $("#email").val(),
    status: $("#statuskawin").val(),
    namapasangan: $("#nama_pasangan").val(),
    pendidikan: $("#pendidikan").val(),
    pekerjaan: $("#pekerjaan").val(),
    referensi: referensi,

  };

  if (!data.tipe_pasien) return Swal.fire("", 'Tipe Pasien belum dipilih.', 'warning');
  if (!data.nik || !data.nama) {
    Swal.fire("NIK dan Nama wajib diisi!", '', 'warning');
    return;
  }
  if (data.tipe_pasien === "JKN") {
    if (!data.nomorkartu || data.nomorkartu.trim() === "") {
      Swal.fire('Peringatan', 'Nomor kartu pasien JKN belum terisi!', 'warning');
      return; // hentikan proses selanjutnya
    }
  }
  const requiredFields = [
    { id: "#jenis_pasien", name: "Tipe Pasien" },
    { id: "#nama_lengkap", name: "Nama Lengkap" },
    { id: "#tgl_lahir", name: "Tanggal Lahir" },
    { id: "input[name='jenis_kelamin']:checked", name: "Jenis Kelamin" },
    { id: "#alamat_jalan", name: "Alamat" },
    { id: "#telepon", name: "Telepon / Nomor HP" },
    { id: "#tempat_lahir", name: "Tempat Lahir" },
  ];

  for (let field of requiredFields) {
    const value = $(field.id).val() || $(field.id).is(":checked");
    if (!value) {
      Swal.fire("", `${field.name} harus diisi!`, "warning");
      return false; // hentikan proses
    }
  }
  saveSession("previewpendaftaran", data);
  try {
    const result = await daftarpasienbaru(data);
    // console.log("hasil daftar:", result);

    saveSession("noRm", result.response.noRm);

    const res = Number(result.metaData.code);

    if (res === 200) {
      // Ambil data lama dari session
      const dataSession = getSession("previewpendaftaran");
      const serverResponse = getSession("noRm");
      const updatedData = { ...dataSession, noRm: serverResponse };
      saveSession("previewpendaftaran", updatedData);

      window.location.href = "/preview/pendaftaran";
    } else if (res === 409) {
      Swal.fire({
        title: '',
        text: result.metaData.message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Perbarui Data',
        cancelButtonText: 'Gunakan Data Lama'
      }).then((choice) => {
        if (choice.isConfirmed) {
          // Aksi update data
          pesertadipilih(); // misal panggil fungsi update form
        } else {
          // Lanjut tanpa update, pakai data lama
          window.location.href = '/sep/antrean?target=antreanpesertalama';// atau fungsi lain
        }
      });
    } else {
      Swal.fire("", "Pendaftaran gagal, silakan coba lagi.", "error");
    }
  } catch (err) {
    console.error("Gagal daftar pasien:", err);
    Swal.fire("", "Pendaftaran gagal, silakan coba lagi.", "error");
  }

};

$(document).ready(function () {
  $("input[name='pilihankartu']").on("change", function () {
    let val = $(this).val(); // hasilnya "nik" atau "noka"
    $(".bpjs, .umum").addClass("d-none");

    if (val === "bpjs_check") {
      $(".bpjs").removeClass("d-none");
      $("#tipe_pasien").val("JKN").trigger("change");
    } else if (val === "nik_check") {
      $(".umum").removeClass("d-none");
      $("#tipe_pasien").val("NON JKN").trigger("change");
    }
  });
});

// tombol pilih BPJS
function inputpesertaBPJS() {
  $("#bpjs_check").prop("checked", true).trigger("change"); // trigger change biar otomatis switch
  $("#tipe_pasien").val("JKN").trigger("change");
  tampilkan("#formPesertaBPJS");
}

// tombol pilih Non BPJS
function inputpesertaNonBPJS() {
  $("#nik_check").prop("checked", true).trigger("change"); // trigger change biar otomatis switch
  $("#tipe_pasien").val("NON JKN").trigger("change");
  tampilkan("#formPesertaBPJS");
}

function cariDataRujukan() {
  const nokartu = $("#nokartu_bpjs").val();
  const url = "v_rujukanbynoka";
  const payload = { NoKartu: nokartu };
  if (!nokartu) return Swal.fire("", "Nomor Kartu belum diisi", "info");
  vclaim_baru(url, "get", payload, function (err, res) {
    if (err) return Swal.fire("Server Error", "Internal Server Error", "error");
    const meta = res?.metaData || res?.metadata || {};
    const code = parseInt(meta.code);
    const msg = meta.message || "Terjadi kesalahan";
    const data = res.response;
    if (code === 200) {
      Swal.fire("", msg, "success");
      saveSession("datarujukan", res.response);
      $("#norujukan_bpjs").val(data.rujukan.noKunjungan);
      pilihDokter_bpjs();
      cariPasien({
        nik: data.rujukan.peserta.nik,
        nomorkartu: data.rujukan.peserta.noKartu,
        nama: data.rujukan.peserta.nama
      });
    } else {
      Swal.fire("", msg, "error");
      console.error("error :", res);
    }
  });
}

function pilihDokter_bpjs() {
  const datarujukan = getSession('datarujukan') || {};
  const poli = datarujukan?.rujukan?.poliRujukan?.kode || "-";
  const tgl = new Date().toISOString().split('T')[0];
  if (!poli) {
    return Swal.fire("Data Belum Lengkap", "Poli tidak ada", "warning");
  }
  const payload = { kodepoli: poli, tanggal: tgl };
  const url = "jadwal_dokter";
  const method = "get";
  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Gagal koneksi server', 'error');
    const meta = res.metaData || res.metadata || {};
    const data = res.response || [];
    const code = parseInt(meta.code);
    saveSession('datadokter', data);
    if (code == 200) {
      const select = $("#pilihDokter_bpjs");
      select.empty(); // Kosongkan dulu

      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          const option = `<option value="${item.kodedokter}" 
                            data-jadwal="${item.jadwal}" 
                            data-nama="${item.namadokter}"
                            data-hari="${item.hari}"
                            data-poli="${item.kodepoli}"
                            >
                            ${item.namadokter} (${item.jadwal})
                          </option>`;
          select.append(option);
        });
      } else {
        select.append(`<option disabled selected>Tidak ada jadwal tersedia</option>`);
      }
      select
        .off("change")
        .on("change", function () {
          const selected = $(this).find(":selected");
          $("#pilihDokterBpjs").val(selected.val());               // hidden input kode
          $("#jampraktekdokterbpjs").val(selected.data("jadwal")); // hidden input jam
          $("#kodePoliBpjs").val(selected.data("poli"));           // hidden input poli
        })
        .trigger("change");
    } else {
      alert(meta.message);
    }
  });
}

async function cariPasienData() {
  const keywoard = $("#no_nik").val() || '';
  const payload = { data: keywoard }
  try {
    const res = await fetch('/data/cekpasien', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    const meta = result.metaData || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';
    const pasien = result.response || [];
    if (code === 200) {
      // saveSession('datapasien', pasien);
      console.log('datapasien :', result, pasien);
      const myModal = new mdb.Modal(document.getElementById("modal-peserta-pusat"));
      myModal.show();
      // lakukan apa pun yang kamu mau di sini, misalnya update UI
    } else {
      // console.warn(`Gagal: ${msg}`);
      Swal.fire('Gagal', `${msg}`, 'error');
    }
  } catch (e) {
    console.error('Error fetch pasien:', e);
    // alert(`Request error: ${e.message}`);
  }
}


async function cariPasien(data) {
  const payload = {
    "nik": data.nik,
    "nomorkartu": data.nomorkartu,
    "nama": data.nama
  }
  try {
    const res = await fetch('/peserta/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    const meta = result.metaData || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';
    const pasien = result.response?.data || result.response || [];
    if (code === 200) {
      saveSession('datapasien', pasien);
      // lakukan apa pun yang kamu mau di sini, misalnya update UI
    } else {
      // console.warn(`Gagal: ${msg}`);
      Swal.fire('Gagal', `${msg}`, 'error');
    }
  } catch (e) {
    console.error('Error fetch pasien:', e);
    // alert(`Request error: ${e.message}`);
  }
}

 function SimpanAntrean() {
  const peserta = getSession("datapeserta") || {};
  const rawrujukan = getSession("datarujukan") || {};
  const rujukan = rawrujukan?.rujukan || rawrujukan || {};
  const pasien = getSession("datapasien") || {};
  const antrean = getSession("dataantrean") || {};
  let data = { data: { ...peserta, ...rujukan, ...pasien, ...antrean } };
  saveSession('datapasien', data);
  Swal.fire({
    title: 'Kirim antrean?',
    text: 'Data antrean akan dikirim ke server.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, kirim',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const { success, message } = await tambahAntreanKlinik();

      if (success) {
        Swal.fire('Berhasil!', message, 'success').then(() => {
          tampilkan("#formantrean");
          clearSession('datarujukan');
          clearSession('datapeserta');
          clearSession('dataantrean');
          
        });
      } else {
        Swal.fire('Info', message, 'warning');
      }
    }
  })
};

function bukaModalAntrean() {
  const myModal = new mdb.Modal(document.getElementById("modalAntrean"));
  myModal.show();
};

async function tambahAntreanKlinik() {
  const data = getSession('datapasien')?.data || {};
  const kodedokter = $("#pilihDokterBpjs").val() || $("#pilihDokterUmum").val();
  const jampraktek = $("#jampraktekdokterbpjs").val() || $("#jampraktekdokterUmum").val();
  const kodepoli = $("#kodePoliBpjs").val() || $("#kodePoliUmum").val();

  const tglPeriksa = new Date().toISOString().slice(0, 10);
  const payload = {
    nomorkartu: data.nomorkartu,
    nama: data.nama,
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
     return { success: true, message: msg };
    } else {
      return { success: false, message: msg };
    }
  } catch (e) {
    console.error('Error fetch pasien:', e);
    return { success: false, message: e.message || 'Error tidak diketahui' };
  }
}


function TambahAntreanBPJS() {
  const data = getSession('dataantrean')?.data || "";
  const info = getSession('infopeserta') || "";
  const payload = {
    kodebooking: $("#p_kodebooking").val(),
    jenispasien: $("#p_jenispasien").val(),
    nomorkartu: $("#p_noKartu").val(),
    nik: $("#p_nik").val(),
    nohp: $("#p_nohp").val(),
    kodepoli: $("#p_kodepoli").val(),
    namapoli: $("#p_namapoli").val(),
    pasienbaru: info?.pasienbaru,
    norm: $("#p_norm").val(),
    tanggalperiksa: $("#p_tanggalperiksa").val(),
    kodedokter: parseInt($("#p_kodedokter").val()),
    namadokter: $("#p_namadokter").val(),
    jampraktek: $("#p_jampraktek").val(),
    jeniskunjungan: parseInt($("#p_jeniskunjungan").val()),
    nomorreferensi: $("#p_nomorreferensi").val(),
    nomorantrean: $("#p_nomorantrean").val(),
    angkaantrean: parseInt($("#p_angkaantrean").val()),
    estimasidilayani: parseInt($("#p_estimasidilayani").val()),
    kuotajkn: parseInt($("#kuotajkn").val()),
    sisakuotajkn: parseInt($("#sisakuotajkn").val()),
    kuotanonjkn: parseInt($("#kuotanonjkn").val()),
    sisakuotanonjkn: parseInt($("#sisakuotanonjkn").val()),
    keterangan: $("#p_keterangan").val(),
  };
  if (!payload.jeniskunjungan) return Swal.fire('', 'Silahkan pilih jenis kunjungan', 'info');
  const url = "antrean_add";
  const method = "post";

  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Gagal koneksi server', 'error');
    const meta = res.metaData || res.metadata || {};
    const data = res.response || [];
    const code = parseInt(meta.code);
    console.log('data diterima: ', res);
    if (code == 200) {
      Swal.fire('', meta.message, 'success').then(() => {
        clearSession('datapasien');
        clearSession('datadokter');
        window.location.replace("/sep?pembuatansep=true");
      });
    } else {
      Swal.fire('', meta.message, 'warning');
      //
    }
  });
}

// Fungsi Update Waktu antrean
async function UpdateWaktuAntrean() {

  const payload = { kodebooking: '', taksid: '', waktu: '', jenisresep: '' };
  const url = "antrean_update";
  const method = "post";

  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Gagal koneksi server', 'error');
    const meta = res.metaData || res.metadata || {};
    const data = res.response || [];
    const code = parseInt(meta.code);

    if (code == 200) {
      Swal.fire('', meta.message, 'success').then(() => {
        window.location.replace("/sep/antrean");
      });
    } else {
      Swal.fire('', meta.message, 'warning');
      //
    }
  });
}

