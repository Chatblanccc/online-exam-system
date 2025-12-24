import fs from "fs/promises";
import path from "path";

const ILLEGAL_CHARS = /[<>:"/\\|?*]/g;

export function sanitizeFilename(filename: string) {
  const cleaned = filename.replace(ILLEGAL_CHARS, "").trim();
  return cleaned.length > 0 ? cleaned : "upload";
}

export async function saveUpload(file: File) {
  const uploadDir = process.env.UPLOAD_DIR ?? "./public/uploads";
  const absoluteDir = path.join(process.cwd(), uploadDir);
  await fs.mkdir(absoluteDir, { recursive: true });

  const safeName = sanitizeFilename(file.name);
  const ext = path.extname(safeName);
  const base = ext ? safeName.slice(0, -ext.length) : safeName;
  const uniqueName = `${base}-${Date.now()}${ext}`;
  const absolutePath = path.join(absoluteDir, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  return {
    absolutePath,
    relativePath: path.posix.join("/uploads", uniqueName),
  };
}
