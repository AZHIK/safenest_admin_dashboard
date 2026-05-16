/**
 * Decryption utility using Web Crypto API for AES-GCM
 */

export interface EncryptionMetadata {
  algorithm: string
  encrypted_key: string
  iv: string
  key_iv: string
  [key: string]: any
}

// Master Key Encryption Key (KEK) - MUST MATCH THE MOBILE APP
const MASTER_KEK = 'default-kek-change-in-production';

/**
 * Helper to convert Base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decrypt data using AES-GCM via Web Crypto API
 */
export async function decryptData(
  encryptedData: Uint8Array,
  metadata: EncryptionMetadata
): Promise<ArrayBuffer> {
  try {
    const crypto = window.crypto.subtle;

    // 1. Prepare the Master KEK
    // We pad/substring to ensure it's 32 bytes (256 bits)
    const kekSource = new TextEncoder().encode(MASTER_KEK.padEnd(32, ' ').substring(0, 32));
    const kek = await crypto.importKey(
      'raw',
      kekSource,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // 2. Unwrap the DEK (Data Encryption Key)
    const wrappedDek = base64ToUint8Array(metadata.encrypted_key);
    const keyIv = base64ToUint8Array(metadata.key_iv);

    const dekBytes = await crypto.decrypt(
      { name: 'AES-GCM', iv: keyIv },
      kek,
      wrappedDek
    );

    const dek = await crypto.importKey(
      'raw',
      dekBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // 3. Decrypt the actual data
    const iv = base64ToUint8Array(metadata.iv);
    
    return await crypto.decrypt(
      { name: 'AES-GCM', iv: iv },
      dek,
      encryptedData
    );
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. Ensure the master key matches.');
  }
}

/**
 * Fetch and decrypt a file
 */
export async function fetchAndDecryptFile(
  fileUrl: string,
  metadata: EncryptionMetadata,
  _kek?: string // kept for backward compatibility with existing calls
): Promise<Blob> {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

  const encryptedData = new Uint8Array(await response.arrayBuffer());
  const decryptedBuffer = await decryptData(encryptedData, metadata);

  const mimeType = metadata.content_type || 'application/octet-stream';
  return new Blob([decryptedBuffer], { type: mimeType });
}

/**
 * Get the KEK from environment variables
 */
export function getKEK(): string {
  return process.env.NEXT_PUBLIC_ENCRYPTION_KEY || MASTER_KEK;
}
