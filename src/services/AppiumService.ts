export class AppiumService {
  static async startServer(host: string = '127.0.0.1', port: number = 4723): Promise<void> {
    console.log(`[AppiumService] Starting Appium on ${host}:${port}`);
  }

  static async stopServer(): Promise<void> {
    console.log('[AppiumService] Stopping Appium server');
  }
}
