import { Request, Response } from 'express';
import { TrackingService } from './tracking.service';

export class TrackingController {
  static async getStatus(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const data = await TrackingService.getByToken(token);

      if (!data) return res.status(404).json({ error: 'Tracking not found' });

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
