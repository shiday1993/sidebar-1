 //Dokter DPJP
  $("#dokter").autocomplete({
    source: function (r, response) {
      const jnsPerawatan = $("#jenisPerawatan").val();
      const dotker = r.term;
      const tglSep = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      vclaim("referensi/dokter/pelayanan/" + jnsPerawatan + "/tglPelayanan/" + tglSep + "/Spesialis/" + dokter, function (data) {
        console.log('data dari bpjs :', data);
        if (data && data.response && data.response.length > 0) {
          response(data.response.map(item => ({
            label: item.kode + " - " + item.nama,
            value: item.nama
          })));
        } else {
          response([{
            label: 'Dokter tidak ditemukan',
            value: '',
            disabled: true
          }]);
          //   Swal.fire({
          //   icon: 'error',
          //   title: 'BPJS Error',
          //   text: data.metaData.message
          // });
        }
      }, "GET", "");
    },
    minLength: 3,
    select: function (event, ui) {
      if (ui.item.disabled) {
        event.preventDefault();
      } else {
        console.log("Dokter dipilih:", ui.item.kode, ui.item.value);
      }
    }
  });

  //Diagnosa 
  $("#diagnosa").autocomplete({
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
            Swal.fire({
              icon: 'error',
              title: 'BPJS Error',
              text: data.metaData.message
            });
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
        console.log("Diagnosa dipilih:", ui.item.kode, ui.item.value);
      }
    }
  });

  //Poli
  $("#kodePoli").autocomplete({
    source: function (request, response) {
      vclaim("referensi/poli/" + request.term, function (data) {
        console.log('data dari bpjs :', data);

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
      }
    }
  });

  //Poli WS
  $('#cariPoli').on('focus', function () {
    if (!$(this).data('loaded')) {
      vclaim_baru(`ref/poli`, "get", {}, function (err, res) {
        console.log('Data dari BPJS:', res);
        const list = data.response?.list || [];
        if (res.metaData?.code === 200 && list.length > 0) {
          const select = $('<select id="poliDropdown"></select>');
          select.append('<option>Pilih Poli</option>');
          list.forEach(item => {
            select.append(`<option value="${item.kdpoli}">${item.nmpoli}</option>`);
          });

          $('#cariPoli').replaceWith(select);
        } else {
          alert('Gagal mengambil data poli.');
        }
      });
    }
  });

  //Procedure
  $("#procedureInput").autocomplete({
    source: function (request, response) {
      vclaim("referensi/procedure/" + request.term, function (data) {
        console.log('data dari bpjs :', data);

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
        console.log("Procedure dipilih:", ui.item.kode, ui.item.value);
      }
    }
  });


  //Kelas Rawat
  $(document).ready(function () {
    let endpoint = "referensi/kelasrawat";
    vclaim(endpoint, function (data) {
      console.log(data);
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
      console.log(data);
      let $kelas = $("#ruangrawat");
      $kelas.empty();
      $kelas.append('<option value="">Pilih Ruang Rawat</option>');

      if (data.response && Array.isArray(data.response.list)) {
        data.response.list.forEach(function (option) {
          $kelas.append(`<option value="${option.kode}">${option.nama}</option>`);
        });
      } else {
        console.error("Error :", data.metaData.message);
      }
    });
  });

  //Spesialistik
  $(document).ready(function () {
    let endpoint = "referensi/spesialistik";
    vclaim(endpoint, function (data) {
      console.log(data);
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
      console.log(data);
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
      console.log(data);
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
        console.log('data dari bpjs :', data);

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
        console.log("Dokter dipilih:", ui.item.kode, ui.item.value);
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
      console.log('data dari bpjs :', data);
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

  $("#rujukanRS").on("submit", function (e) {
    e.preventDefault();

    const noRujukan = $('#noRujukanRS').val().trim();
    if (!noRujukan) {
      Swal.fire({
        icon: "warning",
        title: 'Perhatian!!',
        text: 'Nomor Rujukan tidak boleh kosong!!!'
      });
    }
    $("#resultRujukan").html('<div class="text-info">Mencari data...</div>');
    vclaim("Rujukan/RS/" + noRujukan, function (data) {
      console.log('data dari bpjs :', data);
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
  $("#rujukKartu").on("submit", function (e) {
    e.preventDefault();

    const noRujukan = $('#noRujukKartu').val().trim();
    if (!noRujukan) {
      Swal.fire({
        icon: "warning",
        title: 'Perhatian!!',
        text: 'Nomor Kartu Pesertatidak boleh kosong!!!'
      });
    }
    $("#resultRujukanKartu").html('<div class="text-info">Mencari data...</div>');
    vclaim("Rujukan/Peserta/" + noRujukan, function (data) {
      console.log('data dari bpjs :', data);
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
        console.log('url faskes :', url);

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
            console.log('data dari bpjs :', data);
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
    console.log("Memuat spesialistik dari URL:", url);

    $("#loadingSpesialis").show();
    $("#tableSpesialis tbody").html("");

    vclaim(url, function (data) {
      console.log('data dari bpjs :', data);
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
      Swal.fire('', "Masukkan kode PPK Rujukan yang valid (8 digit)", 'info');
      return;
    }
    const url = "Rujukan/ListSarana/PPKRujukan/" + ppkRujukan;
    console.log("Memuat List Sarana dari URL:", url);

    $("#loadingSarana").show();
    $("#tableSarana tbody").html("");

    vclaim(url, function (data) {
      console.log('data dari bpjs :', data);
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


  //
  function cariSepInternal() {
    const payload = {};
    const url = `SEP/Internal/${noSep}`; // Ganti dengan endpoint
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

  function a() {
    const payload = {};
    const url = `endpoint_disini`; // Ganti dengan endpoint
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


  // Cari Data Nomor Surat Kontrol
  function getListRencana() {
    const noSurat = $("#noSuratKontrol_cari").val().trim();
    if (!noSurat) {
      Swal.fire("", "Harap isi nomor surat kontrol!", "warning");
      return;
    };

    let endpoint = `RencanaKontrol/noSuratKontrol/${noSurat}`;
    vclaim_baru(endpoint, "get", {}, function (err, res) {
      const code = res.metaData?.code;
      const msg = res.metaData?.message;
      if (err) {
        Swal.fire("Server Error", "Gagal memproses data.", "error");
        return;
      };
      if (code === "200") {
        Swal.fire("", msg, "success").then(() => {
          let data = res?.response || {};
          isiDataSurat(data);
        })
      };
      if (code === "201") {
        Swal.fire("", msg, "warning").then(() => {
          let data = getDummy("carisuratkontrol").response || {};
          isiDataSurat(data);
        });
      } else {
        Swal.fire("", msg, "error"); return;
      }
    })
  };

  // Cari SEP
  function cariSEP() {
    const noSep = document.getElementById("noSep").value.trim();
    if (!noSep) {
      Swal.fire({
        icon: 'info',
        title: '',
        text: "Harap masukkan Nomor SEP terlebih dahulu!"
      });
      return;
    }
    vclaim_baru(`SEP/${noSep}`, "get", {}, function (err, res) {
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
        Swal.fire({
          icon: 'success',
          title: message,
          text: "Data berhasil di proses."
        }).then(() => {
          tampilkanDataSEP(data);
          const modal = new mdb.Modal(document.getElementById('hasilSep'));
          modal.show();
        });
      } else if (code === "201") {
        // console.log(res);
        Swal.fire({
          icon: 'info',
          title: 'Perhatian',
          text: message
        }).then(() => {
          const data = getDummy("sep").response;
          Swal.fire({
            icon: 'info',
            title: 'Data tidak ditemukan',
            text: "Menampilkan Data dummy ke halaman insert SEP untuk testing."
          }).then(() => {
            tampilkanDataSEP(data);
           
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
  function tampilkanDataSEP(data) {
    const modal = new mdb.Modal(document.getElementById('hasilSEP'));modal.show();
    $("#nama").text(data.peserta.nama || "-");
    $("#nomor_sep").text(data.noSep || "-");
    $("#jenis_kelamin").text(data.peserta.jkel === 'L' ? 'Laki-laki' : 'Perempuan');
    $("#tanggal_lahir").text(data.peserta.tglLahir || "-");
    $("#noKartuBPJS").text(data.peserta.noKartu || "-");
    $("#nomor_rujukan").text(data.noRujukan || "-");
    $("#no_rm").text(data.peserta.mr?.noMR || "-");
    $("#tgl_sep").text(data.tglSep || "-");
    $("#jenis_pelayanan").text(data.jnsPelayanan === '1' ? 'Rawat Inap' : 'Rawat Jalan');
    $("#kelas_rawat").text(data.kelasRawat.keterangan || "-");
    $("#diagnosa").text(data.diagnosa || "-");
    $("#poli_sep").text(data.poli || "-");
    $("#poli_eksekutif").text(data.poliEksekutif === '1' ? 'Ya' : 'Tidak');
  }


  function callBPJS() {
    antrol_rs("/ref/poli", function (data) {
      console.log(data);
    });
  };
  function test() {
    Swal.fire('', 'Data tidak ditemukan. Nomor SEP tidak sesuai. ', 'warning')
  };
