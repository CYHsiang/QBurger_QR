async function generateQRCodeCanvas(storeCode, storeName, tableNo) {
  const paddedNo = tableNo.toString().padStart(2, '0');
  const url = `https://selforder.qburger.com.tw/Portal/Welcome?StoreCode=${storeCode}&tableNo=${paddedNo}`;

  const canvasSize = 400;
  const padding = 16;
  const qrSize = canvasSize - padding * 2;
  const fontSize = 42;

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, url, {
      // version: 6,  //版本較舊不支援
      margin: 0,
      width: qrSize,
      errorCorrectionLevel: 'H', //容錯率30%
      color: {
          dark: '#000000',
          light: '#FFFFFF'
      }
  });

  ctx.drawImage(qrCanvas, padding, padding);

  const text = paddedNo;
  ctx.font = `bold ${fontSize}px Viga`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(text).width;
  const boxPadding = 10;
  const boxHeight = fontSize + 10;

  const boxX = (canvasSize - textWidth) / 2 - boxPadding / 2;
  const boxY = canvasSize - boxHeight;

  ctx.fillStyle = 'white';
  ctx.fillRect(boxX, boxY, textWidth + boxPadding, boxHeight);
  ctx.fillStyle = 'black';


  ctx.fillText(text, canvasSize / 2, canvasSize - boxHeight / 2 + 5);


  return {
      canvas,
      filename: `${storeCode} ${storeName} ${paddedNo}.png`
  };
}

async function generatePreview() {
  const storeCode = document.getElementById('storeCode').value.trim();
  const storeName = document.getElementById('storeName').value.trim();
  if (!storeCode || !storeName) {
      alert("請輸入店號與店名！");
      return;
  }

  const container = document.getElementById('previewContainer');
  container.innerHTML = '';

  const { canvas, filename } = await generateQRCodeCanvas(storeCode, storeName, 1);

  const card = document.createElement('div');
  card.className = 'card';

  const label = document.createElement('div');
  label.textContent = `桌號：01`;

  const btn = document.createElement('button');
  btn.textContent = '下載';
  btn.onclick = () => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
  };

  card.appendChild(canvas);
  card.appendChild(label);
  card.appendChild(btn);

  container.appendChild(card);
}

async function downloadAll() {
  const storeCode = document.getElementById('storeCode').value.trim();
  const storeName = document.getElementById('storeName').value.trim();
  if (!storeCode || !storeName) {
      alert("請輸入店號與店名！");
      return;
  }

  const zip = new JSZip();

  for (let i = 1; i <= 22; i++) {
      const { canvas, filename } = await generateQRCodeCanvas(storeCode, storeName, i);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      zip.file(filename, blob);
  }

  zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, `${storeCode}_${storeName}_QRCodes.zip`);
  });
}