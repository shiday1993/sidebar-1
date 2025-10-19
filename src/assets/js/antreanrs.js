function openAdmisi() {
  loadReferenceData("dokter", "ref/dokter", function () {
    loadReferenceData("poli", "ref/poli", function () {
      tampilkan("#dash_poli");
      window.open("/dash_admisi?tampilkan=dash_poli", "_blank");
    });
  });
}

function openAdmisiLoket() {
  window.location.href = "/tambahantrian"; 
}

function pesertaBPJS() {
  tampilkan("#formPesertaBPJS");
  window.open("/dash_admisi?tampilkan=formPesertaBPJS", "_blank");
}

function openBox() {
  const poli = $("#consoleBoxOpsi").val();
  if (poli === "admisi") {
    // arahkan ke form peserta BPJS
    const modal = new mdb.Modal(document.getElementById("consoleBoxAdmisi"));
    modal.show();
  } else if (poli === "farmasi") {
    const modal = new mdb.Modal(document.getElementById("consoleBoxFarmasi"));
    modal.show();
  } else { return; };
}

function bukaPesertaBaru() {
  const modal = mdb.Modal.getInstance(document.getElementById("consoleBoxAdmisi"));
  if (modal) {
    modal.hide();
  }
  tampilkan("#pesertabaru");
};

function bukaPesertaLama() {
  Swal.fire("Info", 'Pastikan Anda pernah mendapatkan pelayanan <= 5 tahun atau memiliki No. Rekam Medis di KLINIK UTAMA KL', 'info').then(() => {
    const modal = mdb.Modal.getInstance(document.getElementById("consoleBoxAdmisi"));
    if (modal) {
      modal.hide();
    }
    tampilkan("#pesertalama");
  });
}

function pesertaCheckIn() {
  const modal = new mdb.Modal(document.getElementById("checkInPeserta"));
  modal.show();
};

function loadReferenceData(key, url, callback) {
  if (localStorage.getItem(key)) {
    if (typeof callback === "function") callback();
  } else {
    antrol_rs(url, "get", {}, function (err, res) {
      const meta = res.metaData || res.metadata || {};
      const data = res.response || res.response?.list;

      if (!err && meta.message === "OK" && data) {
        localStorage.setItem(key, JSON.stringify(data));
      }
      if (typeof callback === "function") callback();
    });
  }
}

//Check In Peserta
function checkIn() {
  antreanBooking(() => {
    const modal = mdb.Modal.getInstance(document.getElementById("checkInPeserta"));
    if (modal) {
      modal.hide();
    }
  });
};

//Tambah antrean farmasi
function tambahAntreanFarmasi() {
  tambahAntrean_Farmasi(() => {
    const modal = mdb.Modal.getInstance(document.getElementById("consoleBoxFarmasi"));
    if (modal) {
      modal.hide();
    }
  });
};

//Fungsi List Waktu 
function getListTask() {
  const kode = $("#kode_booking_task_id").val();
  if (!kode) return Swal.fire('', 'Kode Booking belum terisi!', 'warning');
  const payload = { 'kodebooking': kode };
  const url = `get_listtask`;
  const method = "post";
  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');

    console.log("ok: ", res, " error: ", err);
    const meta = res?.metaData || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';

    const render = (listData) => {
      const columns = [
        { label: "No.", key: "index" },
        { label: "Task ID", key: "taskid" },
        { label: "Waktu RS", key: "wakturs" },
        { label: "Waktu", key: "waktu" },
        { label: "Task", key: "taskname" },
        { label: "Kode Booking", key: "kodebooking" }
      ];
      const actions = [
        {
          label: "Detail",
          class: "btn-primary",
          keyId: "kodebooking",
          onclick: "lihatDetailRiwayat"
        }
      ];
      renderTable("#tabelWaktuTask", listData, columns, actions);
    };

    if (code === 200) {
      Swal.fire('', msg, 'success').then((result) => {
        saveSession("", res.response);
        if (result.isConfirmed) {
          const data = res.response.list || [];
          render(data);
        }
      });
    } else {
      Swal.fire('', msg, 'warning');
      clearSession("");
      const dummy = getDummy("taskid")?.response?.list || [];
      render(dummy);
    }
  });
};

function lihatDetailRiwayat(kodebooking) {
  alert("Kode Booking: " + kodebooking);
}

function listWaktuTask(onSuccess) {
  const kode = $("#kodebooking").val() || $("#kodeBooking_add").val() || "";
  if (!kode) return Swal.fire('', 'Kode Booking belum terisi!', 'warning');
  const payload = { 'kodebooking': kode };
  const url = `get_listtask`;
  const method = "post";
  antrol_rs(url, method, payload, function (err, res) {
    if (err) {
      return Swal.fire('Server Error', 'Internal Server Error', 'error');
    }
    // console.log("ok: ", res, " error: ", err);
    const meta = res?.metaData || res?.metadata || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';

    if (code === 200) {
      Swal.fire('', msg, 'success').then((result) => {
        saveSession("", res.response);
        if (result.isConfirmed && typeof onSuccess === "function") {
          onSuccess();
        }
      });
    } else if (code === 201) {
      Swal.fire('', msg, 'info').then((result) => {
        const hasil = getDummy("")?.response;
        saveSession("", hasil);
        if (result.isConfirmed && typeof onSuccess === "function") {
          onSuccess();
        }
      });
    } else if (code === 204) {
      Swal.fire('Tidak Ada Data', msg, 'warning');
    } else {
      Swal.fire('Data Error', msg, 'error');
    }
  });
}

// FUngsi Tambah antrean Farmasi
function tambahAntrean_Farmasi(onSuccess) {
  const kode = $("#kodeBooking").val();
  const resep = $("#jenisResep").val();
  const nomor = $("#nomorAntreanFarmasi").val();
  const ket = $("#keteranganFarmasi").val() || '';

  if (!kode) return Swal.fire('', 'Kode Booking belum terisi!', 'warning');
  if (!resep) return Swal.fire('', 'Jenis Resep belum dipilih!', 'warning');;
  if (!nomor) return Swal.fire('', 'Nomor Antrean belum terisi!', 'warning');;

  const payload = {
    'kodebooking': kode,
    'jenisresep': resep,
    'nomorantrean': nomor,
    'keterangan': ket
  };
  // console.log(payload);
  const url = `farmasi_add`;
  const method = "post";
  antrol_rs(url, method, payload, function (err, res) {
    if (err) {
      return Swal.fire('Server Error', 'Internal Server Error', 'error');
    }
    // console.log("ok: ", res, " error: ", err);
    const meta = res?.metaData || res?.metadata || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';

    if (code === 200) {
      Swal.fire('', msg, 'success').then((result) => {
        saveSession("", res.response);
        if (result.isConfirmed && typeof onSuccess === "function") {
          onSuccess();
        }
      });
    } else if (code === 201) {
      Swal.fire('', msg, 'info').then((result) => {
        const hasil = getDummy("")?.response;
        saveSession("", hasil);
        if (result.isConfirmed && typeof onSuccess === "function") {
          onSuccess();
        }
      });
    } else if (code === 204) {
      Swal.fire('Tidak Ada Data', msg, 'warning').then((result) => {
        if (result.isConfirmed && typeof onSuccess === "function") {
          onSuccess();
        }
      });
    } else {
      Swal.fire('Data Error', msg, 'error');
    }
  });
}

//Fungsi Referensi Dokter
function ref_dokter() {
  const payload = {};
  const url = `ref_dokter`;
  const method = "get";

  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
    const meta = res.metaData || res.metadata || {};
    const data = res.response || res.response.list;

    if (meta.message === "OK") {
      Swal.fire('', meta.message, 'success');
      const tbody = $("#tabelDokter tbody");
      saveSession("dokter", data);
      tbody.empty();
      // console.log(data);
      data.forEach((item, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${item.kodedokter}</td>
            <td>${item.namadokter}</td>
          </tr>`;
        tbody.append(row);
      });
    } else {
      Swal.fire('Gagal', meta.message, 'error');
    }
  });
};

//Fungsi Referensi Poli
function ref_poli() {
  antrol_rs("ref_poli", "get", {}, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
    // console.log(res);

    const meta = res.metaData || res.metadata || {};
    const data = res.response || res.response?.list;
    if (meta.message === "OK") {
      Swal.fire('', meta.message, 'success');
      const tbody = $("#tabelPoli tbody");
      tbody.empty();
      // console.log(data);
      data.forEach((item, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${item.nmpoli}</td>
            <td>${item.nmsubspesialis}</td>
            <td>${item.kdsubspesialis}</td>
            <td>${item.kdpoli}</td>
          </tr>`;
        tbody.append(row);
      });
    } else {
      Swal.fire('Gagal', meta.message, 'error');
    }
  });
}

function ref_poli_select() {
  const select = $("#pilihPoli");
  const selectedValue = $("#kodePoliPilih").val();
  select.empty(); 

  const data = getLocal("dataPoli");
  // console.log("dataPoli", data);

  if (data && data.length > 0) {
    data.forEach(item => {
      const option = `<option value="${item.kodepoli}" data-sub="${item.kodesubspesialis}">
        ${item.namapoli} - ${item.namasubspesialis}
      </option>`;
      select.append(option);
    });
     if (selectedValue) {
      // set ulang pilihan ke value sebelumnya
      select.val(selectedValue).trigger('change');
    } else {
      select.prepend('<option value="" selected>-- Pilih Poli --</option>');
    }
  } else {
    select.append('<option value="">-- Pilih Poli --</option>');
  }
}


$('#pilihPoli').on('change', function () {
  const $selected = $(this).find('option:selected');
  if (!$selected.length) return;

  const selectedText = $selected.text();
  const kodePoli = $selected.val();
  const subspesialis = $selected.data('sub');

  // console.log('Dipilih:', selectedText, '| Sub:', subspesialis, '| kdPoli: ', kodePoli);

  $("#kodePoliPilih").val(kodePoli);
  ref_dokter_select(kodePoli);
});

function ref_dokter_select(kodepoli) {
  const poli = kodepoli || $("#kodePoliPilih").val();

  if (!poli) {
    return Swal.fire("Data Belum Lengkap", "Poli belum dipilih!", "warning");
  }
  const dokterData = getLocal("jadwalDokter") || [];
  const dokterList = dokterData.filter(item => item.kodepoli === poli);

  const select = $("#pilihDokter");
  select.empty(); // kosongin dulu

  if (dokterList.length > 0) {
    dokterList.forEach(item => {
      const option = `<option value="${item.kodedokter}" 
                        data-jadwal="${item.jadwal || ''}" 
                        data-nama="${item.namadokter || ''}"
                        data-hari="${item.hari || ''}">
                        ${item.namadokter} ${item.jadwal ? `(${item.jadwal})` : ''}
                      </option>`;
      select.append(option);
    });
  } else {
    select.append(`<option disabled selected>Tidak ada jadwal tersedia</option>`);
  }
}

$('#pilihDokter').on('change', function () {
  const dokter = $(this).val();
  const nama = $(this).find('option:selected').data('nama');
  const jadwal = $(this).find('option:selected').data('jadwal');
  const hari = $(this).find('option:selected').data('hari');

  // console.log(`Dokter: ${dokter} - ${nama}, Jadwal: ${jadwal}, Hari: ${hari}`);
});


$('#petugasPemanggil').on('click', function (e) {
  e.preventDefault(); // ini penting kalau di dalam form
  pemanggil();
  ref_poli_select();

});


function pemanggil() {
  let pilih = $("#pemanggil").val();
  switch (pilih) {
    case "admisi":
      tampil("#admisi");
      break;
    case "farmasi":
      tampil("#farmasi");
      break;
    case "poli":
      tampil("#poli");
      break;
    // bisa lanjut tambah case lainnya
  }
};

function tampil(id) {
  $(".pilihan").addClass("d-none");
  $(id).removeClass("d-none");
  sessionStorage.setItem("tampil", id);
};

function showForm(kartu) {
  if (kartu === "noka") {
    $("#formBPJS").removeClass("d-none");
    $(".bpjs").removeClass("d-none");

    $("#formUMUM").addClass("d-none");
    $(".umum").addClass("d-none");
  } else {
    $("#formUMUM").removeClass("d-none");
    $(".umum").removeClass("d-none");

    $("#formBPJS").addClass("d-none");
    $(".bpjs").addClass("d-none");
  }
}

$(document).ready(function () {
  const kartuAwal = $('input[name="kartu"]:checked').val();
  showForm(kartuAwal);

  $('input[name="kartu"]').on('change', function () {
    const kartu = $(this).val();
    showForm(kartu);
  });
});


//Fungsi Referensi Dokter
function ref_jadwal_dokter() {
  const poli = $("#kodePoliJadwalDokter").val();
  const tgl = $("#tglJadwalDokter").val();
  if (!poli || !tgl) { Swal.fire("", 'Poli dan Tanggal belum terisi. Harap Periksa data kembali!'), 'warning' }

  const payload = { kodepoli: poli, tanggal: tgl };
  const url = "jadwal_dokter";
  const method = "get";

  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
    const meta = res.metaData || res.metadata || {};
    const data = res.response || res.response.list;

    if (meta.code === "200") {
      Swal.fire('', meta.message, 'success');
      const tbody = $("#tabelJawdalDokter tbody");
      tbody.empty();
      // console.log(data);
      data.forEach((item, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${item.kodedokter}</td>
            <td>${item.namadokter}</td>
          </tr>`;
        tbody.append(row);
      });
    } else {
      Swal.fire('Gagal', meta.message, 'error');
    }
  });
};

//Fungsi Dashboard Per Tanggal
function dashtanggal() {
  const today = new Date().toISOString().split("T")[0];
  const waktu = $("#waktu_d_tanggal").val() || 'server';
  const tanggal = $("#tgl_d_tanggal").val() || today;

  if (!waktu) return Swal.fire("", "Harap Pilih tanggal dan waktu!", 'warning');
  if (!tanggal) return Swal.fire("", "Harap Pilih tanggal dan waktu!", 'warning');

  const payload = { waktu, tanggal };
  const url = "dashboard_tanggal";
  const method = "get";

  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');

    const meta = res.metadata || res.metaData || {};
    const { code, message } = meta;

    if (code === "200" || code === 200) {
      const hasil = res.response;
      Swal.fire('', message, 'success').then((result) => {
        saveSession("", hasil);
        if (result.isConfirmed) {
          // Tambahkan aksi sukses disini
        }
      });
    } else if (code === "201" || code === 201) {
      Swal.fire('', message, 'info').then((result) => {
        const hasil = getDummy("")?.response;
        saveSession("", hasil);
        if (result.isConfirmed) {
          // Tambahkan aksi dummy disini
        }
      });
    } else {
      Swal.fire('', message || 'Terjadi kesalahan', 'error');
      console.error('res error detail:', res);
    }
  });
};

function dashbulan() {
  const waktu = $("#waktu_bulan").val() || "server";
  const bulan = $("#d_bulan").val();
  const tahun = $("#d_tahun").val();

  if (!bulan) return Swal.fire("", "Harap Pilih Bulan!", 'warning');
  if (!tahun) return Swal.fire("", "Harap Pilih Tahun", 'warning');
  const payload = { waktu, bulan, tahun };
  const url = "dashboard_bulan";
  const method = "get";

  antrol_rs(url, method, payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');

    // console.log('error :', err, 'berhasil: ', res);

    const meta = res.metadata || res.metaData || {};
    const { code, message } = meta;

    // console.log("URL:", url);

    if (code === "200" || code === 200) {
      const hasil = res.response;
      // console.log("hasil :", hasil);
      Swal.fire('', message, 'success').then((result) => {
        saveSession("", hasil);
        if (result.isConfirmed) {
          // Tambahkan aksi sukses disini-bpjs

        }
      });
    } else if (code === "201" || code === 201) {
      Swal.fire('', message, 'info').then((result) => {
        const hasil = getDummy("")?.response;
        saveSession("", hasil);
        if (result.isConfirmed) {
          // Tambahkan aksi dummy disini
        }
      });
    } else {
      Swal.fire('', message || 'Terjadi kesalahan', 'error');
      // console.error('res error detail:', res);
    }
  });
};

function antreanBooking(onSuccess) {
  const kodebooking = $("#kodeBooking_add").val();
  if (!kodebooking) {

  }
  const payload = { kodebooking };
  const url = "antrean_perbooking";
  const method = "get";
  antrol_rs(url, method, payload, function (err, res) {
    if (err) {
      return Swal.fire('Server Error', 'Internal Server Error', 'error');
    }
    // console.log("ok: ", res, " error: ", err);
    const meta = res?.metaData || res?.metadata || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';

    if (code === 200) {
      Swal.fire('', msg, 'success').then((result) => {
        saveSession("", res.response);
        if (result.isConfirmed && typeof onSuccess === "function") {
          onSuccess();
        }
      });
    } else if (code === 201) {
      Swal.fire('', msg, 'info').then((result) => {
        const hasil = getDummy("")?.response;
        saveSession("", hasil);
        if (result.isConfirmed && typeof onSuccess === "function") {
          onSuccess();
        }
      });
    } else if (code === 204) {
      Swal.fire('Tidak Ada Data', msg, 'warning');
    } else {
      Swal.fire('Data Error', msg, 'error');
    }
  });
}

//Fungsi Tambah Antrean
function tambah_antrean() {
  const payload = {
    "request": {
      "kodebooking": "16032021A001",
      "jenispasien": "JKN",
      "nomorkartu": "00012345678",
      "nik": "3212345678987654",
      "nohp": "085635228888",
      "kodepoli": "ANA",
      "namapoli": "Anak",
      "pasienbaru": 0,
      "norm": "123345",
      "tanggalperiksa": "2021-01-28",
      "kodedokter": 12345,
      "namadokter": "Dr. Hendra",
      "jampraktek": "08:00-16:00",
      "jeniskunjungan": 1,
      "nomorreferensi": "0001R0040116A000001",
      "nomorantrean": "A-12",
      "angkaantrean": 12,
      "estimasidilayani": 1615869169000,
      "sisakuotajkn": 5,
      "kuotajkn": 30,
      "sisakuotanonjkn": 5,
      "kuotanonjkn": 30,
      "keterangan": "Peserta harap 30 menit lebih awal guna pencatatan administrasi."
    }
  }
  antrol_rs("antrean_add", "post", payload, function (err, res) {
    if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
    console.log(res, 'error', err);

    const meta = res.metaData || res.metadata || {};
    const data = res.response || res.response?.list;
    if (parseInt(meta.code) === 200) {
      Swal.fire('', meta.message, 'success');
    } else {
      Swal.fire('Gagal', meta.message, 'error');
    }
  });
}