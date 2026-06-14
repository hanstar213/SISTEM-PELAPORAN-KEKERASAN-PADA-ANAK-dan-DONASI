import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY_4;

    // Fallback: manually read .env if process.env hasn't picked up the new key (since server might not have been restarted)
    if (!apiKey) {
      try {
        const envPath = path.join(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          // Split by newline and reverse to find the last valid definition
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

    const systemPrompt = `Kamu adalah asisten virtual resmi untuk platform "PeduliAnak". PeduliAnak adalah platform pelaporan kekerasan pada anak dan donasi untuk program perlindungan anak di Indonesia. 
Tugasmu adalah menjawab pertanyaan pengguna tentang platform ini dengan ramah, empatik, jelas, dan menggunakan bahasa Indonesia yang baik. 

PENTING: Ketika mengarahkan atau menyarankan pengguna untuk mengunjungi halaman atau menggunakan fitur tertentu, kamu WAJIB menyertakan tag tombol dengan format:
[LINK: Teks Tombol | /path_halaman]

Daftar halaman dan formatnya:
1. Halaman Melaporkan Kekerasan: [LINK: Laporkan Kekerasan | /report]
2. Halaman Donasi: [LINK: Donasi Sekarang | /donate]
3. Halaman Transparansi Dana: [LINK: Lihat Transparansi | /transparency]
4. Beranda / Home: [LINK: Beranda | /]

Contoh penggunaan:
- "Untuk melaporkan kekerasan pada anak, silakan gunakan [LINK: Laporkan Kekerasan | /report]."
- "Jika ingin menyalurkan bantuan, silakan masuk ke halaman [LINK: Donasi Sekarang | /donate]."
- "Kami menjamin transparansi dana yang terkumpul di [LINK: Lihat Transparansi | /transparency]."

Harap gunakan format tombol ini daripada tautan mentah agar dapat dirender sebagai tombol interaktif di UI. Selalu bersikap suportif dan empatif, terutama jika ada indikasi pengguna mengalami kekerasan. Jawablah dengan ringkas dan to the point.`;

    // Format history for Gemini API
    const formattedHistory = (history || []).map((msg: { role: string, text: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Add current message
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Prepend system prompt to the first user message to guarantee compatibility with all models
    if (formattedHistory.length > 0 && formattedHistory[0].role === "user") {
      formattedHistory[0].parts[0].text = `[SYSTEM INSTRUCTION: ${systemPrompt}]\n\n${formattedHistory[0].parts[0].text}`;
    } else {
      formattedHistory.unshift({
        role: "user",
        parts: [{ text: `[SYSTEM INSTRUCTION: ${systemPrompt}]\n\nHello` }]
      });
      formattedHistory.unshift({
        role: "model",
        parts: [{ text: "Dimengerti. Saya akan bertindak sebagai asisten virtual PeduliAnak." }]
      });
    }

    const payload = {
      contents: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", JSON.stringify(errorData, null, 2));
      return NextResponse.json({ error: "Failed to communicate with AI provider", details: errorData }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[CHATBOT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
