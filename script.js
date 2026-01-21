let data = [];
let current = "nganhang";

const files = {
    nganhang: "data/nganhang.txt",
    kbnn: "data/kbnn.txt",
    dbhc: "data/dbhc.txt"
};

/* ======================
   CHUẨN HÓA TIẾNG VIỆT
====================== */
function norm(s) {
    return s.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, " ");
}

/* ======================
   LOAD FILE
====================== */
async function loadFile(type) {

    current = type;

    const res = await fetch(files[type]);
    const text = await res.text();

    const lines = text.split(/\r?\n/).filter(x => x.trim());

    data = lines.map(line => {
        const cols = line.split(/\t+/);

        if (type === "nganhang") {
            return {
                ma: cols[0],
                ten: cols[1],
                search: norm(cols.join(" "))
            };
        }

        if (type === "kbnn") {
            return {
                ten: cols[0],
                ma: cols[1],
                tinh: cols[2],
                search: norm(cols.join(" "))
            };
        }

        // dbhc
        return {
            ma: cols[0],
            ten: cols[1],
            tinh: cols[2],
            search: norm(cols.join(" "))
        };
    });

    renderHeader();
    document.getElementById("result").innerHTML = "";
}

/* ======================
   HEADER TABLE
====================== */
function renderHeader() {
    const thead = document.getElementById("thead");

    if (current === "nganhang") {
        thead.innerHTML = `
            <tr>
                <th style="width:25%">Mã NH</th>
                <th style="width:75%">Tên ngân hàng</th>
            </tr>`;
    }

    if (current === "kbnn") {
        thead.innerHTML = `
            <tr>
                <th style="width:60%">Tên Kho bạc</th>
                <th style="width:15%">Mã</th>
                <th style="width:25%">Tỉnh/TP</th>
            </tr>`;
    }

    if (current === "dbhc") {
        thead.innerHTML = `
            <tr>
                <th style="width:20%">Mã</th>
                <th style="width:50%">Tên xã/phường</th>
                <th style="width:30%">Tỉnh/TP</th>
            </tr>`;
    }
}

/* ======================
   TÌM KIẾM
====================== */
document.getElementById("keyword").addEventListener("input", function () {

    const key = norm(this.value);
    if (!key) {
        document.getElementById("result").innerHTML = "";
        return;
    }

    const keys = key.split(/\s+/);

    let html = "";
    let count = 0;

    for (let row of data) {

        let ok = true;

        for (let k of keys) {
            if (!row.search.includes(k)) {
                ok = false;
                break;
            }
        }

        if (!ok) continue;

        if (current === "nganhang") {
            html += `
            <tr>
                <td>${row.ma}</td>
                <td>${row.ten}</td>
            </tr>`;
        }

        if (current === "kbnn") {
            html += `
            <tr>
                <td>${row.ten}</td>
                <td style="text-align:center">${row.ma}</td>
                <td style="text-align:center">${row.tinh}</td>
            </tr>`;
        }

        if (current === "dbhc") {
            html += `
            <tr>
                <td>${row.ma}</td>
                <td>${row.ten}</td>
                <td>${row.tinh}</td>
            </tr>`;
        }

        count++;
        if (count >= 200) break;
    }

    document.getElementById("result").innerHTML =
        html || "<tr><td colspan='3'>Không tìm thấy</td></tr>";
});

/* ======================
   TAB
====================== */
function openTab(type) {
    document.querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));
    event.target.classList.add("active");

    document.getElementById("keyword").value = "";
    loadFile(type);
}

/* LOAD MẶC ĐỊNH */
loadFile("nganhang");
