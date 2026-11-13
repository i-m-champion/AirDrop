/**
 * Parse User-Agent and client hints to determine peer device type and friendly label
 */
export function parseDevice(userAgent = '', ip = '') {
  const ua = userAgent.toLowerCase();
  let type = 'desktop';
  let os = 'Unknown Device';
  let browser = 'Browser';

  // OS Detection
  if (ua.includes('iphone')) {
    type = 'mobile';
    os = 'iPhone';
  } else if (ua.includes('ipad')) {
    type = 'tablet';
    os = 'iPad';
  } else if (ua.includes('android')) {
    type = 'mobile';
    os = 'Android Device';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    type = 'desktop';
    os = 'Mac';
  } else if (ua.includes('windows')) {
    type = 'desktop';
    os = 'Windows PC';
  } else if (ua.includes('linux')) {
    type = 'desktop';
    os = 'Linux PC';
  }

  // Browser Detection
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  }

  // Clean remote IP (strip ::ffff:)
  const cleanIp = ip.replace(/^.*:/, '') || '127.0.0.1';

  return {
    type,
    os,
    browser,
    ip: cleanIp,
    label: `${os} (${cleanIp})`,
  };
}
