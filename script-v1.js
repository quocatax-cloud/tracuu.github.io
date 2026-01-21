let rawLines = [];
let convertedLines = [];
let currentFile = "nganhang";

const files = {
    nganhang: "nganhang.txt",
    kbnn: "kbnn.txt",
    dbhc: "dbhc.txt"
};

/* ===== CHUẨN HÓA TIẾNG VIỆT ===== */
function normalizeVN(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/òa|óa|ỏa|õa|ọa/g, "oa")
        .replace(/oà|oá|oả|oã|oạ/g, "oa")
        .replace(/uỳ|úy|ủy|ũy|ụy/g, "uy")
        .replace(/uý|uỳ|uỷ|uỹ|uỵ/g, "uy");
}

/* ===== LOAD FILE TXT 1 LẦN ===== */
async function loadFile(type) {
    const res = await fetch(files[type]);
    const text = await res.text();

    rawLines = text
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    convertedLines = rawLines.map(line => normalizeVN(line));
    document.getElementById("result").innerHTML = "";
}

/* ===== ĐỔI TAB ===== */
function openTab(type) {
    currentFile = type;

    document.querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

    event.target.classList.add("active");

    document.getElementById("keyword").value = "";

    loadFile(type);
}

/* ===== TÌM KIẾM ===== */
document.getElementById("keyword").addEventListener("input", function () {
    const key = normalizeVN(this.value);
    const ul = document.getElementById("result");

    if (key.length === 0) {
        ul.innerHTML = "";
        return;
    }

    let html = "";
    let count = 0;

    for (let i = 0; i < convertedLines.length; i++) {
        if (convertedLines[i].includes(key)) {
            html += `<li>${rawLines[i]}</li>`;
            count++;
            if (count >= 100) break; // chống lag
        }
    }

    ul.innerHTML = html || "<li>Không tìm thấy</li>";
});

/* LOAD BAN ĐẦU */
loadFile("nganhang");
