import { test, expect } from '@playwright/test';
import { ROUTES, AUTH, PASSWORD, PROPERTY, DASHBOARD, TEST_VALUES, TEST_NAMES } from './constants';

test.describe('Full dashboard flow', () => {
  test('shows global chart when properties exist', async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await page.getByLabel(AUTH.LABEL).fill(PASSWORD);
    await page.getByRole('button', { name: AUTH.BUTTON_LOGIN }).click();
    await expect(page.getByText(AUTH.SUCCESS_TEXT)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: PROPERTY.BUTTON_ADD }).click();
    await page.getByLabel(PROPERTY.LABEL_NAME).fill(TEST_NAMES.GLOBAL);
    await page.getByLabel(PROPERTY.LABEL_PRICE).fill(TEST_VALUES.PROPERTY_PRICE);
    await page.getByRole('button', { name: PROPERTY.BUTTON_SAVE }).click();
    await expect(page.getByText(TEST_NAMES.GLOBAL).first()).toBeVisible({ timeout: 10000 });

    await expect(page.getByText(DASHBOARD.GLOBAL_OVERVIEW)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(DASHBOARD.PURCHASE_PRICE).first()).toBeVisible();
    await expect(page.getByText(DASHBOARD.ANNUAL_REVENUE).first()).toBeVisible();
  });
});
