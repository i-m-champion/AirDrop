import qrcodeTerminal from 'qrcode-terminal';

export function printStartupBanner(netInfo) {
  const { primaryUrl, primaryIp, preferredPort, interfaces, hostname } = netInfo;

  console.log('\n' + '='.repeat(64));
  console.log('⚡  AIRDROP LOCAL // NEO-BRUTALIST P2P WI-FI TRANSFER');
  console.log('='.repeat(64));
  console.log(`📡 Host Machine : ${hostname} (${process.platform})`);
  console.log(`🌐 Primary Wi-Fi: ${primaryIp}:${preferredPort}`);
  console.log(`🔗 Browser Link : \x1b[36m\x1b[4m${primaryUrl}\x1b[0m`);
  console.log('='.repeat(64));

  if (interfaces && interfaces.length > 1) {
    console.log('Available Network Interfaces:');
    interfaces.forEach(i => {
      const type = i.isWifi ? '[Wi-Fi]' : (i.isEthernet ? '[Ethernet]' : '[LAN]');
      console.log(`  • ${type.padEnd(11)} ${i.interface} -> ${i.url}`);
    });
    console.log('-'.repeat(64));
  }

  console.log('\n📱 SCAN WITH IPHONE / ANDROID CAMERA TO PAIR INSTANTLY:\n');
  
  try {
    qrcodeTerminal.generate(primaryUrl, { small: true });
  } catch (err) {
    console.log(`(ASCII QR generation skipped: ${err.message})`);
  }

  console.log('\n⚡ Status: Server listening on 0.0.0.0:' + preferredPort);
  console.log('🔒 Privacy: 100% Local Wi-Fi Router Only (Zero External Cloud)');
  console.log('='.repeat(64) + '\n');
}
