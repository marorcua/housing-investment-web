import { test, expect } from '@playwright/test';

test.describe('Calculator page', () => {
  test('shows the investment calculator', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Investment Calculator' })).toBeVisible();
    await expect(page.getByText('Simulate your mortgage payments')).toBeVisible();
  });

  test('calculates loan values reactively', async ({ page }) => {
    await page.goto('/');
    const housePrice = page.getByLabel('House Price (€)');
    await housePrice.fill('250000');
    await expect(page.getByText('Loan Amount')).toBeVisible();
    await expect(page.getByText('Monthly Payment')).toBeVisible();
    await expect(page.getByText('Total Interest Paid')).toBeVisible();
  });
});
