//
function batal() {
    window.location.replace("/lpk?lpk=true");
};
$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('lpk') === 'true') {
        tampilkan('#lpk');
    }
});

//Cari Data LPK
function cariLPK() {
    const tglMasuk = $("#tglMasuk").val();
    const jnsPelayanan = $('jnsPelayanan').val();
    if (!tglMasuk) {
        Swal.fire("", "Tanggal masuk tidak boleh kosong!", "warning"); 
        return;
    };
    if(!jnsPelayanan){
        Swal.fire("", "Pilih jenis pelayanan!", "warning"); 
        return;
    };
    let endpoint = `LPK/TglMasuk/${tglMasuk}/JnsPelayanan/${jnsPelayanan}`;
    vclaim_baru(endpoint, "get", {}, function (err, res){
        const code = res.metaData?.code;
        const msg = res.metaData?.message;
        if (err){
            Swal.fire("Server Error", "Gagal memproses data.", "error");
            return;
        };
        if (code === "200"){
            Swal.fire("", msg, "success").then(() =>{
                let  data = res?.response || {};
                isiDataModal(data);
            })
        };
        if(code === "201"){
            Swal.fire("", msg,"warning").then(()=>{
                let data = getDummy("seprencana").response ||{};
                isiDataModal(data);
            });
        }else {
            Swal.fire("", msg, "error"); return;
        }
    })
};

//Insert LPK
$(document).ready(function () {
    $("#btn-simpan-sep").on("click", function (e) {
        e.preventDefault();
        let kosong = [];
        let data = {
            user: $("#user").val(),
            noSep: $("#noSep").val(),
            tglMasuk: $("#tglMasuk").val(),
            tglKeluar:$("#tglKeluar").val(),
            jaminan: $("#jaminan").val()||"1",
            poli:$("#kodePoli").val(),
            ruangRawat: $("#ruangRawat").val(),
            kelasRawat: $("#kelasRawat").val(),
            spesialistik: $("#spesialistik").val(),
            caraKeluar:$("#caraKeluar").val(),
            kondisiPulang:$("#kondisiPulang").val(),
            kdDiagnosa1: $("#kdDiagnosa1").val(),
            kdDiagnosa2:$("#kdDiagnosa2").val(),
            lvlDiagnosa1: $("#lvlDiagnoa1").val(),
            lvlDiagnosa2: $("#lvlDiagnosa2").val(),
            kdProcedure1:$("#kdProcedure1").val(),
            kdProcedure2:$("#kdProcedure2").val(),
            tindakLanjut:$("#tindakLanjut").val(),
            kodePPK:$("#kodePPK").val(),
            tglKontrol:$("#tglKontrol").val(),
            poliKontrol:$("#poliKontrol").val(),
            kodeDPJP: $("#kodeDPJP").val(),
        };

        Object.keys(data).forEach(key => {
            if (data[key] === undefined || data[key] == null) {
                data[key] = "";
            }
        });

        const wajib = ["tglMasuk", "tglKeluar", "noSep", "user"];
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
                "t_lpk": {
                    "noSep": data.noSep,
                    "tglMasuk": data.tglMasuk,
                    "tglKeluar": data.tglKeluar,
                    "jaminan": data.jaminan,
                    "poli": {
                        "poli": data.poli
                    },
                    "perawatan": {
                        "ruangRawat": data.ruangRawat,
                        "kelasRawat": data.kelasRawat,
                        "spesialistik": data.spesialistik,
                        "caraKeluar": data.caraKeluar,
                        "kondisiPulang": data.kondisiPulang
                    },
                    "diagnosa": [
                        {
                            "kode": data.kdDiagnosa1,
                            "level": data.lvlDiagnosa1
                        },
                        {
                            "kode": data.kdDiagnosa2,
                            "level": data.lvlDiagnosa2
                        }
                    ],
                    "procedure": [
                        {
                            "kode": data.kdProcedure1
                        },
                        {
                            "kode": data.kdProcedure2
                        }
                    ],
                    "rencanaTL": {
                        "tindakLanjut": data.tindakLanjut,
                        "dirujukKe": {
                            "kodePPK": data.kodePPK
                        },
                        "kontrolKembali": {
                            "tglKontrol": data.tglKontrol,
                            "poli": data.poliKontrol
                        }
                    },
                    "DPJP": data.kodeDPJP,
                    
                    "user": data.user
                }
            }
        };
        // console.log('Data yg dikirim: ', JSON.stringify(payload)); // Debug
        vclaim_baru("LPK/insert", "post", payload, function (err, res) {
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
                    tittle: res.metaData.message
                }).then((result) => {
                    saveSession("insertlpk", hasil);
                    reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    text: res.metaData.message
                }).then((result) => {
                    const hasil = getDummy("insertlpk")?.response;
                    saveSession("insertlpk", hasil);
                    reload();
                });
            }
        });
    });
});