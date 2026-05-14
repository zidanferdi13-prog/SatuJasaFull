export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly errors?: string[],
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isSubscriptionExpired() {
    return this.status === 402 || this.code === 'SUBSCRIPTION_EXPIRED';
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 422 || this.status === 400;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isSubscriptionExpired) {
      return 'Langganan Anda telah kadaluarsa. Hubungi admin platform.';
    }
    if (error.isUnauthorized) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }
    if (error.isForbidden) {
      return 'Anda tidak memiliki akses untuk tindakan ini.';
    }
    if (error.isNotFound) {
      return 'Data tidak ditemukan.';
    }
    if (error.errors && error.errors.length > 0) {
      return error.errors.join('\n');
    }
    return error.message || 'Terjadi kesalahan.';
  }
  if (error instanceof Error) {
    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui.';
}
