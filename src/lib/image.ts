// 图片上传工具
//
// 商品档案会持久化到 localStorage，直接存原图容易超出容量限制，
// 因此统一在读取时按最长边压缩并转成 JPEG data URL。

/** 读取本地图片文件，按最长边等比压缩后返回 data URL。 */
export function readImageFile(file: File, maxSize = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`读取「${file.name}」失败`));
    reader.onload = () => {
      const source = String(reader.result);
      const image = new Image();
      image.onerror = () => reject(new Error(`「${file.name}」不是可识别的图片`));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(source);
          return;
        }
        // 先铺白底，避免透明 PNG 转 JPEG 后变黑
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

/** 图片上传失败时给出提示文案，成功返回 data URL。 */
export async function readImages(files: FileList | null): Promise<string[]> {
  if (!files || files.length === 0) return [];
  return Promise.all(Array.from(files).map((file) => readImageFile(file)));
}
