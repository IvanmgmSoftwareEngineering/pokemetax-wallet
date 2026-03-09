# =============================================
# ✏️ EDIT THESE 2 VARIABLES BEFORE RUNNING:
# =============================================
FILE_NAME = 'my_wallet_eth.txt'    # Your encrypted .txt file name
PASSWORD = 'your_password_here'    # The password you used when exporting
# =============================================

import json
from hashlib import pbkdf2_hmac
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Read the encrypted file
with open(FILE_NAME, 'r') as f:
    data = json.load(f)

# Step 1: Extract salt, iv and data (hex → bytes)
salt = bytes.fromhex(data['salt'])
iv = bytes.fromhex(data['iv'])
enc_data = bytes.fromhex(data['data'])

# Step 2: Derive key with PBKDF2 (100,000 iterations, SHA-256)
key = pbkdf2_hmac('sha256', PASSWORD.encode(), salt, 100000, dklen=32)

# Step 3: Decrypt with AES-256-GCM
aesgcm = AESGCM(key)
decrypted = aesgcm.decrypt(iv, enc_data, None)

# Step 4: Auto-detect format and display result
wallet = json.loads(decrypted.decode('utf-8'))

if wallet.get('format') == 'multi-wallet':
    print(f"\n✅ Multi-wallet decrypted ({wallet['walletCount']} wallets):\n")
    for i, w in enumerate(wallet['wallets']):
        print(f"--- Wallet {i + 1} ---")
        print(f"  Network:     {w['networkId']}")
        print(f"  Address:     {w['address']}")
        print(f"  Alias:       {w.get('alias', 'N/A')}")
        print(f"  Private key: {w['privateKey']}")
        if w.get('mnemonic'): print(f"  Seed phrase: {w['mnemonic']}")
        print()
elif wallet.get('format') == 'mono-wallet':
    print("\n✅ Mono-wallet decrypted:\n")
    w = wallet['wallet']
    print(f"  Network:     {w['networkId']}")
    print(f"  Address:     {w['address']}")
    print(f"  Alias:       {w.get('alias', 'N/A')}")
    print(f"  Private key: {w['privateKey']}")
    if w.get('mnemonic'): print(f"  Seed phrase: {w['mnemonic']}")
else:
    print("\n✅ Wallet decrypted (legacy format):\n")
    print(f"  Network:     {wallet.get('networkId', 'N/A')}")
    print(f"  Address:     {wallet.get('address', 'N/A')}")
    if wallet.get('privateKey'): print(f"  Private key: {wallet['privateKey']}")
    if wallet.get('mnemonic'): print(f"  Seed phrase: {wallet['mnemonic']}")

print("\n📋 Full JSON:\n")
print(json.dumps(wallet, indent=2, ensure_ascii=False))
