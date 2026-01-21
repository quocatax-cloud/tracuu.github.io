let rawLines = [];
let convertedLines = [];
let currentFile = "nganhang";

const files = {
    nganhang: "nganhang.txt",
    kbnn: "kbnn.txt",
    dbhc: "dbhc.txt"
};

/* ==============================
   CHUẨN HÓA TIẾNG VIỆT
================================ */
function normalizeVN(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/òa|óa|ỏa|õa|ọa|oà|oá|oả|oã|oạ/g, "oa")
        .replace(/uỳ|úy|ủy|ũy|ụy|uý|uỳ|uỷ|uỹ|uỵ/g, "uy")
        .replace(/[^a-z0-9 ]/g, " ");
}

/* ==============================
   LA MÃ ↔ SỐ
================================ */
const romanMap = {
    i:1, v:5, x:10, l:50, c:100, d:500, m:1000
};

function romanToNumber(roman) {
    let total = 0, prev = 0;
    roman = roman.toLowerCase();

    for (let i = roman.length - 1; i >= 0; i--) {
        let val = romanMap[roman[i]] || 0;
        total += val < prev ? -val : val;
        prev = val;
    }
    return total;
}

/* ==============================
   VIẾT TẮT NGHIỆP VỤ
================================ */
const alias = {
    "kv": "khu vuc",
    "pgd": "phong giao dich",
    "gd": "giao dich",
    "tp": "thanh pho",
    "tx": "thi xa",
    "q": "quan",
    "h": "huyen"
};

/* ==============================
   TIỀN XỬ LÝ TỪ KHÓA
================================ */
function preprocessInput(input) {

    input = normalizeVN(input);

    for (let k in alias) {
        input = input.replace(new RegExp(`\\b${k}\\b`, "g"), alias[k]);
    }

    const parts = input.split(/\s+/).filter(x => x);

    let keywords = [];

    for (let p of parts) {
        if (/^[ivxlcdm]+$/.test(p)) {
            keywords.push(p);
            keywords.push(romanToNumber(p).toString());
        } else {
            keywords.push(p);
        }
    }

    return keywords;
}

/* ==============================
   LOAD FILE TXT
================================ */
async function loadFile(type) {

    const res = await fetch(files[type]);
    const text = await res.text();

    rawLines = text.split(/\r?\n/).filter(l => l.trim());

    convertedLines = rawLines.map(l => {
        let n = normalizeVN(l);

        // thêm bản số thường cho số La Mã
        n = n.replace(/\b[ivxlcdm]+\b/gi, m => {
            return m + " " + romanToNumber(m);
        });

        return n;
    });

    document.getElementById("result").innerHTML = "";
}

/* ==============================
   ĐỔI TAB
================================ */
function openTab(type) {
    currentFile = type;

    document.querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

    event.target.classList.add("active");

    document.getElementById("keyword").value = "";
    loadFile(type);
}

/* ==============================
   TÌM KIẾM THÔNG MINH
================================ */
document.getElementById("keyword").addEventListener("input", function () {

    const keywords = preprocessInput(this.value);
    const ul = document.getElementById("result");

    ul.innerHTML = "";
    if (keywords.length === 0) return;

    let results = [];

    for (let i = 0; i < convertedLines.length; i++) {

        let line = convertedLines[i];
        let score = 0;

        for (let k of keywords) {
            if (line.includes(k)) score++;
        }

        if (score > 0) {
            results.push({
                text: rawLines[i],
                score
            });
        }
    }

    results
        .sort((a,b) => b.score - a.score)
        .slice(0,100)
        .forEach(r => {
            ul.innerHTML += `<li>${r.text}</li>`;
        });

    if (results.length === 0) {
        ul.innerHTML = "<li>Không tìm thấy</li>";
    }
});

/* ==============================
   LOAD BAN ĐẦU
================================ */
loadFile("nganhang");
