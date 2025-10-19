//Fungsi Vclaim 
function dataKunjungan() {
    const tanggal = '';
    const jnsPelayanan = "";
    const payload = {Tanggal: tanggal, JnsPelayanan: jnsPelayanan};
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru("kunjungan", method, payload, function (err, res) {
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

function dataKlaim() {
    const tanggal = '';
    const jnsPelayanan = "";
    const Status = "";
    const payload = {tanggal: tanggal, JnsPelayanan: jnsPelayanan, Status: status};
    
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru("klaim", method, payload, function (err, res) {
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

function dataHistoriPelayanan() {
    const nokartu = $("#no-kartu").text();

    const { tglMulai, tglAkhir } = getTanggalHistori();
    const payload = {NoKartu: nokartu, tglMulai: tglMulai, tglAkhir: tglAkhir};
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru("histori_pelayanan", method, payload, function (err, res) {
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

function getTanggalHistori() {
    const today = new Date();
    const tglAwal = new Date(today);
    tglAwal.setMonth(tglAwal.getMonth() - 2);

    function formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = ('0' + (date.getMonth() + 1)).slice(-2);
        const dd = ('0' + date.getDate()).slice(-2);
        return `${yyyy}-${mm}-${dd}`;
    }

    const tglAkhir = formatDate(today);
    const tglMulai = formatDate(tglAwal);

    return { tglMulai, tglAkhir };
}

function renderHistori() {
    const data = getSession("datahistori").histori || [];

    const container = $("#histori-sep");
    container.empty();

    if (Array.isArray(data) && data.length > 0) {
        const pelayanan = data.jnsPelayanan === 1 ? "Rawat Inap" : "Rawat Jalan";
        data.forEach(item => {
            const html = `
                <div class="border border-secondary mb-2 p-2 rounded">
                    <strong><u>${item.noSep || '-'}</u></strong><br>
                    <small>${pelayanan || "-"}</small><br>
                    <small>${item.poli || '-'}</small><br>
                    <small>Tgl. SEP : ${item.tglSep || '-'}</small><br>
                    <small>${item.noRujukan || '-'}</small><br>
                    <small>${item.diagnosa || '-'}</small> <br>
                    <small>${item.ppkPelayanan || '-'}</small> <br>
                    
                </div>
            `;
            container.append(html);
        });
    } else {
        container.html(`
            <div class="border border-secondary mb-2 p-2">
                <h6><u>Data tidak tersedia</u></h6>
                <small>-</small><br>
                <small>-</small><br>
                <small>-</small><br>
                <small>-</small><br>
                <small>-</small><br>
                <small>-</small><br>
            </div>
        `);
    }
}


function laporanjaminan() {
    const tglMulai = $("#tglAwal_jaminan").val();
    const jnsPelayanan = $("#jnsPelayanan_jaminan").val();
    const tglAkhir = $("#tglAkhir_jaminan").val();
    if (!tglMulai || !tglAkhir || !jnsPelayanan) {
        return Swal.fire('Data tidak lengkap', 'Silakan isi semua filter terlebih dahulu.', 'warning');
    };
    const payload= {JnsPelayanan: jnsPelayanan, tglMulai: tglMulai, tglAkhir: tglAkhir}
    const url = "histori_klaimjaminan"; // Ganti dengan endpoint
    const method = "get"; 
    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            return Swal.fire('Server Error', 'Internal Server Error', 'error');
        }
        // console.log("ok: ", res, " error: ", err);
        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';
       
        const render = (listData) => {
            const columns = [
                { key: "index", label: "No" },
                { key: "sep.noSEP", label: "No SEP" },
                { key: "sep.tglSEP", label: "Tgl SEP" },
                { key: "sep.tglPlgSEP", label: "Tgl Pulang" },
                { key: "sep.noMr", label: "No MR" },
                { key: "sep.jnsPelayanan", label: "Jenis Pelayanan" },
                { key: "sep.poli", label: "Poli" },
                { key: "sep.diagnosa", label: "Diagnosa" },
                { key: "sep.peserta.noKartu", label: "No Kartu" },
                { key: "sep.peserta.nama", label: "Nama Peserta" },
                { key: "jasaRaharja.tglKejadian", label: "Tgl Kejadian" },
                { key: "jasaRaharja.noRegister", label: "No Register" },
                { key: "jasaRaharja.ketStatusDijamin", label: "Status Dijamin" },
                { key: "jasaRaharja.ketStatusDikirim", label: "Status Dikirim" },
                { key: "jasaRaharja.biayaDijamin", label: "Biaya Dijamin" },
                { key: "jasaRaharja.plafon", label: "Plafon" },
                { key: "jasaRaharja.jmlDibayar", label: "Jumlah Dibayar" },
                { key: "jasaRaharja.resultsJasaRaharja", label: "Hasil JR" }
            ];

            renderTable("#hasiljaminan", listData, columns, [], 'Belum Ada data.', true, 'hasiljaminan');

        };

        if (code === 200) {
            Swal.fire('', msg, 'success').then((result) => {
            saveSession("laporanjaminan", res.response?.jaminan);
            if (result.isConfirmed) {
                const storedData = getSession("laporanjaminan");
                render(storedData);
            }
        });

        } else {
            Swal.fire('', msg, 'warning').then((result) => {
            const dummy = getDummy("laporanjaminan").response?.jaminan;
            saveSession("laporanjaminan", dummy);
                if (result.isConfirmed) {
                    const store = getSession("laporanjaminan");
                    render(store);
                }
            });
        }
    });
};

function exportJaminan(){
    exportToExcel("hasiljaminan","data-hasil-jaminan.xlsx")
}