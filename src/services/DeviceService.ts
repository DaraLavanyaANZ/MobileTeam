export class DeviceService {
  static resolvePlatform(): 'android' | 'ios' {
    return ((process.env.PLATFORM ?? 'android').toLowerCase() === 'ios' ? 'ios' : 'android');
  }

  static resolveDeviceName(defaultName: string = 'Pixel_7_Pro'): string {
    return process.env.DEVICE_NAME ?? defaultName;
  }

  static resolveEnvironment(): string {
    return process.env.ENVIRONMENT ?? 'qa';
  }
}
