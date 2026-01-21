const data = [
    { ma: "1051234", ten: "UBND xã Hòa Vang", cap: "Xã" },
    { ma: "1051235", ten: "UBND phường Hòa Khánh", cap: "Phường" },
    { ma: "1051236", ten: "UBND phường Hải Châu", cap: "Phường" },
    { ma: "1051237", ten: "Kho bạc Nhà nước Hòa Vang", cap: "Kho bạc" },
    { ma: "1051238", ten: "Kho bạc Nhà nước khu vực XIII", cap: "Kho bạc" },
];

// test cho nhiều dòng → kiểm tra scroll
for (let i = 0; i < 50; i++) {
    data.push({
        ma: "10" + i,
        ten: "Đơn vị test số " + i,
        cap: "Test"
    });
}

function search() {
    const keyword = document.getElementById("keyword").value.toLowerCase();
    const result = document.getElementById("result");

    result.innerHTML = "";

    const filtered = data.filter(item =>
        item.ma.includes(keyword) ||
        item.ten.toLowerCase().includes(keyword)
    );

    if (filtered.length === 0) {
        result.innerHTML = `
            <tr>
                <td colspan="3">Không tìm thấy kết quả</td>
            </tr>
        `;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.ma}</td>
            <td>${item.ten}</td>
            <td>${item.cap}</td>
        `;
        result.appendChild(tr);
    });
}
