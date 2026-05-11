import bcryptjs from 'bcryptjs';
import { UserModel } from '../models/UserModel';
import { JwtUtil } from '../utils/jwt';
import { User, TokenPair, AuthResponse } from '../types';

export class AuthService {
  private static readonly SALT_ROUNDS = 10;

  static async login(email: string, password: string): Promise<AuthResponse> {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('User account is inactive');
    }

    const passwordHash = await UserModel.getPasswordHash(email);
    if (!passwordHash) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcryptjs.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const tokens = JwtUtil.generateTokens({
      id: user.id,
      bureau_id: user.bureau_id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        bureau_id: user.bureau_id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      tokens,
    };
  }

  static async register(
    email: string,
    password: string,
    fullName: string,
    phone: string | null = null,
    role: string = 'OWNER',
    bureauId: string | null = null,
  ): Promise<AuthResponse> {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(password, this.SALT_ROUNDS);

    const user = await UserModel.create(email, passwordHash, fullName, phone, role, bureauId);

    if (!user) {
      throw new Error('Failed to create user');
    }

    const tokens = JwtUtil.generateTokens({
      id: user.id,
      bureau_id: user.bureau_id,
      role: user.role,
    });

    return {
      user,
      tokens,
    };
  }

  static async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = JwtUtil.verifyToken(refreshToken);

    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const user = await UserModel.findById(payload.id);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    return JwtUtil.generateTokens({
      id: user.id,
      bureau_id: user.bureau_id,
      role: user.role,
    });
  }
}
