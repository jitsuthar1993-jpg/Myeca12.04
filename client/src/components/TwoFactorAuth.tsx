import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone, Key, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

interface TwoFactorStatusResponse {
  enabled: boolean;
}

interface TwoFactorAuthProps {
  userId?: number | string;
  userEmail?: string;
  isEnabled?: boolean;
}

export default function TwoFactorAuth({ isEnabled: initialEnabled = false }: TwoFactorAuthProps = {}) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if 2FA is enabled
  const { data: status } = useQuery({
    queryKey: ["/api/2fa/status"],
    queryFn: async () => {
      const response = await apiRequest("/api/2fa/status");
      const data = await response.json() as TwoFactorStatusResponse;
      setIsEnabled(data.enabled);
      return data;
    }
  });

  // Enable 2FA mutation
  const enableMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/2fa/enable", {
        method: "POST"
      }).then((response) => response.json() as Promise<TwoFactorSetupResponse>);
    },
    onSuccess: (data) => {
      setSetupData(data);
      setShowSetup(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Verify 2FA setup
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("/api/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ code })
      });
    },
    onSuccess: () => {
      setIsEnabled(true);
      setShowSetup(false);
      queryClient.invalidateQueries({ queryKey: ["/api/2fa/status"] });
      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/2fa/disable", {
        method: "POST"
      });
    },
    onSuccess: () => {
      setIsEnabled(false);
      queryClient.invalidateQueries({ queryKey: ["/api/2fa/status"] });
      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disable 2FA. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEnable = () => {
    enableMutation.mutate();
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    }
  };

  const handleDisable = () => {
    if (confirm("Are you sure you want to disable two-factor authentication?")) {
      disableMutation.mutate();
    }
  };

  if (showSetup && setupData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-6 h-6" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app, then enter the verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            
            <Alert>
              <Key className="w-4 h-4" />
              <AlertDescription>
                <strong>Secret Key:</strong> {setupData.secret}
                <br />
                <span className="text-sm text-gray-600">
                  Save this key if you need to manually add this account to your authenticator app
                </span>
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription>
                <strong>Backup Codes:</strong>
                <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm">
                  {setupData.backupCodes.map((code, i) => (
                    <div key={i} className="bg-gray-100 p-2 rounded">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-2">
                  Save these codes in a secure place. Each can be used once if you lose access to your authenticator.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                className="flex-1"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify and Enable"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSetup(false)}
                disabled={verifyMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with time-based one-time passwords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isEnabled ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Shield className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <h3 className="font-semibold">
                  {isEnabled ? "2FA is Enabled" : "2FA is Disabled"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEnabled 
                    ? "Your account is protected with two-factor authentication"
                    : "Enable 2FA to secure your account with an additional verification step"
                  }
                </p>
              </div>
            </div>
            
            {isEnabled ? (
              <Button
                variant="outline"
                onClick={handleDisable}
                disabled={disableMutation.isPending}
              >
                {disableMutation.isPending ? "Disabling..." : "Disable"}
              </Button>
            ) : (
              <Button
                onClick={handleEnable}
                disabled={enableMutation.isPending}
              >
                {enableMutation.isPending ? "Setting up..." : "Enable"}
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">Download App</h4>
              <p className="text-sm text-gray-600 mt-1">
                Use Google Authenticator or Authy
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Key className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">Scan QR Code</h4>
              <p className="text-sm text-gray-600 mt-1">
                Link your account to the app
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">Verify Code</h4>
              <p className="text-sm text-gray-600 mt-1">
                Enter the 6-digit code to confirm
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
