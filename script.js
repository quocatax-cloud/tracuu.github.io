const files = {
    dbhc: "data/dbhc.txt",
    kbnn: "data/kbnn.txt",
    nganhang: "data/nganhang.txt"
};

let currentType = "dbhc";
let rawData = [];

document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentType = tab.dataset.type;
        document.getElementById("searchInput").value = "";
        document.getElementById("result").innerHTML = "";
        loadData();
    };
});

async function loadData() {
    const res = await fetch(files[currentType]);
    const text = await res.text();

    rawData = text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
}

function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, " ");
}

function scoreLine(line, keys) {
    const text = normalize(line);
    let score = 0;

    const fullKey = keys.join(" ");

    // khớp nguyên cụm
    if (text.includes(fullKey)) score += 100;

    // từng từ
    keys.forEach(k => {
        if (text.includes(k)) score += 15;

        // khớp nguyên từ
        const reg = new RegExp(`\\b${k}\\b`);
        if (reg.test(text)) score += 10;
    });

    // đúng thứ tự
    let last = -1;
    for (let k of keys) {
        const pos = text.indexOf(k);
        if (pos >= last && pos !== -1) {
            score += 5;
            last = pos;
        }
    }

    return score;
}

document.getElementById("searchInput").addEventListener("input", function () {
    const input = normalize(this.value);
    const keys = input.split(/\s+/).filter(Boolean);

    if (keys.length === 0) {
        document.getElementById("result").innerHTML = "";
        return;
    }

    const results = [];

    for (let line of rawData) {
        const s = scoreLine(line, keys);
        if (s > 0) {
            results.push({ line, score: s });
        }
    }

    results.sort((a, b) => b.score - a.score);

    const top = results.slice(0, 20);

    document.getElementById("result").innerHTML =
        top.length === 0
            ? "<div class='result-item'>❌ Không tìm thấy kết quả</div>"
            : top.map(r =>
                `<div class="result-item">
                    <b>${r.score}</b> — ${r.line}
                </div>`
              ).join("");
});

loadData();
