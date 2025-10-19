function vclaim(endpoint, onSuccess, onError, method = "GET", payload = "") {
  $.ajax({
    url: "/bridging",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      url: endpoint,
      method: method,
      payload: payload
    }),
    success: onSuccess,
    error: onError || function (xhr, status, errorThrown) {
      const res = JSON.parse(xhr.responseText);
      let msg = "Gagal ambil data bridging: " + endpoint + "!";
      let error = "";
      try {
        if (res.metaData && res.metaData.message) {
          error = res.metaData.message;
        } else {
          error = res.message || res;
        }
      } catch (e) {
        error = xhr.responseText;
      }
      if (xhr.status === 404) {
        msg = "Endpoint BPJS tidak ditemukan. Pastikan URL-nya benar.";
      }
      console.error(msg, error);
      Swal.fire({
        icon: 'error',
        title: 'BPJS Error',
        text: msg
      });
    }
  });
}
