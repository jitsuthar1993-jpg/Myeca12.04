/**
 * Security utilities for MyeCA.in platform
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate and sanitize URL to prevent open redirect vulnerabilities
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow same-origin or explicitly allowed domains
    const allowedDomains = [
      window.location.hostname,
      'myeca.in',
      'www.myeca.in'
    ];
    
    if (allowedDomains.includes(parsed.hostname)) {
      return parsed.toString();
    }
    
    // Return root URL for invalid domains
    return '/';
  } catch {
    return '/';
  }
}

/**
 * Check if content contains potential XSS patterns
 */
export function containsXSS(content: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?<\/embed>/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(content));
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash sensitive data using Web Crypto API
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate PAN card format
 */
export function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
}

/**
 * Validate Aadhaar number format (without storing actual number)
 */
export function validateAadhaar(aadhaar: string): boolean {
  const cleanedAadhaar = aadhaar.replace(/\s/g, '');
  return /^\d{12}$/.test(cleanedAadhaar);
}

/**
 * Validate GSTIN format
 */
export function validateGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
}

/**
 * Mask sensitive data for display
 */
export function maskSensitiveData(data: string, type: 'pan' | 'aadhaar' | 'phone' | 'email' | 'account' | 'gstin'): string {
  if (!data) return '';
  
  switch (type) {
    case 'pan':
      // Show first 3 and last 2 characters: ABC**12XY
      return data.slice(0, 3) + '****' + data.slice(-2);
      
    case 'aadhaar':
      // Show last 4 digits: XXXX XXXX 1234
      return 'XXXX XXXX ' + data.slice(-4);
      
    case 'phone':
      // Show first 2 and last 2 digits: 98XXXXXX10
      return data.slice(0, 2) + 'X'.repeat(data.length - 4) + data.slice(-2);
      
    case 'email':
      // Show first 3 chars and domain: abc***@gmail.com
      const [username, domain] = data.split('@');
      if (username.length <= 3) {
        return username + '***@' + domain;
      }
      return username.slice(0, 3) + '***@' + domain;
      
    case 'account':
      // Show last 4 digits: XXXXXXXX1234
      return 'X'.repeat(Math.max(0, data.length - 4)) + data.slice(-4);
      
    case 'gstin':
      // Show first 2 and last 3 characters: 22XXXXXXXXXZ5
      return data.slice(0, 2) + 'X'.repeat(data.length - 5) + data.slice(-3);
      
    default:
      return data;
  }
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');
  
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  // Common patterns check
  const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }
  
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'fair';
  else if (score <= 5) strength = 'good';
  else strength = 'strong';
  
  return { score, feedback, strength };
}

/**
 * Rate limit checker using localStorage
 */
export function checkRateLimit(
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const key = `rate_limit_${action}`;
  const now = Date.now();
  
  // Get existing attempts
  const stored = localStorage.getItem(key);
  let attempts: { timestamp: number }[] = [];
  
  if (stored) {
    try {
      attempts = JSON.parse(stored);
    } catch {
      attempts = [];
    }
  }
  
  // Filter out attempts outside the window
  attempts = attempts.filter(attempt => now - attempt.timestamp < windowMs);
  
  // Check if rate limit exceeded
  if (attempts.length >= maxAttempts) {
    const oldestAttempt = attempts[0];
    const resetTime = oldestAttempt.timestamp + windowMs;
    
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime
    };
  }
  
  // Add current attempt
  attempts.push({ timestamp: now });
  localStorage.setItem(key, JSON.stringify(attempts));
  
  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempts.length,
    resetTime: now + windowMs
  };
}