import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import prisma from '../../config/prisma';

export class InvoiceService {
  static async generate(transaction: any): Promise<string> {
    const storageDir = process.env.INVOICE_STORAGE_PATH || './storage/invoices';
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

    const fileName = `${transaction.invoiceNumber.replace(/\//g, '-')}.pdf`;
    const filePath = path.join(storageDir, fileName);

    const trackingUrl = `${process.env.TRACKING_URL || 'http://localhost:3001/tracking'}/${transaction.trackingCode}`;

    const tenant = await prisma.tenant.findUnique({ where: { id: transaction.tenantId } });

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(tenant?.name || 'Biro Jasa', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('INVOICE', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Invoice Info
      doc.fontSize(10);
      doc.text(`Nomor Invoice : ${transaction.invoiceNumber}`);
      doc.text(`Kode Tracking : ${transaction.trackingCode}`);
      doc.text(`Cabang         : ${transaction.branch?.name || '-'}`);
      doc.text(`Status         : ${transaction.status}`);
      if (transaction.estimatedFinishDate) {
        doc.text(`Estimasi Selesai: ${new Date(transaction.estimatedFinishDate).toLocaleDateString('id-ID')}`);
      }
      doc.moveDown(0.5);

      // Customer Info
      doc.font('Helvetica-Bold').text('DATA PELANGGAN');
      doc.font('Helvetica');
      doc.text(`Nama   : ${transaction.customer?.name || '-'}`);
      doc.text(`Telepon: ${transaction.customer?.phone || '-'}`);
      doc.moveDown(0.5);

      // Items
      doc.font('Helvetica-Bold').text('DETAIL LAYANAN');
      doc.font('Helvetica');
      doc.moveDown(0.3);

      // Table header
      doc.text('No  | Plat Nomor     | Jenis Layanan                          | Harga');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      transaction.items?.forEach((item: any, idx: number) => {
        const plate = item.vehicle?.plateNumber || '-';
        const service = item.serviceType?.name || '-';
        const price = `Rp ${Number(item.price).toLocaleString('id-ID')}`;
        doc.text(`${idx + 1}.   ${plate.padEnd(15)} ${service.substring(0, 38).padEnd(40)} ${price}`);
      });

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Totals
      doc.font('Helvetica-Bold');
      doc.text(`Total Estimasi  : Rp ${Number(transaction.estimatedTotal).toLocaleString('id-ID')}`, { align: 'right' });
      doc.text(`DP Dibayar      : Rp ${Number(transaction.dpAmount).toLocaleString('id-ID')}`, { align: 'right' });
      doc.text(`Sisa Tagihan    : Rp ${Number(transaction.remainingAmount).toLocaleString('id-ID')}`, { align: 'right' });
      if (Number(transaction.refundAmount) > 0) {
        doc.text(`Refund          : Rp ${Number(transaction.refundAmount).toLocaleString('id-ID')}`, { align: 'right' });
      }
      if (transaction.status !== 'DRAFT') {
        doc.text(`Total Final     : Rp ${Number(transaction.finalTotal).toLocaleString('id-ID')}`, { align: 'right' });
      }

      doc.moveDown(1);
      doc.font('Helvetica').fontSize(9).text(`Pantau status: ${trackingUrl}`, { align: 'center' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Save path to database
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { invoicePath: filePath },
    });

    return filePath;
  }
}
