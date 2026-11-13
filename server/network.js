import os from 'os';

/**
 * Detects all valid IPv4 network interfaces on the host machine.
 * Prioritizes Wi-Fi (en0 on macOS, wlan0 on Linux) and local LAN addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x).
 */
export function getNetworkInfo(preferredPort = 3000) {
  const interfaces = os.networkInterfaces();
  const validIps = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      // Look for IPv4 non-internal addresses
      if (addr.family === 'IPv4' && !addr.internal) {
        // Distinguish common interface types
        const isWifi = name.toLowerCase().includes('wi-fi') || 
                       name.toLowerCase().includes('wlan') || 
                       name === 'en0';
        const isEthernet = name.toLowerCase().includes('eth') || 
                           name.toLowerCase().includes('ethernet') || 
                           name === 'en1';

        validIps.push({
          interface: name,
          address: addr.address,
          netmask: addr.netmask,
          mac: addr.mac,
          isWifi,
          isEthernet,
          url: `http://${addr.address}:${preferredPort}`,
        });
      }
    }
  }

  // Sort: Wi-Fi first, then private LAN IPs (192.168 > 10.x > 172.x), then other interfaces
  validIps.sort((a, b) => {
    if (a.isWifi && !b.isWifi) return -1;
    if (!a.isWifi && b.isWifi) return 1;
    if (a.address.startsWith('192.168.') && !b.address.startsWith('192.168.')) return -1;
    if (!a.address.startsWith('192.168.') && b.address.startsWith('192.168.')) return 1;
    return a.interface.localeCompare(b.interface);
  });

  const primaryIp = validIps.length > 0 ? validIps[0].address : '127.0.0.1';
  const primaryUrl = `http://${primaryIp}:${preferredPort}`;

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    osRelease: os.release(),
    arch: os.arch(),
    primaryIp,
    primaryUrl,
    preferredPort,
    interfaces: validIps,
    hasExternalNetwork: validIps.length > 0,
  };
}
