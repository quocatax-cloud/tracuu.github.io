const files = {
    dbhc: "data/dbhc.txt",
    kbnn: "data/kbnn.txt",
    nganhang: "data/nganhang.txt"
};

let currentType = "dbhc";
let data = [];

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

    data = text
        .split("\n")
        .map(l => l.trim())
        .filter(l => l !== "");
}

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

document.getElementById("searchInput").addEventListener("input", function () {
    const keyword = normalize(this.value);
    const keys = keyword.split(" ").filter(Boolean);

    if (keys.length === 0) {
        document.getElementById("result").innerHTML = "";
        return;
    }

    const results = [];

    for (let line of data) {
        const text = normalize(line);

        let score = 0;

        // khớp toàn cụm
        if (text.includes(keyword)) score += 100;

        // khớp từng từ
        keys.forEach(k => {
            if (text.includes(k)) score += 20;
        });

        if (score > 0) {
            results.push({ line, score });
        }
    }

    results.sort((a, b) => b.score - a.score);

    const top = results.slice(0, 20);

    document.getElementById("result").innerHTML =
        top.length === 0
            ? "<div class='result-item'>❌ Không tìm thấy kết quả</div>"
            : top.map(r =>
                `<div class="result-item">${r.line}</div>`
              ).join("");
});

loadData();
