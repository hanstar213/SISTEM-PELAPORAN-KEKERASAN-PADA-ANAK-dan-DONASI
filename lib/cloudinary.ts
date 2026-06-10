// ============================================================
// PeduliAnak — Cloudinary Upload Service
// ============================================================

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload bukti laporan ke Cloudinary.
 * Menerima base64 string atau URL file.
 */
export async function uploadEvidence(
  file: string,
  reportId?: string
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder: "pedulianak/evidence",
    resource_type: "auto",
    public_id: reportId
      ? `evidence_${reportId}_${Date.now()}`
      : `evidence_${Date.now()}`,
    transformation: [
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/**
 * Hapus file dari Cloudinary.
 */
export async function deleteEvidence(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
