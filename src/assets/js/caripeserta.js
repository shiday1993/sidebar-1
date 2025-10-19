$(document).ready(function () {
  $("#cariPeserta").on("submit", function (e) {
    e.preventDefault();
    console.log("form di submit");
    const noKartu = $('#nomor_kartu').val().trim();
    const jnsKartu = $('input[name="jns_kartu"]:checked').val();
    const tanggalSep = $("#tanggal_sep").val() || new Date().toISOString().split("T")[0];
    let endpoint = "";
    if (!noKartu || !jnsKartu) {
      Swal.fire({
        icon: 'warning',
        text: "Nomor kartu atau pilihan tidak boleh kosong !"
      });
      return;
    } else if (jnsKartu === "nik" || jnsKartu == 'bpjs') {
      endpoint = 'Rujukan/RS/List/Peserta/' + noKartu;

    } else {
      Swal.fire({
        icon: 'info',
        title: '',
        text: "Jenis kartu tidak dikenal. Pilih BPJS atau NIK (eKTP)."
      });
      return;
    }
    $("#hasilCariPeserta").html('<tr><td colspan="7" class="text-center text-info">Loading data...</td></tr>');
    vclaim(endpoint, function (data) {
      console.log('data dari bpjs :', data);
      if (data.metaData?.code === "200" || data.metaData.code === "201") {
        let pList = data.response?.rujukan || [];
        if (!pList.length) {
          // console.warn("Data rujukan kosong, menampilkan dummy.");
          Swal.fire({
            icon: "error",
            title: "Data tidak ditemukan",
            text: data.metaData.message,
          }).then(()=>{
            Swal.fire({
              icon: "info",
              text: "Menampilkan data dummy sebagai contoh.",
            });

          });
         
          pList = [
            {
              "diagnosa": {
                "kode": "I21.9",
                "nama": "Acute myocardial infarction, unspecified"
              },
              "keluhan": "",
              "noKunjungan": "0304R0050217A000079",
              "pelayanan": {
                "kode": "2",
                "nama": "Rawat Jalan"
              },
              "peserta": {
                "cob": {
                  "nmAsuransi": null,
                  "noAsuransi": null,
                  "tglTAT": null,
                  "tglTMT": null
                },
                "hakKelas": {
                  "keterangan": "KELAS III",
                  "kode": "3"
                },
                "informasi": {
                  "dinsos": null,
                  "noSKTM": null,
                  "prolanisPRB": null
                },
                "jenisPeserta": {
                  "keterangan": "PBI (APBN)",
                  "kode": "21"
                },
                "mr": {
                  "noMR": "971430",
                  "noTelepon": null
                },
                "nama": "MUHAMMAD JUSAR",
                "nik": "1106081301530001",
                "noKartu": "0105986780439",
                "pisa": "1",
                "provUmum": {
                  "kdProvider": "03050301",
                  "nmProvider": "BASO"
                },
                "sex": "L",
                "statusPeserta": {
                  "keterangan": "AKTIF",
                  "kode": "0"
                },
                "tglCetakKartu": "2017-11-13",
                "tglLahir": "1953-07-01",
                "tglTAT": "2053-07-01",
                "tglTMT": "2013-01-01",
                "umur": {
                  "umurSaatPelayanan": "63 tahun ,7 bulan ,23 hari",
                  "umurSekarang": "64 tahun ,4 bulan ,12 hari"
                }
              },
              "poliRujukan": {
                "kode": "",
                "nama": ""
              },
              "provPerujuk": {
                "kode": "0304R005",
                "nama": "RSI IBNU SINA"
              },
              "tglKunjungan": "2025-05-24"
            }
          ];
        }
        sessionStorage.setItem("dataRujukan", JSON.stringify({ rujukan: pList }));
        let tableRows = "";
        pList.forEach((p, index) => {
          tableRows += `
            <tr class="text-center align-top">
              <td>${index + 1}</td>
              <td>
                <a class="btn btn-light btn-sm" href="/sep/buat" type="button">${p.noKunjungan}</a>
              </td>
              <td>${p.tglKunjungan}</td>
              <td>${p.peserta?.noKartu || '-'}</td>
              <td>${p.peserta?.nama || '-'}</td>
              <td>${p.provPerujuk?.nama || '-'}</td>
              <td>${p.poliRujukan?.nama || '-'}</td>
            </tr>
          `;
        });

        $("#hasilCariPeserta").html(tableRows);
      } else {
        Swal.fire({
          icon: "error", text: "Data rujukan tidak ditemukan. Nomor Rujukan lebih dari 90 hari"
        });
        $('#hasilCariPeserta').html('');
      }
    }, "GET", "");
  });
});