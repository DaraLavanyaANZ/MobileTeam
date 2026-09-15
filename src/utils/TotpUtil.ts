import crypto from 'node:crypto';

export class TotpUtil {
  static generateFromBase32(secret: string, period = 30, digits = 6, timestampMs = Date.now()): string {
    const normalizedSecret = TotpUtil.normalizeBase32(secret);
    const key = TotpUtil.decodeBase32(normalizedSecret);
    const counter = Math.floor(timestampMs / 1000 / period);

    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    counterBuffer.writeUInt32BE(counter >>> 0, 4);

    const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;

    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 10 ** digits;
    return otp.toString().padStart(digits, '0');
  }

  private static normalizeBase32(secret: string): string {
    const normalized = secret.toUpperCase().replace(/\s+/g, '').replace(/=+$/g, '');
    if (!/^[A-Z2-7]+$/.test(normalized)) {
      throw new Error('Invalid Base32 MFA secret format.');
    }

    return normalized;
  }

  private static decodeBase32(secret: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (const char of secret) {
      const index = alphabet.indexOf(char);
      if (index < 0) {
        throw new Error('Invalid Base32 character in MFA secret.');
      }

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }
}