//Referensi Propinsi
document.addEventListener("DOMContentLoaded", function () {
    let endpoint = "referensi/propinsi";

    fetch("/bridging", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: endpoint,
            method: "GET",
            payload: "",
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            let provinsiSelect = document.getElementById("provinsi");
            provinsiSelect.innerHTML = "";
            let optionElement = document.createElement("option");
            optionElement.value = "";
            optionElement.textContent = "Pilih Provinsi";
            provinsiSelect.appendChild(optionElement);

            if (data.response && Array.isArray(data.response.list)) {
                data.response.list.forEach((option) => {
                    let optionElement = document.createElement("option");
                    optionElement.value = option.kode;
                    optionElement.textContent = option.nama;
                    provinsiSelect.appendChild(optionElement);
                });
            } else {
                console.error("Data list tidak ditemukan atau bukan array");
            }
        });
});
// Referensi Kabupaten
document.getElementById("provinsi").addEventListener("change", function () {
    let kabupatenSelect = document.getElementById("kabupaten");
    let kecamatanSelect = document.getElementById("kecamatan");
    kabupatenSelect.innerHTML = "";
    kecamatanSelect.innerHTML = "";

    if (this.value === "Luar Negeri") {
        document.getElementById("kabupaten").value = "";
        document.getElementById("kecamatan").value = "";
        document.getElementById("kabupaten").disabled = true;
        document.getElementById("kecamatan").disabled = true;
        return;
    } else {
        document.getElementById("kabupaten").disabled = false;
        document.getElementById("kecamatan").disabled = false;
    }


    let selectedprovinsi = this.value;
    fetch("/bridging", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: `referensi/kabupaten/propinsi/${selectedprovinsi}`,
            method: "GET",
            payload: "",
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            let optionElement = document.createElement("option");
            optionElement.value = "";
            optionElement.textContent = "Pilih Kabupaten";
            kabupatenSelect.appendChild(optionElement);
            if (data.response && Array.isArray(data.response.list)) {
                data.response.list.forEach((option) => {
                    let optionElement = document.createElement("option");
                    optionElement.value = option.kode;
                    optionElement.textContent = option.nama;
                    kabupatenSelect.appendChild(optionElement);
                });
            } else {
                console.error("Data list tidak ditemukan atau bukan array");
            }
        });
});
// Referensi Kecamatan
document.getElementById("kabupaten").addEventListener("change", function () {
    let kecamatanSelect = document.getElementById("kecamatan");
    kecamatanSelect.innerHTML = "";

    let selectedkabupaten = this.value;
    fetch("/bridging", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: `referensi/kecamatan/kabupaten/${selectedkabupaten}`,
            method: "GET",
            payload: "",
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            let optionElement = document.createElement("option");
            optionElement.value = "";
            optionElement.textContent = "Pilih Kecamatan";
            kecamatanSelect.appendChild(optionElement);
            if (data.response && Array.isArray(data.response.list)) {
                data.response.list.forEach((option) => {
                    let optionElement = document.createElement("option");
                    optionElement.value = option.kode;
                    optionElement.textContent = option.nama;
                    kecamatanSelect.appendChild(optionElement);
                });
            } else {
                console.error("Data list tidak ditemukan atau bukan array");
            }
        });
});

document.getElementById("kecamatan").addEventListener("change", function () {
    let selectedkecamatan_val = this.value;
    let selectedText = this.options[this.selectedIndex].text;

    let provinsiSelect = document.getElementById("provinsi");
    let selected_provinsi_val = provinsiSelect.value;
    let selected_provinsi_text = provinsiSelect.options[provinsiSelect.selectedIndex].text;

    let kabupatenSelect = document.getElementById("kabupaten");
    let selected_kabupaten_val = kabupatenSelect.value;
    let selected_kabupaten_text = kabupatenSelect.options[kabupatenSelect.selectedIndex].text;

    let sidePanel = document.getElementById("sidePanelContent");
    sidePanel.innerHTML = `
                <h5>Detail Pilihan</h5>
                <p><strong>Provinsi : </strong> ${selected_provinsi_text}</p>
                <p><strong>Kabupaten : </strong> ${selected_kabupaten_text}</p>
                <p><strong>Kecamatan : </strong> ${selectedText}</p>
            `;
    document.getElementById("provinsi_nama").value = selected_provinsi_text;
    document.getElementById("kabupaten_nama").value = selected_kabupaten_text;
    document.getElementById("kecamatan_nama").value = selectedText;
});

document.getElementById("alamatForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const provinsiSelect = document.getElementById("provinsi");
    const kabupatenSelect = document.getElementById("kabupaten");
    const kecamatanSelect = document.getElementById("kecamatan");

    document.getElementById("provinsi_nama").value = provinsiSelect.options[provinsiSelect.selectedIndex]?.text || "";
    document.getElementById("kabupaten_nama").value = kabupatenSelect.options[kabupatenSelect.selectedIndex]?.text || "";
    document.getElementById("kecamatan_nama").value = kecamatanSelect.options[kecamatanSelect.selectedIndex]?.text || "";

    let formData = new FormData(this);

    fetch("/alamat", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.hasil) {
                alert("Data berhasil disimpan: " + data.hasil);
                document.getElementById("alamatForm").reset();
                let sidePanel = document.getElementById("sidePanelContent");
                sidePanel.innerHTML = `<h5>Hasil:</h5><p>${data.hasil}</p>`;
            } else if (data.error) {
                alert("Terjadi error: " + data.error);
            }
            console.log("isi data:", data);
        });
});


//Poli
$("#poliform").autocomplete({
    source: function (request, response) {
        const namaAtauKode = request.term;
        if (!namaAtauKode) {
            response([]);
            return;
        }
        const url = `referensi/poli/${encodeURIComponent(namaAtauKode)}`;
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
            },
            error: function () {
                response([{
                    label: 'Gagal mengambil Data Poli',
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
            console.log("Poli dipilih:", ui.item.kode, ui.item.value);
            $("#sidePanelPoli").html(`
                <h5>Poli yang dipilih:</h5>
                <p><strong>Kode:</strong> ${ui.item.kode}</p>
                <p><strong>Nama:</strong> ${ui.item.value}</p>
            `);
        }
    }
}).autocomplete("instance")._renderItem = function (ul, item) {
    var $li = $("<li>");
    if (item.disabled) { $li.addClass("ui-state-disabled"); }
    $li.append($("<div>").text(item.label));
    return $li.appendTo(ul);
};

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
            $("#sidePanelDiagnosa").html(`
                <h5>Diagnosa yang dipilih:</h5>
                <p><strong>Kode:</strong> ${ui.item.kode}</p>
                <p><strong>Nama:</strong> ${ui.item.value}</p>
            `);
        }
    }
}).autocomplete("instance")._renderItem = function (ul, item) {
    var $li = $("<li>");
    if (item.disabled) { $li.addClass("ui-state-disabled"); }
    $li.append($("<div>").text(item.label));
    return $li.appendTo(ul);
};
