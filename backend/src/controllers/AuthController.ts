import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const authResponse = await AuthService.login(email, password);

      res.json({
        user: authResponse.user,
        tokens: authResponse.tokens,
      });
    } catch (error: any) {
      const statusCode = error.message === 'User not found' || error.message === 'Invalid password' ? 401 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    try {
      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async refresh(req: AuthRequest, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const tokens = await AuthService.refresh(refresh_token);

      res.json(tokens);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
