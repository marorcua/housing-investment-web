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
    await expect(page.getByText('Hacienda Test Property').first()).toBeVisible({ timeout: 10000 });

    // Add revenue — wait for form heading to disappear (mutation completed, form closed)
    await page.getByRole('button', { name: 'Revenue' }).first().click();
    await page.getByRole('button', { name: 'Add Revenue' }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByLabel('Amount (€)').fill('1200');
    await page.getByRole('button', { name: 'Add Revenue' }).click();
    await expect(page.getByText('Add revenue', { exact: true })).not.toBeVisible({ timeout: 10000 });

    // Add expense — wait for form heading to disappear
    await page.getByRole('button', { name: 'Expense' }).first().click();
    await page.getByRole('button', { name: 'Add Expense' }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByLabel('Amount (€)').fill('300');
    await page.getByRole('button', { name: 'Add Expense' }).click();
    await expect(page.getByText('Add expense', { exact: true })).not.toBeVisible({ timeout: 10000 });

    // Open cashflow calendar and wait for June data to appear
    await page.getByRole('button', { name: 'Cashflow' }).first().click();
    await expect(page.getByText(/Annual Cashflow/)).toBeVisible({ timeout: 10000 });
    const junRow = page.locator('tr').filter({ hasText: 'Jun' }).first();
    await expect(junRow.locator('td').nth(1)).not.toHaveText('\u2014', { timeout: 10000 });

    // Expand the current month row
    await junRow.click();

    // Verify expanded entries appear
    await expect(page.getByText('Revenue entries')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Manual expenses')).toBeVisible({ timeout: 5000 });
  });
});
