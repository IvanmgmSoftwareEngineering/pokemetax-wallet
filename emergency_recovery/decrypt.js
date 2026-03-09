// =============================================
// ✏️ EDIT THESE 2 VARIABLES BEFORE RUNNING:
// =============================================
const FILE_NAME = 'my_wallet_eth.txt';  // Your encrypted .txt file name
const PASSWORD = 'your_password_here';  // The password you used when exporting
// =============================================

const crypto = require('crypto');
const fs = require('fs');

// Read the encrypted file
const file = JSON.parse(fs.readFileSync(FILE_NAME, 'utf8'));

// Step 1: Extract salt, iv and data from file (hex → bytes)
const salt = Buffer.from(file.salt, 'hex');
const iv = Buffer.from(file.iv, 'hex');
const encData = Buffer.from(file.data, 'hex');

// Step 2: Derive key with PBKDF2 (100,000 iterations, SHA-256)
const key = crypto.pbkdf2Sync(PASSWORD, salt, 100000, 32, 'sha256');

// Step 3: Separate Auth Tag (last 16 bytes) from Ciphertext
const authTag = encData.slice(encData.length - 16);
const ciphertext = encData.slice(0, encData.length - 16);

// Step 4: Decrypt with AES-256-GCM
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(authTag);
const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

// Step 5: Auto-detect format and display result
const wallet = JSON.parse(decrypted.toString('utf8'));

if (wallet.format === 'multi-wallet') {
  console.log('\n✅ Multi-wallet decrypted (' + wallet.walletCount + ' wallets):\n');
  wallet.wallets.forEach((w, i) => {
    console.log('--- Wallet ' + (i + 1) + ' ---');
    console.log('  Network:     ' + w.networkId);
    console.log('  Address:     ' + w.address);
    console.log('  Alias:       ' + (w.alias || 'N/A'));
    console.log('  Private key: ' + w.privateKey);
    if (w.mnemonic) console.log('  Seed phrase: ' + w.mnemonic);
    console.log('');
  });
} else if (wallet.format === 'mono-wallet') {
  console.log('\n✅ Mono-wallet decrypted:\n');
  const w = wallet.wallet;
  console.log('  Network:     ' + w.networkId);
  console.log('  Address:     ' + w.address);
  console.log('  Alias:       ' + (w.alias || 'N/A'));
  console.log('  Private key: ' + w.privateKey);
  if (w.mnemonic) console.log('  Seed phrase: ' + w.mnemonic);
} else {
  // Legacy format
  console.log('\n✅ Wallet decrypted (legacy format):\n');
  console.log('  Network:     ' + wallet.networkId);
  console.log('  Address:     ' + wallet.address);
  if (wallet.privateKey) console.log('  Private key: ' + wallet.privateKey);
  if (wallet.mnemonic) console.log('  Seed phrase: ' + wallet.mnemonic);
}

console.log('\n📋 Full JSON:\n');
console.log(JSON.stringify(wallet, null, 2));
