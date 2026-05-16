import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class InvoiceService {
  static async generatePDF(transaction: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const filename = `invoice-${transaction.invoiceNumber.replace(/\//g, '-')}.pdf`;
      const dir = path.resolve(__dirname, '../../../public/invoices');

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, filename);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text(transaction.tenant?.name || 'SatuJasa', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('INVOICE', { align: 'center' }).moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown();

      // Invoice Info
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice: ${transaction.invoiceNumber}`);
      doc.text(`Date: ${new Date(transaction.createdAt).toLocaleDateString('id-ID')}`);
      doc.text(`Customer: ${transaction.customer?.name || '-'}`);
      doc.text(`Status: ${transaction.status}`);

      doc.moveDown();

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Service', 70, tableTop);
      doc.text('Vehicle', 250, tableTop);
      doc.text('Price', 420, tableTop, { align: 'right' });
      doc.moveTo(50, tableTop + 18).lineTo(545, tableTop + 18).stroke();
      doc.font('Helvetica');

      // Items
      let y = tableTop + 25;
      (transaction.items || []).forEach((item: any) => {
        doc.text(item.service?.name || '-', 70, y);
        doc.text(item.vehicle?.plateNumber || '-', 250, y);
        doc.text(`Rp ${Number(item.price).toLocaleString('id-ID')}`, 420, y, { align: 'right' });
        y += 20;
      });

      doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
      y += 15;

      // Totals
      doc.font('Helvetica-Bold');
      doc.text(`Total: Rp ${Number(transaction.finalTotal).toLocaleString('id-ID')}`, 300, y, { align: 'right' });
      y += 15;
      doc.text(`DP: Rp ${Number(transaction.dpAmount).toLocaleString('id-ID')}`, 300, y, { align: 'right' });
      y += 15;
      doc.fontSize(12).text(`Remaining: Rp ${Number(transaction.remainingAmount).toLocaleString('id-ID')}`, 300, y, { align: 'right' });

      y += 30;
      doc.fontSize(8).font('Helvetica').text(`Tracking: ${transaction.trackingCode || '-'}`, { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}
