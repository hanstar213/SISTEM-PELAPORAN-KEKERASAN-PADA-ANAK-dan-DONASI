// AI list-models API telah dihapus
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Fitur AI telah dihapus dari sistem" },
    { status: 410 }
  );
}
