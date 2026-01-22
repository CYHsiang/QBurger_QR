const getData = () => {
    const storeCode = document.getElementById('storeCode').value.trim(),
        storeName = document.getElementById('storeName').value.trim(),
        tableCount = parseInt(document.getElementById('tableCount').value, 10);
    if (!storeCode || !storeName) { alert("請輸入店號與店名"); return null; }
    if (!tableCount || tableCount < 1) { alert("請輸入正確的張數"); return null; }
    return { storeCode, storeName, tableCount };
}
async function createQR(storeCode, storeName, tableNo) {
    const padded = tableNo.toString().padStart(2, '0'),
        url = `https://selforder.qburger.com.tw/Portal/Welcome?StoreCode=${storeCode}&tableNo=${padded}`,
        size = 300, pad = 16, qrSize = size - pad * 2, fontSize = 42;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, url, { width: qrSize, margin: 0, errorCorrectionLevel: 'H' });
    ctx.drawImage(qrCanvas, pad, pad);
    ctx.font = `bold ${fontSize}px Viga`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(padded).width, h = fontSize + 10, x = (size - w) / 2 - 5, y = size - h;
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w + 10, h);
    ctx.fillStyle = '#000'; ctx.fillText(padded, size / 2, size - h / 2 + 4);
    return { canvas, filename: `${storeCode} ${storeName} ${padded}.png`, url };
}

async function generatePreview() {
    const data = getData();
    if (!data) return;

    const container = document.getElementById('previewContainer');
    container.innerHTML = ''; // 清空預覽區

    // 生成第一張 QR Code（桌號 01）
    const { canvas, filename, url } = await createQR(data.storeCode, data.storeName, 1);

    // 顯示 URL 在按鈕下方，換行顯示
    const currentUrlDiv = document.getElementById('currentUrl');
    currentUrlDiv.innerHTML = ''; // 先清空

    // 第一行：文字「網址：」
    const titleDiv = document.createElement('div');
    titleDiv.textContent = '網址：';
    titleDiv.style.fontWeight = 'bold';

    // 第二行：實際連結
    const linkDiv = document.createElement('div');
    const link = document.createElement('a');
    link.href = url;
    link.textContent = url;
    link.target = '_blank';
    link.style.wordBreak = 'break-all';
    linkDiv.appendChild(link);

    currentUrlDiv.appendChild(titleDiv);
    currentUrlDiv.appendChild(linkDiv);

    // 建立 QR Code 卡片
    const card = document.createElement('div');
    card.className = 'card';

    const tableNo = document.createElement('div');
    tableNo.className = 'table-no';
    tableNo.textContent = '桌號：01';

    const btn = document.createElement('button');
    btn.textContent = '下載此張';
    btn.onclick = () => {
        const a = document.createElement('a');
        a.download = filename;
        a.href = canvas.toDataURL('image/png');
        a.click();
    };

    // 將元素加入卡片
    card.append(canvas, tableNo, btn);

    // 將卡片加入預覽區
    container.appendChild(card);
}





async function downloadAll() {
    const data = getData(); if (!data) return;
    const zip = new JSZip();
    for (let i = 1; i <= data.tableCount; i++) {
        const { canvas, filename } = await createQR(data.storeCode, data.storeName, i);
        const blob = await new Promise(r => canvas.toBlob(r));
        zip.file(filename, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${data.storeCode}_${data.storeName}_QRCodes.zip`);
}

function clearForm() {
    ['storeCode', 'storeName', 'tableCount'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('previewContainer').innerHTML = '<div id="placeholder">尚未產生 QR Code</div>';
    document.getElementById('currentUrl').textContent = ''; // 清空 URL
}
