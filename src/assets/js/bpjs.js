function vclaim_baru(endpoint, method = "get", payload = {}, callback) {
    $.ajax({
        url: "/bpjs",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            endpoint: endpoint,
            method: method,
            payload: payload
        }),
        success: function (res) {
            // console.log("Respon BPJS:", res);
            if (typeof callback === "function") {
                callback(null, res);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error BPJS:", error);
            if (typeof callback === "function") {
                callback(error, null);
            }
        }
    });
};

function antrol_rs(endpoint, method = "get", payload = {}, callback) {
    $.ajax({
        url: "/antrol_rs",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            endpoint: endpoint,
            method: method,
            payload: payload
        }),
        success: function (res) {
            // console.log("Respon BPJS:", res);
            if (typeof callback === "function") {
                callback(null, res);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error: ", error);
            if (typeof callback === "function") {
                callback(error, null);
            }
        }
    });
}