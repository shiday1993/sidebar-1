function getKelamin(kode) { return kode === "P" ? "Perempuan" : kode === "L" ? "Laki-laki" : "-"; };
function batal(){window.location.href = "/rujukan"; tampilkan("#sep_list")};
//Insert Rujukan
$(document).ready(function () {
    $("#kirimrujukan").on("click", function (e) {
        e.preventDefault();
        let tipeRujukan = $("input[name='tipe']:checked").val();
        let kosong = [];
        let data = {
            user: $("#user").val(),
            noSep: $("#nomorSep").text(),
            tglRujukan: $("#tanggalSep").text(),
            tglRencanaKunjungan: $("#tglRujukan").val(),
            ppkDirujuk: $("#ppkDiRujuk").val(),
            jnsPelayanan: $("#jenisPelayanan").val(),
            catatan: $("#catatan").val(),
            diagRujukan: $("#kodeDiagRujukan").val(),
            tipeRujukan: tipeRujukan,
            poliRujukan: $("#kodeSpesialis").val(),
        };
        Object.keys(data).forEach(key => {
            if (data[key] === undefined || data[key] == null) {
                data[key] = "";
            }
        });
        const wajib = ["tglRujukan", "ppkDirujuk", "user", "tipeRujukan"];
        const label = {
            tglRujukan: "Tanggal Rujukan",
            ppkDirujuk: "PPK Rujuk",
            user: "User",
            tipeRujukan: "Tipe Rujukan"
        };

        wajib.forEach(key => {
            if (!data[key]) kosong.push(label[key] || key);
        });
        if (kosong.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan!',
                text: kosong.join(' , ') + ' tidak boleh kosong.'
            });
            return;
        }
        let payload = {
            "request": {
                "t_rujukan": {
                    "noSep": data.noSep,
                    "tglRujukan": data.tglRujukan,
                    "tglRencanaKunjungan": data.tglRencanaKunjungan,
                    "ppkDirujuk": data.ppkDirujuk,
                    "jnsPelayanan": data.jnsPelayanan,
                    "catatan": data.catatan,
                    "diagRujukan": data.diagRujukan,
                    "tipeRujukan": data.tipeRujukan,
                    "poliRujukan": data.poliRujukan,
                    "user": data.user
                }
            }
        }
        // console.log("data yg dikirim: ", JSON.stringify(payload))
        vclaim_baru("v_insertrujukan", "post", payload, function (err, res) {
            if (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: "Gagal mengirim data."
                })
                return;
            }
            if (res.metaData.code === "200") {
                const pesan = res.response.rujukan.noRujukan;
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: f("Berhasil membuat rujukan dengan nomor: "+ pesan)
                });
            } else if (res.metaData.code === "201") {
                 Swal.fire('', res.metaData.message, 'warning').then((r)=>{
                    if(r.isConfirmed){
                        const pesan = getDummy("insertrujukan").response.rujukan.noRujukan;
                        const text = `Berhasil membuat rujukan dengan nomor: ${pesan}`
                        Swal.fire('Berhasil', text, 'success');
                    }
                 });
            }else{
                Swal.fire({
                    icon: 'error',
                    text: res.metaData.message
                });
            }
        });
    })
});

//Update Rujukan
$(document).ready(function () {
    $("#updaterujukan").on("click", function (e) {
        e.preventDefault();
        let tipeRujukan = $("input[name='tipe']:checked").val();
        let kosong = [];
        let data = {
            user: $("#user").val(),
            noSep: $("#nomorSep").text(),
            tglRujukan: $("#tglRujukan").val(),
            tglRencanaKunjungan: $("#tglRencanaKunjungan").val(),
            ppkDirujuk: $("#ppkDiRujuk").val(),
            jnsPelayanan: $("#jenisPelayanan").val(),
            catatan: $("#catatan").val(),
            diagRujukan: $("#kodeDiagRujukan").val(),
            tipeRujukan: tipeRujukan,
            poliRujukan: $("#kodeSpesialis").val(),
            user: $("#user").val()
        };
        Object.keys(data).forEach(key => {
            if (data[key] === undefined || data[key] == null) {
                data[key] = "";
            }
        });
        const wajib = ["tglRujukan", "ppkDirujuk", "user", "tipeRujukan"];
        wajib.forEach(key => {
            if (!data[key]) kosong.push(key);
        });
        if (kosong.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan!',
                text: kosong.join('/ ') + ' tidak boleh kosong.'
            });
            return;
        };
        let payload = {
            "request": {
                "t_rujukan": {
                    "noSep": data.noSep,
                    "tglRujukan": data.tglRujukan,
                    "tglRencanaKunjungan": data.tglRencanaKunjungan,
                    "ppkDirujuk": data.ppkDirujuk,
                    "jnsPelayanan": data.jnsPelayanan,
                    "catatan": data.catatan,
                    "diagRujukan": data.diagRujukan,
                    "tipeRujukan": data.tipeRujukan,
                    "poliRujukan": data.poliRujukan,
                    "user": data.user
                }
            }
        };

        console.log("data yg dikirim: ", JSON.stringify(payload))
        vclaim_baru("v_updaterujukan", "put", payload, function (err, res) {
            if (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: "Gagal mengirim data."
                })
                return;
            }
            if (res.metaData.code === "200") {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: "Nomor Rujukan: " + (res?.response || "-") + " berhasil diperbarui."
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: res.metaData.message
                });
            }
        });
    })
});

//Delete Rujukan
$(document).ready(function () {
    $("#deleteRujukan").on("click", function (e) {
        e.preventDefault();
        let data = {
            noRujukan: $("#nomorRujukan").val(),
            user: ("#user").val()
        };
        let payload = {
            "request": {
                "t_rujukan": {
                    "noRujukan": data.noRujukan,
                    "user": data.user,
                }
            }
        };
        vclaim_baru("v_deleterujukan", "delete", payload, function (err, res) {
            if (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: "Gagal mengirim data."
                })
                return;
            }
            if (res.metaData.code === "200") {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: "Nomor Rujukan: " + (res?.response || "-") + " berhasil dihapus."
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: res.metaData.message
                });
            }
        });
    })
});

// Cari SEP
function cariSep() {
    const noSep = document.getElementById("noSep").value.trim();
    if (!noSep) {
        Swal.fire({
            icon: 'info',
            title: '',
            text: "Harap masukkan Nomor SEP terlebih dahulu!"
        });
        return;
    }

    vclaim_baru(`v_cariSEP`, "get", {'nosep':noSep}, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Internal Server Error!"
            })
            return;
        }
        code = res?.metaData?.code || "";
        const msg = res?.metaData?.message || "Tidak ada pesan";
        if (code === "200") {
            const data = res.response;
            saveSession("sepData", data);
            saveSession("cetakSep", data);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: msg
            }).then(() => {
                isiDataSEP(data);
                const modal = new mdb.Modal(document.getElementById('resultSep'));
                modal.show(); 
            });
        } else if (code === "201") {
            Swal.fire({
                icon: 'info',
                title: 'Perhatian',
                text: msg
            }).then(() => {
                const data = getDummy("sep").response;
                saveSession("sepData", data);
                saveSession("cetakSep", data);
                Swal.fire({
                    icon: 'info',
                    title: 'Data tidak ditemukan',
                    text: "Menampilkan Data dummy ke halaman insert SEP untuk testing."
                }).then(() => {
                    isiDataSEP(data);
                    const modal= new mdb.Modal( document.getElementById('resultSep'));
                    modal.show();
                });
            });
        } else {
            console.error('error :', res);
            Swal.fire({
                icon: 'error',
                title: 'BPJS Error',
                text: msg
            });
        }
    });
};

//Fungsi render tabel rujukan dan event detail
function renderRujukanTable(list) {
    let tableBody = document.getElementById("rujukanTableBody");
    tableBody.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center fw-bold">Data rujukan belum tersedia.</td></tr>`;
        return;
    }

    list.forEach((item, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <button class="btn btn-sm btn-secondary detail-rujukan" data-index="${index}">
                    ${item.noRujukan}
                </button>
            </td>
            <td>${item.tglRujukan}</td> 
            <td>${item.jnsPelayanan}</td>
            <td>${item.noSep}</td>
            <td>${item.noKartu}</td>
            <td>${item.nama}</td>
            <td>${item.ppkDirujuk}</td>
            <td>${item.namaPpkDirujuk}</td>
        `;
        tableBody.appendChild(row);
    });

    // Pasang event click setelah render
    document.querySelectorAll(".detail-rujukan").forEach(btn => {
        btn.addEventListener("click", function () {
            const index = parseInt(this.dataset.index, 10);
            const list = JSON.parse(sessionStorage.getItem("dataRujukan") || "[]");

            if (!Array.isArray(list) || !list[index]) return;

            const selected = list[index];
            sessionStorage.setItem("rujukanTerpilih", JSON.stringify(selected));
            vclaim(`SEP/${selected.noSep}`, function (data) {
                if (data.metaData?.code === "200") {
                    let isi = data?.response || {};
                    isiDataSEP(isi);
                    isiDataRujukan(selected);
                    tampilkan("#rujukan-konten")
                } else {
                    console.log('error :', data);
                    let isi = getDummy("sep").response || {};
                    isiDataSEP(isi);
                    isiDataRujukan(selected);
                    tampilkan("#rujukan-konten");
                }
            }, "GET", "");
        });
    });
}

//render RUjukan Khusus
function renderRujukanKhusus(list) {
    let tableBody = document.getElementById("rujukanKhususBody");
    tableBody.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center fw-bold">Data belum tersedia.</td></tr>`;
        return;
    }

    list.forEach((item, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <th scope="col">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="hapusRujukanKhusus" />
                </div>
            </th>
            <td>${index + 1}</td>
            <td>${item.idrujukan}</td>
            <td>${item.norujukan}</td>
            <td>${item.nokapst}</td> 
            <td>${item.nmpst}</td>
            <td>${item.diagppk}</td>
            <td>${item.tglrujukan_awal}</td>
            <td>${item.tglrujukan_berakhir}</td>
        `;
        tableBody.appendChild(row);
    });
};
// Rujukan Keluar
function getRujukanKeluar() {
    let tglMulai = document.getElementById("tglMulai").value;
    let tglAkhir = document.getElementById("tglAkhir").value;
    const payload = {"tglMulai": tglMulai, "tglAkhir": tglAkhir}
    if (!tglMulai || !tglAkhir) {
        Swal.fire({ icon: 'warning', text: "Harap isi kedua tanggal!" });
        return;
    }

    let url = "v_listrujukankeluar";
    vclaim_baru(url, "get", payload, function (err, res) {
        if (err) {
            Swal.fire({ icon: 'error', title: 'Server Error', text: "Gagal mengirim data." });
            return;
        }

        if (res.metaData.code === "200") {
            Swal.fire({ icon: 'success', title: 'Berhasil', text: "Data berhasil diproses." }).then(() => {
                const list = res.response?.list || [];
                sessionStorage.setItem("dataRujukan", JSON.stringify(list));
                renderRujukanTable(list);
            });
        } else if (res.metaData.code === "201") {
            Swal.fire({ icon: 'info', text: res.metaData.message }).then(() => {
                const dummylist = getDummy("listrujukan").response?.list || [];
                sessionStorage.setItem("dataRujukan", JSON.stringify(dummylist));
                renderRujukanTable(dummylist);
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: res.metaData.message }).then(() => {
                sessionStorage.removeItem("dataRujukan");
                renderRujukanTable([]);
            });
        }
    });
}

// Fungsi isi data rujukan
function isiDataRujukan(data) {
    const mapJenis = {
        "rawat jalan": "1",
        "rawat inap": "2"
    };
    let pelayanan = mapJenis[(data.jnsPelayanan || '').toLowerCase()] || data.jnsPelayanan;

    document.getElementById("nomorSep").innerText = data.noSep || "-";
    document.getElementById("tanggalSep").innerText = data.tglRujukan || "-";
    document.getElementById("jnsPelayanan").innerText = pelayanan === "1" ? "Rawat Jalan" : "Rawat Inap";
    document.getElementById("ppkPelayanan").innerText = data.namaPpkDirujuk || "-";

    document.getElementById("tglRujukan").value = data.tglRujukan || "";
    document.getElementById("jenisPelayanan").value = pelayanan || "";
    document.getElementById("catatan").value = data.catatan || "";
    document.getElementById("kodeDiagRujukan").value = data.diagRujukan || "";
    document.getElementById("ppkDiRujuk").value = data.ppkDirujuk || "";
    document.getElementById("ppkRujukan").value = data.namaPpkDirujuk || "";

}

//Get List Rujukan Keluar RS
function getListRujukanKeluarRS() {
    let tglAwal = $("#tglAwalRujukKeluar").val();
    let tglAkhir = $("#tglAkhirRujukKeluar").val();
    payload = {"tglAwal": tglAwal, "tglAkhir": tglAkhir}
    if (!tglAwal|| !tglAkhir) {
        Swal.fire({ icon: 'warning', text: "Harap isi kedua tanggal!" });
        return;
    }

    let url = "v_listrujukankelua";
    vclaim_baru(url, "get", payload, function (err, res) {
        const code = res.metaData.code;
        const msg = res.metaData.message;
        if (err) {
            Swal.fire({ icon: 'error', title: 'Server Error', text: "Gagal mengirim data." });
            return;
        }

        if (code === "200") {
            Swal.fire(msg, "Data berhasil diproses." , 'success').then(() => {
                const hasil = res.response?.list|| [];
                saveSession("dataRujukanKeluar", hasil);
                rujukanKeluar(hasil);
            });
        } else if (code === "201") {
             Swal.fire('Perhatian', msg , 'warning').then(() => {
                const hasil = getDummy("listrujukankeluarrs").response?.list || [];
                saveSession("dataRujukanKeluar", hasil);
                rujukanKeluar(hasil);
            });
        } else {
            Swal.fire("Gagal", msg, 'error').then(() => {
                sessionStorage.removeItem("dataRujukanKeluar");
                rujukanKeluar([]);
            });
        }
    });
}

//List Rujukan Khusus
function getListRujukanKhusus() {
    let bulan = document.getElementById("bulan").value;
    let tahun = document.getElementById("tahun").value;
    const payload = { "Bulan": bulan , "Tahun": tahun};
    if (!bulan|| !tahun) {
        Swal.fire({ icon: 'warning', text: "Harap isi bulan dan tahun!" });
        return;
    }

    let url = "v_listrujukankhusus";
    vclaim_baru(url, "get", payload, function (err, res) {
        if (err) {
            Swal.fire({ icon: 'error', title: 'Server Error', text: "Gagal mengirim data." });
            return;
        }

        if (res.metaData.code === "200") {
            Swal.fire({ icon: 'success', title: 'Berhasil', text: "Data berhasil diproses." }).then(() => {
                const list = res.response?.rujukan || [];
                sessionStorage.setItem("dataRujukanKhusus", JSON.stringify(list));
                renderRujukanKhusus(list);
            });
        } else if (res.metaData.code === "201") {
            Swal.fire({ icon: 'info', text: res.metaData.message }).then(() => {
                const dummylist = getDummy("listrujukankhusus").response?.rujukan || [];
                sessionStorage.setItem("dataRujukanKhusus", JSON.stringify(dummylist));
                renderRujukanKhusus(dummylist);
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: res.metaData.message }).then(() => {
                sessionStorage.removeItem("dataRujukanKhusus");
                renderRujukanKhusus([]);
            });
        }
    });
}

//Cari Nomor Rujukan
$("#noRujukan").autocomplete({
    source: function (request, response) {
        const nomor = request.term;
        if (!nomor) {
            response([]);
            return;
        }
        const url = `Rujukan/rs/${encodeURIComponent(nomor)}`;
        $.ajax({
            url: "/bridging",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                url: url,
                method: "GET",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                payload: ""
            }),
            success: function (data) {
                console.log('data dari bpjs :', data)
                const rujukan = data.response?.rujukan || [];
                if (data.metaData?.code === "200" && rujukan) {
                    const suggestions = [{
                        label: rujukan.noRujukan + " - " + (rujukan.peserta?.nama || "Tanpa Nama"),
                        value: rujukan.noRujukan,
                        detail: rujukan
                    }];
                    response(suggestions);
                } else {
                    response([{
                        label: "Data rujukan tidak ditemukan",
                        value: "",
                        disabled: true
                    }]);
                }
            },
            error: function () {
                response([{
                    label: "Gagal mengambil data",
                    value: "",
                    disabled: true
                }]);
            }
        });
    },
    minLength: 10,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
            return;
        }
        const data = ui.item.detail;
        $("#poliRujukan").val(data.poliRujukan?.nama || "");
        $("#ppkRujukan").val(data.provPerujuk?.nama || "");
        $("#tglRujukan").val(data.tglKunjungan || "");
        $("#diagnosa").val(data.diagnosa?.nama || "");
        $("#noMR").val(data.peserta?.mr?.noMR || "");
        $("#noTelp").val(data.peserta?.mr?.noTelepon || "Tidak Ada");
        $("#statusKecelakaan").val("Tidak Diketahui");
    }
});

//Diagnosa Rujukan
$("#diagRujukan").autocomplete({
    source: function (request, response) {
        const namaAtauKode = request.term;
        if (!namaAtauKode) {
            response([]);
            return;
        }
        const url = `referensi/diagnosa/${encodeURIComponent(namaAtauKode)}`;
        $.ajax({
            url: "/bridging",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                url: url,
                method: "GET",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                payload: ""
            }),
            success: function (data) {
                console.log('data dari bpjs :', data)

                const list = data.response?.diagnosa || [];
                if (data.metaData?.code === "200" && list.length > 0) {
                    const results = list.map(item => ({
                        label: item.kode + " - " + item.nama,
                        value: item.nama,
                        kode: item.kode
                    }));
                    response(results);
                } else {
                    response([{
                        label: 'Diagnosa tidak ditemukan',
                        value: '',
                        disabled: true
                    }]);
                }
            },
            error: function () {
                response([{
                    label: 'Gagal mengambil data Diagnosa',
                    value: '',
                    disabled: true
                }]);
            }
        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            document.getElementById("kodeDiagRujukan").value = ui.item.kode;
            console.log("Diagnosa dipilih:", ui.item.kode, ui.item.value);
        }
    }
})

$("#ppk_Rujukan").autocomplete({
    source: function (request, response) {
        const namaAtauKode = request.term;
        if (!namaAtauKode) {
            response(['Jenis nama/kode belum diisi']);
            return;
        }
        const url = `referensi/faskes/${encodeURIComponent(namaAtauKode)}/2`;
        console.log('url faskes :', url);
        $.ajax({
            url: "/bridging",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                url: url,
                method: "GET",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                payload: "",

            }),
            success: function (data) {
                console.log('data dari bpjs :', data)
                if (data.metaData && data.metaData.code === "200" && data.response && data.response.faskes && data.response.faskes.length > 0) {
                    const results = data.response.faskes.map(item => ({
                        label: item.kode + " - " + item.nama,
                        value: item.nama,
                        kode: item.kode
                    }));
                    response(results);
                } else {
                    response([{
                        label: 'PPK tidak ditemukan',
                        value: '',
                        disabled: true
                    }]);
                }
            },
            error: function () {
                response([{
                    label: 'Gagal mengambil data PPK',
                    value: '',
                    disabled: true
                }]);
            }
        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            // console.log("PPK dipilih:", ui.item.kode, ui.item.value);
            document.getElementById("kodePPKRujukan").value = ui.item.kode;
            document.getElementById("ppkDiRujuk").value = ui.item.kode;
            document.getElementById("ppkRujukan").value = ui.item.value;
        }
    }
});

$("#loadSpesialis").click(function () {
    const ppkRujukan = $("#kodePPKRujukan").val().trim();
    const tglRujukan = $("#tgl_Rujukan").val();

    if (!ppkRujukan || ppkRujukan.length !== 8) {
        Swal.fire({
            icon: 'info',
            text: "Masukkan kode PPK Rujukan yang valid (8 digit)"
        });
        return;
    };
    if (!tglRujukan) {
        Swal.fire({
            icon: 'info',
            text: "Tanggal rujukan tidak boleh kosong"
        });
        return;
    };

    const url = `Rujukan/ListSpesialistik/PPKRujukan/${encodeURIComponent(ppkRujukan)}/TglRujukan/${tglRujukan}`;

    $("#loadingSpesialis").show();
    $("#tableSpesialis tbody").html("");

    vclaim(url, function (data) {
        // console.log('data dari bpjs :', data);
        $("#loadingSpesialis").hide();
        if (data.metaData && data.metaData.code === "200" && data.response.list && data.response.list.length > 0) {
            let rows = "";
            data.response.list.forEach(item => {
                rows += `<tr>
                    <td>${item.kodeSpesialis || "-"}</td>
                    <td><button type="button" class="btn btn-light btn-sm pilihSpesialis btn-tampil" data-target="#rujukan-konten"
                            data-nama="${item.namaSpesialis || "-"}"
                            data-kode="${item.kodeSpesialis || "-"}" 
                            data-mdb-ripple-init data-mdb-ripple-color="dark">
                            ${item.namaSpesialis || "-"}
                        </button>
                    </td>
                    <td>${item.kapasitas || "-"}</td>
                    <td>${item.jumlahRujukan || "-"}</td>
                    <td>${item.persentase || "-"}</td>
                </tr>`;
            });
            $("#tableSpesialis tbody").html(rows);
        } else {
            $("#tableSpesialis tbody").html(`<tr><td class="text-center" colspan="5">Data Tidak Ditemukan.</td></tr>`);
        }
    }, "GET", "");
});

$("#tableSpesialis tbody").on("click", ".pilihSpesialis", function () {
    const nama = $(this).data("nama");
    const kode = $(this).data("kode");

    // console.log("Spesialis dipilih:", kode + ",", nama);

    $("#kodeSpesialis").val(kode);
    $("#namaSpesialisInput").val(nama);
});

$("#tgl_Rujukan").on("change", function () {
    $("#tglRencanaKunjungan").val(this.value);
});


//fungsi isi data sep 
function isiDataSEP(data) {
    let kelamin = getKelamin(data.peserta?.kelamin);
    const mapJenis = {
        "rawat jalan": "1",
        "rawat inap": "2"
    };
    let pelayanan = mapJenis[(data?.jnsPelayanan).toLowerCase()];

    document.getElementById("sepNo").innerText = data.noSep || "-";
    document.getElementById("sepDate").innerText = data.tglSep || "-";
    document.getElementById("serviceType").innerText = data.jnsPelayanan || "-";
    document.getElementById("diagnosis").innerText = data.diagnosa || "-";
    document.getElementById("doctor").innerText = data.dpjp?.nmDPJP || "-";
    document.getElementById("patientName").innerText = data.peserta?.nama || "-";
    document.getElementById("cardNumber").innerText = data.peserta?.noKartu || "-";
    document.getElementById("participantType").innerText = data.peserta?.jnsPeserta?.keterangan || "-";
    document.getElementById("accidentStatus").innerText = data.nmstatusKecelakaan || "-";

    document.getElementById("nomorSep").innerText = data.noSep || "-";
    document.getElementById("tanggalSep").innerText = data.tglSep|| "-";
    document.getElementById("jnsPelayanan").innerText = data.jnsPelayanan|| "-";
    document.getElementById("jenisPelayanan").value = pelayanan || "";
    document.getElementById("diagnosa").innerText = data.diagnosa || "-";
    document.getElementById("ppkPelayanan").value = data.ppkPelayanan || "-";
    document.getElementById("diagRujukan").value = data.diagnosa?.nama || "";
    document.getElementById("kodeDiagRujukan").value = data.diagnosa?.kode || "-";
    document.getElementById("kdDPJP").value = data.dpjp?.kdDPJP || "-";
    document.getElementById("nama").innerText = data.peserta?.nama || "-";
    document.getElementById("noKartu").innerText = data.peserta?.noKartu || "-";
    document.getElementById("jenisKelamin").innerText = kelamin || "-";
    document.getElementById("tgl-lahir").innerText = data.peserta?.tglLahir || "-";
    document.getElementById("kelasHak").innerText = data.peserta?.hakKelas || "-";

    sessionStorage.setItem("sepData", JSON.stringify(data));
}

function pilihSepRujukan(){
    const modal = mdb.Modal.getInstance(document.getElementById('resultSep'));
    modal.hide();
    tampilkan("#rujukan-konten");
}