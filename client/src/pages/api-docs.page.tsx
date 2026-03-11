import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Code2, Copy, Check, ChevronRight, Lock, Globe, 
  Zap, Shield, Database, GitBranch, Key, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

// API Endpoints data
const apiEndpoints = {
  auth: [
    {
      method: "POST",
      path: "/api/auth/register",
      description: "Register a new user",
      auth: false,
      body: {
        email: "string",
        password: "string",
        name: "string",
        phone: "string"
      },
      response: {
        user: { id: "number", email: "string", name: "string" },
        token: "string"
      }
    },
    {
      method: "POST",
      path: "/api/auth/login",
      description: "Login user",
      auth: false,
      body: {
        email: "string",
        password: "string"
      },
      response: {
        user: { id: "number", email: "string", role: "string" },
        token: "string"
      }
    },
    {
      method: "GET",
      path: "/api/auth/me",
      description: "Get current user",
      auth: true,
      response: {
        user: { id: "number", email: "string", profile: "object" }
      }
    },
    {
      method: "POST",
      path: "/api/auth/logout",
      description: "Logout user",
      auth: true,
      response: {
        message: "string"
      }
    }
  ],
  tax: [
    {
      method: "GET",
      path: "/api/tax/returns",
      description: "Get user's tax returns",
      auth: true,
      query: {
        year: "string (optional)",
        status: "string (optional)"
      },
      response: {
        returns: [
          {
            id: "number",
            assessmentYear: "string",
            status: "string",
            refundAmount: "number"
          }
        ]
      }
    },
    {
      method: "POST",
      path: "/api/tax/calculate",
      description: "Calculate tax based on income",
      auth: true,
      body: {
        income: "number",
        deductions: "object",
        regime: "old | new"
      },
      response: {
        taxAmount: "number",
        effectiveRate: "number",
        breakdown: "object"
      }
    },
    {
      method: "POST",
      path: "/api/tax/file-return",
      description: "Submit ITR filing",
      auth: true,
      body: {
        assessmentYear: "string",
        incomeDetails: "object",
        deductions: "object",
        bankDetails: "object"
      },
      response: {
        returnId: "string",
        status: "submitted",
        acknowledgmentNumber: "string"
      }
    }
  ],
  services: [
    {
      method: "GET",
      path: "/api/services",
      description: "Get all available services",
      auth: false,
      response: {
        services: [
          {
            id: "number",
            name: "string",
            price: "number",
            category: "string"
          }
        ]
      }
    },
    {
      method: "POST",
      path: "/api/services/purchase",
      description: "Purchase a service",
      auth: true,
      body: {
        serviceId: "number",
        paymentMethod: "string"
      },
      response: {
        orderId: "string",
        status: "pending | completed",
        invoice: "string (URL)"
      }
    },
    {
      method: "GET",
      path: "/api/services/my-services",
      description: "Get user's purchased services",
      auth: true,
      response: {
        services: [
          {
            id: "number",
            serviceId: "number",
            status: "string",
            purchasedAt: "date"
          }
        ]
      }
    }
  ],
  ai: [
    {
      method: "POST",
      path: "/api/ai-optimizer/optimize",
      description: "Get AI tax optimization suggestions",
      auth: true,
      body: {
        income: "number",
        currentDeductions: "object",
        goals: "array"
      },
      response: {
        recommendations: "array",
        potentialSavings: "number",
        optimizedRegime: "string"
      }
    },
    {
      method: "POST",
      path: "/api/ai-optimizer/chat",
      description: "Chat with AI tax assistant",
      auth: true,
      body: {
        message: "string",
        context: "object (optional)"
      },
      response: {
        reply: "string",
        suggestions: "array",
        references: "array"
      }
    }
  ]
};

const codeExamples = {
  javascript: `// Authentication Example
const axios = require('axios');

// Login
const login = async () => {
  try {
    const response = await axios.post('https://api.myeca.in/api/auth/login', {
      email: 'user@example.com',
      password: 'securepassword'
    });
    
    const { token, user } = response.data;
    console.log('Logged in:', user);
    
    // Store token for subsequent requests
    axios.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
  } catch (error) {
    console.error('Login failed:', error.response.data);
  }
};

// Get Tax Returns
const getTaxReturns = async () => {
  try {
    const response = await axios.get('https://api.myeca.in/api/tax/returns', {
      params: { year: '2024-25' }
    });
    
    console.log('Tax returns:', response.data.returns);
  } catch (error) {
    console.error('Failed to fetch returns:', error.response.data);
  }
};`,

  python: `# Authentication Example
import requests

# Base URL
BASE_URL = 'https://api.myeca.in'

# Login
def login(email, password):
    response = requests.post(f'{BASE_URL}/api/auth/login', json={
        'email': email,
        'password': password
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data['token']
        user = data['user']
        print(f"Logged in as: {user['email']}")
        return token
    else:
        print(f"Login failed: {response.json()}")
        return None

# Get Tax Returns with Authentication
def get_tax_returns(token, year=None):
    headers = {'Authorization': f'Bearer {token}'}
    params = {'year': year} if year else {}
    
    response = requests.get(
        f'{BASE_URL}/api/tax/returns',
        headers=headers,
        params=params
    )
    
    if response.status_code == 200:
        returns = response.json()['returns']
        for ret in returns:
            print(f"Year: {ret['assessmentYear']}, Status: {ret['status']}")
    else:
        print(f"Failed to fetch returns: {response.json()}")

# Usage
token = login('user@example.com', 'securepassword')
if token:
    get_tax_returns(token, '2024-25')`,

  curl: `# Login Request
curl -X POST https://api.myeca.in/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": 1,
#     "email": "user@example.com",
#     "role": "user"
#   }
# }

# Get Tax Returns (Authenticated Request)
curl -X GET https://api.myeca.in/api/tax/returns?year=2024-25 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Calculate Tax
curl -X POST https://api.myeca.in/api/tax/calculate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -d '{
    "income": 1000000,
    "deductions": {
      "section80C": 150000,
      "section80D": 25000
    },
    "regime": "old"
  }'`
};

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const { toast } = useToast();

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-700",
      POST: "bg-blue-100 text-blue-700",
      PUT: "bg-orange-100 text-orange-700",
      DELETE: "bg-red-100 text-red-700"
    };
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="API Documentation - MyeCA.in Developer Portal"
        description="Comprehensive API documentation for MyeCA.in platform. RESTful APIs for tax filing, services, and AI-powered features."
        keywords="API documentation, REST API, developer portal, tax API, MyeCA API"
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Code2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600">RESTful API for developers</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Base URL</p>
                    <p className="font-mono text-sm">api.myeca.in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Version</p>
                    <p className="font-semibold">v2.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Auth Type</p>
                    <p className="font-semibold">Bearer Token</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Rate Limit</p>
                    <p className="font-semibold">1000 req/hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - API Endpoints */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(apiEndpoints).map(([category, endpoints]) => (
                  <div key={category}>
                    <h3 className="font-semibold capitalize mb-2 text-gray-700">{category}</h3>
                    <div className="space-y-1">
                      {endpoints.map((endpoint, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedEndpoint(endpoint)}
                          className={`w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                            selectedEndpoint === endpoint ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </Badge>
                            <span className="text-sm font-mono truncate">{endpoint.path}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {category !== 'ai' && <Separator className="my-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Quick guide to start using MyeCA API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All API requests must include a valid API key in the Authorization header.
                    Get your API key from the <a href="/settings" className="text-blue-600 hover:underline">Settings</a> page.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold mb-2">Authentication</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                    Authorization: Bearer YOUR_API_TOKEN
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Base URL</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                    https://api.myeca.in
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response Format</h3>
                  <p className="text-sm text-gray-600 mb-2">All responses are returned in JSON format.</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {`{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2025-01-20T10:30:00Z"
}`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Endpoint Details */}
            {selectedEndpoint && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Endpoint Details</CardTitle>
                    <Badge className={getMethodColor(selectedEndpoint.method)}>
                      {selectedEndpoint.method}
                    </Badge>
                  </div>
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedEndpoint.path}
                  </code>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-600">{selectedEndpoint.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedEndpoint.auth ? (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Auth Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>

                  {selectedEndpoint.query && (
                    <div>
                      <h4 className="font-semibold mb-2">Query Parameters</h4>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <pre className="text-sm">{JSON.stringify(selectedEndpoint.query, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.body && (
                    <div>
                      <h4 className="font-semibold mb-2">Request Body</h4>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <pre className="text-sm">{JSON.stringify(selectedEndpoint.body, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Response</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <pre className="text-sm">{JSON.stringify(selectedEndpoint.response, null, 2)}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>Sample code in different languages</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>

                  {Object.entries(codeExamples).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang} className="mt-4">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute right-2 top-2"
                          onClick={() => copyCode(code, lang)}
                        >
                          {copiedCode === lang ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm font-mono">{code}</pre>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* SDKs */}
            <Card>
              <CardHeader>
                <CardTitle>SDKs & Libraries</CardTitle>
                <CardDescription>Official SDKs for popular languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold">JavaScript SDK</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Official Node.js & Browser SDK</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">npm install @myeca/sdk</code>
                  </div>

                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">Python SDK</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Official Python SDK</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">pip install myeca-sdk</code>
                  </div>

                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold">PHP SDK</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Official PHP SDK</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">composer require myeca/sdk</code>
                  </div>

                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">Java SDK</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Official Java SDK</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">Coming Soon</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}