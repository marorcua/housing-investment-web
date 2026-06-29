import { test, expect } from '@playwright/test';

test.describe('Full dashboard flow', () => {
  test('shows global chart when properties exist', async ({ page }) => {
    // Login
    await page.goto('/dashboard');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your Investments')).toBeVisible({ timeout: 10000 });

    // Add a property
    await page.getByRole('button', { name: 'Add Property' }).click();
    await page.getByLabel('Property Name').fill('Global Test Property');
    await page.getByLabel(/Purchase Price/i).fill('250000');
    await page.getByRole('button', { name: 'Save Property' }).click();
    await expect(page.getByText('Global Test Property')).toBeVisible({ timeout: 10000 });

    // Verify the Global Overview chart is visible
    await expect(page.getByText('Global Overview')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Purchase Price/).first()).toBeVisible();
    await expect(page.getByText(/Annual Revenue/).first()).toBeVisible();
  });
});
