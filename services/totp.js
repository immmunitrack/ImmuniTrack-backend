const crypto = require('crypto');

/**
 * Decodes a base32 string into a binary Buffer.
 * Characters outside the standard RFC 4648 base32 alphabet (A-Z, 2-7) are ignored.
 */
function decodeBase32(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  // Remove padding, normalize characters, remove spacing
  const clean = base32.replace(/=+$/, '').toUpperCase().replace(/[\s-]/g, '');
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) {
      throw new Error(`Invalid base32 character: ${clean[i]}`);
    }
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generates a cryptographically secure random base32 secret.
 */
function generateSecret(length = 16) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += alphabet[randomBytes[i] % 32];
  }
  return secret;
}

/**
 * Calculates the current 6-digit TOTP token.
 */
function getTOTP(secret, timeStep = 30) {
  const key = decodeBase32(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(0, 0);
  buf.writeUInt32BE(counter, 4);
  
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
               
  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Validates a user-supplied token against a secret (within a ±1 step clock window).
 */
function verifyTOTP(token, secret, window = 1, timeStep = 30) {
  try {
    const key = decodeBase32(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(epoch / timeStep);
    
    // Check current step and adjacent steps to allow minor clock drifts
    for (let i = -window; i <= window; i++) {
      const counter = currentCounter + i;
      const buf = Buffer.alloc(8);
      buf.writeUInt32BE(0, 0);
      buf.writeUInt32BE(counter, 4);
      
      const hmac = crypto.createHmac('sha1', key).update(buf).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const code = ((hmac[offset] & 0x7f) << 24) |
                   ((hmac[offset + 1] & 0xff) << 16) |
                   ((hmac[offset + 2] & 0xff) << 8) |
                   (hmac[offset + 3] & 0xff);
                   
      const calculatedToken = (code % 1000000).toString().padStart(6, '0');
      if (calculatedToken === token) {
        return true;
      }
    }
  } catch (err) {
    console.error('Error during TOTP verification:', err.message);
  }
  return false;
}

module.exports = {
  generateSecret,
  decodeBase32,
  getTOTP,
  verifyTOTP
};
