/**
 * End-to-end tests for authentication
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/Security RAT Modern/);
    await expect(page.locator('h1')).toContainText('Login to Security RAT Modern');
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();
  });

  test('should show error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('button', { hasText: 'Login' }).click();
    
    // Check for validation errors (browser-level validation)
    const emailInput = page.locator('input[type=email]');
    await expect(emailInput).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('input[type=email]').fill('wrong@example.com');
    await page.locator('input[type=password]').fill('wrongpassword');
    await page.locator('button', { hasText: 'Login' }).click();
    
    // Wait for error message
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
    await expect(page.locator('.MuiAlert-message')).toContainText('Invalid credentials');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in valid credentials
    await page.locator('input[type=email]').fill('test@example.com');
    await page.locator('input[type=password]').fill('password123');
    await page.locator('button', { hasText: 'Login' }).click();
    
    // Wait for navigation to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify user is logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check that token is stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(token).not.toBe('null');
  });

  test('should redirect to login from protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to register page from login', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('a', { hasText: 'Register' }).click();
    
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('Register');
  });

  test('should persist session after page reload', async ({ page }) => {
    // First, login
    await page.goto('/login');
    await page.locator('input[type=email]').fill('test@example.com');
    await page.locator('input[type=password]').fill('password123');
    await page.locator('button', { hasText: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
    
    // Reload the page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    // First, login
    await page.goto('/login');
    await page.locator('input[type=email]').fill('test@example.com');
    await page.locator('input[type=password]').fill('password123');
    await page.locator('button', { hasText: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
    
    // Find and click logout button
    await page.locator('button', { hasText: 'Logout' }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    
    // Verify token is cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
