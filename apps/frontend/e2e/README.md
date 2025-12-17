# End-to-End Tests

This directory contains Playwright end-to-end tests for the Security RAT Modern frontend.

## Running Tests

### Basic Test Run

```bash
npm run test:e2e
```

This will:
- Start the development server
- Run all tests in headless mode
- Generate reports

### Headed Mode (Visible Browser)

```bash
npm run test:e2e:headed
```

Runs tests with a visible browser window - useful for debugging.

### Debug Mode

```bash
npm run test:e2e:debug
```

Pauses execution before each test to allow inspection.

## Test Structure

Tests are organized in `.spec.ts` files within the `e2e` directory.

### Current Tests

- **auth.spec.ts**: Authentication flow tests including:
  - Login page rendering
  - Login with valid/invalid credentials
  - Session persistence
  - Logout functionality
  - Protected route redirection

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Security RAT Modern/);
});
```

### Interacting with Elements

```typescript
// Fill in a form field
await page.locator('input[type=email]').fill('test@example.com');

// Click a button
await page.locator('button', { hasText: 'Login' }).click();

// Check visibility
await expect(page.locator('text=Dashboard')).toBeVisible();

// Check URL
await expect(page).toHaveURL('/dashboard');
```

### Mocking API Responses

For API testing, you can use Playwright's `route` method:

```typescript
test('should handle API error', async ({ page }) => {
  await page.route('**/api/v1/auth/login', route => 
    route.fulfill({ 
      status: 401,
      body: JSON.stringify({ message: 'Invalid credentials' })
    })
  );
  
  await page.goto('/login');
  // ... test error handling
});
```

## Test Configuration

See `playwright.config.ts` for configuration options including:
- Browser selection (Chromium, Firefox, WebKit)
- Timeout settings
- Web server configuration
- Reporting options

## Tips

1. **Use `await expect()`** for assertions - Playwright automatically waits for elements
2. **Clear localStorage** before tests to ensure clean state
3. **Use descriptive test names** that explain what's being tested
4. **Test both happy paths and error cases**
5. **Use `--headed` flag** when debugging visual issues

## Viewing Reports

After running tests, you can view:
- **HTML reports**: Generated in the `playwright-report` directory
- **Traces**: Detailed execution traces for failed tests
- **Videos**: Screen recordings of test runs (for failed tests)
- **Screenshots**: Automatically captured on failure
