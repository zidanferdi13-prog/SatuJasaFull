import { Request, Response } from 'express';
import { TrackingService } from '../services/TrackingService';

export class TrackingController {
  static async getStatus(req: Request, res: Response) {
    try {
      const { tracking_token } = req.params;

      const status = await TrackingService.getStatus(tracking_token);
      res.json({ data: status });
    } catch (error: any) {
      res.status(error.message === 'Tracking information not found' ? 404 : 400).json({ error: error.message });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const { tracking_token } = req.params;

      const history = await TrackingService.getHistory(tracking_token);
      res.json({ data: history });
    } catch (error: any) {
      res.status(error.message === 'Tracking information not found' ? 404 : 400).json({ error: error.message });
    }
  }
}
