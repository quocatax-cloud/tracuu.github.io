let records = [];
let currentFile = "kbnn";

const files = {
    nganhang: "nganhang.txt",
    kbnn: "kbnn.txt",
    dbhc: "dbhc.txt"
};

/* ===============================
   CHUẨN HÓA TIẾNG VIỆT
================================ */
function norm(s) {
    return s.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, " ");
}

/* ===============================
   LA MÃ → SỐ
================================ */
const romanMap = {i:1,v:5,x:10,l:50,c:100,d:500,m:1000};

function romanToNumber(r) {
    let t = 0, p = 0;
    r = r.toLowerCase();
    for (let i = r.length - 1; i >= 0; i--) {
        let v = romanMap[r[i]] || 0;
        t += v < p ? -v : v;
        p = v;
    }
    return t;
}

/* ===============================
   PHÂN TÍCH DÒNG KBNN
================================ */
function parseLine(line) {

    const n = norm(line);

    // khu vực
    let kv = n.match(/khu vuc ([ivxlcdm]+)/);
    let khuVuc = kv ? kv[1] : "";

    // phòng giao dịch
    let pgd = n.match(/phong giao dich so (\d{1,2})/);
    let phong = pgd ? pgd[1] : "";

    // mã kho bạc (4 số)
    let ma = n.match(/\b\d{4}\b/);
    let maKB = ma ? ma[0] : "";

    return {
        raw: line,
        norm: n + " " + romanToNumber(khuVuc),
        khuVuc,
        phong,
        maKB
    };
}

/* ===============================
   LOAD FILE
================================ */
async function loadFile(type) {

    const res = await fetch(files[type]);
    const text = await res.text();

    records = text
        .split(/\r?\n/)
        .filter(x => x.trim())
        .map(parseLine);

    document.getElementById("result").innerHTML = "";
}

/* ===============================
   TÌM KIẾM CHUẨN NGHIỆP VỤ
================================ */
document.getElementById("keyword").addEventListener("input", function () {

    const q = norm(this.value);
    const parts = q.split(/\s+/).filter(x => x);

    const nums = parts.filter(x => /^\d+$/.test(x));
    const romans = parts.filter(x => /^[ivxlcdm]+$/.test(x));
    const words = parts.filter(x => isNaN(x));

    const ul = document.getElementById("result");
    ul.innerHTML = "";

    let out = [];

    for (let r of records) {

        // khu vực
        if (romans.length && !romans.includes(r.khuVuc)) continue;

        // số phòng
        if (nums.length === 1 && nums[0].length <= 2) {
            if (r.phong !== nums[0]) continue;
        }

        // mã kho bạc
        if (nums.some(n => n.length === 4)) {
            if (!nums.includes(r.maKB)) continue;
        }

        // chữ thường
        let ok = true;
        for (let w of words) {
            if (!r.norm.includes(w)) {
                ok = false;
                break;
            }
        }

        if (ok) out.push(r.raw);
    }

    ul.innerHTML =
        out.slice(0, 100).map(x => `<li>${x}</li>`).join("")
        || "<li>Không tìm thấy</li>";
});

/* ===============================
   LOAD BAN ĐẦU
================================ */
loadFile("kbnn");
