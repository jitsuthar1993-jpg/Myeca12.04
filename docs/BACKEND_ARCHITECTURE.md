# SmartTaxCalculator Backend - System Architecture & API Documentation

## 🏗️ System Architecture Overview

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vue)                        │
├─────────────────────────────────────────────────────────────────┤
│                    API Gateway (Express)                      │
├─────────────────────────────────────────────────────────────────┤
│  Authentication  │  User Management  │  Tax Calculation     │
│     Middleware     │     Routes        │      Routes         │
├─────────────────────────────────────────────────────────────────┤
│                 Business Logic Layer                           │
├─────────────────────────────────────────────────────────────────┤
│              Data Access Layer (SQLite)                        │
├─────────────────────────────────────────────────────────────────┤
│              Logging & Audit Trail System                      │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend Framework**: Node.js + Express.js
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Authentication**: Dummy (Development) / JWT (Production)
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston (Custom implementation)
- **Validation**: Express-validator
- **Security**: Helmet.js, CORS, Rate limiting

## 🔐 Authentication System (Development Only)

### ⚠️ Security Warning

**This system uses DUMMY authentication for development purposes ONLY!**

- **Username**: `admin`
- **Password**: `admin123`
- **Auth Token**: `dummy-dev-token`

**DO NOT USE IN PRODUCTION!**

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  API Login  │────▶│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Token     │◀────│  Validate   │◀────│   Verify    │
│  (dummy)    │     │   Token     │     │  Credentials│
└─────────────┘     └─────────────┘     └─────────────┘
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  pan_number TEXT,
  aadhaar_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  is_active BOOLEAN DEFAULT 1,
  is_admin BOOLEAN DEFAULT 0,
  email_verified BOOLEAN DEFAULT 0,
  phone_verified BOOLEAN DEFAULT 0,
  two_factor_enabled BOOLEAN DEFAULT 0,
  profile_image_url TEXT,
  preferences TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME,
  reset_token TEXT,
  reset_token_expires DATETIME,
  verification_token TEXT,
  verification_token_expires DATETIME
);
```

### Tax Calculations Table
```sql
CREATE TABLE tax_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  financial_year TEXT NOT NULL,
  assessment_year TEXT NOT NULL,
  income_salary REAL DEFAULT 0,
  income_house_property REAL DEFAULT 0,
  income_business_profession REAL DEFAULT 0,
  income_capital_gains REAL DEFAULT 0,
  income_other_sources REAL DEFAULT 0,
  total_income REAL DEFAULT 0,
  deductions_80c REAL DEFAULT 0,
  deductions_80d REAL DEFAULT 0,
  deductions_80g REAL DEFAULT 0,
  deductions_24 REAL DEFAULT 0,
  other_deductions REAL DEFAULT 0,
  total_deductions REAL DEFAULT 0,
  taxable_income REAL DEFAULT 0,
  tax_old_regime REAL DEFAULT 0,
  tax_new_regime REAL DEFAULT 0,
  cess_amount REAL DEFAULT 0,
  total_tax_liability REAL DEFAULT 0,
  regime_chosen TEXT,
  calculation_details TEXT,
  input_data TEXT,
  is_saved BOOLEAN DEFAULT 0,
  is_filed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  severity TEXT DEFAULT 'info',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## 🚀 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Dummy admin login | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| GET | `/api/v1/auth/status` | Check auth status | No |
| GET | `/api/v1/auth/health` | Auth service health | No |
| GET | `/api/v1/auth/migration-path` | Migration guide | No |
| GET | `/api/v1/auth/security-warnings` | Security warnings | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/user/profile` | Get user profile | Yes |
| PUT | `/api/v1/user/profile` | Update profile | Yes |
| GET | `/api/v1/user/tax-calculations` | Get tax calculations | Yes |
| POST | `/api/v1/user/tax-calculations` | Create tax calculation | Yes |
| GET | `/api/v1/user/tax-calculations/:id` | Get specific calculation | Yes |
| PUT | `/api/v1/user/tax-calculations/:id/save` | Save calculation | Yes |
| DELETE | `/api/v1/user/tax-calculations/:id` | Delete calculation | Yes |
| GET | `/api/v1/user/documents` | Get documents | Yes |
| POST | `/api/v1/user/documents` | Upload document | Yes |
| DELETE | `/api/v1/user/documents/:id` | Delete document | Yes |
| GET | `/api/v1/user/notifications` | Get notifications | Yes |
| PUT | `/api/v1/user/notifications/:id/read` | Mark notification as read | Yes |
| PUT | `/api/v1/user/notifications/read-all` | Mark all as read | Yes |
| GET | `/api/v1/user/settings/public` | Get public settings | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/users` | Get all users | Admin |
| GET | `/api/v1/admin/users/:id` | Get user by ID | Admin |
| POST | `/api/v1/admin/users` | Create user | Admin |
| PUT | `/api/v1/admin/users/:id` | Update user | Admin |
| DELETE | `/api/v1/admin/users/:id` | Delete user | Admin |
| GET | `/api/v1/admin/tax-calculations` | Get all calculations | Admin |
| GET | `/api/v1/admin/tax-calculations/:id` | Get calculation | Admin |
| DELETE | `/api/v1/admin/tax-calculations/:id` | Delete calculation | Admin |
| GET | `/api/v1/admin/settings` | Get all settings | Admin |
| PUT | `/api/v1/admin/settings/:key` | Update setting | Admin |
| GET | `/api/v1/admin/audit-logs` | Get audit logs | Admin |
| GET | `/api/v1/admin/statistics` | Get system statistics | Admin |

## 📋 API Request/Response Examples

### Authentication Examples

#### Login Request
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Login Response
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@smarttaxcalculator.com",
      "first_name": "System",
      "last_name": "Administrator",
      "is_admin": true,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "dummy-dev-token",
    "refresh_token": "dummy-refresh-token",
    "expires_in": "24h",
    "dev_warning": "This is development-only authentication. Replace with proper JWT/OAuth before production."
  }
}
```

#### Authenticated Request
```http
GET /api/v1/user/profile
Authorization: Bearer dummy-dev-token
```

### Tax Calculation Examples

#### Create Tax Calculation
```json
POST /api/v1/user/tax-calculations
Authorization: Bearer dummy-dev-token
Content-Type: application/json

{
  "financial_year": "2024-2025",
  "assessment_year": "2025-2026",
  "income_salary": 1200000,
  "income_house_property": 50000,
  "income_other_sources": 25000,
  "deductions_80c": 150000,
  "deductions_80d": 25000,
  "regime_chosen": "old",
  "calculation_details": "Annual tax calculation for FY 2024-2025",
  "input_data": {
    "employer": "ABC Corporation",
    "location": "Mumbai"
  }
}
```

#### Tax Calculation Response
```json
{
  "success": true,
  "message": "Tax calculation created successfully.",
  "data": {
    "calculation_id": 1,
    "total_income": 1275000,
    "total_deductions": 175000,
    "taxable_income": 1100000,
    "tax_old_regime": 142500,
    "tax_new_regime": 112500,
    "cess_amount": 5700,
    "total_tax_liability": 148200
  }
}
```

## 🔧 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "help": "Please check your input and try again."
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Business logic error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## 📝 Logging and Monitoring

### Log Levels
- **ERROR**: System errors and exceptions
- **WARN**: Warning conditions that might require attention
- **INFO**: Informational messages about system operations
- **DEBUG**: Detailed debugging information

### Log Files
- `logs/app.log` - General application logs
- `logs/error.log` - Error-specific logs
- `logs/audit.jsonl` - Audit trail logs

### Audit Trail
All user actions are logged with:
- User ID
- Action type
- Resource affected
- Old and new values
- IP address
- User agent
- Timestamp

## 🧪 Testing Strategy

### Unit Tests
- Individual function testing
- Database query testing
- Business logic validation
- Error handling verification

### Integration Tests
- API endpoint testing
- Authentication flow testing
- Database integration testing
- Error scenario testing

### Load Tests
- API performance testing
- Database performance testing
- Concurrent user testing
- Rate limiting verification

## 🔒 Security Considerations

### Development Security (Current)
- ⚠️ Dummy authentication system
- ⚠️ No password hashing
- ⚠️ Development-only warnings
- ⚠️ Basic error handling

### Production Security (Future)
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation and sanitization
- ✅ Rate limiting and throttling
- ✅ HTTPS enforcement
- ✅ CSRF protection
- ✅ Security headers (Helmet.js)
- ✅ Comprehensive audit logging
- ✅ Two-factor authentication
- ✅ Session management

## 🚀 Deployment Guide

### Development Deployment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access API documentation
open http://localhost:3001/api-docs
```

### Production Deployment Checklist
- [ ] Replace dummy authentication with JWT
- [ ] Implement proper password hashing
- [ ] Set up production database (PostgreSQL)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies
- [ ] Implement comprehensive testing
- [ ] Set up CI/CD pipeline
- [ ] Configure environment variables
- [ ] Set up logging and monitoring

## 📚 API Documentation

Full interactive API documentation is available at:
**http://localhost:3001/api-docs**

The documentation includes:
- Complete endpoint descriptions
- Request/response examples
- Authentication requirements
- Error responses
- Development warnings
- Migration guides

## 🔧 Development Tools

### Database Tools
- SQLite Browser for database inspection
- SQL query testing utilities
- Migration scripts for schema updates

### API Testing
- Postman collection (available in `/docs`)
- cURL examples for all endpoints
- Automated testing scripts

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Audit trail inspection

---

**Built with ❤️ for SmartTaxCalculator Development**