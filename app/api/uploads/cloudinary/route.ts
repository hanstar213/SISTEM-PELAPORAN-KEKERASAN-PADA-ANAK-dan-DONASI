import { NextRequest, NextResponse } from "next/server";
import { uploadEvidence } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary belum dikonfigurasi. Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET terisi di .env",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 25MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

    const uploaded = await uploadEvidence(dataUri);

    return NextResponse.json({
      success: true,
      data: {
        ...uploaded,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API] POST /api/uploads/cloudinary error:", errorMessage);
    console.error("[API] Full error object:", error);
    
    // Check if it's a Cloudinary auth error
    if (errorMessage.includes("Invalid credentials") || errorMessage.includes("401")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cloudinary authentication gagal. Pastikan CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET benar." 
        },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes("Resource not found")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cloudinary cloud tidak ditemukan. Pastikan CLOUDINARY_CLOUD_NAME benar." 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Gagal mengunggah file: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}