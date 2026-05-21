import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';
import { lookup } from 'dns/promises';
import { isIP } from 'net';

const MAX_BYTES = 1_000_000;          // 1 MB — install scripts are tiny
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;

@Injectable()
export class ScriptFetcher {
  /** Fetch text content over HTTP(S). Throws BadRequest for malformed/blocked
   *  URLs, BadGateway for upstream failures. */
  async fetchText(rawUrl: string): Promise<string> {
    const url = this.parseAndValidate(rawUrl);
    await this.assertPublicHost(url.hostname);
    return this.get(url.toString());
  }

  /** Derive a reasonable script name from a URL path. */
  suggestedName(rawUrl: string): string | undefined {
    const generic = new Set(['install', 'setup', 'sh', 'bash', 'init', 'bootstrap']);
    try {
      const url = new URL(rawUrl);
      const last = url.pathname.split('/').filter(Boolean).pop();
      const stripped = last?.replace(/\.(sh|bash)$/i, '');
      if (stripped && !generic.has(stripped.toLowerCase())) return stripped;

      // Fall back to a meaningful piece of the hostname.
      // sh.rustup.rs   → labels = [sh, rustup, rs] → "rustup"
      // example.com    → labels = [example, com]  → "example"
      const labels = url.hostname.replace(/^www\./, '').split('.');
      const brand = labels.length >= 3 ? labels[labels.length - 2] : labels[0];
      return brand || stripped;
    } catch {
      return undefined;
    }
  }

  private parseAndValidate(rawUrl: string): URL {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new BadRequestException('Invalid URL');
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new BadRequestException('Only http(s) URLs are allowed');
    }
    return url;
  }

  /** Block requests to loopback, private, and link-local addresses to limit
   *  basic SSRF risk. Resolves the hostname so a public-looking name pointing
   *  at 127.0.0.1 is also blocked. */
  private async assertPublicHost(hostname: string): Promise<void> {
    const candidates = isIP(hostname)
      ? [hostname]
      : (await lookup(hostname, { all: true }).catch(() => []))
          .map((r) => r.address);

    for (const addr of candidates) {
      if (this.isPrivate(addr)) {
        throw new BadRequestException(
          'Refusing to fetch from a private or loopback address',
        );
      }
    }
  }

  private isPrivate(addr: string): boolean {
    // IPv4
    if (/^127\./.test(addr))                return true;
    if (/^10\./.test(addr))                 return true;
    if (/^192\.168\./.test(addr))           return true;
    if (/^169\.254\./.test(addr))           return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(addr)) return true;
    if (addr === '0.0.0.0')                 return true;
    // IPv6
    if (addr === '::1')                     return true;
    if (/^fe80:/i.test(addr))               return true;
    if (/^fc00:|^fd00:/i.test(addr))        return true;
    return false;
  }

  private get(url: string, redirectsLeft = MAX_REDIRECTS): Promise<string> {
    return new Promise((resolve, reject) => {
      if (redirectsLeft === 0) {
        reject(new BadGatewayException('Too many redirects'));
        return;
      }

      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, (res) => {
        if (
          res.statusCode &&
          [301, 302, 303, 307, 308].includes(res.statusCode) &&
          res.headers.location
        ) {
          // Re-validate the redirect target before following.
          this.fetchText(new URL(res.headers.location, url).toString())
            .then(resolve)
            .catch(reject);
          res.resume();
          return;
        }
        if (res.statusCode !== 200) {
          reject(new BadGatewayException(`Upstream returned HTTP ${res.statusCode}`));
          return;
        }
        let bytes = 0;
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > MAX_BYTES) {
            req.destroy();
            reject(new BadRequestException('Script too large (1 MB cap)'));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });

      req.on('error', (err) => reject(new BadGatewayException(err.message)));
      req.setTimeout(TIMEOUT_MS, () => {
        req.destroy();
        reject(new BadGatewayException('Request timed out'));
      });
    });
  }
}
