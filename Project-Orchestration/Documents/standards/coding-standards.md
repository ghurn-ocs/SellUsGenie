# Coding Standards and Best Practices

**Version:** 1.0  
**Last Updated:** 2024-08-21  
**Owner:** Omni Cyber Solutions LLC

This document defines the coding standards, best practices, and quality requirements for the CyberSecVault platform development using the Multi-Agent Software Development Orchestration Framework.

---

## General Principles

### Code Quality Philosophy
1. **Readability First**: Code should be self-documenting and easily understood by team members
2. **Security by Design**: Security considerations integrated into every line of code
3. **Performance Awareness**: Write efficient code that scales with user growth
4. **Maintainability**: Code should be easy to modify and extend
5. **Consistency**: Follow established patterns and conventions throughout the codebase

### Multi-Tenant Considerations
- All code must support multi-tenant architecture
- Data isolation requirements must be enforced at the code level
- Tenant context must be properly managed in all operations
- Resource usage should be monitored per tenant

---

## Frontend Standards (React/TypeScript)

### File Structure and Organization
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components across features
│   ├── ai/              # AI-specific components
│   └── admin/           # Admin-only components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── contexts/            # React context providers
├── services/            # API service layers
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── assets/              # Static assets
```

### Component Standards

#### Component Structure
```typescript
// ComponentName.tsx
import React from 'react'
import { ComponentProps } from './types'
import styles from './ComponentName.module.css'

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructured props
}) => {
  // Component logic
  
  return (
    <div className={styles.container}>
      {/* JSX content */}
    </div>
  )
}

export default ComponentName
```

#### Naming Conventions
- **Components**: PascalCase (e.g., `UserDashboard`, `RiskPrioritizationTable`)
- **Files**: Match component name (e.g., `UserDashboard.tsx`)
- **Props Interfaces**: ComponentName + Props (e.g., `UserDashboardProps`)
- **CSS Classes**: kebab-case (e.g., `risk-score-card`)
- **Functions**: camelCase (e.g., `calculateRiskScore`)

#### TypeScript Standards
```typescript
// Always define explicit types
interface UserData {
  id: string
  email: string
  tenantId: string
  role: 'admin' | 'user' | 'viewer'
}

// Use proper generics for reusable components
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDefinition<T>[]
  onRowClick?: (item: T) => void
}

// Avoid 'any' - use unknown or specific types
const processApiResponse = (response: unknown): UserData => {
  // Type validation and parsing
}
```

### State Management
```typescript
// Use React Context for global state
interface AppContextType {
  user: User | null
  tenant: Tenant | null
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
}

// Custom hooks for state logic
const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Error Handling
```typescript
// Error boundaries for component error handling
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo)
    // Log to monitoring service
  }
}

// API error handling
const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
```

---

## Backend Standards (Node.js/TypeScript)

### File Structure and Organization
```
src/
├── routes/              # API route definitions
├── services/            # Business logic services
├── middleware/          # Express middleware
├── controllers/         # Request/response handlers
├── models/              # Data models and types
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── tests/               # Test files
```

### API Design Standards

#### Route Structure
```typescript
// routes/userRoutes.ts
import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { authMiddleware } from '../middleware/auth'
import { tenantMiddleware } from '../middleware/tenant'
import { userController } from '../controllers/userController'

const router = Router()

// Apply common middleware
router.use(authMiddleware)
router.use(tenantMiddleware)

// Define routes with validation
router.get('/:id',
  param('id').isUUID().withMessage('Invalid user ID'),
  userController.getUser
)

router.post('/',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('role').isIn(['admin', 'user', 'viewer']).withMessage('Invalid role')
  ],
  userController.createUser
)

export default router
```

#### Controller Standards
```typescript
// controllers/userController.ts
import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { userService } from '../services/userService'
import { logger } from '../utils/logger'

export const userController = {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { id } = req.params
      const tenantId = req.tenantId!

      const user = await userService.getUserById(id, tenantId)
      
      res.json({
        success: true,
        data: user
      })

    } catch (error) {
      logger.error('Get user error:', {
        userId: req.params.id,
        tenantId: req.tenantId,
        error: error.message
      })
      next(error)
    }
  }
}
```

#### Service Layer Standards
```typescript
// services/userService.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { User, CreateUserInput } from '../types/user'

class UserService {
  private supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  async getUserById(id: string, tenantId: string): Promise<User> {
    // Set tenant context for RLS
    await this.supabase.rpc('set_config', {
      setting_name: 'app.current_tenant_id',
      setting_value: tenantId
    })

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }

    if (!data) {
      throw new Error('User not found')
    }

    return data
  }

  async createUser(input: CreateUserInput, tenantId: string): Promise<User> {
    // Implementation with proper error handling
  }
}

export const userService = new UserService()
```

### Error Handling Standards
```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    tenantId: req.tenantId,
    userId: req.userId
  })

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code
    })
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
}
```

---

## Database Standards (Supabase/PostgreSQL)

### Schema Design Principles
1. **Multi-Tenant Architecture**: All tables include tenant_id for data isolation
2. **Row-Level Security (RLS)**: Enable RLS on all tables
3. **Audit Trail**: Include created_at, updated_at, created_by, updated_by
4. **Soft Deletes**: Use deleted_at instead of hard deletes where appropriate

### Table Structure Standards
```sql
-- Example table with multi-tenant considerations
CREATE TABLE vulnerabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  cve_id VARCHAR(20),
  severity VARCHAR(20) NOT NULL,
  cvss_score DECIMAL(3,1),
  asset_id UUID REFERENCES assets(id),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row-Level Security
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY vulnerabilities_tenant_isolation ON vulnerabilities
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Migration Standards
```sql
-- Migration file naming: YYYYMMDD_HHMMSS_description.sql
-- Example: 20241221_143000_add_ai_risk_scoring.sql

-- Always wrap in transaction
BEGIN;

-- Create new tables
CREATE TABLE ai_risk_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id),
  risk_score DECIMAL(5,2) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_version VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_risk_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY ai_risk_scores_tenant_isolation ON ai_risk_scores
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Create indexes
CREATE INDEX idx_ai_risk_scores_tenant_vulnerability 
  ON ai_risk_scores(tenant_id, vulnerability_id);

CREATE INDEX idx_ai_risk_scores_calculated_at 
  ON ai_risk_scores(calculated_at);

-- Create functions if needed
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_ai_risk_scores_updated_at
  BEFORE UPDATE ON ai_risk_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## Security Standards

### Authentication and Authorization
```typescript
// JWT token validation
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

interface AuthenticatedRequest extends Request {
  userId?: string
  tenantId?: string
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.userId = decoded.sub
    req.tenantId = decoded.tenant_id

    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Input Validation and Sanitization
```typescript
import { body, param, query } from 'express-validator'
import DOMPurify from 'isomorphic-dompurify'

// Input validation schemas
export const createVulnerabilityValidation = [
  body('cve_id')
    .matches(/^CVE-\d{4}-\d{4,}$/)
    .withMessage('Invalid CVE format'),
  body('severity')
    .isIn(['critical', 'high', 'medium', 'low', 'info'])
    .withMessage('Invalid severity level'),
  body('cvss_score')
    .isFloat({ min: 0, max: 10 })
    .withMessage('CVSS score must be between 0 and 10'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters')
    .customSanitizer((value) => DOMPurify.sanitize(value))
]
```

### Data Protection
```typescript
// Encryption utilities
import crypto from 'crypto'

export class EncryptionService {
  private algorithm = 'aes-256-gcm'
  private key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.key)
    cipher.setAAD(Buffer.from('additional-data'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
  }

  decrypt(encryptedData: string): string {
    const [ivHex, tagHex, encrypted] = encryptedData.split(':')
    
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    
    const decipher = crypto.createDecipher(this.algorithm, this.key)
    decipher.setAAD(Buffer.from('additional-data'))
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}
```

---

## AI/ML Standards

### Model Implementation Standards
```python
# AI model implementation standards
import logging
import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class RiskPrediction:
    risk_score: float
    confidence: float
    explanations: List[str]
    model_version: str

class RiskScoringModel:
    def __init__(self, model_version: str = "1.0.0"):
        self.model_version = model_version
        self.logger = logging.getLogger(__name__)
        
    def predict(self, features: Dict) -> RiskPrediction:
        """
        Predict risk score with confidence and explanations
        
        Args:
            features: Dictionary of input features
            
        Returns:
            RiskPrediction with score, confidence, and explanations
        """
        try:
            # Validate input
            self._validate_features(features)
            
            # Make prediction
            risk_score = self._calculate_risk_score(features)
            confidence = self._calculate_confidence(features)
            explanations = self._generate_explanations(features, risk_score)
            
            return RiskPrediction(
                risk_score=risk_score,
                confidence=confidence,
                explanations=explanations,
                model_version=self.model_version
            )
            
        except Exception as e:
            self.logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def _validate_features(self, features: Dict) -> None:
        """Validate input features"""
        required_features = ['cvss_score', 'asset_criticality']
        
        for feature in required_features:
            if feature not in features:
                raise ValueError(f"Missing required feature: {feature}")
    
    def _calculate_risk_score(self, features: Dict) -> float:
        """Calculate weighted risk score"""
        # Implementation details
        pass
    
    def _calculate_confidence(self, features: Dict) -> float:
        """Calculate prediction confidence"""
        # Implementation details
        pass
    
    def _generate_explanations(self, features: Dict, score: float) -> List[str]:
        """Generate human-readable explanations"""
        # Implementation details
        pass
```

### API Integration Standards
```typescript
// AI service integration
import axios from 'axios'

interface AIRiskRequest {
  vulnerabilityId: string
  features: Record<string, any>
  tenantId: string
}

interface AIRiskResponse {
  riskScore: number
  confidence: number
  explanations: string[]
  modelVersion: string
}

export class AIRiskService {
  private baseUrl = process.env.AI_SERVICE_URL!
  private timeout = 5000 // 5 second timeout

  async calculateRiskScore(request: AIRiskRequest): Promise<AIRiskResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/predict`,
        request,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': request.tenantId
          }
        }
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`AI service error: ${error.message}`)
      }
      throw error
    }
  }
}
```

---

## Testing Standards

### Unit Testing
```typescript
// Jest unit test example
import { userService } from '../services/userService'
import { mockSupabaseClient } from '../tests/mocks/supabase'

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'test-user-id'
      const tenantId = 'test-tenant-id'
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        tenantId
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: expectedUser,
              error: null
            })
          })
        })
      })

      // Act
      const result = await userService.getUserById(userId, tenantId)

      // Assert
      expect(result).toEqual(expectedUser)
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('set_config', {
        setting_name: 'app.current_tenant_id',
        setting_value: tenantId
      })
    })

    it('should throw error when user not found', async () => {
      // Arrange
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })

      // Act & Assert
      await expect(
        userService.getUserById('nonexistent', 'tenant-id')
      ).rejects.toThrow('User not found')
    })
  })
})
```

### Integration Testing
```typescript
// Integration test example using Playwright
import { test, expect } from '@playwright/test'

test.describe('AI Risk Prioritization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'admin@test.com')
    await page.fill('[data-testid="password"]', 'password')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })

  test('should calculate risk score for vulnerability', async ({ page }) => {
    // Navigate to AI Risk page
    await page.click('[data-testid="ai-risk-nav"]')
    await page.waitForURL('/ai-risk')

    // Select vulnerability
    await page.click('[data-testid="vulnerability-row"]:first-child')
    
    // Click calculate risk
    await page.click('[data-testid="calculate-risk-button"]')
    
    // Wait for calculation to complete
    await page.waitForSelector('[data-testid="risk-score"]')
    
    // Verify risk score is displayed
    const riskScore = await page.textContent('[data-testid="risk-score"]')
    expect(riskScore).toMatch(/^\d+\.\d+$/)
    
    // Verify explanations are shown
    const explanations = await page.locator('[data-testid="explanation"]').count()
    expect(explanations).toBeGreaterThan(0)
  })
})
```

---

## Documentation Standards

### Code Documentation
```typescript
/**
 * Calculates AI-powered risk score for a vulnerability
 * 
 * @param vulnerabilityId - Unique identifier for the vulnerability
 * @param tenantId - Tenant identifier for multi-tenant isolation
 * @param context - Additional context for risk calculation
 * @returns Promise resolving to calculated risk score with explanations
 * 
 * @throws {ValidationError} When input parameters are invalid
 * @throws {AIServiceError} When AI service is unavailable
 * 
 * @example
 * ```typescript
 * const riskScore = await calculateRiskScore(
 *   'vuln-123',
 *   'tenant-456',
 *   { assetCriticality: 'high' }
 * )
 * console.log(`Risk: ${riskScore.score}%`)
 * ```
 */
export async function calculateRiskScore(
  vulnerabilityId: string,
  tenantId: string,
  context?: VulnerabilityContext
): Promise<RiskScore> {
  // Implementation
}
```

### API Documentation
```typescript
/**
 * @swagger
 * /api/ai/risk/calculate:
 *   post:
 *     summary: Calculate AI risk score for vulnerability
 *     tags: [AI Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vulnerabilityId
 *             properties:
 *               vulnerabilityId:
 *                 type: string
 *                 format: uuid
 *                 description: Unique vulnerability identifier
 *               forceRecalculation:
 *                 type: boolean
 *                 default: false
 *                 description: Skip cache and recalculate
 *     responses:
 *       200:
 *         description: Risk score calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskScoreResponse'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
```

---

## Performance Standards

### Response Time Requirements
- **API Endpoints**: < 500ms for 95th percentile
- **Page Load Times**: < 2 seconds for initial load
- **AI Calculations**: < 5 seconds for risk scoring
- **Database Queries**: < 100ms for simple queries

### Code Optimization
```typescript
// Use proper memoization for expensive calculations
import { useMemo, useCallback } from 'react'

const RiskDashboard = ({ vulnerabilities }: Props) => {
  // Memoize expensive calculations
  const riskStatistics = useMemo(() => {
    return calculateRiskStatistics(vulnerabilities)
  }, [vulnerabilities])

  // Memoize event handlers
  const handleVulnerabilityClick = useCallback((id: string) => {
    onVulnerabilitySelect(id)
  }, [onVulnerabilitySelect])

  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### Database Optimization
```sql
-- Proper indexing for multi-tenant queries
CREATE INDEX CONCURRENTLY idx_vulnerabilities_tenant_status 
  ON vulnerabilities(tenant_id, status) 
  WHERE deleted_at IS NULL;

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_ai_risk_scores_lookup 
  ON ai_risk_scores(tenant_id, vulnerability_id, calculated_at DESC);
```

---

## Monitoring and Observability

### Logging Standards
```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'cybersecvault-api',
    version: process.env.APP_VERSION
  },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Usage example
logger.info('Risk calculation started', {
  vulnerabilityId,
  tenantId,
  userId,
  timestamp: new Date().toISOString()
})
```

### Metrics Collection
```typescript
// Performance monitoring
import { performance } from 'perf_hooks'

export const withTiming = (label: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = performance.now()
      try {
        const result = await method.apply(this, args)
        const duration = performance.now() - start
        
        logger.info('Method execution completed', {
          method: `${target.constructor.name}.${propertyName}`,
          duration: Math.round(duration),
          label
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - start
        
        logger.error('Method execution failed', {
          method: `${target.constructor.name}.${propertyName}`,
          duration: Math.round(duration),
          error: error.message,
          label
        })
        
        throw error
      }
    }
  }
}

// Usage
class UserService {
  @withTiming('user-lookup')
  async getUserById(id: string): Promise<User> {
    // Implementation
  }
}
```

---

## Code Review Standards

### Review Checklist
```markdown
# Code Review Checklist

## Functionality
- [ ] Code implements all acceptance criteria
- [ ] Error handling is comprehensive
- [ ] Edge cases are handled appropriately
- [ ] Performance requirements are met

## Security
- [ ] Input validation is proper
- [ ] Authentication/authorization is correct
- [ ] No sensitive data in logs
- [ ] SQL injection prevention implemented
- [ ] XSS prevention implemented

## Code Quality
- [ ] Code follows established patterns
- [ ] Naming conventions are consistent
- [ ] Functions are single-purpose and small
- [ ] Comments explain "why" not "what"
- [ ] No code duplication

## Testing
- [ ] Unit tests cover critical paths
- [ ] Integration tests validate workflows
- [ ] Test names are descriptive
- [ ] Mocks are appropriate and realistic

## Documentation
- [ ] API changes are documented
- [ ] Complex logic is explained
- [ ] README is updated if needed
- [ ] Breaking changes are noted
```

---

**Document Version:** 1.0  
**Effective Date:** 2024-08-21  
**Review Cycle:** Quarterly  
**Next Review:** 2024-11-21