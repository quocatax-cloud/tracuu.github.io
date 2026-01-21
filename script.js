const files = {
    dbhc: "data/dbhc.txt",
    kbnn: "data/kbnn.txt",
    nganhang: "data/nganhang.txt"
};

let current = "dbhc";
let data = [];

const input = document.getElementById("search");
const result = document.getElementById("result");

/* ======================
   LOAD FILE TXT
====================== */
async function loadData() {
    const res = await fetch(files[current]);
    const text = await res.text();

    data = text
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);
}

loadData();

/* ======================
   TAB CLICK
====================== */
document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        current = tab.dataset.type;
        input.value = "";
        result.innerHTML = "";

        loadData();
    };
});

/* ======================
   CHUẨN HOÁ CHUỖI
====================== */
function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/* ======================
   SEARCH ENGINE
====================== */
input.addEventListener("input", () => {

    const key = normalize(input.value);
    if (!key) {
        result.innerHTML = "";
        return;
    }

    const words = key.split(" ");
    const matches = [];

    for (let line of data) {
        const text = normalize(line);
        let score = 0;

        // khớp cả cụm
        if (text.includes(key)) score += 100;

        // khớp từng từ
        words.forEach(w => {
            if (text.includes(w)) score += 20;
        });

        if (score > 0) {
            matches.push({ line, score });
        }
    }

    matches.sort((a, b) => b.score - a.score);

    const top = matches.slice(0, 20);

    result.innerHTML =
        top.length === 0
            ? "<div class='result-item'>❌ Không tìm thấy kết quả</div>"
            : top.map(x =>
                `<div class="result-item">${x.line}</div>`
              ).join("");
});
