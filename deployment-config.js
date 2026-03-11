#!/usr/bin/env node

/**
 * MyeCA.in Production Deployment Configuration
 * Ensures all environment variables and settings are properly configured for production
 */

// Required environment variables for production deployment
const REQUIRED_PRODUCTION_VARS = [
  'JWT_SECRET',
  'DATABASE_URL'
];

// Optional but recommended environment variables
const RECOMMENDED_VARS = [
  'NODE_ENV',
  'OPENAI_API_KEY',
  'SENDGRID_API_KEY'
];

function checkEnvironmentVariables() {
  console.log('🔍 Checking Production Environment Configuration...\n');
  
  let allRequiredPresent = true;
  let warnings = [];
  
  // Check required variables
  console.log('✅ Required Variables:');
  for (const varName of REQUIRED_PRODUCTION_VARS) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✓ ${varName}: ${value.length > 20 ? '***[CONFIGURED]***' : value}`);
    } else {
      console.log(`   ❌ ${varName}: MISSING`);
      allRequiredPresent = false;
    }
  }
  
  // Check recommended variables
  console.log('\n📋 Recommended Variables:');
  for (const varName of RECOMMENDED_VARS) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✓ ${varName}: ${value.length > 20 ? '***[CONFIGURED]***' : value}`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set (optional)`);
      warnings.push(varName);
    }
  }
  
  // Production-specific checks
  console.log('\n🏭 Production Environment Checks:');
  
  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    console.log('   ✓ NODE_ENV: production');
  } else {
    console.log(`   ⚠️  NODE_ENV: ${nodeEnv || 'not set'} (should be "production" for deployment)`);
    warnings.push('NODE_ENV should be set to "production"');
  }
  
  // Check JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    if (jwtSecret.length >= 32) {
      console.log('   ✓ JWT_SECRET: Strong (>=32 characters)');
    } else {
      console.log('   ⚠️  JWT_SECRET: Weak (<32 characters)');
      warnings.push('JWT_SECRET should be at least 32 characters');
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allRequiredPresent) {
    console.log('🎉 DEPLOYMENT READY!');
    console.log('All required environment variables are configured.');
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Deploy your application to Replit');
    console.log('2. Monitor deployment logs for any issues');
    console.log('3. Test authentication after deployment');
    
  } else {
    console.log('❌ DEPLOYMENT NOT READY!');
    console.log('Missing required environment variables.');
    console.log('\n🔧 Fix Instructions:');
    console.log('1. Add missing variables to Replit Deployment Secrets');
    console.log('2. Run this script again to verify');
    console.log('3. Deploy after all variables are configured');
  }
  
  return allRequiredPresent;
}

// Generate deployment summary
function generateDeploymentSummary() {
  const isReady = checkEnvironmentVariables();
  
  console.log('\n📄 Deployment Summary:');
  console.log(`Status: ${isReady ? 'READY ✅' : 'NOT READY ❌'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured' : 'Missing'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Configured' : 'Missing'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
  
  return isReady;
}

// Main execution
console.log('🚀 MyeCA.in Deployment Configuration Checker');
console.log('='.repeat(50));

const isReady = generateDeploymentSummary();
process.exit(isReady ? 0 : 1);

export {
  checkEnvironmentVariables,
  generateDeploymentSummary,
  REQUIRED_PRODUCTION_VARS,
  RECOMMENDED_VARS
};