import { test, expect } from '@playwright/test';

test.describe('Transaction flow (Hacienda)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your Investments')).toBeVisible({ timeout: 10000 });
  });

  test('adds revenue and expense, verifies cashflow calendar', async ({ page }) => {
    // Add a property first
    await page.getByRole('button', { name: 'Add Property' }).click();
    await page.getByLabel('Property Name').fill('Hacienda Test Property');
    await page.getByLabel(/Purchase Price/i).fill('300000');
    await page.getByRole('button', { name: 'Save Property' }).click();
    await expect(page.getByText('Hacienda Test Property')).toBeVisible({ timeout: 10000 });

    // Add revenue
    await page.getByRole('button', { name: 'Revenue' }).first().click();
    await page.getByLabel('Amount (€)').fill('1200');
    await page.getByRole('button', { name: 'Add Revenue' }).click();

    // Add expense
    await page.getByRole('button', { name: 'Expense' }).first().click();
    await page.getByLabel('Amount (€)').fill('300');
    await page.getByRole('button', { name: 'Add Expense' }).click();

    // Open cashflow calendar
    await page.getByRole('button', { name: 'Cashflow' }).first().click();
    await expect(page.getByText(/Annual Cashflow/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Total Revenue').first()).toBeVisible();
    await expect(page.getByText('Total Expenses').first()).toBeVisible();
    await expect(page.getByText('Net Cashflow').first()).toBeVisible();

    // Expand the current month row
    const monthRow = page.locator('tr').filter({ hasText: 'Jun' }).first();
    await monthRow.click();

    // Verify expanded entries appear
    await expect(page.getByText('Revenue entries')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Manual expenses')).toBeVisible({ timeout: 5000 });
  });
});
