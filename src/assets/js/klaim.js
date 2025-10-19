//
function batal() {
    window.location.replace("/klaim?klaim=true");
};
$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('klaim') === 'true') {
        tampilkan('#klaim');
    }
});

// Cari Data Klaim
function cariDataKlaim() {
    const tglSep = $("#noSep").val();
    const jnsPelayanan = $('jnsPelayanan').val();
    if (!tglSep) {
        Swal.fire("", "Tanggal SEP tidak boleh kosong!", "warning"); 
        return;
    };
    if(!jnsPelayanan){
        Swal.fire("", "Pilih jenis pelayanan!", "warning"); 
        return;
    };
    let endpoint = `Monitoring/Kunjungan/Tanggal/${tglSep}/JnsPelayanan/${jnsPelayanan}`;
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
