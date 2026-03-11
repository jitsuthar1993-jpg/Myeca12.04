/**
 * Client-side encryption utilities for sensitive data
 */

/**
 * Encrypt data using Web Crypto API
 */
export async function encryptData(data: string, password: string): Promise<{
  encrypted: string;
  salt: string;
  iv: string;
}> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  // Convert to base64 for storage
  return {
    encrypted: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encrypted)))),
    salt: btoa(String.fromCharCode.apply(null, Array.from(salt))),
    iv: btoa(String.fromCharCode.apply(null, Array.from(iv)))
  };
}

/**
 * Decrypt data using Web Crypto API
 */
export async function decryptData(
  encryptedData: string,
  password: string,
  salt: string,
  iv: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Convert from base64
  const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
  const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltArray,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    key,
    encryptedArray
  );
  
  return decoder.decode(decrypted);
}

/**
 * Securely store sensitive data in localStorage with encryption
 */
export class SecureStorage {
  private static masterKey: string | null = null;
  
  /**
   * Initialize secure storage with a master key
   */
  static async init(password: string): Promise<void> {
    // Generate a master key from the password
    const encoder = new TextEncoder();
    const keyData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    this.masterKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Store encrypted data
   */
  static async setItem(key: string, value: any): Promise<void> {
    if (!this.masterKey) {
      throw new Error('SecureStorage not initialized');
    }
    
    const data = JSON.stringify(value);
    const { encrypted, salt, iv } = await encryptData(data, this.masterKey);
    
    localStorage.setItem(key, JSON.stringify({ encrypted, salt, iv }));
  }
  
  /**
   * Retrieve and decrypt data
   */
  static async getItem<T>(key: string): Promise<T | null> {
    if (!this.masterKey) {
      throw new Error('SecureStorage not initialized');
    }
    
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      const { encrypted, salt, iv } = JSON.parse(stored);
      const decrypted = await decryptData(encrypted, this.masterKey, salt, iv);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }
  
  /**
   * Remove item
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  /**
   * Clear all secure storage
   */
  static clear(): void {
    // Only clear items that were encrypted by SecureStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value);
          if (parsed.encrypted && parsed.salt && parsed.iv) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Not a SecureStorage item, skip
      }
    });
  }
  
  /**
   * Lock the storage (clear master key)
   */
  static lock(): void {
    this.masterKey = null;
  }
}