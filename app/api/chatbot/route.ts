// Chatbot API telah dihapus
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Fitur chatbot telah dihapus dari sistem" },
    { status: 410 }
  );
}
