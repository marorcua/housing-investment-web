import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('logs in with correct password', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your Investments')).toBeVisible({ timeout: 10000 });
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/invalid password|login failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('logs out', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your Investments')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 10000 });
  });
});
