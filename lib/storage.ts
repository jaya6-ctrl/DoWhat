import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export class StorageError extends Error {}

export async function saveAvatar(userId: string, file: File): Promise<string> {
  if (file.size === 0) throw new StorageError("头像文件为空");
  if (file.size > MAX_AVATAR_BYTES) throw new StorageError("头像不能超过 2 MB");
  const ext = ALLOWED_MIME[file.type];
  if (!ext) throw new StorageError("仅支持 PNG / JPEG / WebP 格式");

  await mkdir(AVATAR_DIR, { recursive: true });
  const filename = `${userId}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(AVATAR_DIR, filename), buf);

  return `/avatars/${filename}?v=${Date.now()}`;
}
