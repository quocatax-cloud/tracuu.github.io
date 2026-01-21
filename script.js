let rawData = [];
let currentFile = "dbhc.txt";
let lastResult = [];
 
const input = document.getElementById("searchInput");
const tbody = document.getElementById("results");
const thead = document.getElementById("table-head");
const tabs = document.querySelectorAll(".tab");

/* =====================
   CHUẨN HÓA
===================== */

function normalize(s) {
    return s.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/* =====================
   LOAD TXT
===================== */

async function loadFile(file) {
    tbody.innerHTML = "";
    input.value = "";

    const res = await fetch("data/" + file);
    const text = await res.text();

    rawData = text.split(/\r?\n/).filter(l => l.trim());
    buildHeader(file);
}

loadFile(currentFile);

/* =====================
   HEADER
===================== */

function buildHeader(file) {
    if (file === "dbhc.txt")
        thead.innerHTML = "<th>Mã</th><th>Xã / Phường</th><th>Tỉnh</th>";
    else if (file === "kbnn.txt")
        thead.innerHTML = "<th>Tên KBNN</th><th>Mã</th><th>Tỉnh</th>";
    else
        thead.innerHTML = "<th>Mã</th><th>Ngân hàng</th>";
}

/* =====================
   SEARCH
===================== */

input.addEventListener("input", () => {
    const q = normalize(input.value);
    tbody.innerHTML = "";
    lastResult = [];

    if (!q) return;

    const keys = q.split(" ");

    let scored = [];

    for (let line of rawData) {
        const n = normalize(line);
        let score = 0;

        keys.forEach(k => {
            if (n.includes(k)) score += 2;
        });

        if (n.startsWith(q)) score += 5;
        if (score > 0)
            scored.push({ line, score });
    }

    scored.sort((a, b) => b.score - a.score);
    scored = scored.slice(0, 50);

    lastResult = scored;

    scored.forEach(obj => {
        const cols = obj.line.split(/\s{2,}|\t/);

        const tr = document.createElement("tr");

        cols.forEach(c => {
            let html = c;
            keys.forEach(k => {
                const reg = new RegExp(`(${k})`, "gi");
                html = html.replace(reg, "<mark>$1</mark>");
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
   TAB
===================== */

tabs.forEach(t => {
    t.onclick = () => {
        tabs.forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        currentFile = t.dataset.file;
        loadFile(currentFile);
    };
});
