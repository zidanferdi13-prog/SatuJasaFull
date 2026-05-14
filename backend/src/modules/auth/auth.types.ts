export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    branchId: string | null;
  };
}
