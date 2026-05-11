import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class InvoiceService {
  static async generatePDF(transaction: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `invoice-${transaction.invoiceNumber.replace(/\//g, '-')}.pdf`;
      const dir = path.join(__dirname, '../../../public/invoices');

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, filename);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(transaction.tenant.name, { align: 'center' });
      doc.fontSize(10).text(transaction.tenant.address || '', { align: 'center' });
      doc.moveDown();

      // Invoice Details
      doc.fontSize(16).text('INVOICE', { underline: true });
      doc.fontSize(10).text(`Number: ${transaction.invoiceNumber}`);
      doc.text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`);
      doc.text(`Customer: ${transaction.customer.name}`);
      doc.text(`Vehicle: ${transaction.items[0]?.vehicle?.plateNumber || '-'}`);
      doc.moveDown();

      // Table Header
      doc.text('Service', 100, 250);
      doc.text('Amount', 400, 250);
      doc.moveTo(50, 265).lineTo(550, 265).stroke();

      // Items
      let y = 280;
      transaction.items.forEach((item: any) => {
        doc.text(item.service.name, 100, y);
        doc.text(`Rp ${Number(item.price).toLocaleString()}`, 400, y);
        y += 20;
      });

      doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();

      // Totals
      y += 20;
      doc.text('Total:', 300, y);
      doc.text(`Rp ${Number(transaction.finalTotal).toLocaleString()}`, 400, y);

      y += 15;
      doc.text('DP:', 300, y);
      doc.text(`Rp ${Number(transaction.dpAmount).toLocaleString()}`, 400, y);

      y += 15;
      doc.fontSize(12).text('Remaining:', 300, y);
      doc.text(`Rp ${Number(transaction.remainingAmount).toLocaleString()}`, 400, y);

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}
