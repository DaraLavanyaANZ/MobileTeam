export class DeviceManager {
  static getRequestedDevice(defaultDevice: string = 'Pixel_7_Pro'): string {
    const cliArg = process.argv.find((arg) => arg.startsWith('--device='));
    return cliArg ? cliArg.split('=')[1] : process.env.DEVICE_NAME ?? defaultDevice;
  }

  static getRequestedPlatform(defaultPlatform: 'android' | 'ios' = 'android'): 'android' | 'ios' {
    const cliArg = process.argv.find((arg) => arg.startsWith('--platform='));
    const value = cliArg ? cliArg.split('=')[1] : process.env.PLATFORM ?? defaultPlatform;
    return value === 'ios' ? 'ios' : 'android';
  }
}
