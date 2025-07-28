const { createCA, createCert } = require('mkcert');
const fs = require('fs');
const path = require('path');

async function createCerts() {
  try {
    console.log('Creating HTTPS certificates...');
    
    const ca = await createCA({
      organization: 'FinTask Dev',
      countryCode: 'US',
      state: 'Dev',
      locality: 'Local',
      validity: 365
    });

    const cert = await createCert({
      ca: { key: ca.key, cert: ca.cert },
      domains: ['127.0.0.1', 'localhost'],
      validity: 365
    });

    if (!fs.existsSync('certs')) {
      fs.mkdirSync('certs');
    }

    fs.writeFileSync('certs/cert.pem', cert.cert);
    fs.writeFileSync('certs/key.pem', cert.key);

    console.log('✅ Certificates created! Now run: npm start');
  } catch (error) {
    console.error('Error:', error);
  }
}

createCerts();