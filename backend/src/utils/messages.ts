export class MessageTemplates {
  static receiptMessage(
    customerName: string,
    serviceName: string,
    amount: number,
    trackingUrl: string,
  ): string {
    return `
📋 *STRUK TRANSAKSI STNK BUREAU* 📋

Halo ${customerName},

Terima kasih telah menggunakan layanan kami!

*Detail Transaksi:*
🔹 Jasa: ${serviceName}
🔹 Biaya: Rp ${amount.toLocaleString('id-ID')}
🔹 Status: Pending

*Tracking Dokumen:*
Pantau progress dokumen Anda di sini:
${trackingUrl}

Kami akan menghubungi Anda ketika dokumen siap diambil.

Terima kasih! 🙏
    `.trim();
  }

  static stageUpdateMessage(customerName: string, stage: string, stageName: string): string {
    const stageEmojis: { [key: string]: string } = {
      '1': '📥',
      '2': '🔍',
      '3': '⚙️',
      '4': '✅',
      '5': '🎉',
    };

    const emoji = stageEmojis[stage] || '📌';

    return `
${emoji} *UPDATE DOKUMEN ANDA* ${emoji}

Halo ${customerName},

Status dokumen Anda telah diperbarui!

*Status Terbaru:* ${stageName}

Terima kasih atas kesabaran Anda. 🙏
    `.trim();
  }
}
