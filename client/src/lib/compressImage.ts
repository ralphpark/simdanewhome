// 사진을 긴 변 1600px JPEG 로 줄여 data URL 로 돌려준다.
// ponytail: 사진을 DB 에 data URL 로 넣는 방식이라 글 하나가 Vercel 요청 한도(4.5MB) 안이어야 한다. 사진이 많아지면 Vercel Blob 에 올리고 주소만 저장한다
export async function compressImage(file: File, maxSize = 1600, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // 투명 PNG 가 JPEG 에서 검게 변하지 않도록
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
