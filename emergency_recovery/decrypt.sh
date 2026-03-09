#!/bin/bash
# =============================================
# ✏️ EDIT THESE 2 VARIABLES BEFORE RUNNING:
# =============================================
FILE_NAME="my_wallet_eth.txt"      # Your encrypted .txt file name
PASSWORD="your_password_here"      # The password you used when exporting
# =============================================

node -e "
const crypto = require('crypto');
const fs = require('fs');
const file = JSON.parse(fs.readFileSync('$FILE_NAME', 'utf8'));
const salt = Buffer.from(file.salt, 'hex');
const key = crypto.pbkdf2Sync('$PASSWORD', salt, 100000, 32, 'sha256');
const iv = Buffer.from(file.iv, 'hex');
const encData = Buffer.from(file.data, 'hex');
const authTag = encData.slice(encData.length - 16);
const ciphertext = encData.slice(0, encData.length - 16);
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(authTag);
const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
const w = JSON.parse(decrypted.toString('utf8'));
if (w.format === 'multi-wallet') {
  console.log('✅ Multi-wallet (' + w.walletCount + ' wallets)');
} else if (w.format === 'mono-wallet') {
  console.log('✅ Mono-wallet: ' + w.wallet.address);
} else {
  console.log('✅ Legacy wallet: ' + w.address);
}
console.log(JSON.stringify(w, null, 2));
" 2>/dev/null || echo "❌ Error: Wrong password or corrupted file."
