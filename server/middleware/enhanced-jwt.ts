// Enhanced JWT Security with Advanced Secret Management
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';

// Enhanced JWT configuration
interface JWTConfig {
  primarySecret: string;
  secondarySecret: string;
  algorithm: jwt.Algorithm;
  issuer: string;
  audience: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  rotationInterval: number; // milliseconds
  maxAge: number; // milliseconds
}

interface JWTSecrets {
  current: string;
  previous: string;
  next: string;
  rotationTimestamp: number;
}

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  sessionId: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  issuedAt: number;
  expiresAt: number;
  refreshTokenId?: string;
  permissions?: string[];
  [key: string]: any;
}

interface TokenMetadata {
  algorithm: jwt.Algorithm;
  issuer: string;
  audience: string;
  issuedAt: number;
  expiresAt: number;
  notBefore?: number;
  jwtid?: string;
}

class EnhancedJWTSecurity {
  private secrets: JWTSecrets;
  private config: JWTConfig;
  private tokenBlacklist: Set<string> = new Set();
  private activeSessions: Map<string, TokenMetadata> = new Map();
  private rotationTimer: NodeJS.Timeout | null = null;

  constructor(config: JWTConfig) {
    this.config = config;
    this.secrets = this.generateSecretRotation();
    this.startSecretRotation();
  }

  // Generate cryptographically secure secrets
  private generateSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('base64');
  }

  // Initialize secret rotation
  private generateSecretRotation(): JWTSecrets {
    return {
      current: this.config.primarySecret,
      previous: this.config.secondarySecret,
      next: this.generateSecret(),
      rotationTimestamp: Date.now()
    };
  }

  // Start automatic secret rotation
  private startSecretRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }

    this.rotationTimer = setInterval(() => {
      this.rotateSecrets();
    }, this.config.rotationInterval);
  }

  // Rotate secrets automatically
  private rotateSecrets(): void {
    console.log('🔄 Rotating JWT secrets...');
    
    this.secrets = {
      previous: this.secrets.current,
      current: this.secrets.next,
      next: this.generateSecret(),
      rotationTimestamp: Date.now()
    };

    // Log rotation for security audit
    this.logSecurityEvent('jwt_secret_rotation', {
      timestamp: new Date().toISOString(),
      rotationInterval: this.config.rotationInterval
    });
  }

  // Enhanced token generation with security features
  public async generateTokens(payload: Partial<JWTPayload>, metadata?: Partial<TokenMetadata>): Promise<{
    accessToken: string;
    refreshToken: string;
    tokenMetadata: TokenMetadata;
  }> {
    // Validate payload
    this.validatePayload(payload);

    // Generate session and device IDs
    const sessionId = crypto.randomUUID();
    const deviceId = metadata?.deviceId || crypto.randomUUID();
    const refreshTokenId = crypto.randomUUID();

    // Enhanced payload with security metadata
    const enhancedPayload: JWTPayload = {
      userId: payload.userId!,
      email: payload.email!,
      role: payload.role!,
      sessionId,
      deviceId,
      ip: payload.ip,
      userAgent: payload.userAgent,
      issuedAt: Date.now(),
      expiresAt: Date.now() + this.parseExpiry(this.config.accessTokenExpiry),
      refreshTokenId,
      permissions: payload.permissions || [],
      ...payload
    };

    // Token metadata
    const tokenMetadata: TokenMetadata = {
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience,
      issuedAt: Date.now(),
      expiresAt: Date.now() + this.parseExpiry(this.config.accessTokenExpiry),
      notBefore: metadata?.notBefore,
      jwtid: crypto.randomUUID()
    };

    // Generate access token
    const accessToken = jwt.sign(
      enhancedPayload,
      this.secrets.current,
      {
        algorithm: this.config.algorithm,
        issuer: this.config.issuer,
        audience: this.config.audience,
        expiresIn: this.config.accessTokenExpiry,
        jwtid: tokenMetadata.jwtid,
        notBefore: tokenMetadata.notBefore ? Math.floor(tokenMetadata.notBefore / 1000) : undefined
      }
    );

    // Generate refresh token
    const refreshTokenPayload = {
      userId: enhancedPayload.userId,
      sessionId,
      refreshTokenId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + this.parseExpiry(this.config.refreshTokenExpiry)
    };

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      this.secrets.current,
      {
        algorithm: this.config.algorithm,
        issuer: this.config.issuer,
        audience: this.config.audience,
        expiresIn: this.config.refreshTokenExpiry
      }
    );

    // Store session metadata
    this.activeSessions.set(sessionId, tokenMetadata);

    // Log token generation for security audit
    this.logSecurityEvent('token_generated', {
      userId: enhancedPayload.userId,
      sessionId,
      deviceId,
      ip: enhancedPayload.ip,
      userAgent: enhancedPayload.userAgent,
      issuedAt: new Date().toISOString()
    });

    return {
      accessToken,
      refreshToken,
      tokenMetadata
    };
  }

  // Enhanced token verification with multiple secret support
  public async verifyToken(token: string, options?: {
    ignoreExpiration?: boolean;
    maxAge?: number;
    requiredPermissions?: string[];
  }): Promise<JWTPayload> {
    try {
      // Check blacklist first
      if (this.tokenBlacklist.has(token)) {
        throw new Error('Token has been revoked');
      }

      // Try with current secret first
      let payload: JWTPayload;
      let verified = false;
      let usedSecret = 'current';

      // Try current secret
      try {
        payload = jwt.verify(token, this.secrets.current, {
          algorithms: [this.config.algorithm],
          issuer: this.config.issuer,
          audience: this.config.audience,
          ignoreExpiration: options?.ignoreExpiration,
          maxAge: options?.maxAge ? Math.floor(options.maxAge / 1000) : undefined
        }) as JWTPayload;
        verified = true;
      } catch (error) {
        // Try previous secret for recent rotation
        if (this.isRecentRotation()) {
          try {
            payload = jwt.verify(token, this.secrets.previous, {
              algorithms: [this.config.algorithm],
              issuer: this.config.issuer,
              audience: this.config.audience,
              ignoreExpiration: options?.ignoreExpiration,
              maxAge: options?.maxAge ? Math.floor(options.maxAge / 1000) : undefined
            }) as JWTPayload;
            verified = true;
            usedSecret = 'previous';
          } catch (prevError) {
            throw error; // Throw original error
          }
        } else {
          throw error;
        }
      }

      if (!verified) {
        throw new Error('Token verification failed');
      }

      // Validate payload structure
      this.validateJWTPayload(payload);

      // Check permissions if required
      if (options?.requiredPermissions) {
        this.validatePermissions(payload, options.requiredPermissions);
      }

      // Check session validity
      if (!this.activeSessions.has(payload.sessionId)) {
        throw new Error('Session not found or expired');
      }

      // Validate device fingerprint
      if (payload.deviceId && !this.validateDeviceFingerprint(payload)) {
        throw new Error('Device fingerprint mismatch');
      }

      // Log successful verification
      this.logSecurityEvent('token_verified', {
        userId: payload.userId,
        sessionId: payload.sessionId,
        usedSecret,
        verifiedAt: new Date().toISOString()
      });

      return payload;
    } catch (error) {
      this.logSecurityEvent('token_verification_failed', {
        error: error.message,
        tokenHash: this.hashToken(token),
        attemptedAt: new Date().toISOString()
      });
      throw error;
    }
  }

  // Token refresh with enhanced security
  public async refreshToken(refreshToken: string, deviceInfo?: {
    ip?: string;
    userAgent?: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    tokenMetadata: TokenMetadata;
  }> {
    try {
      // Verify refresh token
      const payload = await this.verifyToken(refreshToken, { ignoreExpiration: false });
      
      // Validate refresh token specific claims
      if (!payload.refreshTokenId) {
        throw new Error('Invalid refresh token structure');
      }

      // Check if refresh token is still valid
      if (Date.now() > payload.expiresAt) {
        throw new Error('Refresh token expired');
      }

      // Generate new tokens
      const newPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        ip: deviceInfo?.ip || payload.ip,
        userAgent: deviceInfo?.userAgent || payload.userAgent
      };

      const result = await this.generateTokens(newPayload, {
        deviceId: payload.deviceId
      });

      // Revoke old refresh token
      this.revokeToken(refreshToken, 'refresh_token_rotation');

      // Log refresh operation
      this.logSecurityEvent('token_refreshed', {
        userId: payload.userId,
        oldSessionId: payload.sessionId,
        newSessionId: result.tokenMetadata.jwtid,
        refreshTokenId: payload.refreshTokenId,
        refreshedAt: new Date().toISOString()
      });

      return result;
    } catch (error) {
      this.logSecurityEvent('token_refresh_failed', {
        error: error.message,
        refreshTokenHash: this.hashToken(refreshToken),
        failedAt: new Date().toISOString()
      });
      throw error;
    }
  }

  // Token revocation with audit trail
  public revokeToken(token: string, reason: string = 'user_logout'): void {
    try {
      // Add to blacklist
      this.tokenBlacklist.add(token);

      // Try to decode token for audit purposes
      let payload: JWTPayload;
      try {
        payload = jwt.decode(token) as JWTPayload;
        if (payload && payload.sessionId) {
          this.activeSessions.delete(payload.sessionId);
        }
      } catch (error) {
        // Token might be malformed, still blacklist it
      }

      // Log revocation
      this.logSecurityEvent('token_revoked', {
        reason,
        tokenHash: this.hashToken(token),
        revokedAt: new Date().toISOString(),
        sessionId: payload?.sessionId,
        userId: payload?.userId
      });
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }

  // Batch token revocation for user sessions
  public revokeUserSessions(userId: number, reason: string = 'security_incident'): void {
    const sessionsToRevoke = Array.from(this.activeSessions.entries())
      .filter(([sessionId, metadata]) => {
        // This would need to be enhanced to track userId in session metadata
        return true; // Placeholder logic
      });

    sessionsToRevoke.forEach(([sessionId, metadata]) => {
      this.activeSessions.delete(sessionId);
    });

    this.logSecurityEvent('user_sessions_revoked', {
      userId,
      reason,
      sessionCount: sessionsToRevoke.length,
      revokedAt: new Date().toISOString()
    });
  }

  // Security validation methods
  private validatePayload(payload: Partial<JWTPayload>): void {
    if (!payload.userId || typeof payload.userId !== 'number') {
      throw new Error('Invalid or missing userId');
    }
    if (!payload.email || typeof payload.email !== 'string') {
      throw new Error('Invalid or missing email');
    }
    if (!payload.role || typeof payload.role !== 'string') {
      throw new Error('Invalid or missing role');
    }
  }

  private validateJWTPayload(payload: any): void {
    if (!payload.sessionId || typeof payload.sessionId !== 'string') {
      throw new Error('Invalid or missing sessionId');
    }
    if (!payload.issuedAt || typeof payload.issuedAt !== 'number') {
      throw new Error('Invalid or missing issuedAt');
    }
    if (!payload.expiresAt || typeof payload.expiresAt !== 'number') {
      throw new Error('Invalid or missing expiresAt');
    }
  }

  private validatePermissions(payload: JWTPayload, requiredPermissions: string[]): void {
    const userPermissions = payload.permissions || [];
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      throw new Error('Insufficient permissions');
    }
  }

  private validateDeviceFingerprint(payload: JWTPayload): boolean {
    // Enhanced device fingerprint validation
    // This would compare against stored device fingerprints
    return true; // Placeholder implementation
  }

  private isRecentRotation(): boolean {
    const rotationAge = Date.now() - this.secrets.rotationTimestamp;
    return rotationAge < 300000; // 5 minutes grace period
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiry format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    return value * multipliers[unit as keyof typeof multipliers];
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Security audit logging
  private logSecurityEvent(event: string, data: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      severity: this.getEventSeverity(event)
    };

    // In production, this would send to security audit system
    if (process.env.NODE_ENV === 'production') {
      // Send to external security logging service
      console.log('🔒 Security Event:', JSON.stringify(logEntry));
    } else {
      console.log('🔒 Security Event:', logEntry);
    }
  }

  private getEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'token_generated': 'low',
      'token_verified': 'low',
      'token_refreshed': 'medium',
      'token_revoked': 'medium',
      'jwt_secret_rotation': 'high',
      'token_verification_failed': 'high',
      'token_refresh_failed': 'high',
      'user_sessions_revoked': 'critical'
    };

    return severityMap[event] || 'medium';
  }

  // Cleanup and resource management
  public cleanup(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
    this.tokenBlacklist.clear();
    this.activeSessions.clear();
  }

  // Get security statistics
  public getSecurityStats(): {
    activeSessions: number;
    blacklistedTokens: number;
    lastRotation: number;
    secretsAge: number;
  } {
    return {
      activeSessions: this.activeSessions.size,
      blacklistedTokens: this.tokenBlacklist.size,
      lastRotation: this.secrets.rotationTimestamp,
      secretsAge: Date.now() - this.secrets.rotationTimestamp
    };
  }
}

// Enhanced JWT middleware with security features
export const createEnhancedJWTMiddleware = (jwtSecurity: EnhancedJWTSecurity) => {
  return async (req: any, res: any, next: any) => {
    try {
      const token = extractTokenFromRequest(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'No token provided',
          code: 'NO_TOKEN'
        });
      }

      // Enhanced device fingerprinting
      const deviceInfo = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      const payload = await jwtSecurity.verifyToken(token, {
        requiredPermissions: req.requiredPermissions
      });

      // Validate device fingerprint
      if (!jwtSecurity.validateDeviceFingerprint(payload)) {
        jwtSecurity.logSecurityEvent('device_fingerprint_mismatch', {
          userId: payload.userId,
          expected: payload.deviceId,
          actual: deviceInfo,
          timestamp: new Date().toISOString()
        });
        
        return res.status(403).json({ 
          error: 'Device fingerprint mismatch',
          code: 'DEVICE_MISMATCH'
        });
      }

      // Attach enhanced user context
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
        deviceId: payload.deviceId,
        permissions: payload.permissions || []
      };

      req.tokenPayload = payload;
      req.jwtSecurity = jwtSecurity;

      next();
    } catch (error) {
      const errorMessage = error.message || 'Token verification failed';
      const errorCode = error.message.includes('expired') ? 'TOKEN_EXPIRED' : 
                       error.message.includes('revoked') ? 'TOKEN_REVOKED' : 
                       'INVALID_TOKEN';

      return res.status(401).json({ 
        error: errorMessage,
        code: errorCode
      });
    }
  };
};

// Helper function to extract token from request
function extractTokenFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookie as fallback
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  
  return null;
}

// Export singleton instance and factory function
export const createEnhancedJWTSecurity = (config: JWTConfig): EnhancedJWTSecurity => {
  return new EnhancedJWTSecurity(config);
};

export default EnhancedJWTSecurity;