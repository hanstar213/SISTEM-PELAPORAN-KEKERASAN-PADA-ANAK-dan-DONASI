// ============================================================
// PeduliAnak — Email Notification Service (Resend)
// ============================================================

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummykey_for_build");

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@pedulianak.id";

/**
 * Kirim email notifikasi laporan baru.
 */
export async function sendReportNotification(
  to: string,
  reportTitle: string,
  status: string
) {
  await resend.emails.send({
    from: `PeduliAnak <${FROM_EMAIL}>`,
    to,
    subject: `[PeduliAnak] Update Laporan: ${reportTitle}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0c2461, #0abfaa); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">PeduliAnak</h1>
        </div>
        <div style="padding: 32px; background: #f8fafc; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0c2461; margin-top: 0;">Update Laporan</h2>
          <p>Laporan <strong>"${reportTitle}"</strong> telah diperbarui.</p>
          <p>Status saat ini: <strong>${status}</strong></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/laporan" 
             style="display: inline-block; padding: 12px 24px; background: #0abfaa; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Lihat Detail
          </a>
        </div>
      </div>
    `,
  });
}

/**
 * Kirim email konfirmasi donasi.
 */
export async function sendDonationConfirmation(
  to: string,
  donorName: string,
  amount: number,
  programTitle: string
) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

  await resend.emails.send({
    from: `PeduliAnak <${FROM_EMAIL}>`,
    to,
    subject: `[PeduliAnak] Terima Kasih atas Donasi Anda!`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0c2461, #0abfaa); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">PeduliAnak</h1>
        </div>
        <div style="padding: 32px; background: #f8fafc; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0c2461; margin-top: 0;">Terima Kasih, ${donorName}! 🙏</h2>
          <p>Donasi Anda sebesar <strong>${formattedAmount}</strong> untuk program <strong>"${programTitle}"</strong> telah kami terima.</p>
          <p>Donasi Anda akan digunakan untuk membantu anak-anak yang membutuhkan.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/donate" 
             style="display: inline-block; padding: 12px 24px; background: #0abfaa; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Lihat Riwayat Donasi
          </a>
        </div>
      </div>
    `,
  });
}

export default resend;
