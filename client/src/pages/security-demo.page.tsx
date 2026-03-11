import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Eye, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/security/PasswordStrengthIndicator';
import { SensitiveDataInput } from '@/components/security/SensitiveDataInput';
import { SecureForm } from '@/components/security/SecureForm';
import { useSecureSession } from '@/hooks/useSecureSession';
import { ContentSecurityPolicy } from '@/components/security/ContentSecurityPolicy';
import { useToast } from '@/hooks/use-toast';

export default function SecurityDemoPage() {
  const [password, setPassword] = useState('');
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [gstin, setGstin] = useState('');
  const [account, setAccount] = useState('');
  const { toast } = useToast();
  
  const { showWarning, timeRemaining, extendSession } = useSecureSession({
    maxInactiveTime: 5 * 60 * 1000, // 5 minutes for demo
    warningTime: 1 * 60 * 1000, // 1 minute warning
  });

  const handleSecureSubmit = (data: any, csrfToken: string) => {
    toast({
      title: "Secure Form Submitted",
      description: `Form submitted with CSRF token: ${csrfToken.substring(0, 10)}...`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <ContentSecurityPolicy />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Security Features Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore MyeCA.in's comprehensive security features designed to protect your sensitive financial data
            </p>
          </div>

          {/* Session Security Warning */}
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-900">Session Expiring Soon</h3>
                      <p className="text-red-700">
                        Your session will expire in {timeRemaining} seconds due to inactivity
                      </p>
                    </div>
                  </div>
                  <Button onClick={extendSession} variant="outline" className="border-red-600 text-red-600">
                    Extend Session
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Security Features Grid */}
          <div className="grid gap-8">
            {/* Password Security */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Password Security</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="demo-password">Test Password Strength</Label>
                  <Input
                    id="demo-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password to test"
                    className="mt-2"
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>
            </Card>

            {/* Sensitive Data Protection */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Sensitive Data Protection</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="demo-pan">PAN Number</Label>
                  <SensitiveDataInput
                    id="demo-pan"
                    dataType="pan"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="demo-aadhaar">Aadhaar Number</Label>
                  <SensitiveDataInput
                    id="demo-aadhaar"
                    dataType="aadhaar"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="demo-gstin">GSTIN</Label>
                  <SensitiveDataInput
                    id="demo-gstin"
                    dataType="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="demo-account">Bank Account</Label>
                  <SensitiveDataInput
                    id="demo-account"
                    dataType="account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* CSRF Protection Demo */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">CSRF Protection</h2>
              </div>
              
              <SecureForm onSecureSubmit={handleSecureSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="demo-email">Email</Label>
                  <Input
                    id="demo-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="demo-message">Message</Label>
                  <Input
                    id="demo-message"
                    type="text"
                    name="message"
                    placeholder="Enter a message"
                    className="mt-2"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Submit Secure Form
                </Button>
              </SecureForm>
            </Card>

            {/* Security Features List */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Active Security Features</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  'HTTPS Encryption (SSL/TLS)',
                  'CSRF Token Protection',
                  'XSS Prevention',
                  'SQL Injection Protection',
                  'Rate Limiting',
                  'Session Timeout Management',
                  'Password Strength Requirements',
                  'Sensitive Data Masking',
                  'Content Security Policy',
                  'Secure HTTP Headers',
                  'Input Sanitization',
                  'Authentication Rate Limiting',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Security Tips */}
          <Card className="mt-8 p-8 bg-blue-50 border-blue-200">
            <h3 className="text-xl font-bold mb-4 text-blue-900">Security Best Practices</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Use strong, unique passwords for your account</li>
              <li>• Enable two-factor authentication when available</li>
              <li>• Never share your login credentials with anyone</li>
              <li>• Always verify the URL before entering sensitive information</li>
              <li>• Keep your browser and devices updated</li>
              <li>• Log out when using shared computers</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}