// ============================================================
// PeduliAnak — User Registration API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sanitizeRecord } from "@/lib/sanitizer";

export async function POST(req: NextRequest) {
  try {
    const body = sanitizeRecord(await req.json());
    const { name, email, password } = body;

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar. Silakan gunakan email lain atau login." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru dengan role USER
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Registrasi berhasil! Silakan login.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal melakukan registrasi" },
      { status: 500 }
    );
  }
}
