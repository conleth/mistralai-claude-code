# Running Playwright E2E Tests - Complete Guide

## Current Status

The Playwright tests have been successfully created, but they require the Playwright browsers to be installed before they can run.

## Quick Start

### 1. Install Playwright Browsers

```bash
cd apps/frontend
npx playwright install
```

This will install Chromium, Firefox, and WebKit browsers for testing.

### 2. Start the Backend Server

The tests require the backend API to be running:

```bash
cd apps/backend
npm run dev
```

The backend should be running at `http://localhost:3000`

### 3. Run the Tests

```bash
cd apps/frontend
npm run test:e2e
```

This will:
- Start the Vite development server
- Run all tests across Chromium, Firefox, and WebKit
- Generate reports in the `playwright-report` directory

## Test Configuration

### What's Configured

The Playwright configuration (`apps/frontend/playwright.config.ts`) includes:

- **3 Browsers**: Chromium, Firefox, and WebKit
- **Automatic Server**: Vite dev server starts automatically
- **Reporting**: HTML reports, traces, videos, and screenshots
- **Timeouts**: 30 second test timeout, 5 second expectation timeout

### Test Files

- **`apps/frontend/e2e/auth.spec.ts`**: 8 authentication tests
  - Login page rendering
  - Form validation
  - Invalid credentials
  - Successful login
  - Protected route redirection
  - Register page navigation
  - Session persistence
  - Logout functionality

## Running Specific Tests

### Run Tests for One Browser

```bash
npm run test:e2e -- --project=chromium
```

### Run Specific Test

```bash
npm run test:e2e -- --grep "should login successfully"
```

### Run in Headed Mode (Visible Browser)

```bash
npm run test:e2e:headed
```

### Run in Debug Mode

```bash
npm run test:e2e:debug
```

## Viewing Test Results

After running tests, you'll find:

1. **HTML Report**: `playwright-report/index.html`
   - Open this in a browser for a detailed report

2. **Test Results**: `test-results/` directory
   - JSON files with test results

3. **Traces**: Detailed execution traces (for failed tests)
   - View with: `npx playwright show-trace path/to/trace.zip`

4. **Videos**: Screen recordings (for failed tests)

5. **Screenshots**: Automatically captured on failure

## Troubleshooting

### Error: "Executable doesn't exist"

**Solution**: Install Playwright browsers
```bash
npx playwright install
```

### Error: "Backend not running"

**Solution**: Start the backend server
```bash
cd apps/backend
npm run dev
```

### Error: "Page crashed"

**Solution**: Run in headed mode to see what's happening
```bash
npm run test:e2e:headed
```

### Error: "Element not found"

**Solution**: 
1. Verify the page is fully loaded
2. Check that selectors match the actual HTML
3. Use more specific selectors

### Tests Hang

**Solution**:
1. Check if backend is responding: `curl http://localhost:3000/health`
2. Increase timeouts in `playwright.config.ts`
3. Run in headed mode to debug

## Manual Testing Alternative

If you can't run the E2E tests, you can manually test the login functionality:

### 1. Start Both Servers

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

### 2. Test Login

Open browser to: `http://localhost:5173/login`

Test credentials:
- Email: `test@example.com`
- Password: `password123`

### 3. Test API Directly

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"new@example.com","password":"password123","role":"developer"}'
```

## Test Coverage Summary

### Current Tests (8 tests)

1. ✅ **should display login page** - Verifies login page renders correctly
2. ✅ **should show error for empty form submission** - Tests form validation
3. ✅ **should show error for invalid credentials** - Tests error handling
4. ✅ **should login successfully with valid credentials** - Tests successful login
5. ✅ **should redirect to login from protected route** - Tests authentication guard
6. ✅ **should navigate to register page from login** - Tests navigation
7. ✅ **should persist session after page reload** - Tests session persistence
8. ✅ **should logout and redirect to login** - Tests logout functionality

### Future Tests (Recommended)

- Questionnaire creation and management
- Shortlist generation
- Requirement status tracking
- Comments and collaboration
- Webhook configuration
- Integration with Jira/Rally
- Export functionality

## CI/CD Integration

To add tests to your CI/CD pipeline:

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Playwright browsers
        run: npx playwright install
        working-directory: apps/frontend
      
      - name: Start backend
        run: npm run dev &
        working-directory: apps/backend
      
      - name: Run tests
        run: npm run test:e2e
        working-directory: apps/frontend
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: apps/frontend/test-results/
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Playwright Test Runner](https://playwright.dev/docs/test-runners)
- [Playwright CI](https://playwright.dev/docs/ci)

## Need Help?

If you encounter issues:

1. Check the test output for specific errors
2. Run in headed mode to see what's happening
3. Check browser console for JavaScript errors
4. Verify backend logs for API issues
5. Review the Playwright documentation for specific error messages
