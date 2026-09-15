export interface Device {
  name: string;
  platform: 'android' | 'ios';
  version?: string;
  udid?: string;
  status?: 'online' | 'offline';
}
