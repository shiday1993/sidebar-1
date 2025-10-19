$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pembuatansep') === 'true') {
        tampilkan('#pembuatansep');
    }
});

$(document).ready(function () {
    function toggleForm() {
        const pilihan = $('input[name="rujukan"]:checked').val();

        if (pilihan === "rujukan") {
            $('#rujukanForm').removeClass('d-none');
            $('#rujukanManualForm').addClass('d-none');
        } else if (pilihan === "igd") {
            $('#rujukanForm').addClass('d-none');
            $('#rujukanManualForm').removeClass('d-none');
        }
    }
    toggleForm();
    $('input[name="rujukan"]').change(function () {
        toggleForm();
    });
});


//Cetak SEP
function cetakSEP() {
    const data = sessionStorage.getItem("sepData");
    if (!data) {
        Swal.fire({
            icon: 'warning',
            title: 'Data SEP tidak ditemukan!',
            text: 'Silakan simpan atau muat data SEP terlebih dahulu.'
        });
        return;
    }
    sessionStorage.setItem("cetakSep", data);
    window.location.href = "/cetak?target=print-sep";
    tampilkan("#cetakSEP");
};

//
function batal() {
    window.location.replace("/sep?pembuatansep=true");
};

$(document).ready(function () {
    $('#pembiayaan').on('change', function () {
        const selectedText = $(this).find('option:selected').text();
        $('#penanggungJawab').val(selectedText);
    });
    $("#btn-simpan-sep").on("click", async function (e) {
        e.preventDefault();
        const text = $('#pembiayaan option:selected').text();
        function cekNaikKelas(hakKelas, klsRawatNaik) {
            // ICU / HCU / NICU → langsung valid
            if (klsRawatNaik >= 6) {
                return { valid: true };
            }
            const mappingHak = {
                3: 5,  // Kelas 3 → kode 5
                2: 4,  // Kelas 2 → kode 4
                1: 3   // Kelas 1 → kode 3
            };
            const kodeKelasNormal = mappingHak[hakKelas];
            if (klsRawatNaik == kodeKelasNormal || klsRawatNaik == 0 || !klsRawatNaik) {
                return { valid: true };
            }
            if (klsRawatNaik < kodeKelasNormal) {
                const selisih = kodeKelasNormal - klsRawatNaik;
                if (selisih > 1) {
                    return { valid: false, message: "Naik kelas maksimal 1 tingkat di atas hak kelas peserta." };
                }
            }
            return { valid: true };
        }
        const hakKelas = parseInt($("#kelasRawatHak").val());
        const naikKelas = parseInt($("#klsRawatNaik").val());
        const cek = cekNaikKelas(hakKelas, naikKelas);
        if (!cek.valid) {
            Swal.fire('', cek.message, 'warning');
            return;
        };
        let kosong = [];
        let data = {
            user: $("#user").val(),
            noKartu: $("#no-kartu").text(),
            tglSep: $("#tglSep").val(),
            ppkPelayanan: $("#ppkPelayanan").val(),
            jnsPelayanan: $("#jnsPelayanan").val(),
            kelasRawatHak: $("#kelasRawatHak").val(),
            kelasRawatNaik: $("#klsRawatNaik").val(),
            pembiayaan: $("#pembiayaan").val(),
            penanggungJawab: $("#penanggungJawab").val() || "",
            noMR: $("#noMR").val(),
            asalRujukan: $("#asalRujukan").val(),
            tglRujukan: $("#tglRujukan").val(),
            noRujukan: $("#noRujukan").val(),
            ppkRujukan: $("#ppkRujukan").val() || $("#ppk-rujukan").text(),
            catatan: $("#catatan").val(),
            diagAwal: $("#kodeDiagAwal").val(),
            tujuan: $("#poliTujuan").val(),
            eksekutif: $("input[name='eksekutif']:checked").val() || "0",
            cob: $("input[name='cob']:checked").val() || "0",
            katarak: $("input[name='katarak']:checked").val() || "0",
            lakaLantas: $("#lakaLantas").val(),
            noLP: $("#noLPKejadian").val(),
            tglKejadian: $("#tglKejadian").val(),
            keteranganKejadian: $("#keteranganKejadian").val(),
            suplesi: $("input[name='suplesi']:checked").val() || "0",
            noSepSuplesi: $("#noSepSuplesi").val(),
            kdPropinsi: $("#kdPropinsi").val(),
            kdKabupaten: $("#kdKabupaten").val(),
            kdKecamatan: $("#kdKecamatan").val(),
            tujuanKunj: $("#tujuanKunj").val(),
            flagProcedure: $("#flagProcedure").val() || "0",
            kdPenunjang: $("#kdPenunjang").val(),
            assesmentPel: $("#assesmentPel").val(),
            noSurat: $("#noSurat").val(),
            kodeDPJP: $("#kodeDPJP").val(),
            dpjpLayan: $("#dpjpLayan").val(),
            noTelp: $("#noTelp").val(),
        };
        Object.keys(data).forEach(key => {
            if (data[key] === undefined || data[key] == null) {
                data[key] = "";
            }
        });

        const wajib = ["kodeDPJP", "noKartu", "user"];
        wajib.forEach(key => {
            if (!data[key]) kosong.push(key);
        });

        // Object.keys(data).forEach(key => {
        //     if (!data[key] || data[key].trim() === "") {
        //         kosong.push(key);
        //         data[key] = ""; 
        //     }
        // });

        if (kosong.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan!',
                text: kosong.join('/ ') + ', tidak boleh kosong.'
            });
            return;
        };

        let lakaLantas = $("#lakaLantas").val();
        const nilaiValid = ["0", "1", "2", "3", "4", "5"];
        if (!nilaiValid.includes(lakaLantas)) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan!',
                text: 'Laka lantas tidak sesuai. Pilih status kecelakaan yang valid.'
            });
            return;
        };
        if (data["lakaLantas"] !== "0") {
            const fieldMap = {
                kdPropinsi: "Kode propinsi",
                kdKabupaten: "Kode kabupaten/kota",
                kdKecamatan: "Kode kecamatan"
            };
            let tglSep = $("#tglSep").val(); // yyyy-mm-dd
            let tglKejadian = $("#tglKejadian").val();

            for (let key in fieldMap) {
                const val = data[key];

                if (!val || val.trim() === "") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan!',
                        text: `${fieldMap[key]} tidak boleh kosong.`
                    });
                    return;
                }

                if (!tglKejadian) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan!',
                        text: 'Tanggal kejadian harus diisi.'
                    });
                    return;
                };

                if (tglKejadian && tglSep) {
                    let kejadianDate = new Date(tglKejadian);
                    let sepDate = new Date(tglSep);
                    if (kejadianDate > sepDate) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Peringatan!',
                            text: 'Tanggal kejadian lebih dari tanggal SEP. Harap periksa kembali.'
                        });
                        return;
                    }
                }

            }
        };

        const fieldTanggalWajib = ["tglRujukan", "tglSep"];
        for (let key of fieldTanggalWajib) {
            const val = $("#" + key).val();
            if (!val) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Peringatan!',
                    text: `${key} tidak boleh kosong.`
                });
                return;
            }
        };
        Swal.fire({
            title: 'Konfirmasi Simpan',
            text: 'Apakah data sudah benar dan ingin disimpan?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Simpan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                let payload = {
                    "request": {
                        "t_sep":
                        {
                            "noKartu": data.noKartu,
                            "tglSep": data.tglSep,
                            "ppkPelayanan": data.ppkPelayanan,
                            "jnsPelayanan": data.jnsPelayanan,
                            "klsRawat": {
                                "klsRawatHak": data.kelasRawatHak,
                                "klsRawatNaik": data.kelasRawatNaik,
                                "pembiayaan": data.pembiayaan,
                                "penanggungJawab": data.penanggungJawab
                            },
                            "noMR": data.noMR,
                            "rujukan": {
                                "asalRujukan": data.asalRujukan,
                                "tglRujukan": data.tglRujukan,
                                "noRujukan": data.noRujukan,
                                "ppkRujukan": data.ppkRujukan
                            },
                            "catatan": data.catatan,
                            "diagAwal": data.diagAwal,
                            "poli": {
                                "tujuan": data.tujuan,
                                "eksekutif": data.eksekutif
                            },
                            "cob": {
                                "cob": data.cob
                            },
                            "katarak": {
                                "katarak": data.katarak
                            },
                            "jaminan": {
                                "lakaLantas": data.lakaLantas,
                                "noLP": data.noLP,
                                "penjamin": {
                                    "tglKejadian": data.tglKejadian,
                                    "keterangan": data.keteranganKejadian,
                                    "suplesi": {
                                        "suplesi": data.suplesi,
                                        "noSepSuplesi": data.noSepSuplesi,
                                        "lokasiLaka": {
                                            "kdPropinsi": data.kdPropinsi,
                                            "kdKabupaten": data.kdKabupaten,
                                            "kdKecamatan": data.kdKecamatan
                                        }
                                    }
                                }
                            },
                            "tujuanKunj": data.tujuanKunj,
                            "flagProcedure": data.flagProcedure,
                            "kdPenunjang": data.kdPenunjang,
                            "assesmentPel": data.assesmentPel,
                            "skdp": {
                                "noSurat": data.noSurat,
                                "kodeDPJP": data.kodeDPJP
                            },
                            "dpjpLayan": data.dpjpLayan,
                            "noTelp": data.noTelp,
                            "user": data.user
                        }
                    }
                };
                // console.log('Data yg dikirim: ', JSON.stringify(payload)); // Debug
                vclaim_baru("v_insertSEP", "post", payload, function (err, res) {
                    if (err) {
                        alert("Gagal konek ke server.");
                        Swal.fire({
                            icon: 'error',
                            title: 'Server Error',
                            text: "Gagal mengirim data."
                        })
                        return;
                    }
                    if (res.metaData.code === "200") {
                        const hasil = res.response;
                        Swal.fire({
                            icon: 'success',
                            title: res.metaData.message
                        }).then((result) => {
                            saveSession("cetakSep", hasil);
                            const pesan = res.response.sep?.noSep || '';
                            if (result.isConfirmed) {
                                Swal.fire('Sukses', "SEP telah dibuat dengan nomor " + pesan, 'success').then(() => {
                                    window.location.href = "/cetak?target=print-sep";
                                    tampilkan("#cetakSEP");
                                });
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            text: res.metaData.message
                        }).then((result) => {
                            const hasil = getDummy("sep")?.response;
                            const pesan = getDummy("sephasil")?.response.sep?.noSep || '';
                            saveSession("cetakSep", hasil);
                            if (result.isConfirmed) {
                                Swal.fire('Sukses', "SEP telah dibuat dengan nomor " + pesan, 'success').then(() => {
                                    window.location.href = "/cetak?target=print-sep";
                                    tampilkan("#cetakSEP");
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

//
$(document).ready(function () {
    $('#pembiayaan').on('change', function () {
        const selectedText = $(this).find('option:selected').text();
        $('#penanggungJawab').val(selectedText);
    });
    $("#btn-update-sep").on("click", function (e) {
        e.preventDefault();
        const text = $('#pembiayaan option:selected').text();
        let kosong = [];
        let data = {
            user: $("#user").val(),
            noSep: $("#nomorSEP").text(),
            kelasRawatHak: $("#kelasRawatHak").val(),
            kelasRawatNaik: $("#kelasRawatNaik").val(),
            pembiayaan: $("#pembiayaan").val(),
            penanggungJawab: $("#penanggungJawab").val() || "",
            noMR: $("#noMR").val(),
            catatan: $("#catatan").val(),
            diagAwal: $("#kodeDiagAwal").val(),
            poli: $("#poliTujuan").val(),
            eksekutif: $("input[name='eksekutif']:checked").val() || "0",
            cob: $("input[name='cob']:checked").val() || "0",
            katarak: $("input[name='katarak']:checked").val() || "0",
            lakaLantas: $("#lakaLantas").val(),
            noLP: $("#noLP").val(),
            tglKejadian: $("#tglKejadian").val(),
            keteranganKejadian: $("#keteranganKejadian").val(),
            suplesi: $("input[name='suplesi']:checked").val() || "0",
            noSepSuplesi: $("#noSepSuplesi").val(),
            kdPropinsi: $("#kdPropinsi").val(),
            kdKabupaten: $("#kdKabupaten").val(),
            kdKecamatan: $("#kdKecamatan").val(),
            dpjpLayan: $("#dpjpLayan").val(),
            noTelp: $("#noTelp").val(),
        };

        Object.keys(data).forEach(key => {
            if (data[key] === undefined || data[key] == null) {
                data[key] = "";
            }
        });

        const wajib = ["user"];
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

        let lakaLantas = $("#lakaLantas").val();
        const nilaiValid = ["0", "1", "2", "3", "4", "5"];
        if (!nilaiValid.includes(lakaLantas)) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan!',
                text: 'Laka lantas tidak sesuai. Pilih status kecelakaan yang valid.'
            });
            return;
        };

        if (data["lakaLantas"] !== "0") {
            const fieldMap = {
                kdPropinsi: "Kode propinsi",
                kdKabupaten: "Kode kabupaten/kota",
                kdKecamatan: "Kode kecamatan"
            };
            let tglSep = $("#tglSep").val(); // yyyy-mm-dd
            let tglKejadian = $("#tglKejadian").val();

            for (let key in fieldMap) {
                const val = data[key];

                if (!val || val.trim() === "") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan!',
                        text: `${fieldMap[key]} tidak boleh kosong.`
                    });
                    return;
                }

                if (!tglKejadian) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan!',
                        text: 'Tanggal kejadian harus diisi.'
                    });
                    return;
                };

                if (tglKejadian && tglSep) {
                    let kejadianDate = new Date(tglKejadian);
                    let sepDate = new Date(tglSep);
                    if (kejadianDate > sepDate) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Peringatan!',
                            text: 'Tanggal kejadian lebih dari tanggal SEP. Harap periksa kembali.'
                        });
                        return;
                    }
                }

            }
        };

        const fieldTanggalWajib = ["tglRujukan", "tglSep"];
        for (let key of fieldTanggalWajib) {
            const val = $("#" + key).val();
            if (!val) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Peringatan!',
                    text: `${key} tidak boleh kosong.`
                });
                return;
            }
        };

        let payload = {
            "request": {
                "t_sep":
                {
                    "noSep": data.noSep,
                    "klsRawat": {
                        "klsRawatHak": data.kelasRawatHak,
                        "klsRawatNaik": data.kelasRawatNaik,
                        "pembiayaan": data.pembiayaan,
                        "penanggungJawab": data.penanggungJawab
                    },
                    "noMR": data.noMR,
                    "catatan": data.catatan,
                    "diagAwal": data.diagAwal,
                    "poli": {
                        "tujuan": data.poli,
                        "eksekutif": data.eksekutif
                    },
                    "cob": {
                        "cob": data.cob,
                    },
                    "katarak": {
                        "katarak": data.katarak,
                    },
                    "jaminan": {
                        "lakaLantas": data.lakaLantas,
                        "penjamin": {
                            "tglKejadian": data.tglKejadian,
                            "keterangan": data.keteranganKejadian,
                            "suplesi": {
                                "suplesi": data.suplesi,
                                "noSepSuplesi": data.noSepSuplesi,
                                "lokasiLaka": {
                                    "kdPropinsi": data.kdPropinsi,
                                    "kdKabupaten": data.kdKabupaten,
                                    "kdKecamatan": data.kdKecamatan
                                }
                            }
                        }
                    },
                    "dpjpLayan": data.dpjpLayan,
                    "noTelp": data.noTelp,
                    "user": data.user
                }
            }
        };

        // console.log('Data yg dikirim: ', JSON.stringify(payload)); // Debug
        vclaim_baru("v_updateSEP", "put", payload, function (err, res) {
            if (err) {
                alert("Gagal konek ke server.");
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: "Gagal mengirim data."
                })
                return;
            }
            if (res.metaData.code === "200") {
                const hasil = res.response;
                Swal.fire({
                    icon: 'success',
                    title: res.metaData.message
                }).then((result) => {
                    sessionStorage.setItem("UpdateSep", JSON.stringify(hasil));
                    sessionStorage.setItem("cetakSep", JSON.stringify(hasil));
                    if (result.isConfirmed) {
                        // window.location.replace("/sep");
                        tampilkanModeView();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    text: res.metaData.message
                }).then((result) => {
                    const hasil = getDummy("sepcetak")?.response;
                    sessionStorage.setItem("UpdateSep", JSON.stringify(hasil));
                    sessionStorage.setItem("cetakSep", JSON.stringify(hasil));
                    if (result.isConfirmed) {
                        // window.location.replace("/sep");
                        tampilkanModeView();
                    }
                });
            }
        });
    });
});

//
$(document).ready(function () {
    $("#btn-hapus-sep").on("click", function (e) {
        e.preventDefault();
        let noSep = $("#nomorSEP").text();
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan!',
            text: 'Apakah anda yakin ingin menghapus SEP ' + noSep + ' ini?',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Tidak, Batalkan'
        }).then((result) => {
            if (result.isConfirmed) {
                let kosong = [];
                let data = {
                    user: $("#user").val(),
                    noSep: $("#nomorSEP").text(),
                };

                Object.keys(data).forEach(key => {
                    if (data[key] === undefined || data[key] == null) {
                        data[key] = "";
                    }
                });

                const wajib = ["user", "noSep"];
                wajib.forEach(key => {
                    if (!data[key]) kosong.push(key);
                });

                if (kosong.length > 0) {
                    Swal.fire({
                        icon: 'warning',
                        text: kosong.join('/ ') + ', tidak boleh kosong.'
                    });
                    return;
                };


                let payload = {
                    "request": {
                        "t_sep":
                        {
                            "noSep": data.noSep,
                            "user": data.user
                        }
                    }
                };

                console.log('Data yg dikirim: ', JSON.stringify(payload)); // Debug
                vclaim_baru("v_deleteSEP", "delete", payload, function (err, res) {
                    if (err) {
                        // alert("Gagal konek ke server.");
                        Swal.fire({
                            icon: 'error',
                            title: 'Server Error',
                            text: "Gagal mengirim data."
                        })
                        return;
                    }
                    if (res.metaData.code === "200") {
                        const hasil = res.response;
                        Swal.fire({
                            icon: 'success',
                            text: "Data SEP " + hasil + " berhasil dihapus."
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.replace("/sep");
                                tampilkan('#pembuatansep');
                            }
                        });

                    } else if (res.metaData.code === "201") {
                        const hasil = getDummy("sephapus")?.response;
                        Swal.fire({
                            icon: 'info',
                            text: res.metaData.message + ". Menggunakan data dummy.",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    icon: 'success',
                                    text: "Data SEP " + hasil + " berhasil dihapus."
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        window.location.replace("/sep");
                                        tampilkan('#pembuatansep');
                                    }
                                });
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            text: res.metaData.message
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.replace("/sep");
                                tampilkan('#pembuatansep');
                            }
                        });
                    }
                });
            }
        })
    });
});

//Get Suplesi 
// $("input[name='suplesi']").on("change", function () {
//     let val = $(this).val();
//     if (val === "1") {
//         let noKartu = $("#nokartu-bpjs").text();
//         let tglKejadian = $("#tglKejadian").val();

//         if (!noKartu || !tglKejadian) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Peringatan!',
//                 text: 'No Suplesi dan tanggal kejadian harus diisi terlebih dahulu.'
//             });
//             return;
//         }
//         getSepSuplesi(noKartu, tglKejadian);
//     } else {
//         $("#noSepSuplesi").val("");
//     }
// });

function cariSuplesi() {
    const noKartu = $("#nokartu-bpjs").text();
    const tglSep = $("#tglSep").val();
    if (!noKartu){
        Swal.fire('', "Nomor Kartu belum terisi. Cek Data kembali.",'warning');
        return;
    }
     if (!tglSep){
        Swal.fire('', "Tanggal SEP belum terisi. Cek Data kembali.",'warning');
        return;
    }
    const payload = {'NoKartu' : noKartu, 'tglPelayanan': tglSep};
    let url = `v_suplesijasaraharja`;
    vclaim_baru(url, "get", payload, function (err, res) {
        if (err) {
            console.error("Error ambil SEP Suplesi:", err);
            return;
        }
        if (res.metaData.code === "200") {
            let jaminan = res.response?.jaminan;
            if (jaminan && jaminan.length > 0) {
                let suplesi = jaminan[0].noSep;

                if (suplesi && suplesi.trim() !== "") {
                    $("#noSepSuplesi").val(suplesi);
                    console.log("Data Suplesi:", res.response);
                } else {
                    showNotFound();
                }
            } else {
                showNotFound();
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: res.metaData.message
            }).then(()=>{
                Swal.fire('', 'Menampilkan data Dummy untuk testing', 'info');
                let hasil = getDummy('sepsuplesi').response.jaminan;
                if (hasil && hasil.length > 0) {
                    let suplesi = hasil[0].noSep;
                    if (suplesi && suplesi.trim() !== "") {
                        $("#noSepSuplesi").val(suplesi);
                        
                        console.log("Data Suplesi:", res.response);
                    } else {
                        showNotFound();
                    }
                }   
            })
        }
    });
    function showNotFound() {
        Swal.fire({
            icon: 'info',
            title: 'Tidak ditemukan',
            text: 'Data SEP suplesi tidak ditemukan untuk pasien ini.'
        });
        $("#noSepSuplesi").val("");
    }
}

$("#tanggal_sep").on("change", function () {
    $("#tglSep").val($(this).val());
});


//Dokter DPJP
$("#namaDPJP").autocomplete({
    source: function (r, response) {
        const jnsPelayanan = $("#jnsPelayanan").val();
        const dokter = r.term;
        let tanggal = $("#tglSep").val() || $("#tanggal_sep").val(); 
        console.log("data tanggalep:", tanggal)
        if (!tanggal){
            Swal.fire('', 'Tanggal SEP belum terisi.','warning');
            return;
        }
        if (!jnsPelayanan){
            Swal.fire('', 'Jenis Pelayanan belum terisi.','warning');
            return;
        }
        const payload = {pelayanan: jnsPelayanan, tglPelayanan: tanggal, spesialis: dokter}
        
        vclaim_baru("v_dokterdpjp", "get", payload, function (err, res) {
            // console.log('data dari bpjs :', data);
            if (res && res.response && res.response.length > 0) {
                response(res.response.map(item => ({
                    label: item.kode + " - " + item.nama,
                    value: item.nama,
                    kode: item.kode
                })));
            } else {
                response([{
                    label: 'Dokter tidak ditemukan',
                    value: 'Dr. Kelvin Alim',
                    kode: null,
                    sDummy: true
                }]);
            }
        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
            $("#kodeDPJP").val(""); // kosongkan
            return;
        } else {
            // console.log("Dokter dipilih:", ui.item.kode, ui.item.value);
            if (ui.item.kode) {
                $("#kodeDPJP").val(ui.item.kode);
            } else {
                $("#kodeDPJP").val("DK001");
            }
        }
    }
});

//Diagnosa 
$("#diagAwal").autocomplete({
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
                // console.log('data dari bpjs :', data)

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
        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            // console.log("Diagnosa dipilih:", ui.item.kode, ui.item.value);
            $("#kodeDiagAwal").val(ui.item.kode);
        }
    }
});

//Poli
$("#namaPoliTujuan").autocomplete({
    source: function (request, response) {
        vclaim("referensi/poli/" + request.term, function (data) {
            // console.log('data dari bpjs :', data);
            const list = data.response?.poli || [];
            if (data.metaData?.code === "200" && list.length > 0) {
                const results = list.map(item => ({
                    label: item.kode + " - " + item.nama,
                    value: item.nama,
                    kode: item.kode
                }));
                response(results);
            } else {
                response([{
                    label: 'Poli tidak ditemukan',
                    value: '',
                    disabled: true
                }]);
            }
        }, "GET", "");
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            console.log("Poli dipilih:", ui.item.kode, ui.item.value);
            $("#poliTujuan").val(ui.item.kode);
        }
    }
});

//Poli WS
$('#cariPoli').on('focus', function () {
    if (!$(this).data('loaded')) {
        antrol_rs("ref/poli", function (data) {
            // console.log('Data dari BPJS:', data);

            const list = data.response?.list || [];
            if (data.metaData?.code === 200 && list.length > 0) {
                const select = $('<select id="poliDropdown"></select>');
                select.append('<option>Pilih Poli</option>');
                list.forEach(item => {
                    select.append(`<option value="${item.kdpoli}">${item.nmpoli}</option>`);
                });

                $('#cariPoli').replaceWith(select);
            } else {
                alert('Gagal mengambil data poli.');
            }
        }, "GET", "");
    }
});


//Procedure
$("#procedureInput").autocomplete({
    source: function (request, response) {
        vclaim("referensi/procedure/" + request.term, function (data) {
            // console.log('data dari bpjs :', data);

            const list = data.response?.procedure || [];
            if (data.metaData?.code === "200" && list.length > 0) {
                const results = list.map(item => ({
                    label: item.kode + " - " + item.nama,
                    value: item.nama,
                    kode: item.kode
                }));
                response(results);

            } else {
                response([{
                    label: 'Procedure/ tindakan tidak ditemukan',
                    value: '',
                    disabled: true
                }]);
            }
        }, "GET", "");
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            // console.log("Procedure dipilih:", ui.item.kode, ui.item.value);
        }
    }
});


//Kelas Rawat
$(document).ready(function () {
    let endpoint = "referensi/kelasrawat";
    vclaim(endpoint, function (data) {
        // console.log(data);
        let $kelas = $("#kelasrawat");
        $kelas.empty();
        $kelas.append('<option value="">Pilih Kelas Rawat</option>');

        if (data.response && Array.isArray(data.response.list)) {
            data.response.list.forEach(function (option) {
                $kelas.append(`<option value="${option.kode}">${option.nama}</option>`);
            });
        } else {
            console.error("Data list tidak ditemukan atau bukan array");
        }
    });
});

//Ruang Rawat
$(document).ready(function () {
    let endpoint = "referensi/ruangrawat";
    vclaim(endpoint, function (data) {
        // console.log(data);
        let $kelas = $("#ruangrawat");
        $kelas.empty();
        $kelas.append('<option value="">Pilih Ruang Rawat</option>');

        if (data.response && Array.isArray(data.response.list)) {
            data.response.list.forEach(function (option) {
                $kelas.append(`<option value="${option.kode}">${option.nama}</option>`);
            });
        } else {
            // console.error("Error :", data.metaData.message);
        }
    });
});

//Spesialistik
$(document).ready(function () {
    let endpoint = "referensi/spesialistik";
    vclaim(endpoint, function (data) {
        // console.log(data);
        let $kelas = $("#spesialistik");
        $kelas.empty();
        $kelas.append('<option value="">Pilih Spesialistik</option>');

        if (data.response && Array.isArray(data.response.list)) {
            data.response.list.forEach(function (option) {
                $kelas.append(`<option value="${option.kode}">${option.nama}</option>`);
            });
        } else {
            console.error("Error :", data.metaData.message);
        }
    });
});

//Cara Keluar
$(document).ready(function () {
    let endpoint = "referensi/carakeluar";
    vclaim(endpoint, function (data) {
        // console.log(data);
        let $kelas = $("#carakeluar");
        $kelas.empty();
        $kelas.append('<option value="">Pilih Cara Keluar</option>');

        if (data.response && Array.isArray(data.response.list)) {
            data.response.list.forEach(function (option) {
                $kelas.append(`<option value="${option.kode}">${option.nama}</option>`);
            });
        } else {
            console.error("Error :", data.metaData.message);
        }
    });
});

//Pasca Pulang
$(document).ready(function () {
    let endpoint = "referensi/pascapulang";
    vclaim(endpoint, function (data) {
        // console.log(data);
        let $kelas = $("#pascapulang");
        $kelas.empty();
        $kelas.append('<option value="">Pilih Pasca Pulang</option>');

        if (data.response && Array.isArray(data.response.list)) {
            data.response.list.forEach(function (option) {
                $kelas.append(`<option value="${option.kode}">${option.nama}</option>`);
            });
        } else {
            console.error("Error :", data.metaData.message);
        }
    });
});


//DPJP RITL
$("#dpjpritl").autocomplete({
    source: function (r, response) {
        const jnsPelayanan = $('jnsPelayanan').val();
        const tglPelayanan = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const dokter = r.term
        vclaim("referensi/dokter/pelayanan/" + jnsPelayanan + "/tglPelayanan/" + tglPelayanan + "/Spesialis/" + dokter, function (data) {
            // console.log('data dari bpjs :', data);
            const list = data.response?.procedure || [];
            if (data.metaData?.code === "200" && list.length > 0) {
                const results = list.map(item => ({
                    label: item.kode + " - " + item.nama,
                    value: item.nama,
                    kode: item.kode
                }));
                response(results);

            } else {
                response([{
                    label: 'Dokter DPJP tidak ditemukan',
                    value: '',
                    disabled: true
                }]);
            }
        }, "GET", "");
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            // console.log("Dokter dipilih:", ui.item.kode, ui.item.value);
        }
    }
});

//Cari Nomor Rujukan
$("#cariRujukan").on("submit", function (e) {
    e.preventDefault();

    const noRujukan = $('#noRujukan').val().trim();
    if (!noRujukan) {
        Swal.fire({
            icon: "warning",
            title: 'Perhatian!!',
            text: 'Nomor Rujukan tidak boleh kosong!!!'
        });
    }
    $("#resultRujukan").html('<div class="text-info">Mencari data...</div>');
    vclaim("Rujukan/" + noRujukan, function (data) {
        // console.log('data dari bpjs :', data);
        const rujukan = data.response?.rujukan || null;
        if (data.metaData?.code === "200" && rujukan) {
            $('#resultRujukan').html(`
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Detail Rujukan</h5>
                    <p><strong>Nomor:</strong> ${rujukan.noKunjungan}</p>
                    <p><strong>Nama Pasien:</strong> ${rujukan.peserta.nama}</p>
                    <p><strong>Diagnosa:</strong> ${rujukan.diagnosa.nama}</p>
                    <p><strong>Poli:</strong> ${rujukan.poliRujukan.nama}</p>
                  </div>
                </div>
            `);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Data rujukan tidak ditemukan. Nomor Rujukan lebih dari 90 hari"
            });
            $('#resultRujukan').html('');
        }

    }, "GET", "");
});

function validasi() {
    const tglSep = $("#tanggal_sep").val();
    const rujukan = $('input[name="rujukan"]:checked').val();
    const faskes = $("#faskes").val();

    if (!rujukan) {
        Swal.fire({
            icon: "info",
            text: "Harap pilih jenis rujukan terlebih dahulu."
        });
        return false;
    }
    if (!tglSep) {
        Swal.fire({
            icon: "info",
            text: "Harap isi tanggal SEP terlebih dahulu."
        });
        return false;
    }
    if (!faskes) {
        Swal.fire({
            icon: "info",
            text: "Harap pilih asal rujukan terlebih dahulu."
        });
        return false;
    }
    return true;
}

//cai RUjukan berdasarkan kartu (multi record)
let sessionData = [];
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-tampil')) {
        const index = e.target.dataset.index;
        const selected = sessionData[index];
        const modal = mdb.Modal.getInstance(document.getElementById('cariRujukanFaskes'));
        modal.hide();
        saveSession("sepData", selected);
        tampilkanSepRujukan(selected);
        tampilkan("#insertsepform");
    }
});

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('tampil-sep')) {
        const index = e.target.dataset.index;
        const selected = sessionData[index];
        saveSession("sepData", selected);
        tampilkanSepPeserta(selected);
        tampilkan("#insertsepform");
    }
});
function buatRowRujukan(data) {
    sessionData = data;
    if (!Array.isArray(data)) { data = [data]; }
    if (!data.length) {
        return `<tr><td colspan="7" class="text-center">Data tidak ditemukan.</td></tr>`;
    }
    return data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <button class="btn btn-light btn-tampil" data-index="${index}">
                    ${item.noKunjungan || "-"}
                </button>
            </td>
            <td>${item.tglKunjungan || "-"}</td>
            <td>
                <button class="btn btn-light btn-tampil" data-index="${index}">
                    ${item.peserta?.noKartu || "-"}
                </button>
            </td>
            <td>${item.peserta?.nama || "-"}</td>
            <td>${item.provPerujuk?.nama || "-"}</td>
            <td>${item.poliRujukan?.nama || "-"}</td>
        </tr>
    `).join('');
}


function buatRowPeserta(data) {
    sessionData = data;
    if (!Array.isArray(data)) { data = [data]; }
    if (!data.length) {
        return `<tr><td colspan="6" class="text-center">Data tidak ditemukan.</td></tr>`;
    }
    return data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <button class="btn btn-light tampil-sep" data-index="${index}">
                    ${item.peserta.nik || "-"}
                </button>
            </td>
            <td>
                <button class="btn btn-light tampil-sep" data-index="${index}">
                    ${item.peserta.noKartu || "-"}
                </button>
            </td>
            <td>${item.peserta?.nama || "-"}</td>
            <td>${item.peserta.provUmum?.nmProvider || "-"}</td>
            <td>${item.peserta.statusPeserta?.keterangan || "-"}</td>
        </tr>
    `).join('');
}


function cariRujukan() {
    const noRujukan = $('#noRujukanRS').val().trim();
    const valid = validasi();
    if (!valid) return;
    if (!noRujukan) {
        Swal.fire({
            icon: "warning",
            title: 'Perhatian!!',
            text: 'Nomor Rujukan tidak boleh kosong!!!'
        });
        return;
    };
    $("#wrapperHasilCariRujukan").addClass("d-none");
    vclaim_baru('v_rujukanbyno', "get", {norujukan: noRujukan}, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Gagal mengirim data."
            })
            return;
        }
        const kode = res.metaData.code;
        const message = res.metaData.message;

        if (kode === "200" || kode === "201") {
            console.log("balasan dari bpjs: ", res)
            const isDummy = (kode === "201");
            const rawData = isDummy
                ? getDummy("rujukan").response.rujukan || {}
                : res.response || {};

            const data = Array.isArray(rawData) ? rawData : [rawData];

            Swal.fire({
                icon: isDummy ? 'info' : 'success',
                title: isDummy ? 'Perhatian' : 'Berhasil',
                text: message + (isDummy ? " Menampilkan data dummy untuk testing." : "")
            });

            saveSession("dataSepRujukan", data);
            $("#hasilCariRujukan").html(buatRowRujukan(data));

            $("#wrapperHasilCariRujukan").removeClass("d-none");

            $(".btn-tampil").off("click").on("click", function () {
                const index = $(this).data("index");
                const rujukanData = JSON.parse(sessionStorage.getItem("dataSepRujukan") || "[]");
                const rujukanArray = Array.isArray(rujukanData) ? rujukanData : [rujukanData];
                const data = rujukanArray[index];
                if (data) {
                    tampilkanSepRujukan(data);
                    tampilkan("#insertsepform");
                } else {
                    Swal.fire("Oops!", "Data tidak ditemukan.", "error");
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: message
            }).then(() => {
                sessionStorage.removeItem("dataSepRujukan");
                $("#hasilCariRujukan").html(`<tr><td colspan="7" class="text-center">Data tidak ditemukan.</td></tr>`);
            });
        }
    });
};

function cariRujukanKartu() {
    const tgl = $("#tanggal_sep").val();
    const nokartu = $('#nomor_kartu').val().trim();
    if (!nokartu) {
        Swal.fire({
            icon: "warning",
            title: '',
            text: 'Nomor Kartu atau NIK tidak boleh kosong!!!'
        });
        return;
    }
    if (!tgl){Swal.fire('', 'Tanggal SEP belum terisi.','warning');return;};
    let url = 'v_rujukanbynoka'
    vclaim_baru(url, "get", {'NoKartu': nokartu}, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Gagal mengirim data."
            })
            return;
        }
        const kode = res.metaData.code;
        const message = res.metaData.message;

        if (kode === "200" || kode === "201") {
            const rawData = (kode === "200")
                ? res.response?.rujukan || {}
                : getDummy("seprujukan").response?.rujukan || {};

            const data = Array.isArray(rawData) ? rawData : [rawData];
            if (kode === "201") {
                Swal.fire({
                    icon: 'info',
                    title: 'Perhatian',
                    text: message + `. Menampilkan data dummy untuk testing.`
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: message
                });
            }
            saveSession("sepData", data);
            // console.log('disini:', data)
            cariPasienKlinik(data[0]);
            $("#hasilCariPeserta").html(buatRowRujukan(data));
        } else {
            console.log('eror:', err)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: message
            }).then(() => {
                clearSession("sepData");
                $("#hasilCariPeserta").html(`<tr><td colspan="7" class="text-center">Data tidak ditemukan.</td></tr>`);
            });
        }
    });
};

async function cariPasienKlinik(data) {
    // console.log('data terisi: ', data);

  const payload = {
    "nik": data.peserta.nik,
    "nomorkartu": data.peserta.noKartu,
    "nama": data.peserta.nama
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

function cariRujukanFaskes() {
    const nokartu = $('#nomor_kartu').val().trim();
    if (!nokartu) {
        Swal.fire({
            icon: "warning",
            title: 'Perhatian!!',
            text: 'Nomor Kartu atau NIK tidak boleh kosong!!!'
        });
        return;
    }
    vclaim_baru('v_rujukanbynokamulti' , "get", {NoKartu: nokartu}, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Gagal mengirim data."
            })
            return;
        }
        const kode = res.metaData.code;
        const message = res.metaData.message;

        if (kode === "200" || kode === "201") {
            const rawData = (kode === "200")
                ? res.response?.rujukan || {}
                : getDummy("rujukanmulti").response?.rujukan || {};

            const data = Array.isArray(rawData) ? rawData : [rawData];
            if (kode === "201") {
                Swal.fire({
                    icon: 'info',
                    title: 'Perhatian',
                    text: message + " Menampilkan data dummy untuk testing."
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: message
                });
            }
            sessionStorage.setItem("dataRujukanFaskes", JSON.stringify(data));
            // console.log('disini:', data)
            $("#hasilCariPeserta").html(buatRowRujukan(data));
        } else {
            console.log('eror:', err)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: message
            }).then(() => {
                sessionStorage.removeItem("dataRujukanFaskes");
                $("#hasilCariPeserta").html(`<tr><td colspan="7" class="text-center">Data tidak ditemukan.</td></tr>`);
            });
        }
    });
}



function cariRujukanIGD() {
    const nokartu = $('#noKartuIGD').val().trim();
    const tglSEP = $("#tanggal_sep_IGD").val();
    if (!nokartu) {
        Swal.fire({
            icon: "warning",
            title: 'Perhatian!!',
            text: 'Nomor Kartu atau NIK tidak boleh kosong!!!'
        });
        return;
    }
    const url = "p_kartu"
    vclaim_baru(url, "get", {nokart: nokartu, tglSEP: tglSEP}, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Gagal mengirim data."
            })
            return;
        }
        const kode = res.metaData.code;
        const message = res.metaData.message;

        if (kode === "200" || kode === "201") {
            const data = (kode === "200") ? res.response || {} : getDummy("peserta").response || {};
            if (kode === "201") {
                Swal.fire({
                    icon: 'info',
                    title: 'Perhatian',
                    text: message + ". Menampilkan data dummy untuk testing."
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: message
                });
            }
            sessionStorage.setItem("dataIGD", JSON.stringify(data));
            // console.log('disini:', data)
            $("#hasilCariPesertaIGD").html(buatRowPeserta(data));
            $("#wrapperHasilCariPeserta").removeClass("d-none");
        } else {
            console.log('eror:', err)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: message
            }).then(() => {
                sessionStorage.removeItem("dataIGD");
                $("#hasilCariPesertaIGD").html(`<tr><td colspan="6" class="text-center">Data tidak ditemukan.</td></tr>`);
            });
        }
    });
}

// Cari SEP
function cariSEP() {
    const noSep = document.getElementById("no_sep").value.trim();
    if (!noSep) {
        Swal.fire({
            icon: 'info',
            title: '',
            text: "Harap masukkan Nomor SEP terlebih dahulu!"
        });
        return;
    }
    
    vclaim_baru(`v_cariSEP`, "get", {"nosep": noSep}, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Gagal mengirim data."
            })
            return;
        }
        code = res?.metaData?.code || "";
        const message = res?.metaData?.message || "Tidak ada pesan";
        if (code === "200") {
            const data = res.response;
            saveSession("sepData", data);
            saveSession("cetakSep", data);
            Swal.fire({
                icon: 'success',
                title: message,
                text: "Data berhasil di proses."
            }).then(() => {
                tampilkanDataSEP(data);
                tampilkan("#insertsepform");
            });
        } else if (code === "201") {
            // console.log(res);
            Swal.fire({
                icon: 'info',
                title: 'Perhatian',
                text: message
            }).then(() => {
                const data = getDummy("sep").response;
                saveSession("sepData", data);
                saveSession("cetakSep", data);
                Swal.fire({
                    icon: 'info',
                    title: 'Data tidak ditemukan',
                    text: "Menampilkan Data dummy ke halaman insert SEP untuk testing."
                }).then(() => {
                    tampilkanDataSEP(data);
                    tampilkan("#insertsepform");
                });
            });
        } else {
            // console.error('error :', res);
            Swal.fire({
                icon: 'error',
                title: 'BPJS Error',
                text: message
            });
        }
    });
}
// Cari SEP
function cariSEPpulang() {
    const noSep = $("#noSep_update").val();
    if (!noSep) {
        Swal.fire({
            icon: 'info',
            title: '',
            text: "Harap masukkan Nomor SEP terlebih dahulu!"
        });
        return;
    }
    vclaim_baru('v_cariSEP', "get", {nosep: noSep}, function (err, res) {
        if (err) {
            Swal.fire('Error', 'Internal Server Error', 'error');
            return;
        }
        code = res.metaData?.code || "";
        const message = res.metaData?.message || "Tidak ada pesan";
        if (code === "200") {
            const data = res.response;
            saveSession("sepUpdate", data);
            Swal.fire('Berhasil', "Data berhasil di proses.", 'success').then(() => {
                isiUpdatePulang(data);
            });
        } else if (code === "201") {
            // console.log(res);
            Swal.fire('', message, 'warning').then(() => {
                const data = getDummy("sep").response;
                saveSession("sepUpdate", data);

                Swal.fire({
                    icon: 'info',
                    title: 'Data tidak ditemukan',
                    text: "Menampilkan Data Dummy untuk testing."
                }).then(() => {
                    isiUpdatePulang(data);
                });
            });
        } else {
            // console.error('error :', res);
            Swal.fire({
                icon: 'error',
                title: 'BPJS Error',
                text: res.metaData?.message
            });
        }
    });
}

$("#rujukKartu").on("submit", function (e) {
    e.preventDefault();

    const noRujukan = $('#noRujukKartu').val().trim();
    if (!noRujukan) {
        Swal.fire({
            icon: "warning",
            title: 'Perhatian!!',
            text: 'Nomor Kartu Peserta tidak boleh kosong!!!'
        });
    }
    $("#resultRujukanKartu").html('<div class="text-info">Mencari data...</div>');
    vclaim("Rujukan/RS/Peserta/" + noRujukan, function (data) {
        // console.log('data dari bpjs :', data);
        const rujukan = data.response?.rujukan || null;
        if (data.metaData?.code === "200" && rujukan) {
            $('#resultRujukan').html(`
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Detail Rujukan</h5>
                    <p><strong>Nomor:</strong> ${rujukan.noKunjungan}</p>
                    <p><strong>Nama Pasien:</strong> ${rujukan.peserta.nama}</p>
                    <p><strong>Diagnosa:</strong> ${rujukan.diagnosa.nama}</p>
                    <p><strong>Poli:</strong> ${rujukan.poliRujukan.nama}</p>
                  </div>
                </div>
            `);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Data rujukan tidak ditemukan. Nomor Rujukan lebih dari 90 hari"
            });
            $('#resultRujukan').html('');
        }

    }, "GET", "");
});
function rujukan(selector, faskesSelector, kodeSelector) {
    $(selector).autocomplete({
        source: function (request, response) {
            const namaAtauKode = request.term;
            if (!namaAtauKode) {
                response(['Jenis nama/kode belum diisi']);
                return;
            }

            const faskes = $(faskesSelector).val();
            const url = "referensi/faskes/" + namaAtauKode + "/" + faskes;
            // console.log('url faskes :', url);

            $.ajax({
                url: "/bridging",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    url: url,
                    method: "GET",
                    payload: "",
                }),
                success: function (data) {
                    // console.log('data dari bpjs :', data);
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
                $(kodeSelector).val(ui.item.kode);
                console.log("dipilih:", kodeSelector, $(kodeSelector));
            }
        }
    });
}
rujukan("#ppk_Rujukan", "#jnsFaskes", "#kodePPKRujukan");
rujukan("#ppk_RujukanSarana", "#jnsFaskesSarana", "#kodePPKRujukanSarana");
//Spesialistik

$("#loadSpesialis").click(function () {
    const ppkRujukan = $("#kodePPKRujukan").val().trim();
    const tglRujukan = $("#tgl_Rujukan").val();

    if (!ppkRujukan || ppkRujukan.length !== 8) {
        alert("Masukkan kode PPK Rujukan yang valid (8 digit)");
        return;
    }
    if (!tglRujukan) {
        alert("Tanggal rujukan tidak boleh kosong");
        return;
    }

    const url = "Rujukan/ListSpesialistik/PPKRujukan/" + ppkRujukan + "/TglRujukan/" + tglRujukan;
    // console.log("Memuat spesialistik dari URL:", url);

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
                    <td><button type="button" class="btn btn-light btn-sm pilihSpesialis"
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


//List Sarana
$("#loadSarana").click(function () {
    const ppkRujukan = $("#kodePPKRujukanSarana").val().trim();
    if (!ppkRujukan || ppkRujukan.length !== 8) {
        alert("Masukkan kode PPK Rujukan yang valid (8 digit)");
        return;
    }
    if (!tglRujukan) {
        alert("Tanggal rujukan tidak boleh kosong");
        return;
    }

    const url = "Rujukan/ListSarana/PPKRujukan/" + ppkRujukan;
    // console.log("Memuat List Sarana dari URL:", url);

    $("#loadingSarana").show();
    $("#tableSarana tbody").html("");

    vclaim(url, function (data) {
        // console.log('data dari bpjs :', data);
        $("#loadingSarana").hide();
        if (data.metaData && data.metaData.code === "200" && data.response.list && data.response.list.length > 0) {
            let rows = "";
            data.response.list.forEach(item => {
                rows += `<tr>
                    <td>${item.kodeSarana || "-"}</td>
                    <td><button type="button" class="btn btn-light btn-sm pilihSpesialis"
                            data-nama="${item.namaSarana || "-"}"
                            data-kode="${item.kodeSarana || "-"}" 
                            data-mdb-ripple-init data-mdb-ripple-color="dark">
                            ${item.namaSarana || "-"}
                        </button>
                      </td>
                </tr>`;
            });
            $("#tableSarana tbody").html(rows);
        } else {
            $("#tableSarana tbody").html(`<tr><td class="text-center" colspan="5">Data Tidak Ditemukan.</td></tr>`);
        }
    }, "GET", "");
});


function callBPJS() {
    antreanrs("/ref/poli", function (data) {
        // console.log(data);
    });
}

//Reload Halaman 
function reload() {
    window.location.reload();
}

//Isi data Peserta
function cariPeserta() {
    let jenisKartu = $('input[name="jns_kartu"]:checked').val();
    let nomorKartu = $('#nomor_kartu').val().trim();
    let tglSep = $('#tanggal_sep').val();
    let endpoint = "";

    if (!nomorKartu || !jenisKartu) {
        Swal.fire({
            icon: 'warning',
            title: '',
            text: "Nomor kartu atau pilihan tidak boleh kosong !"
        });
        return;
    }

    if (!tglSep) {
        Swal.fire({
            icon: "info",
            title: "Harap isi tanggal SEP terlebih dahulu."
        }).then(() => {
            tampilkan("#pembuatansep");
        });
        return;
    };

    if (jenisKartu === "nik") {
        endpoint = "p_nik";
        payload= {nik: nomorkartu, tglSEP: tglSep};
    } else if (jenisKartu === "bpjs") {
        endpoint = "p_kartu";
        payload= {nokartu: nomorkartu, tglSEP: tglSep};

    } else {
        Swal.fire({
            icon: 'info',
            title: '',
            text: "Jenis kartu tidak dikenal. Pilih BPJS atau KTP."
        });
        return;
    };

    vclaim_baru(endpoint, "get", payload, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Gagal memproses data."
            })
            return;
        }
        if (res.metaData.code === "200") {
            let p = res.response.peserta;
            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: 'Data BPJS berhasil diproses.'
            }).then(() => {

                $('#namaPeserta').text(p.nama || "Tidak ada data.");
                $('#statusPeserta').text(p.statusPeserta?.keterangan || "Tidak ada data.");
                $('#kelaminPeserta').text(p.sex === "L" ? "Laki-laki" : (p.sex === "P" ? "Perempuan" : "Tidak ada data."));
                $('#tglLahirPeserta').text(p.tglLahir || "Tidak ada data.");
                $('#umurSaatPelayananPeserta').text(p.umur?.umurSaatPelayanan || "Tidak ada data.");
                $('#noKartuPeserta').text(p.noKartu || "Tidak ada data.");
                $('#noKTP').text(p.nik || "Tidak ada data.");
                $('#noRekamMedisPeserta').text(p.mr?.noMR || "Tidak ada data.");
                $('#asalRujukanPeserta').text(p.provUmum?.nmProvider || "Tidak ada data.");
                $('#hakKelasPeserta').text(p.hakKelas?.keterangan || "Tidak ada data.");
                $('#jenisPeserta').text(p.jenisPeserta?.keterangan || "Tidak ada data.");
                $('#tglTMTPeserta').text(p.tglTMT || "Tidak ada data.");
                $('#tglTATPeserta').text(p.tglTAT || "Tidak ada data.");

                sessionStorage.setItem("dataPeserta", JSON.stringify(res));
            });
        } else {
            if (jenisKartu === "nik") {
                Swal.fire({
                    icon: 'error',
                    title: 'Peringatan!',
                    text: "Nomor Induk Kependudukan atau nomor KTP tidak terdaftar!"
                });
            } else if (jenisKartu === "bpjs") {
                Swal.fire({
                    icon: 'error',
                    title: 'Peringatan!',
                    text: "Nomor kartu BPJS tidak ditemukan!"
                });
            }
            return;
        }
    });
};


//Cari Peserta dengan NIK
function cariNIK() {
    let nik = document.getElementById("noKtp").value;
    let tanggalSep = document.getElementById("tgl_sep").value || new Date().toISOString().split("T")[0];

    let endpoint = `Peserta/nik/${nik}/tglSEP/${tanggalSep}`;
    if (!nik) {
        Swal.fire({
            icon: 'info',
            title: '',
            text: "Harap masukkan Nomor KTP terlebih dahulu!"
        });
        return;
    }
    fetch("/bridging", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url: endpoint,
            method: "GET",
            payload: ""
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.metaData.code == 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sukses',
                    text: 'Data BPJS berhasil diproses.'
                });

                console.log(data);
                sessionStorage.setItem("nikData", JSON.stringify(data.response));

                const peserta = data.response.peserta;
                document.getElementById("nama").innerText = peserta.nama || "-";
                document.getElementById("status").innerText = peserta.statusPeserta?.keterangan || "-";
                document.getElementById("jenisKelamin").innerText = peserta.sex === "L" ? "Laki-laki" : peserta.sex === "P" ? "Perempuan" : "-";
                document.getElementById("tanggalLahir").innerText = peserta.tglLahir || "-";
                document.getElementById("noKartuBPJS").innerText = peserta.noKartu || "-";
                document.getElementById("noNIK").innerText = peserta.nik || "-";
                document.getElementById("noRekamMedis").innerText = peserta.mr?.noMR || "-";
                document.getElementById("asalRujukan").innerText = peserta.provUmum?.nmProvider || "-";
                document.getElementById("hakKelas").innerText = peserta.hakKelas?.keterangan || "-";
                document.getElementById("jenisPeserta").innerText = peserta.jenisPeserta?.keterangan || "-";
                document.getElementById("umurSaatPelayanan").innerText = peserta.umur?.umurSaatPelayanan || "-";
                document.getElementById("tglTMT").innerText = peserta.tglTMT || "-";
                document.getElementById("tglTAT").innerText = peserta.tglTAT || "-";

                sessionStorage.setItem("dataPeserta", JSON.stringify(data));
            } else if (data.metaData.code == 404) {
                console.log('error dari bpjs:', data);
            } else {
                console.log('error di terima:', data);
                Swal.fire({
                    icon: 'error',
                    title: 'BPJS Error',
                    text: 'Nomor Kartu Tanda Penduduk/ NIK tidak terdaftar.'
                });
            }
        })
}

document.addEventListener("DOMContentLoaded", function () {
    const data = sessionStorage.getItem("nikData");
    if (data) {
        const parsed = JSON.parse(data);
        isiDataPeserta(parsed.peserta);
    }
});



//Handel untuk form tambahan Kecelakaan Lalu Lintas
$(document).ready(function () {
    $('#lakaLantas').on('change', function () {
        if ($(this).val() !== "" && $(this).val() !== "0") {
            $('#formKLL').removeClass('d-none');
        } else {
            $('#formKLL').addClass('d-none');
        }
    });
});

//Propinsi, Kabupaten, Kecamatan
$(document).ready(function () {
    let endpoint = "referensi/propinsi";
    vclaim(endpoint, function (data) {
        // console.log("provinsi: ", data);
        let $provinsiSelect = $("#provinsi");
        $provinsiSelect.empty();
        $provinsiSelect.append('<option value="">Pilih Provinsi</option>');

        if (data.response && Array.isArray(data.response.list)) {
            data.response.list.forEach(function (option) {
                $provinsiSelect.append(`<option value="${option.kode}">${option.nama}</option>`);
            });
        } else {
            console.error("Data list tidak ditemukan atau bukan array");
        }
    });
    $("#provinsi").change(function () {
        let $kabupatenSelect = $("#kabupaten");
        let $kecamatanSelect = $("#kecamatan");
        $kabupatenSelect.empty();
        $kecamatanSelect.empty();

        let selectedprovinsi = $(this).val();
        vclaim(`referensi/kabupaten/propinsi/${selectedprovinsi}`, function (data) {
            $kabupatenSelect.append('<option value="">Pilih Kabupaten</option>');

            if (data.response && Array.isArray(data.response.list)) {
                data.response.list.forEach(function (option) {
                    $kabupatenSelect.append(`<option value="${option.kode}">${option.nama}</option>`);
                });
            } else {
                console.error("Data list tidak ditemukan atau bukan array");
            }
        });
    });
    $("#kabupaten").change(function () {
        let $kecamatanSelect = $("#kecamatan");
        $kecamatanSelect.empty();

        let selectedkabupaten = $(this).val();
        vclaim(`referensi/kecamatan/kabupaten/${selectedkabupaten}`, function (data) {
            // console.log("kecamatan: ", data);
            $kecamatanSelect.append('<option value="">Pilih Kecamatan</option>');

            if (data.response && Array.isArray(data.response.list)) {
                data.response.list.forEach(function (option) {
                    $kecamatanSelect.append(`<option value="${option.kode}">${option.nama}</option>`);
                });
            } else {
                console.error("Data list tidak ditemukan atau bukan array");
            }
        });
    });
});

//Isi input hidden Propinsi, Kabupaten, Kecamatan
function updateHiddenWilayah() {
    let provinsi = $("#provinsi").val();
    let kabupaten = $("#kabupaten").val();
    let kecamatan = $("#kecamatan").val();

    $("#kdPropinsi").val(provinsi || "");
    $("#kdKabupaten").val(kabupaten || "");
    $("#kdKecamatan").val(kecamatan || "");

    // console.log('kode dipilih:', provinsi, 'kab:', kabupaten, 'kec:', kecamatan);
}
$("#provinsi, #kabupaten, #kecamatan").on("change", updateHiddenWilayah);
$(document).ready(updateHiddenWilayah);

//Spesialistik
$("#kodeSpesialis").autocomplete({
    source: function (request, response) {
        vclaim("referensi/spesialistik", function (data) {
            console.log('data dari bpjs :', data);
            if (data.metaData && data.metaData.code === "200" && data.response.list.length > 0) {
                const results = data.response.list.map(item => ({
                    label: item.kode + " - " + item.nama,
                    value: item.nama,
                    kode: item.kode
                }));
                response(results);
            } else {
                response([{
                    label: 'Spesialistik tidak ditemukan',
                    value: '',
                    disabled: true
                }]);
                Swal.fire({
                    icon: 'error',
                    title: 'BPJS Error',
                    text: data.metaData.message
                });
            }
        }, "GET", "");
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            console.log("Spesialistik dipilih:", ui.item.kode, ui.item.value);
        }
    }
});

//Faskes 
$("#namaPpkPelayanan").autocomplete({
    source: function (request, response) {
        const namaAtauKode = request.term;
        const jenisFaskes = $("#asalRujukan").val();
        if (!namaAtauKode || !jenisFaskes) {
            response(['Jenis faskes atau nama/kode belum diisi']);
            return;
        }
        const url = `referensi/faskes/${encodeURIComponent(namaAtauKode)}/${jenisFaskes}`;
        // console.log('url faskes :', url);
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
                // console.log('data dari bpjs :', data)
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
            console.log("PPK dipilih:", ui.item.kode, ui.item.value);
            $("#ppkPelayanan").val(ui.item.kode);
        }
    }
});


//fungsi isi data sep 
function getKelamin(kode) {
    if (!kode) return "-";
    kode = kode.toUpperCase();
    if (kode === "L") return "Laki-laki";
    if (kode === "P") return "Perempuan";
    return "-";
};

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
    $("#insertsep :input").each(function () {
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

//
function tampilkanDataSEP(data) {
    formMode = "update";
    const pasien = getSession("datapasien")||{};
    const peserta = data.peserta || {};
    const lokasi = data.lokasiKejadian || {};
    const dpjp = data.dpjp || {};
    const pelayanan = data.jnsPelayanan || {};
    const klsRawat = data.klsRawat || {};
    const kontrol = data.kontrol || {};

    // Bagian atas (kartu peserta)
    safeText("nama-sep", peserta.nama);
    safeText("nokartu-bpjs", peserta.noKartu);

    // Tab 1: Data peserta
    safeText("no-kartu", peserta.noKartu);
    safeText("no-nik", peserta.nik);
    safeText("tgl-lahir", peserta.tglLahir);
    safeText("hakKelas", peserta.hakKelas);
    safeText("jenis_peserta", peserta.jnsPeserta);
    safeText("hubungan", peserta.hubungan);

    // Bagian Insert SEP
    safeText("nomorSEP", data.noSep);
    safeText("jenisPelayanan", pelayanan);

    safeValue('kelasRawatHak', klsRawat.klsRawatHak);
    safeValue("kelasRawatNaik", klsRawat.klsRawatNaik);
    safeValue("pembiayaan", klsRawat.pembiayaan);
    safeValue("penanggungJawab", klsRawat?.penanggungJawab);
    safeValue("penjamin", data.penjamin);
    safeValue("tglSep", data.tglSep);
    safeValue("noRujukan", data.noRujukan);
    safeValue("tglRujukan", data.tglRujukan);
    safeValue("namaDPJP", dpjp.nmDPJP);
    safeValue("kodeDPJP", dpjp.kdDPJP);
    safeValue("namaPoliTujuan", `${data.kodePoli || ""} - ${data.poli}`);
    safeValue("poliTujuan", data.kodePoli);
    safeValue("eksekutif", data.poliEksekutif);

    safeValue("ppkPelayanan", data.ppkPelayanan);
    safeValue("namaPpkPelayanan", data.namaPpkPelayanan);

    safeValue("cob", data.cob);
    safeValue("katarak", data.katarak);
    safeValue("tujuanKunj", data.tujuanKunj?.kode);
    safeValue("namatujuanKunj", data.tujuanKunj?.nama);
    safeValue("flagProcedure", data.flagProcedure?.kode);
    safeValue("nmFlagProcedure", data.flagProcedure?.nama);
    safeValue("kdDokter", kontrol.kdDokter);
    safeValue("nmDokter", kontrol.nmDokter);
    safeValue("noSurat", kontrol.noSurat);
    safeValue("noMR", pasien.norm);
    safeValue("diagAwal", data.diagnosa);
    safeValue("kodeDiagAwal", data.diagnosa?.kode);
    safeValue("catatan", data.catatan);

    safeValue("lakaLantas", data.kdStatusKecelakaan);
    safeValue("tglKejadian", lokasi.tglKejadian);
    safeValue("keteranganKejadian", lokasi.ketKejadian);

    safeValue("kdPropinsi", lokasi.kdProp);
    safeValue("kdKabupaten", lokasi.kdKab);
    safeValue("kdKecamatan", lokasi.kdKec);
    safeValue("provinsi", lokasi.kdProp);
    safeValue("kabupaten", lokasi.kdKab);
    safeValue("kecamatan", lokasi.kdKec);

    // Checkbox
    document.getElementById("eksekutif").checked = data.poliEksekutif === "1";
    document.getElementById("cob").checked = data.cob === "1";
    document.getElementById("katarak").checked = data.katarak === "1";

    sessionStorage.setItem("sepData", JSON.stringify(data));
    $("#kontrolView").removeClass("d-none");
    $("#update").addClass("d-none");

    // Scroll ke bawah otomatis (kalau belum)
    $("#insertsepform").removeClass("d-none");
};


//
function tampilDataSepInternal(data) {
    formMode = "update";
    const pasien = getSession("datapasien")||{};

    const peserta = data.peserta || {};
    const lokasi = data.lokasiKejadian || {};
    const dpjp = data.dpjp || {};
    const pelayanan = data.jnsPelayanan || {};
    const klsRawat = data.klsRawat || {};
    const kontrol = data.kontrol || {};

    // Bagian atas (kartu peserta)
    safeText("nama-sep", peserta.nama);
    safeText("nokartu-bpjs", peserta.noKartu);

    // Tab 1: Data peserta
    safeText("no-kartu", peserta.noKartu);
    safeText("no-nik", peserta.nik);
    safeText("tgl-lahir", peserta.tglLahir);
    safeText("hakKelas", peserta.hakKelas);
    safeText("jenis_peserta", peserta.jnsPeserta);
    safeText("hubungan", peserta.hubungan);

    // Bagian Insert SEP
    safeText("nomorSEP", data.noSep);
    safeText("jenisPelayanan", pelayanan);

    safeValue('kelasRawatHak', klsRawat.klsRawatHak);
    safeValue("kelasRawatNaik", klsRawat.klsRawatNaik);
    safeValue("pembiayaan", klsRawat.pembiayaan);
    safeValue("penanggungJawab", klsRawat?.penanggungJawab);
    safeValue("penjamin", data.penjamin);
    safeValue("tglSep", data.tglSep);
    safeValue("noRujukan", data.noRujukan);
    safeValue("tglRujukan", data.tglRujukan);
    safeValue("namaDPJP", dpjp.nmDPJP);
    safeValue("kodeDPJP", dpjp.kdDPJP);
    safeValue("namaPoliTujuan", `${data.kodePoli || ""} - ${data.poli}`);
    safeValue("poliTujuan", data.kodePoli);
    safeValue("eksekutif", data.poliEksekutif);

    safeValue("ppkPelayanan", data.ppkPelayanan);
    safeValue("namaPpkPelayanan", data.namaPpkPelayanan);

    safeValue("cob", data.cob);
    safeValue("katarak", data.katarak);
    safeValue("tujuanKunj", data.tujuanKunj?.kode);
    safeValue("namatujuanKunj", data.tujuanKunj?.nama);
    safeValue("flagProcedure", data.flagProcedure?.kode);
    safeValue("nmFlagProcedure", data.flagProcedure?.nama);
    safeValue("kdDokter", kontrol.kdDokter);
    safeValue("nmDokter", kontrol.nmDokter);
    safeValue("noSurat", kontrol.noSurat);
    safeValue("noMR", pasien.norm);
    safeValue("diagAwal", data.diagnosa);
    safeValue("kodeDiagAwal", data.diagnosa?.kode);
    safeValue("catatan", data.catatan);

    safeValue("lakaLantas", data.kdStatusKecelakaan);
    safeValue("tglKejadian", lokasi.tglKejadian);
    safeValue("keteranganKejadian", lokasi.ketKejadian);

    safeValue("kdPropinsi", lokasi.kdProp);
    safeValue("kdKabupaten", lokasi.kdKab);
    safeValue("kdKecamatan", lokasi.kdKec);
    safeValue("provinsi", lokasi.kdProp);
    safeValue("kabupaten", lokasi.kdKab);
    safeValue("kecamatan", lokasi.kdKec);

    // Checkbox
    document.getElementById("eksekutif").checked = data.poliEksekutif === "1";
    document.getElementById("cob").checked = data.cob === "1";
    document.getElementById("katarak").checked = data.katarak === "1";

    sessionStorage.setItem("sepData", JSON.stringify(data));
    $("#kontrolView").removeClass("d-none");
    $("#update").addClass("d-none");

    // Scroll ke bawah otomatis (kalau belum)
    $("#insertsepform").removeClass("d-none");
};

//
function tampilkanSepRujukan(data) {
    formMode = "insert";
    const pasien = getSession("datapasien")||{};
    
    const peserta = data.peserta || {};
    const lokasi = data.lokasiKejadian || {};
    const dpjp = data.dpjp || {};
    const pelayanan = data.pelayanan || {};
    const klsRawat = data.klsRawat || {};
    const kontrol = data.kontrol || {};

    // Bagian atas (kartu peserta)
    safeText("nama-sep", peserta.nama);
    safeText("nokartu-bpjs", peserta.noKartu);

    // Tab 1: Data peserta
    safeText("no-kartu", peserta.noKartu);
    safeText("no-nik", peserta.nik);
    safeText("tgl-lahir", peserta.tglLahir);
    safeText("hakKelas", peserta.hakKelas.keterangan);
    safeText("jenis_peserta", peserta.jenisPeserta.keterangan);
    safeText("hubungan", peserta.hubungan);
    safeText("ppk-rujukan", data.provPerujuk.nama);

    // Bagian Insert SEP
    safeText("nomorSEP", data.noSep);
    safeText("jenisPelayanan", pelayanan.nama);
    safeValue("jnsPelayanan", pelayanan.kode);

    safeValue('kelasRawatHak', peserta.hakKelas.kode);
    safeValue("kelasRawatNaik", peserta.hakKelas.kode);
    safeValue("pembiayaan", klsRawat.pembiayaan);
    safeValue("penanggungJawab", klsRawat?.penanggungJawab);
    safeValue("penjamin", data.penjamin);
    safeValue("tglSep", data.tglSep);
    safeValue("noRujukan", data.noKunjungan);
    safeValue("tglRujukan", data.tglRujukan || data.tglKunjungan);
    safeValue("namaDPJP", dpjp.nmDPJP);
    safeValue("kodeDPJP", dpjp.kdDPJP);
    safeValue("namaPoliTujuan", data.poliRujukan.nama);
    safeValue("poliTujuan", data.poliRujukan.kode);
    safeValue("eksekutif", data.poliEksekutif);

    safeValue("ppkPelayanan", data.provPerujuk.kode);
    safeValue("namaPpkPelayanan", data.provPerujuk.nama);

    safeValue("cob", peserta.cob);
    safeValue("katarak", data.katarak);
    safeValue("tujuanKunj", data.tujuanKunj?.kode);
    safeValue("namatujuanKunj", data.tujuanKunj?.nama);
    safeValue("flagProcedure", data.flagProcedure?.kode);
    safeValue("nmFlagProcedure", data.flagProcedure?.nama);
    safeValue("kdDokter", kontrol.kdDokter);
    safeValue("nmDokter", kontrol.nmDokter);
    safeValue("noSurat", kontrol.noSurat);
    safeValue("noMR", peserta.mr.noMr || pasien.norm);
    safeValue("noTelp", peserta.mr.noTelp || pasien.nohp);
    safeValue("diagAwal", data.diagnosa?.kode + " -" + " " + data.diagnosa?.nama);
    safeValue("kodeDiagAwal", data.diagnosa?.kode);
    safeValue("catatan", data.catatan);

    safeValue("lakaLantas", data.kdStatusKecelakaan);
    safeValue("tglKejadian", lokasi.tglKejadian);
    safeValue("keteranganKejadian", lokasi.ketKejadian);

    safeValue("kdPropinsi", lokasi.kdProp);
    safeValue("kdKabupaten", lokasi.kdKab);
    safeValue("kdKecamatan", lokasi.kdKec);
    safeValue("provinsi", lokasi.kdProp);
    safeValue("kabupaten", lokasi.kdKab);
    safeValue("kecamatan", lokasi.kdKec);

    // Checkbox
    document.getElementById("eksekutif").checked = data.poliEksekutif === "1";
    document.getElementById("cob").checked = data.cob === "1";
    document.getElementById("katarak").checked = data.katarak === "1";

    sessionStorage.setItem("sepData", JSON.stringify(data));
    tampilkanModeInsert();
    $("#insertsepform").removeClass("d-none");

};

function tampilkanSepPeserta() {
    const data = getSession("dataIGD");
    formMode = "insert";
    console.log(data);
    const peserta = data.peserta || {};

    // Bagian atas (kartu peserta)
    safeText("nama-sep", peserta.nama);
    safeText("nokartu-bpjs", peserta.noKartu);

    // Tab 1: Data peserta
    safeText("no-kartu", peserta.noKartu);
    safeText("no-nik", peserta.nik);
    safeText("tgl-lahir", peserta.tglLahir);
    safeText("hakKelas", peserta.hakKelas.keterangan);
    safeText("jenis_peserta", peserta.jenisPeserta.keterangan);
    safeText("hubungan", peserta.hubungan);
    safeText("ppk-rujukan", data.provUmum.nama);

    // Bagian Insert SEP
    safeText("nomorSEP", data?.noSep);
    safeText("jenisPelayanan", pelayanan?.nama);
    safeValue("jnsPelayanan", pelayanan?.kode);

    safeValue('kelasRawatHak', peserta.hakKelas.kode);
    safeValue("kelasRawatNaik", peserta.hakKelas.kode);
    safeValue("pembiayaan", klsRawat.pembiayaan);
    safeValue("penanggungJawab", klsRawat?.penanggungJawab);
    safeValue("penjamin", data?.penjamin);
    safeValue("tglSep", data?.tglSep);
    safeValue("noRujukan", data?.noKunjungan);
    safeValue("tglRujukan", data?.tglRujukan || data?.tglKunjungan);
    safeValue("namaDPJP", data.dpjp?.nmDPJP); 
    safeValue("kodeDPJP", data.dpjp?.kdDPJP);
    safeValue("namaPoliTujuan", data.poliRujukan?.nama);
    safeValue("poliTujuan", data.poliRujukan?.kode);
    safeValue("eksekutif", data?.poliEksekutif);

    safeValue("ppkPelayanan", data.provPerujuk?.kode);
    safeValue("namaPpkPelayanan", data.provPerujuk?.nama);

    safeValue("cob", peserta.cob);
    safeValue("katarak", data.katarak);
    safeValue("tujuanKunj", data.tujuanKunj?.kode);
    safeValue("namatujuanKunj", data.tujuanKunj?.nama);
    safeValue("flagProcedure", data.flagProcedure?.kode);
    safeValue("nmFlagProcedure", data.flagProcedure?.nama);
    safeValue("kdDokter", kontrol.kdDokter);
    safeValue("nmDokter", kontrol.nmDokter);
    safeValue("noSurat", kontrol.noSurat);
    safeValue("noMR", peserta.mr.noMr || peserta.mr?.noMR);
    safeValue("noTelp", peserta.mr.noTelp || peserta.mr?.noTelepon);
    safeValue("diagAwal", data.diagnosa?.kode + " -" + " " + data.diagnosa?.nama);
    safeValue("kodeDiagAwal", data.diagnosa?.kode);
    safeValue("catatan", data.catatan);

    safeValue("lakaLantas", data.kdStatusKecelakaan);
    safeValue("tglKejadian", lokasi.tglKejadian);
    safeValue("keteranganKejadian", lokasi.ketKejadian);

    safeValue("kdPropinsi", lokasi.kdProp);
    safeValue("kdKabupaten", lokasi.kdKab);
    safeValue("kdKecamatan", lokasi.kdKec);
    safeValue("provinsi", lokasi.kdProp);
    safeValue("kabupaten", lokasi.kdKab);
    safeValue("kecamatan", lokasi.kdKec);

    // Checkbox
    document.getElementById("eksekutif").checked = data.poliEksekutif === "1";
    document.getElementById("cob").checked = data.cob === "1";
    document.getElementById("katarak").checked = data.katarak === "1";

    sessionStorage.setItem("sepData", JSON.stringify(data));
    tampilkanModeInsert();
    $("#insertsepform").removeClass("d-none");

};

//
function isiUpdatePulang(data) {
    const peserta = data.peserta || {};
    const pelayanan = data.jnsPelayanan || {};
    const klsRawat = data.klsRawat || {};

    safeValue("nama_update", peserta.nama);
    safeValue("no_kartu_bpjs", peserta.noKartu);
    safeValue("noSep_update", data.noSep);
    safeValue("pelayanan_update", pelayanan);
    safeValue('kelasRawat_update', klsRawat.klsRawatHak);
    safeValue("tglSep_update", data.tglSep);
    safeValue("poli_update", `${data.kodePoli || ""} - ${data.poli}`);
    safeValue("ppk_pelayanan_update", data.namaPpkPelayanan);
    safeValue("diagnosa_update", data.diagnosa);
    sessionStorage.setItem("sepUpdate", JSON.stringify(data));
};


//Data Sep internal
function dataSepInternal() {
    const noSep = $("#noSepInternal").val();
    
    if (!noSep) {
        Swal.fire('', 'Nomor SEP tidak boleh kosong!', 'warning');
        return;
    };
    const payload = {'nosep19digit': noSep};

    vclaim_baru('v_dataSEPinternal', "get", payload, function (err, res) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: "Gagal mengirim data."
            })
            return;
        }

        if (res.metaData.code === "200") {
            const total = res.response?.count;
            const hasil = res.response.list;
            Swal.fire({
                icon: 'success',
                title: res.metaData.message
            }).then((result) => {
                saveSession("dataSepInternal", hasil);
                if (result.isConfirmed) {
                    tampilDataSepInternal(hasil, total);

                }
            });
        } else if (res.metaData.code === "201") {
            const total = res.response?.count;
            const hasil = getDummy("dataSepInternal")?.response.list;
            Swal.fire({
                icon: 'error',
                text: res.metaData.message
            }).then((result) => {

                saveSession("dataSepInternal", hasil);
                if (result.isConfirmed) {
                    tampilDataSepInternal(hasil, total);
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                text: res.metaData.message
            });
        }
    });
};

//Hapus Sep Internal
function hapusSepInternal() {
    const data = {
        noSep: $("#noSepInterHapus").val(),
        noSurat: $("#noSuratHapus").val(),
        tglRujukanInternal: $("#tglRujukanInternal").val(),
        kdPoliTuj: $("#kdPoliTujuan").val(),
        user: $("#user").val()
    };
    const payload = {
        "request": {
            "t_sep": {
                "noSep": data.noSep,
                "noSurat": data.noSurat,
                "tglRujukanInternal": data.tglRujukanInternal,
                "kdPoliTuj": data.kdPoliTuj,
                "user": data.user
            }
        }
    };
    const url = "v_hapusSEPinternal";
    const method = "delete";

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
                    // Tambahkan aksi sukses disini

                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("")?.response;
                saveSession("", hasil);
                if (result.isConfirmed) {
                    // Tambahkan aksi dummy disini
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};

//Fungsi 
function tampilDataSepInternal(list) {
    let tableBody = document.getElementById("hasilSepInternal");
    let totalSep = document.getElementById("totalSepInternal");

    tableBody.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="11" class="text-center fw-bold">Data SEP Internal belum tersedia.</td></tr>`;
        return;
    }

    list.forEach((item, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
             <td>
                <button class="btn btn-sm btn-secondary detail-rujukan" data-index="${index}">
                    <h5 class="fw-bold">${item.nosep}</h5>
                </button>
            </td>
            <td>${item.tglsep}</td>
            <td>${item.nmpoliasal}</td>
            <td>${item.nmtujuanrujuk}</td>
            <td>${item.nokapst}</td>
            <td>${item.nmdiag}</td>
            <td>${item.nmdokter}</td>
            <td>${item.nosurat}</td>
            <td>${item.flaginternal == "1" ? "Internal" : "External"}</td>
            <td>${item.fdate}</td>
        `;
        tableBody.appendChild(row);
    });
    totalSep.textContent = `Total Data : ${count}`;
}

//Get List Finger Print
function getListFinger() {
    const tgl = $("#tglPelayananListFinger").val();
    const payload = {TglPelayanan: tgl};
    const url = "v_getlistfingerprint";
    const method = "get";

    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            Swal.fire('Server Error', 'Internal Server Error', 'error');
            return;
        }
        const code = res.metaData.code;
        const msg = res.metaData.message;
        if (code === "200") {
            const hasil = res.response.list;
            Swal.fire('', msg, 'success').then((result) => {
                saveSession("", hasil);
                if (result.isConfirmed) {
                    // Tambahkan aksi sukses disini

                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("getlistfinger")?.response.list;
                saveSession("", hasil);
                if (result.isConfirmed) {
                    // Tambahkan aksi dummy disini
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};

//Get Finger Print
function getFingerPrint() {

    const noKartu = $("#noKartuFinger").val();
    const tgl = $("#tglPelayananFinger").val();

    const url = "v_getfingerprint";
    const method = "get";

    vclaim_baru(url, method, {NoKartuPeserta: noKartu, TglPelayanan: tgl}, function (err, res) {
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
                    // Tambahkan aksi sukses disini

                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("")?.response;
                saveSession("", hasil);
                if (result.isConfirmed) {
                    // Tambahkan aksi dummy disini
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};

//Update Pulang SEP
function updatePulang() {
    let data = {
        user: $("#user").val(),
        noSep: $("#noSep_update").val(),
        tglSep: $("#tglSep_update").val(),
        status: $("#status_pulang").val(),
        meninggal: $("#no_surat_meninggal").val() || "",
        tglMeninggal: $("#tanggal_meninggal").val() || "",
        tglPulang: $("#tanggal_pulang").val() || "",
        noLP: $("#laporan_manual").val() || ""

    }

    if (data.tglPulang) {
        const tglPulang = new Date(data.tglPulang);
        const hariIni = new Date();
        const tglSep = new Date($("#tglSep_update").val());
        // Buang jam, menit, detik biar pure tanggal
        tglPulang.setHours(0, 0, 0, 0);
        hariIni.setHours(0, 0, 0, 0);
        tglSep.setHours(0, 0, 0, 0);
        const tanggal = tgl => tgl.toLocaleDateString('id-ID');
        if (tglPulang > hariIni) {
            Swal.fire('Tanggal Tidak Valid', `Tanggal Pulang tidak boleh lebih dari hari ini`, 'warning');
            return;
        }
        if (tglPulang < tglSep) {
            Swal.fire('Tanggal Tidak Valid', `Tgl. Pulang ${tanggal(tglPulang)} tidak boleh lebih kecil dari tgl. SEP ${tanggal(tglSep)}`, 'warning');
            return;
        }

    }

    let kosong = [];
    const wajib = ["user", 'noSep', 'tglPulang'];
    wajib.forEach(key => {
        if (!data[key]) kosong.push(key);
    });
    if (kosong.length > 0) {
        Swal.fire('', kosong + " tidak boleh kosong. Harap Lengkapi data terlebih dahulu!", 'warning');
        return;
    };

    if (data.status == '4') {
        if (!data.meninggal || data.meninggal.length < 5) {
            Swal.fire('', "Nomor Surat Meninggal Kosong. Harap Lengkapi data terlebih dahulu!", 'warning');
            return;
        }
        if (!data.tglMeninggal){
            Swal.fire('', "Tanggal Meninggal Kosong. Harap Lengkapi data terlebih dahulu!", 'warning');
            return;
        }
    };
    const url = "v_updatetglpulang"; // Ganti dengan endpoint
    const method = "put"; //Ganti sesuai kebutuhan method(get, post, put, delete)
    Swal.fire({
        title: 'Konfirmasi',
        text: `Apakah Anda yakin mengUpdate tgl pulang nomor sep ${data.noSep}?`,
        icon: 'question', // Icon konfirmasi
        showCancelButton: true,
        confirmButtonText: 'Ya, Simpan',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            const payload = {
                'request': {
                    "t_sep": {
                        "noSep": data.noSep,
                        "statusPulang": data.status,
                        "noSuratMenginggal": data.meninggal,
                        "tglMeninggal": data.tglMeninggal,
                        "tglPulang": data.tglPulang,
                        "noLPManual": data.noLP,
                        "user": data.user
                    }
                }
            };
            vclaim_baru(url, method, payload, function (err, res) {
                if (err) {
                    Swal.fire('Server Error', 'Internal Server Error', 'error');
                    return;
                }
                const code = res.metaData.code;
                const msg = res.metaData.message;
                if (code === "200") {
                    const hasil = res.response;
                    Swal.fire(msg, "Data Tanggal Pulang SEP berhasil di Update", 'success').then((result) => {
                        saveSession("", hasil);
                        if (result.isConfirmed) {
                            // Tambahkan aksi sukses disini
                            
                        }
                    });
                } else if (code === "201") {
                    Swal.fire('', msg, 'info').then(() => {
                        Swal.fire('', "Data Tanggal Pulang SEP berhasil di Update", 'success');
                    });
                } else { Swal.fire('', msg, 'error') };
            });
        };
    });
};


//Fungsi Vclaim 
function v() {
    const payload = {};
    const url = `endpoint_disini`; // Ganti dengan endpoint
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            return Swal.fire('Server Error', 'Internal Server Error', 'error');
        }
        // console.log("ok: ", res, " error: ", err);
        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';

        if (code === 200) {
            Swal.fire('', msg, 'success').then(() => {
                saveSession("", res.response);
                // Tambahkan aksi sukses di sini, misalnya:
                
            });
        } else if (code === 201) {
            Swal.fire('', msg, 'info').then(() => {
                const hasil = getDummy("")?.response;
                saveSession("", hasil);
                // Tambahkan aksi dummy di sini
            });
        } else {
            Swal.fire('', msg, 'error');
        }
    });
}


$("#ppkRujukan_IGD").autocomplete({
    source: function (request, response) {
        const namaAtauKode = request.term;
        const jenisFaskes = $("#jenisFaskes_igd").val() || "1"; // pastikan ID sesuai

        if (!namaAtauKode || !jenisFaskes) {
            response([{ label: 'Jenis faskes atau nama/kode belum diisi', value: '', disabled: true }]);
            return;
        }

        $("#ppkRujukan_IGD").addClass("loading");

        vclaim_baru("v_faskes", "GET", {kode: namaAtauKode, jnsFaskes: jenisFaskes}, function (err, res) {
            $("#ppkRujukan_IGD").removeClass("loading"); // hapus indikator loading

            if (err) {
                response([{ label: 'Gagal mengambil data PPK', value: '', disabled: true }]);
                return;
            }

            const meta = res?.metaData || res?.metadata || {};
            const code = parseInt(meta.code);
            const msg = meta.message || 'Terjadi kesalahan';

            if (code === 200 && res?.response?.faskes?.length > 0) {
                const results = res.response.faskes.map(item => ({
                    label: `${item.kode} - ${item.nama}`,
                    value: item.nama,
                    kode: item.kode
                }));
                response(results);
            } else {
                response([{ label: 'PPK tidak ditemukan', value: '', disabled: true }]);
            }
        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (ui.item.disabled) {
            event.preventDefault();
        } else {
            console.log("PPK dipilih:", ui.item.kode, ui.item.value);
            $("#kdPpkRujukan_IGD").val(ui.item.kode);
        }
    }
});

function pengajuanSEP(){
    const data = {
        noKartu : $("#noKartuPengajuan").val(),
        tglSep: $("#tglSepPengajuan").val(),
        jnsPelayanan: $("#jenisPelayananPengajuan").val(),
        jsnPengajuan: $("#jenisPengajuan").val(),
        keterangan: $("#keteranganPengajuan").val(),
        user: $("#user").val()
    }
    const payload= {"request": {"t_sep": {data}}}
     vclaim_baru("v_pengajuanSEP", "GET", payload, function (err, res) {
            if (err) {
                response([{ label: 'Gagal mengambil data PPK', value: '', disabled: true }]);
                return;
            }

            const meta = res?.metaData || res?.metadata || {};
            const code = parseInt(meta.code);
            const msg = meta.message || 'Terjadi kesalahan';
            if (code === 200) {
                Swal.fire('', msg, 'success').then(()=>{
                    saveSession('datapengajuansep', meta?.response)
            });
            } else {
                return Swal.fire('', msg, 'warning');
            }
        });
   
}