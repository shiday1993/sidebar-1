function getDummy(key = "") {
    const data = {
        dash_tanggal: {
            "metadata": {
                "code": 200,
                "message": "OK"
            },
            "response": {
                "list": [
                    {
                        "kdppk": "0115S006",
                        "waktu_task1": 0,
                        "avg_waktu_task4": 0,
                        "jumlah_antrean": 1,
                        "avg_waktu_task3": 0,
                        "namapoli": "MATA",
                        "avg_waktu_task6": 0,
                        "avg_waktu_task5": 0,
                        "nmppk": "KLINIK UTAMA KL",
                        "avg_waktu_task2": 0,
                        "avg_waktu_task1": 0,
                        "kodepoli": "BED",
                        "waktu_task5": 0,
                        "waktu_task4": 0,
                        "waktu_task3": 0,
                        "insertdate": 1627873951000,
                        "tanggal": "2025-07-26",
                        "waktu_task2": 0,
                        "waktu_task6": 0
                    }
                ]
            }
        },

        dash_bulan: {
            "metadata": {
                "code": 200,
                "message": "OK"
            },
            "response": {
                "list": [
                    {
                        "kdppk": "0115S006",
                        "waktu_task1": 0,
                        "avg_waktu_task4": 0,
                        "jumlah_antrean": 1,
                        "avg_waktu_task3": 0,
                        "namapoli": "BEDAH",
                        "avg_waktu_task6": 0,
                        "avg_waktu_task5": 0,
                        "nmppk": "KLINIK UTAMA KL",
                        "avg_waktu_task2": 0,
                        "avg_waktu_task1": 0,
                        "kodepoli": "BED",
                        "waktu_task5": 0,
                        "waktu_task4": 0,
                        "waktu_task3": 0,
                        "insertdate": 1627873951000,
                        "tanggal": "2021-04-16",
                        "waktu_task2": 0,
                        "waktu_task6": 0
                    }
                ]
            }
        },

        listwaktutask: {
            "response": {
                "list": [
                    {
                        "wakturs": "16-03-2021 11:32:49 WIB",
                        "waktu": "24-03-2021 12:55:23 WIB",
                        "taskname": "mulai waktu tunggu admisi",
                        "taskid": 1,
                        "kodebooking": "Y03-20#1617068533"
                    }
                ]
            },
            "metadata": {
                "code": 200,
                "message": "OK"
            }
        },

        kosong: {
            "metaData": {
                "code": "201",
                "message": "Data tidak ditemukan"
            },
            "response": {}
        }
    };
    return data[key] || data.kosong;
};
