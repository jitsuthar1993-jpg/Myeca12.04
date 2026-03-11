#!/usr/bin/env node

/**
 * JWT Secret Generator for MyeCA.in Platform
 * Generates a cryptographically secure JWT secret for production use
 */

import crypto from 'crypto';

function generateSecureJWTSecret(length = 64) {
  // Generate a cryptographically secure random string
  const secret = crypto.randomBytes(length).toString('base64url');
  return secret;
}

function main() {
  console.log('🔐 JWT Secret Generator for MyeCA.in');
  console.log('=====================================\n');
  
  // Generate a new secure JWT secret
  const jwtSecret = generateSecureJWTSecret();
  
  console.log('✅ Generated secure JWT secret:');
  console.log('--------------------------------');
  console.log(jwtSecret);
  console.log('--------------------------------\n');
  
  console.log('📋 Add this to your deployment environment variables:');
  console.log(`JWT_SECRET=${jwtSecret}\n`);
  
  console.log('🚀 Deployment Instructions:');
  console.log('1. Copy the JWT_SECRET value above');
  console.log('2. Add it to your Replit deployment secrets');
  console.log('3. Ensure NODE_ENV=production is also set');
  console.log('4. Redeploy your application\n');
  
  console.log('🔒 Security Notes:');
  console.log('- This secret is 64 bytes (512 bits) of randomness');
  console.log('- Keep this secret secure and never expose it in code');
  console.log('- Use different secrets for different environments');
  console.log('- Rotate this secret periodically for enhanced security');
}

main();

export { generateSecureJWTSecret };