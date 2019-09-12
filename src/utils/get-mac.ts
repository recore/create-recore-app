import { networkInterfaces } from 'os';

export default function getMacAddress(): string | null {
  const result = networkInterfaces();
  const interfaces = Object.keys(result).sort();
  for (const inter of interfaces) {
    const macAddress = result[inter].find(item => item.mac && item.mac !== '00:00:00:00:00:00');
    if (macAddress) {
      return macAddress.mac
    }
  }
  return null;
}