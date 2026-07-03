import { test, expect } from '@playwright/test';
import { ROUTES, CALCULATOR, CALCULATOR_VALUES } from './constants';

test.describe('Calculator page', () => {
  test('shows the investment calculator', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await expect(page.getByRole('heading', { name: CALCULATOR.HEADING })).toBeVisible();
    await expect(page.getByText(CALCULATOR.SUBTITLE)).toBeVisible();
  });

  test('calculates loan values reactively', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    const housePrice = page.getByLabel(CALCULATOR.LABEL_HOUSE_PRICE);
    await housePrice.fill(CALCULATOR_VALUES.HOUSE_PRICE);
    await expect(page.getByText(CALCULATOR.RESULT_LOAN_AMOUNT)).toBeVisible();
    await expect(page.getByText(CALCULATOR.RESULT_MONTHLY_PAYMENT)).toBeVisible();
    await expect(page.getByText(CALCULATOR.RESULT_TOTAL_INTEREST)).toBeVisible();
  });
});
