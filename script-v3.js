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
        .map(line => line.trim())
        .filter(line => line !== "");
}

function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, " ");
}

document.getElementById("searchInput").addEventListener("input", function () {
    const keyword = normalize(this.value);
    const keys = keyword.split(/\s+/).filter(k => k);

    let html = "";

    if (keys.length === 0) {
        document.getElementById("result").innerHTML = "";
        return;
    }

    let count = 0;

    for (let line of data) {
        const text = normalize(line);

        const match = keys.every(k => text.includes(k));

        if (match) {
            count++;
            html += `<div class="result-item">${line}</div>`;
        }

        if (count >= 50) break; // chống lag
    }

    document.getElementById("result").innerHTML =
        html || "<div class='result-item'>❌ Không tìm thấy kết quả</div>";
});

loadData();
