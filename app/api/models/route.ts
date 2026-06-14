import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    let apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY_4;

    if (!apiKey) {
      try {
        const envPath = path.join(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          const lines = envContent.split(/\r?\n/).reverse();
          for (const line of lines) {
            const match = line.match(/^GEMINI_API_KEY(?:_\d+)?\s*=\s*"?([^"\n\r]+)"?/);
            if (match && match[1]) {
              apiKey = match[1].trim();
              break;
            }
          }
        }
      } catch (e) {
        console.error("Failed to read .env file", e);
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    return NextResponse.json({ 
      apiKeyUsed: apiKey.substring(0, 8) + "...",
      models: data.models?.map((m: any) => m.name) || [],
      rawData: data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
