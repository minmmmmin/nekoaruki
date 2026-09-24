"use client";

import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  console.log(
    "[before]",
    file.name,
    `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    file.type
  );

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  });

  console.log(
    "[after]",
    compressedFile.name,
    `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
    compressedFile.type
  );

  return compressedFile;
}
