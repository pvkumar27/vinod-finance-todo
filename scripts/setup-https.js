const { createCA, createCert } = require('mkcert');
const fs = require('fs');
const path = require('path');

async function setupHTTPS() {
  try {
    console.log('🔐 Setting up local HTTPS certificates...');
    
    // Create CA
    const ca = await createCA({
      organization: 'FinTask Dev',
      countryCode: 'US',
      state: 'Dev',
      locality: 'Local',
      validity: 365
    });

    // Create certificate
    const cert = await createCert({
      ca: { key: ca.key, cert: ca.cert },
      domains: ['127.0.0.1', 'localhost'],
      validity: 365
    });

    // Create certs directory
    const certsDir = path.join(__dirname, '..', 'certs');
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir);
    }

    // Write certificates
    fs.writeFileSync(path.join(certsDir, 'cert.pem'), cert.cert);
    fs.writeFileSync(path.join(certsDir, 'key.pem'), cert.key);

    console.log('✅ HTTPS certificates created in ./certs/');
    console.log('📱 Now run: npm run start:https');
    
  } catch (error) {
    console.error('❌ Error setting up HTTPS:', error);
  }
}

setupHTTPS();