import { test, expect } from '@playwright/test';
import { ROUTES, AUTH, PASSWORD, PROPERTY, HACIENDA, TEST_VALUES, TEST_NAMES } from './constants';

test.describe('Transaction flow (Hacienda)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await page.getByLabel(AUTH.LABEL).fill(PASSWORD);
    await page.getByRole('button', { name: AUTH.BUTTON_LOGIN }).click();
    await expect(page.getByText(AUTH.SUCCESS_TEXT)).toBeVisible({ timeout: 10000 });
  });

  test('adds revenue and expense, verifies cashflow calendar', async ({ page }) => {
    await page.getByRole('button', { name: PROPERTY.BUTTON_ADD }).click();
    await page.getByLabel(PROPERTY.LABEL_NAME).fill(TEST_NAMES.HACIENDA);
    await page.getByLabel(PROPERTY.LABEL_PRICE).fill(TEST_VALUES.PROPERTY_PRICE_ALT);
    await page.getByRole('button', { name: PROPERTY.BUTTON_SAVE }).click();
    await expect(page.getByText(TEST_NAMES.HACIENDA).first()).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: HACIENDA.BUTTON_REVENUE }).first().click();
    await page.getByRole('button', { name: HACIENDA.BUTTON_ADD_REVENUE }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByLabel(HACIENDA.LABEL_AMOUNT).fill(TEST_VALUES.REVENUE_AMOUNT);
    await page.getByLabel(HACIENDA.LABEL_DATE).fill(TEST_VALUES.TEST_DATE);
    await page.getByRole('button', { name: HACIENDA.BUTTON_ADD_REVENUE }).click();
    await expect(page.getByText(HACIENDA.HEADING_ADD_REVENUE, { exact: true })).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: HACIENDA.BUTTON_EXPENSE }).first().click();
    await page.getByRole('button', { name: HACIENDA.BUTTON_ADD_EXPENSE }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByLabel(HACIENDA.LABEL_AMOUNT).fill(TEST_VALUES.EXPENSE_AMOUNT);
    await page.getByLabel(HACIENDA.LABEL_DATE).fill(TEST_VALUES.TEST_DATE);
    await page.getByRole('button', { name: HACIENDA.BUTTON_ADD_EXPENSE }).click();
    await expect(page.getByText(HACIENDA.HEADING_ADD_EXPENSE, { exact: true })).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: HACIENDA.BUTTON_CASHFLOW }).first().click();
    await expect(page.getByText(HACIENDA.ANNUAL_CASHFLOW)).toBeVisible({ timeout: 10000 });
    const junRow = page.locator('tr').filter({ hasText: HACIENDA.MONTH_JUN }).first();
    await expect(junRow.locator('td').nth(1)).not.toHaveText('\u2014', { timeout: 10000 });

    await junRow.click();

    await expect(page.getByText(HACIENDA.REVENUE_ENTRIES)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(HACIENDA.MANUAL_EXPENSES)).toBeVisible({ timeout: 5000 });
  });
});
