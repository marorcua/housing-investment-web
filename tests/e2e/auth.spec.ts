import { test, expect } from '@playwright/test';
import { ROUTES, AUTH, PASSWORD, WRONG_PASSWORD } from './constants';

test.describe('Authentication', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await expect(page.getByRole('heading', { name: AUTH.HEADING })).toBeVisible();
    await expect(page.getByLabel(AUTH.LABEL)).toBeVisible();
  });

  test('logs in with correct password', async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await page.getByLabel(AUTH.LABEL).fill(PASSWORD);
    await page.getByRole('button', { name: AUTH.BUTTON_LOGIN }).click();
    await expect(page.getByText(AUTH.SUCCESS_TEXT)).toBeVisible({ timeout: 10000 });
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await page.getByLabel(AUTH.LABEL).fill(WRONG_PASSWORD);
    await page.getByRole('button', { name: AUTH.BUTTON_LOGIN }).click();
    await expect(page.getByText(AUTH.ERROR_PATTERN)).toBeVisible({ timeout: 10000 });
  });

  test('logs out', async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await page.getByLabel(AUTH.LABEL).fill(PASSWORD);
    await page.getByRole('button', { name: AUTH.BUTTON_LOGIN }).click();
    await expect(page.getByText(AUTH.SUCCESS_TEXT)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: AUTH.BUTTON_LOGOUT }).click();
    await expect(page.getByRole('heading', { name: AUTH.HEADING })).toBeVisible({ timeout: 10000 });
  });
});
