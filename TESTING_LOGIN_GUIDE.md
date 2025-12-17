# Login Functionality Testing Guide

This guide explains how to test the login functionality in Security RAT Modern, including both unit tests and end-to-end tests.

## Overview

The login system consists of:
- **Frontend**: React components with Material-UI
- **Backend**: Fastify API with JWT authentication
- **Database**: SQLite for user storage

## Test Types

### 1. Unit Tests (Existing)

Unit tests verify the AuthContext logic without a browser:

```bash
cd apps/frontend
npm test
```

**Location**: `apps/frontend/src/context/AuthContext.test.tsx`

**Tests covered**:
- Initial state
- Login success/failure
- Registration
- Logout
- Session restoration from localStorage

### 2. End-to-End Tests (New)

End-to-end tests verify the complete login flow in a real browser:

```bash
cd apps/frontend
npm run test:e2e
```

**Location**: `apps/frontend/e2e/auth.spec.ts`

**Tests covered**:
- Login page rendering
- Form validation
- Login with invalid credentials
- Login with valid credentials
- Protected route redirection
- Session persistence
- Logout functionality

## Running E2E Tests

### Prerequisites

1. Install Playwright browsers (if not already installed):
   ```bash
   npx playwright install
   ```

2. Ensure backend is running:
   ```bash
   cd apps/backend
   npm run dev
   ```

### Running Tests

**Headless mode (default)**:
```bash
npm run test:e2e
```

**Headed mode (visible browser)**:
```bash
npm run test:e2e:headed
```

**Debug mode**:
```bash
npm run test:e2e:debug
```

### Test Output

After running tests, you'll find:
- **HTML report**: `playwright-report/index.html`
- **Traces**: Detailed execution traces
- **Videos**: Screen recordings of test runs
- **Screenshots**: Automatically captured on failure

## Manual Testing

If you prefer manual testing or need to debug issues:

### 1. Start the Development Server

```bash
cd apps/frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 2. Start the Backend Server

```bash
cd apps/backend
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 3. Test Login Flow

1. Open browser to `http://localhost:5173/login`
2. Enter valid credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"
4. Verify you're redirected to the dashboard

### 4. Test Error Cases

**Invalid credentials**:
- Email: `wrong@example.com`
- Password: `wrongpassword`
- Expected: Error message displayed

**Empty form**:
- Submit without filling fields
- Expected: Form validation errors

### 5. Check API Directly

You can test the API endpoints directly using curl:

**Login**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Register**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"new@example.com","password":"password123","role":"developer"}'
```

## Debugging Login Issues

### Common Problems

#### 1. Backend Not Running

**Symptom**: Login requests hang or return 500 errors

**Solution**:
```bash
cd apps/backend
npm run dev
```

#### 2. CORS Issues

**Symptom**: Frontend requests blocked with CORS errors

**Solution**: Ensure backend has CORS enabled (it should be by default)

#### 3. Database Not Initialized

**Symptom**: Login fails with "User not found" even with correct credentials

**Solution**: Run database setup:
```bash
./tools/setup-db.sh
```

#### 4. Port Conflicts

**Symptom**: Server won't start

**Solution**: Check if another process is using the port:
```bash
lsof -i :3000  # Backend
lsof -i :5173 # Frontend
```

Kill conflicting processes and restart.

### Checking Logs

**Backend logs**:
```bash
cd apps/backend
npm run dev
```

**Frontend logs**:
```bash
cd apps/frontend
npm run dev
```

**Browser console**: Press F12 to open developer tools and check for JavaScript errors.

## Creating Test Users

The backend automatically creates users when you register. To create a test user:

1. Go to `http://localhost:5173/register`
2. Fill in the form
3. Click "Register"

Or use the API:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"developer"}'
```

## Writing New Tests

### Unit Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

describe('AuthContext - Custom Test', () => {
  it('should handle custom scenario', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    // Test your scenario here
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should test custom login scenario', async ({ page }) => {
  await page.goto('/login');
  
  // Add your test steps here
  await page.locator('input[type=email]').fill('custom@example.com');
  await page.locator('input[type=password]').fill('custompassword');
  await page.locator('button', { hasText: 'Login' }).click();
  
  // Add assertions
  await expect(page).toHaveURL('/dashboard');
});
```

## Best Practices

1. **Test both success and failure paths**
2. **Clear localStorage between tests** to ensure isolation
3. **Use descriptive test names** that explain what's being tested
4. **Test edge cases** (empty fields, invalid formats, etc.)
5. **Run tests in CI/CD** to catch regressions early

## Troubleshooting

### Test Fails to Start

**Check**:
- Are all dependencies installed? (`npm install`)
- Is the backend running?
- Are there port conflicts?

### Tests Hang

**Check**:
- Is the development server responding?
- Are there network issues?
- Try increasing timeouts in `playwright.config.ts`

### Elements Not Found

**Check**:
- Is the page fully loaded? (Use `await expect(page).toHaveURL(...)`)
- Did the selector change? (Check the actual HTML)
- Try more specific selectors

### API Mocking

If you need to mock API responses in tests:

```typescript
test('should handle API error', async ({ page }) => {
  await page.route('**/api/v1/auth/login', route => 
    route.fulfill({ 
      status: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    })
  );
  
  await page.goto('/login');
  await page.locator('input[type=email]').fill('test@example.com');
  await page.locator('input[type=password]').fill('password123');
  await page.locator('button', { hasText: 'Login' }).click();
  
  await expect(page.locator('.MuiAlert-root')).toBeVisible();
});
```

## Resources

- **Playwright Documentation**: https://playwright.dev/
- **Vitest Documentation**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Fastify Testing**: https://fastify.dev/docs/latest/Guides/Testing/
