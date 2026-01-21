let rawData = [];
let currentFile = "dbhc.txt";
let lastResult = [];

const input = document.getElementById("searchInput");
const tbody = document.getElementById("results");
const thead = document.getElementById("table-head");
const tabs = document.querySelectorAll(".tab");

/* =====================
   CHUẨN HÓA TIẾNG VIỆT
===================== */
function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/* =====================
   LOAD FILE TXT
===================== */
async function loadFile(file) {
    input.value = "";
    tbody.innerHTML = "";
    rawData = [];

    const res = await fetch("data/" + file);
    const text = await res.text();

    rawData = text.split(/\r?\n/).filter(x => x.trim());

    buildHeader(file);
}

loadFile(currentFile);

/* =====================
   HEADER TABLE
===================== */
function buildHeader(file) {
    if (file === "dbhc.txt")
        thead.innerHTML = "<th>Mã</th><th>Phường / Xã</th><th>Tỉnh / Huyện</th>";
    else if (file === "kbnn.txt")
        thead.innerHTML = "<th>Tên Kho bạc</th><th>Mã</th><th>Tỉnh</th>";
    else
        thead.innerHTML = "<th>Mã</th><th>Ngân hàng</th>";
}

/* =====================
   SEARCH DBHC (ƯU TIÊN CAO)
===================== */
function searchDBHC(keyword) {

    const q = normalize(keyword);
    const keys = q.split(" ");

    let results = [];

    for (let line of rawData) {

        const cols = line.split(/\t| {2,}/);

        const ma = cols[0] || "";
        const ten = cols[1] || "";
        const tinh = cols[2] || "";

        const nTen = normalize(ten);
        const nTinh = normalize(tinh);
        const full = normalize(ten + " " + tinh);

        let score = 0;

        // khớp tuyệt đối
        if (full === q) score += 300;

        // cụm đầy đủ
        if (full.includes(q)) score += 150;

        // tên xã/phường cực ưu tiên
        if (nTen.includes(q)) score += 120;

        // tỉnh/huyện
        if (nTinh.includes(q)) score += 80;

        // từng từ
        keys.forEach(k => {
            if (nTen.includes(k)) score += 25;
            if (nTinh.includes(k)) score += 15;
        });

        // mã
        if (ma.includes(keyword)) score += 200;

        if (score > 0)
            results.push({ line, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 40);
}

/* =====================
   SEARCH KHÁC
===================== */
function searchNormal(keyword) {

    const q = normalize(keyword);
    const keys = q.split(" ");

    let results = [];

    for (let line of rawData) {

        const n = normalize(line);
        let score = 0;

        if (n.includes(q)) score += 80;

        keys.forEach(k => {
            if (n.includes(k)) score += 20;
        });

        if (score > 0)
            results.push({ line, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 50);
}

/* =====================
   INPUT SEARCH
===================== */
input.addEventListener("input", () => {

    tbody.innerHTML = "";
    lastResult = [];

    const keyword = input.value.trim();
    if (!keyword) return;

    let results = [];

    if (currentFile === "dbhc.txt")
        results = searchDBHC(keyword);
    else
        results = searchNormal(keyword);

    lastResult = results;

    const keys = normalize(keyword).split(" ");

    results.forEach(obj => {

        const cols = obj.line.split(/\t| {2,}/);
        const tr = document.createElement("tr");

        cols.forEach(col => {

            let html = col;

            keys.forEach(k => {
                if (k.length > 1) {
                    const reg = new RegExp(`(${k})`, "gi");
                    html = html.replace(reg, "<mark>$1</mark>");
                }
            });

            const td = document.createElement("td");
            td.innerHTML = html;
            tr.appendChild(td);
        });

        tr.onclick = () => {
            navigator.clipboard.writeText(cols[0]);
            alert("Đã copy: " + cols[0]);
        };

        tbody.appendChild(tr);
    });
});

/* =====================
   TAB SWITCH
===================== */
tabs.forEach(tab => {
    tab.onclick = () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentFile = tab.dataset.file;
        loadFile(currentFile);
    };
});
