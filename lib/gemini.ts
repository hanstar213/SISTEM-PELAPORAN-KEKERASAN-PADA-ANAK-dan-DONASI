// ============================================================
// PeduliAnak — Google Gemini AI Service
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIAnalysisResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/**
 * Menganalisis laporan kasus anak menggunakan Gemini AI.
 * Mengembalikan urgency level, ringkasan, dan rekomendasi tindakan.
 */
export async function analyzeReport(
  title: string,
  description: string,
  category: string
): Promise<AIAnalysisResult> {
  const prompt = `
Kamu adalah seorang analis perlindungan anak profesional di Indonesia.
Analisis laporan kasus berikut dan berikan penilaian:

**Judul:** ${title}
**Kategori:** ${category}
**Deskripsi:** ${description}

Berikan respons dalam format JSON berikut (tanpa markdown code block):
{
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "Ringkasan singkat kasus dalam 2-3 kalimat",
  "suggestion": "Rekomendasi tindakan yang harus dilakukan, termasuk lembaga yang perlu dihubungi (KPAI, Polisi, Dinas Sosial, dll)",
  "confidence": 0.0 - 1.0
}

Kriteria urgency:
- CRITICAL: Ancaman langsung terhadap nyawa/keselamatan anak
- HIGH: Kekerasan aktif atau penelantaran serius
- MEDIUM: Kasus yang perlu penanganan segera tapi tidak mengancam jiwa
- LOW: Kasus ringan atau membutuhkan pemantauan

Pastikan respons hanya JSON valid, tanpa teks tambahan.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Parse JSON response
    const parsed = JSON.parse(text) as AIAnalysisResult;

    // Validate urgencyLevel
    const validLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (!validLevels.includes(parsed.urgencyLevel)) {
      parsed.urgencyLevel = "MEDIUM" as any;
    }

    return parsed;
  } catch (error) {
    console.error("[AI] Failed to analyze report:", error);
    // Fallback jika AI gagal
    return {
      urgencyLevel: "MEDIUM" as any,
      summary: "Analisis AI gagal — membutuhkan review manual oleh moderator.",
      suggestion:
        "Lakukan review manual terhadap laporan ini. Hubungi KPAI jika diperlukan.",
      confidence: 0,
    };
  }
}

/**
 * Generate ringkasan untuk dashboard admin.
 */
export async function generateDashboardInsight(
  stats: Record<string, number>
): Promise<string> {
  const prompt = `
Sebagai analis data perlindungan anak, berikan insight singkat (3-4 kalimat) berdasarkan statistik berikut:
${JSON.stringify(stats, null, 2)}

Gunakan bahasa Indonesia yang profesional dan berikan rekomendasi singkat.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return "Insight tidak tersedia saat ini.";
  }
}
