export class CommonUtil {
  static randomString(length = 8): string {
    return Math.random().toString(36).slice(2, 2 + length);
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static getEnvironmentName(): string {
    return process.env.ENVIRONMENT ?? 'qa';
  }
}
