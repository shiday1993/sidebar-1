//
function batal() {
    window.location.replace("/rencana?sep_list=true");
};

$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sep_list') === 'true') {
        tampilkan('#sep_list');
    }
});
 

$(document).ready(function() {
    function toggleForm() {
        const pilihan = $('input[name="rencana"]:checked').val();

        if (pilihan === "1") {
            $('#carirencanaKartu').removeClass('d-none');
            $('#carirencanaSep').addClass('d-none');
        } else if (pilihan === "2") {
            $('#carirencanaSep').removeClass('d-none');
            $('#carirencanaKartu').addClass('d-none');
        }
    }
    toggleForm();
    $('input[name="rencana"]').change(function() {
        toggleForm();
    });
});

function insertSPRI() {
    const modal = mdb.Modal.getInstance(document.getElementById('resultSep'));
    modal.hide();
    tampilkan("#rencanaForm");
    tampilkanModeInsert();
    isiDataForm();
};

//
function isEmpty(value) { return value === null || value === undefined || value === ""; }

function safeText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = isEmpty(value) ? "-" : value;
}
function safeValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = isEmpty(value) ? "" : value;
}

function setFormEditable(editable) {
    $("#rencanaForm :input").each(function () {
        if ($(this).data("editable")) {
            $(this).prop("disabled", !editable);
        } else {
            $(this).prop("disabled", true);
        }
    });
}
function showOnly(target) {
    $("#insert, #update, #kontrolView").addClass("d-none");
    $(target).removeClass("d-none");
}
function setButton(state) {
    $("#btn-simpan-sep, #btn-hapus-sep, #btn-update-sep, #btn-edit-sep, #btn-print-sep, .btn-tampil").prop("disabled", !state);
}
function tampilkanModeView() {
    formMode = 'view';
    setFormEditable(false);
    setButton(true);
    showOnly("#kontrolView");
}
function tampilkanModeInsert() {
    formMode = 'insert';
    setFormEditable(true);
    setButton(true);
    showOnly("#insert");
}
function aktifkanEditMode() {
    formMode = 'update';
    setFormEditable(true);
    setButton(true);
    showOnly("#update");
}
$("#btn-edit-sep").on("click", function () { aktifkanEditMode(); });

//fungsi isi data Modal
function isiDataModal(data) {
    saveSession("rencanaKontrol", data);
    const modal = new mdb.Modal(document.getElementById('resultSep')); modal.show();

    $("#sepNo").text(data?.noSep || "-");
    $("#noRujukan").text(data.provPerujuk?.noRujukan || "-");
    $("#sepDate").text(data?.tglSep || "-");
    $("#serviceType").text(data?.jnsPelayanan || "-");
    $("#diagnosis").text(data?.diagnosa || "-");
    $("#poliModal").text(data?.poli || "-");
    $("#namaPeserta").text(data.peserta?.nama || '-');
    $("#cardNumber").text(data.peserta?.noKartu || "-");
    $("#nmProviderPerujuk").text(data.provPerujuk?.nmProviderPerujuk || "-");
    $("#tglLahirModal").text(data.peserta?.tglLahir || "-");
    $("#rujukanDate").text(data.provPerujuk?.tglRujukan || "-");

};

//fungsi isi data Form
function isiDataForm() {
    const data = getSession("rencanaKontrol");
    const kelamin = data.peserta?.kelamin === "L" ? "Laki-laki" : data.peserta?.kelamin === "P" ? "Perempuan" : "-";
    const map = {
        nomorSep: data.noSep,
        tanggalSep: data.tglSep,
        jnsPelayanan: data.jnsPelayanan,
        diagnosa: data.diagnosa,
        poli: data.poli,
        noSepRujukan: data.provPerujuk?.noRujukan,
        tglRujukan: data.provPerujuk?.tglRujukan,
        ppk: data.provPerujuk?.nmProviderPerujuk,
        nama: data.peserta?.nama,
        noKartu: data.peserta?.noKartu,
        tgl_lahir: data.peserta?.tglLahir,
        jenisKelamin: kelamin,
        kelasHak: data.peserta?.hakKelas,
        ppkPerujuk: data.provPerujuk?.nmProviderPerujuk,
        tglRencanaKontrol: data.provPerujuk?.tglRujukan,
        noSuratKontrol: data?.noSurat,
        kodeSpesialis: data?.kodeSpesialis,
        namaSpesialis: data?.poli,

    };

    Object.keys(map).forEach(id => {
        const el = $("#" + id);
        if (el.is("input, textarea, select")) {
            el.val(map[id] || '');
        } else {
            el.text(map[id] || '');
        }
    });
};

// Cari SEP
function cariSep() {
    const noSep = $("#noSep").val().trim();
    const radio = $('input[name="rencana"]:checked').val();
    if (!noSep) {
        Swal.fire("", "Nomor SEP tidak boleh kosong!", "warning"); return;
    };
    if (!radio) {
        Swal.fire("", "Pilih jenis rencana kontrol!", "warning"); return;
    };
    let endpoint = "v_carisepSPRI";
    vclaim_baru(endpoint, "get", {nosep: noSep}, function (err, res) {
        const code = res.metaData?.code;
        const msg = res.metaData?.message;
        if (err) {
            Swal.fire("Server Error", "Gagal memproses data.", "error");
            return;
        };
        if (code === "200") {
            Swal.fire("", msg, "success").then(() => {
                let data = res?.response || {};
                isiDataModal(data);
            })
        };
        if (code === "201") {
            Swal.fire("", msg, "warning").then(() => {
                let data = getDummy("seprencana").response || {};
                isiDataModal(data);
            });
        } else {
            Swal.fire("", msg, "error"); return;
        }
    })
};

function cariKartu() {
    const noKartu = $("#noKartuRencana").val();
    const bulan = $("#bulanRencana").val();
    const tahun = $("#tahunRencana").val();
    const filter = $("#filterRencana").val();

    if (!noKartu) {
        Swal.fire("", "Nomor Kartu tidak boleh kosong!", "warning"); return;
    } else if (!bulan) {
        Swal.fire("", "Silahkan pilih bulan.", "warning"); return;
    } else if (!tahun) {
        Swal.fire("", "Silahkan pilih tahun", "warning"); return;
    } else if (!filter) {
        Swal.fire("", "Silahkan pilih filter", "warning");
    };
    const payload = {Bulan: bulan, Tahun: tahun, Nokartu: noKartu, filter: filter}
    let endpoint = "v_datasuratkontrolkartu";
    // console.log("endpoint:", endpoint)
    vclaim_baru(endpoint, "get", payload, function (err, res) {
        const code = res.metaData?.code;
        const msg = res.metaData?.message;
        if (err) {
            Swal.fire("Server Error", "Gagal memproses data.", "error");
            return;
        };
        if (code === "200") {
            Swal.fire("", msg, "success").then(() => {
                let data = res?.response || {};
                isiTabelKontrol(data);
                $('#cariByKartu').removeClass('d-none');
            })
        };
        if (code === "201") {
            Swal.fire("", msg, "warning").then(() => {
                let data = getDummy("suratkontrolkartu").response || {};
                isiTabelKontrol(data);
                $('#cariByKartu').removeClass('d-none');
            });
        } else {
            Swal.fire("", msg, "error"); return;
        }
    })
};
// Cari Data Nomor Surat Kontrol
function getListRencana() {
    const tglAwal = $("#tglAwal").val();
    const tglAkhir = $("#tglAkhir").val();
    const filter = $("#filter").val();

    if (!tglAwal && !tglAkhir) {
        Swal.fire("", "Harap pilih tanggal untuk melanjutkan!", "warning");
        return;
    };
    if (!filter) {
        Swal.fire("", "Pilih jenis Filter!", "warning");
        return;
    };
    const payload ={ tglAwal: tglAwal, tglAkhir: tglAkhir, filter: filter}
    let endpoint ="v_datasuratkontrol";
    vclaim_baru(endpoint, "get", payload, function (err, res) {
        const code = res.metaData?.code;
        const msg = res.metaData?.message;
        if (err) {
            Swal.fire("Server Error", "Gagal memproses data.", "error");
            return;
        };
        if (code === "200") {
            Swal.fire("", msg, "success").then(() => {
                let data = res?.response || {};
                isiDataTabel(data);
            })
        };
        if (code === "201") {
            Swal.fire("", msg, "warning").then(() => {
                let data = getDummy("listsuratkontrol").response || {};
                isiDataTabel(data);
            });
        } else {
            Swal.fire("", msg, "error"); return;
        }
    })
};


function cariSepInternal() {
    const jenis = $("#jenisKontrol").val();
    const tgl = $("#tanggalKontrol").val();
    const nomor = $("#nomorKontrol").val();
    const payload = {JnsKontrol: jenis, nomor: nomor, TglRencanaKontrol: tgl};

    const url = "v_datapolispesialis"; // Ganti dengan endpoint
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            Swal.fire('Server Error', 'Internal Server Error', 'error');
            return;
        }
        const code = res.metaData.code;
        const msg = res.metaData.message;
        if (code === "200") {
            const hasil = res.response;
            Swal.fire('', msg, 'success').then((result) => {
                saveSession("", hasil);
                if (result.isConfirmed) {
                    modalDokter(hasil);
                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("")?.response;
                saveSession("", hasil);
                if (result.isConfirmed) {
                    modalDokter(hasil)
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};

//Cari Dokter (rencana kontrol)
function cariDokterPoli() {
    const jenis = $("#jenisPelayanan").val();
    const tgl = $("#tglRencanaKontrol").val();
    const poli = $("#kodeSpesialis").val();
    const payload = {JnsKontrol: jenis, KdPoli: poli, TglRencanaKontrol: tgl};

    const url ="v_datadokter";
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            Swal.fire('Server Error', 'Internal Server Error', 'error');
            return;
        }
        const code = res.metaData.code;
        const msg = res.metaData.message;
        if (code === "200") {
            const hasil = res.response;
            Swal.fire('', msg, 'success').then((result) => {
                saveSession("jadwalDokter", hasil);
                if (result.isConfirmed) {
                    tampilJadwal();
                    // const modal = mdb.Modal.getInstance($("#modalSpesialistik")[0]); modal.hide();
                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("dokterrencana")?.response;
                saveSession("jadwalDokter", hasil);
                if (result.isConfirmed) {
                    tampilJadwal();
                    // const modal = mdb.Modal.getInstance($("#modalSpesialistik")[0]); modal.hide();
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};

// Cari Data Spesialistik / Poli
function cariPoli() {
    const jenis = $("#jenisPelayanan").val();
    const nomor = (jenis == 2) ? $("#nomorSep").text() : $("#noKartu").text();
    const tgl = $("#tglRencanaKontrol").val();
     const payload ={ JnsKontrol: jenis, nomor: nomor, TglRencanaKontrol: tgl}
    let url ="v_datapolispesialis";
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)
    // console.log(url);
    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            Swal.fire('Server Error', 'Internal Server Error', 'error');
            return;
        }
        const code = res.metaData.code;
        const msg = res.metaData.message;
        if (code === "200") {
            const hasil = res.response;
            Swal.fire('', msg, 'success').then((result) => {
                saveSession("poliRencana", hasil);
                if (result.isConfirmed) {
                    modalSpesialistik();
                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("polirencana")?.response;
                saveSession("poliRencana", hasil);
                // console.log(hasil);
                if (result.isConfirmed) {
                    modalSpesialistik();
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};


function isiTabelKontrol(response) {
    const list = response.list || [];
    let html = "";

    if (list.length === 0) {
        html = `<tr><td colspan="11" class="text-center">Tidak ada data</td></tr>`;
    } else {
        list.forEach((item, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.noSuratKontrol}</td>
                    <td>${item.jnsPelayanan}</td>
                    <td>${item.jnsKontrol} - ${item.namaJnsKontrol}</td>
                    <td>${item.tglRencanaKontrol}</td>
                    <td>${item.noSepAsalKontrol}</td>
                    <td>${item.namaPoliTujuan}</td>
                    <td>${item.namaDokter}</td>
                    <td>${item.noKartu}</td>
                    <td>${item.nama}</td>
                    <td>${item.terbitSEP}</td>
                </tr>
            `;
        });
    }

    $("#listRencanaKontrol").html(html);
}

function isiDataTabel(response) {
    const list = response.list||[];   
    let html = "";
    if (list.length === 0) {
        html = `<tr><td colspan="11" class="text-center">Tidak ada data.</td></tr>`;
    } else {
        list.forEach((item, index) => {
            const kontrol = (item.jnsKontrol == 2) ? "Kontrol" : "Inap";
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <button type="button" class="btn btn-secondary"  data-mdb-ripple-init data-mdb-ripple-color="dark" onclick="">
                            ${item.noSuratKontrol}
                        </button>
                    </td>
                    <td>${kontrol}</td>
                    <td>${item.tglRencanaKontrol}</td>
                    <td>${item.tglTerbitKontrol}</td>
                    <td>${item.noSepAsalKontrol}</td>
                    <td>${item.namaPoliAsal}</td>
                    <td>${item.namaPoliTujuan}</td>
                    <td>${item.namaDokter}</td>
                    <td>${item.noKartu}</td>
                    <td>${item.nama}</td>
                </tr>
            `;
        });
    };

    $("#listSuratKontrol").html(html);
}

function modalDokter(data){
    const list = data.list||[];   
    let html = "";
    if (list.length === 0) {
        html = `<tr><td colspan="11" class="text-center">Tidak ada data.</td></tr>`;
    } else {
        list.forEach((item, index) => {
            const kontrol = (item.jnsKontrol == 2) ? "Kontrol" : "Inap";
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <button type="button" class="btn btn-secondary"  data-mdb-ripple-init data-mdb-ripple-color="dark" onclick="">
                            ${item.noSuratKontrol}
                        </button>
                    </td>
                    <td>${kontrol}</td>
                    <td>${item.tglRencanaKontrol}</td>
                    <td>${item.tglTerbitKontrol}</td>
                    <td>${item.noSepAsalKontrol}</td>
                    <td>${item.namaPoliAsal}</td>
                    <td>${item.namaPoliTujuan}</td>
                    <td>${item.namaDokter}</td>
                    <td>${item.noKartu}</td>
                    <td>${item.nama}</td>
                </tr>
            `;
        });
    };
    
    $("#jadwalDokter").html(html);
}

function tampilJadwal(){ 
    $("#jadwalDokter").removeClass("d-none");
    const list = getSession("jadwalDokter").list ||[];
    let html = "";
    if (list.length === 0) {
        html = `<tr><td colspan="5" class="text-center">Tidak ada data.</td></tr>`;
    } else {
        list.forEach((item, index) => {
           html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.namaDokter}</td>
                    <td>${item.jadwalPraktek}</td>
                    <td>${item.kapasitas}</td>
                    <td>
                        <button type="button" class="btn btn-primary btn-pilih-dokter"  
                        data-kode="${item.kodeDokter}" data-nama="${item.namaDokter}">
                        <i class="fas fa-circle-check me-2"></i>Pilih</button>
                        </td>
                </tr>
            `;
        });
    };
    $("#jadwalPraktekDokter").html(html);
};

$(document).on('click', '.btn-pilih-dokter', function() {
    const kode = $(this).data('kode');
    const nama = $(this).data('nama');
    console.log("Dokter dipilih:", kode);
    console.log("Dokter dipilih:",  nama);
    $("#kodeDokter").val(kode);
    $("#dpjpTujuan").val(nama);
    tampilkan("#rencanaForm");
});


function modalSpesialistik(){
    tampilkan('#jadwalPraktek')
    const list = getSession("poliRencana").list||[];  
    // console.log(list); 
    let html = "";
    if (list.length === 0) {
        html = `<tr><td colspan="5" class="text-center">Tidak ada data.</td></tr>`;
    } else {
        list.forEach((item, index) => {
           html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                       <button class="btn btn-secondary btn-pilih-poli"
                            data-kode="${item.kodePoli}" 
                            data-nama="${item.namaPoli}">
                            ${item.kodePoli} - ${item.namaPoli}
                        </button>
                    </td>
                    <td>${item.kapasitas}</td>
                    <td>${item.jmlRencanaKontroldanRujukan}</td>
                    <td>${item.persentase}</td>
                </tr>
            `;
        });
    };
    $("#dataJadwalPraktek").html(html);
};
$(document).on('click', '.btn-pilih-poli', function() {
  
    const kode = $(this).data('kode');
    const nama = $(this).data('nama');
    console.log("Poli dipilih:", kode);
    console.log("Poli dipilih:",  nama);
    $("#kodeSpesialis").val(kode);
    $("#namaSpesialis").val(nama);
    cariDokterPoli();
});

//Insert SPRI 

//Update SPRI

//Hapus SPRI

// Insert Rencana Kontrol
function insert(){
    kirimRencanKontrol();
}
function kirimRencanKontrol() {
    let data = {
        noSEP: $("#nomorSep").text(),
        kodeDokter:$("#kodeDokter").val(),
        namaDokter:$("#dpjpTujuan").val(),
        diagnosa: $("#diagnosa").text(),
        poliKontrol: $("#kodeSpesialis").val(),
        namaPoli:$("#namaSpesialis").val(),
        tglRencanaKontrol:$("#tglRencanaKontrol").val(),
        user : $("#user").val()
    }
    if(!data.kodeDokter) return Swal.fire("",'Harap Pilih Dokter terlebih dahulu!','warning');
    if(!data.tglRencanaKontrol) return Swal.fire("",'Harap Pilih Tanggal Rencana Kontrol terlebih dahulu!','warning');
    if(!data.poliKontrol) return Swal.fire("",'Harap Pilih Poli/Spesialis Rencana Kontrol terlebih dahulu!','warning');
    saveSession("tambahan", data);
    const payload = {
        "request":{
            "noSEP": data.noSEP,
            "kodeDokter": data.kodeDokter,
            "poliKontrol": data.poliKontrol,
            "tglRencanaKontrol": data.tglRencanaKontrol,
            "user": data.user
        }
    };
    const url = "v_insertkontrol";
    const method = "post"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            Swal.fire('Server Error', 'Internal Server Error', 'error');
            return;
        }
        const code = res.metaData.code;
        const msg = res.metaData.message;
        if (code === "200") {
            const hasil = res.response;
            Swal.fire('', msg, 'success').then((result) => {
                if (result.isConfirmed) {
                    // Tambahkan aksi sukses disini
                    saveSession("dataSuKon", hasil);
                    const noSurat = hasil.noSuratKontrol;
                    $("#noSuratKontrol").val(noSurat);
                    tampilkanModeView();
                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("insertsukon")?.response;
                if (result.isConfirmed) {
                    // Tambahkan aksi dummy disini
                    saveSession("dataSuKon", hasil);
                    const noSurat = hasil.noSuratKontrol;
                    $("#noSuratKontrol").val(noSurat);
                    tampilkanModeView();
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};

// Update Rencana Kontrol
function edit() {
    loadDataKontrolKeForm(); // isi form dengan data existing
    showMode('update');
}
function update() {
    kirimUpdateRencanaKontrol();
}

//Hapus Rencana Kontrol
function hapus() {
    Swal.fire({
        title: 'Yakin Hapus?',
        text: 'Data rencana kontrol akan dihapus.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus'
    }).then((result) => {
        if (result.isConfirmed) {
            hapusRencanaKontrol();
        }
    });
}


//Cetak SUrat Kontrol
function cetakSutaKontrol() {
    const data = getSession("dataSuKon");
    const t = getSession("tambahan");
    if (!data) {
        Swal.fire({
            icon: 'warning',
            title: 'Data Surat Kontrol tidak ditemukan!',
            text: 'Silakan simpan atau muat data Surat Kontrol terlebih dahulu.'
        });
        return;
    }
    const dataSukon = {
        "suratKontrol": data,
        "tambahan": t
    }
    saveSession("dataSukon", dataSukon);
    window.location.href = "/cetak?target=print-kontrol";
    tampilkan("#cetakSuratKontrol");
}