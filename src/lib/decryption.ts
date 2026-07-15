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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function normalizeEncryptionMetadata(metadata: unknown): EncryptionMetadata {
  const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata

  if (!isRecord(parsed)) {
    throw new Error('Encryption metadata is missing or invalid.')
  }

  const encryptedKey = parsed.encrypted_key
  const iv = parsed.iv
  const keyIv = parsed.key_iv

  if (
    typeof encryptedKey !== 'string' ||
    typeof iv !== 'string' ||
    typeof keyIv !== 'string'
  ) {
    throw new Error('Encryption metadata is incomplete.')
  }

  return parsed as EncryptionMetadata
}

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

function toBufferSource(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

function hasPrefix(bytes: Uint8Array, prefix: Uint8Array): boolean {
  if (bytes.length < prefix.length) {
    return false
  }

  for (let i = 0; i < prefix.length; i++) {
    if (bytes[i] !== prefix[i]) {
      return false
    }
  }

  return true
}

function stripNoncePrefixIfPresent(bytes: Uint8Array, nonce: Uint8Array): Uint8Array {
  return hasPrefix(bytes, nonce) ? bytes.slice(nonce.length) : bytes
}

/**
 * Get the KEK from environment variables
 */
export function getKEK(): string {
  const kek = process.env.NEXT_PUBLIC_ENCRYPTION_KEY?.trim()

  if (!kek) {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY is not set.')
  }

  return kek
}

/**
 * Decrypt data using AES-GCM via Web Crypto API
 */
export async function decryptData(
  encryptedData: Uint8Array,
  metadata: EncryptionMetadata | string,
  kekOverride?: string
): Promise<ArrayBuffer> {
  try {
    const crypto = window.crypto.subtle;
    const normalizedMetadata = normalizeEncryptionMetadata(metadata)

    // 1. Prepare the Master KEK
    // We pad/substring to ensure it's 32 bytes (256 bits)
    const kekValue = (kekOverride ?? getKEK()).padEnd(32, ' ').substring(0, 32)
    const kekSource = new TextEncoder().encode(kekValue);
    const kek = await crypto.importKey(
      'raw',
      kekSource,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // 2. Unwrap the DEK (Data Encryption Key)
    const wrappedDekWithPossibleNonce = base64ToUint8Array(normalizedMetadata.encrypted_key);
    const keyIv = base64ToUint8Array(normalizedMetadata.key_iv);
    const wrappedDek = stripNoncePrefixIfPresent(wrappedDekWithPossibleNonce, keyIv)

    let dekBytes: ArrayBuffer
    try {
      dekBytes = await crypto.decrypt(
        { name: 'AES-GCM', iv: toBufferSource(keyIv) },
        kek,
        toBufferSource(wrappedDek)
      );
    } catch (error) {
      console.error('DEK unwrap failed:', error);
      throw new Error('Failed to unwrap the file key. The dashboard encryption key is likely wrong.')
    }

    const dek = await crypto.importKey(
      'raw',
      dekBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // 3. Decrypt the actual data
    const iv = base64ToUint8Array(normalizedMetadata.iv);
    const encryptedPayload = stripNoncePrefixIfPresent(encryptedData, iv)

    try {
      return await crypto.decrypt(
        { name: 'AES-GCM', iv: toBufferSource(iv) },
        dek,
        toBufferSource(encryptedPayload)
      );
    } catch (error) {
      console.error('Payload decrypt failed:', error);
      throw new Error('Failed to decrypt the file contents. The encrypted file or metadata does not match.')
    }
  } catch (error) {
    console.error('Decryption failed:', error);
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to decrypt data.')
  }
}

/**
 * Fetch and decrypt a file
 */
export async function fetchAndDecryptFile(
  fileUrl: string,
  metadata: EncryptionMetadata | string,
  kek?: string,
  init?: RequestInit
): Promise<Blob> {
  const response = await fetch(fileUrl, init);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

  const encryptedData = new Uint8Array(await response.arrayBuffer());
  const decryptedBuffer = await decryptData(encryptedData, metadata, kek);
  const normalizedMetadata = normalizeEncryptionMetadata(metadata)

  const mimeType = normalizedMetadata.content_type || 'application/octet-stream';
  return new Blob([decryptedBuffer], { type: mimeType });
}
