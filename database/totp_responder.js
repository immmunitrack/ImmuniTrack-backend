const fs = require('fs');
const path = require('path');
const { getTOTP } = require('../services/totp');

const scratchDir = 'C:\\Users\\mulis\\.gemini\\antigravity-ide\\brain\\479da02b-1c64-4c85-8af6-22bbbaa834b7\\scratch';
const secretPath = path.join(scratchDir, 'secret.txt');
const codePath = path.join(scratchDir, 'code.txt');

console.log('TOTP Responder started. Monitoring secret.txt...');

function check() {
  if (fs.existsSync(secretPath)) {
    try {
      const secret = fs.readFileSync(secretPath, 'utf8').trim();
      if (secret) {
        console.log('Found secret:', secret);
        const code = getTOTP(secret);
        console.log('Calculated code:', code);
        fs.writeFileSync(codePath, code, 'utf8');
        fs.unlinkSync(secretPath);
        console.log('Wrote code to code.txt');
      }
    } catch (err) {
      console.error('Error processing secret:', err);
    }
  }
  setTimeout(check, 1000);
}

check();
