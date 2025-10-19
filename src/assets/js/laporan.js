//Fungsi Laporan Kunjungan
function laporanklaim() {
    const tanggal = $("#tanggalAwal").val() || $("#tanggalAkhir").val();
    const pelayanan = $("#jenisPelayanan").val();
    const payload = {};
    const url = `Monitoring/Kunjungan/Tanggal/${tanggal}/JnsPelayanan/${pelayanan}`; // Ganti dengan endpoint
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            Swal.fire('Server Error', 'Internal Server Error', 'error');
            return;
        }
        const code = res.metaData.code;
        const msg = res.metaData.message;
        if (code === "200") {
            const hasil = res.response.sep;
            Swal.fire('', msg, 'success').then((result) => {
                saveSession("laporanklaim", hasil);
                if (result.isConfirmed) {
                    tampilkanklaim(hasil);
                }
            });
        } else if (code === "201") {
            Swal.fire('', msg, 'info').then((result) => {
                const hasil = getDummy("datakunjungan")?.response.sep;
                saveSession("laporanklaim", hasil);
                if (result.isConfirmed) {
                   tampilkanklaim(hasil);
                }
            });
        } else { Swal.fire('', msg, 'error') };
    });
};

document.getElementById('exportExcel').addEventListener('click', function() {
    const data = getSession("laporanklaim")
    if (data.length === 0) {
        alert("Data kosong!");
        return;
    }

    const wsData = data.map(item => ({
        Nama: item.nama,
        NoKartu: item.noKartu,
        NoSEP: item.noSep,
        Diagnosa: item.diagnosa,
        KelasRawat: item.kelasRawat,
        TglSEP: item.tglSep,
        TglPulang: item.tglPlgSep
    }));

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataKlaim");

    XLSX.writeFile(workbook, "klaim_sep.xlsx");
});

function tampilkanklaim(data){
    $("#dataklaimkunjungan").removeClass("d-none");
    if (!Array.isArray(data)) { data = [data]; }
    let html='';
    if (!data.length) {
        html = `<tr><td colspan="8" class="text-center">Data tidak ditemukan.</td></tr>`;
    } else {
        html = data.map((item, index) => 
            `<tr>
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td>${item.noKartu}</td>
                <td>${item.noSep}</td>
                <td>${item.diagnosa}</td>
                <td>${item.kelasRawat}</td>
                <td>${item.tglSep}</td>
                <td>${item.tglPlgSep}</td>
            </tr>`
        ).join('');
    }

    $("#hasilkunjungan").html(html);
}