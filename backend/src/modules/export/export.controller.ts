import { Request, Response, NextFunction } from 'express';
import { ExportService } from './export.service';
import { sendSuccess } from '../../shared/utils/response';

export class ExportController {
  static async exportTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ExportService.getTransactionData(
        req.user!.tenant_id,
        req.user!.role,
        req.query
      );

      // Dynamic import ExcelJS
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Transactions');

      sheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'No Invoice', key: 'invoice_number', width: 25 },
        { header: 'Tenant', key: 'tenant', width: 20 },
        { header: 'Cabang', key: 'branch', width: 20 },
        { header: 'Pelanggan', key: 'customer', width: 20 },
        { header: 'Plat Nomor', key: 'plate_numbers', width: 20 },
        { header: 'Jenis Layanan', key: 'service_types', width: 30 },
        { header: 'Estimasi Total', key: 'estimated_total', width: 18 },
        { header: 'Total Final', key: 'final_total', width: 18 },
        { header: 'DP', key: 'dp', width: 15 },
        { header: 'Sisa', key: 'remaining', width: 15 },
        { header: 'Refund', key: 'refund', width: 15 },
        { header: 'Profit', key: 'profit', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      sheet.addRows(data);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) { next(err); }
  }

  static async exportRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ExportService.getRevenueData(
        req.user!.tenant_id,
        req.user!.role,
        req.query
      );
      return sendSuccess(res, data);
    } catch (err) { next(err); }
  }
}
