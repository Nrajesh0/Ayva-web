// Zero-Knowledge WebCrypto Security Architecture using AES-256-GCM & PBKDF2

export interface VaultMetadata {
  version: number;
  cipher: 'AES-256-GCM';
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string; // Base64 encoded salt
  createdAt: number;
  appName: string;
}

export interface EncryptedPayload {
  iv: string; // Base64 encoded 12-byte IV
  ciphertext: string; // Base64 encoded ciphertext
  tagLength?: number;
}

export interface VaultExportPackage {
  metadata: VaultMetadata;
  payload: EncryptedPayload;
  checksum: string;
}

// 128 BIP-39 English words for emergency recovery mnemonic generation
export const MNEMONIC_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
  'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
  'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
  'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake'
];

export function generateMnemonicPhrase(length = 12): string {
  const words: string[] = [];
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);
  for (let i = 0; i < length; i++) {
    const idx = randomBytes[i] % MNEMONIC_WORDS.length;
    words.push(MNEMONIC_WORDS[idx]);
  }
  return words.join(' ');
}

// Buffer to Base64 & Base64 to Buffer helpers
export function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class VaultSecurity {
  private static readonly ITERATIONS = 100_000;
  private static readonly KEY_LENGTH = 256;

  /**
   * Generates a secure random salt.
   */
  static generateSalt(): Uint8Array {
    const salt = new Uint8Array(16);
    window.crypto.getRandomValues(salt);
    return salt;
  }

  /**
   * Derives an AES-GCM CryptoKey from a passphrase and salt using PBKDF2-SHA256.
   */
  static async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plaintext string using AES-256-GCM.
   */
  static async encrypt(plaintext: string, key: CryptoKey): Promise<EncryptedPayload> {
    const iv = new Uint8Array(12); // 96-bit recommended IV for AES-GCM
    window.crypto.getRandomValues(iv);
    const enc = new TextEncoder();

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      enc.encode(plaintext)
    );

    return {
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(ciphertextBuffer),
      tagLength: 128
    };
  }

  /**
   * Decrypts AES-256-GCM payload into plaintext string.
   */
  static async decrypt(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
    const iv = base64ToBuffer(payload.iv);
    const ciphertext = base64ToBuffer(payload.ciphertext);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any
      },
      key,
      ciphertext as any
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  }

  /**
   * Generates a SHA-256 integrity checksum for a payload string.
   */
  static async calculateChecksum(data: string): Promise<string> {
    const enc = new TextEncoder();
    const digest = await window.crypto.subtle.digest('SHA-256', enc.encode(data));
    return bufferToBase64(digest);
  }

  /**
   * Encrypts entire vault data (notes, tasks, preferences) into a portable Zero-Knowledge JSON package.
   */
  static async exportEncryptedVault(
    vaultData: { notes: any[]; tasks: any[]; exportedAt: number },
    passphrase: string
  ): Promise<VaultExportPackage> {
    const salt = this.generateSalt();
    const key = await this.deriveKey(passphrase, salt);
    const jsonString = JSON.stringify(vaultData);
    const payload = await this.encrypt(jsonString, key);
    const checksum = await this.calculateChecksum(payload.ciphertext);

    const metadata: VaultMetadata = {
      version: 1,
      cipher: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations: this.ITERATIONS,
      salt: bufferToBase64(salt),
      createdAt: Date.now(),
      appName: 'RuN Desktop Notesnook'
    };

    return {
      metadata,
      payload,
      checksum
    };
  }

  /**
   * Decrypts a portable Zero-Knowledge JSON package back into notes and tasks.
   */
  static async importEncryptedVault(
    pkg: VaultExportPackage,
    passphrase: string
  ): Promise<{ notes: any[]; tasks: any[]; exportedAt: number }> {
    const currentChecksum = await this.calculateChecksum(pkg.payload.ciphertext);
    if (currentChecksum !== pkg.checksum) {
      throw new Error('Vault package checksum verification failed. The encrypted file may be corrupted or modified.');
    }

    const salt = base64ToBuffer(pkg.metadata.salt);
    const key = await this.deriveKey(passphrase, salt);
    const decryptedJson = await this.decrypt(pkg.payload, key);
    return JSON.parse(decryptedJson);
  }
}
