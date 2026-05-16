import { CheckPkbInput } from './pkb.schema';

const DEFAULT_TIMEOUT_MS = 10000;

type PkbResponse = {
  no_polisi: string;
  kd_plat: string;
  source: 'sambara';
  result: unknown;
};

export class PkbService {
  static async check(payload: CheckPkbInput): Promise<PkbResponse> {
    const apiUrl = process.env.SAMBARA_PKB_API_URL;
    const token = process.env.SAMBARA_PKB_BEARER_TOKEN;

    if (!apiUrl || !token) {
      throw Object.assign(new Error('PKB service is not configured'), { statusCode: 503, expose: true });
    }

    const timeoutMs = PkbService.getTimeoutMs();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Origin: 'https://sambara-v2.bapenda.jabarprov.go.id',
          Referer: 'https://sambara-v2.bapenda.jabarprov.go.id/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          no_polisi: payload.no_polisi,
          kd_plat: payload.kd_plat,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const text = await response.text();
      const result = PkbService.parseJson(text);

      if (!response.ok) {
        const upstreamMessage = PkbService.getUpstreamMessage(result);
        const message = process.env.NODE_ENV === 'development'
          ? `Failed to retrieve PKB data (${response.status}${upstreamMessage ? `: ${upstreamMessage}` : ''})`
          : 'Failed to retrieve PKB data';
        throw Object.assign(new Error(message), { statusCode: 502, expose: true });
      }

      return {
        no_polisi: payload.no_polisi,
        kd_plat: payload.kd_plat,
        source: 'sambara',
        result,
      };
    } catch (err: any) {
      if (err?.statusCode) throw err;
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        throw Object.assign(new Error('PKB service request timed out'), { statusCode: 504, expose: true });
      }
      throw Object.assign(new Error('PKB service is unavailable'), { statusCode: 502, expose: true });
    }
  }

  private static getTimeoutMs() {
    const timeoutMs = Number(process.env.SAMBARA_PKB_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
    return Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
  }

  private static parseJson(text: string) {
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      throw Object.assign(new Error('Failed to retrieve PKB data'), { statusCode: 502, expose: true });
    }
  }

  private static getUpstreamMessage(result: unknown) {
    if (!result || typeof result !== 'object') return '';
    const message = (result as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
}
