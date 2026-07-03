import { test, expect } from '@playwright/test';
import { ROUTES, AUTH, PASSWORD, PROPERTY, TEST_VALUES, TEST_NAMES } from './constants';
import { API_URL } from './helpers';

async function cleanDb() {
  const login = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) });
  const { token } = await login.json();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const list = await fetch(`${API_URL}/properties`, { headers });
  const props = await list.json();
  for (const p of props) {
    await fetch(`${API_URL}/properties/${p.id}`, { method: 'DELETE', headers });
  }
}

test.describe('Property management', () => {
  test.beforeAll(async () => {
    await cleanDb();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD);
    await page.getByLabel(AUTH.LABEL).fill(PASSWORD);
    await page.getByRole('button', { name: AUTH.BUTTON_LOGIN }).click();
    await expect(page.getByText(AUTH.SUCCESS_TEXT)).toBeVisible({ timeout: 10000 });
  });

  test('shows empty state when no properties exist', async ({ page }) => {
    await expect(page.getByText(PROPERTY.EMPTY_TEXT)).toBeVisible();
  });

  test('adds a new property', async ({ page }) => {
    await page.getByRole('button', { name: PROPERTY.BUTTON_ADD }).click();
    await page.getByLabel(PROPERTY.LABEL_NAME).fill(TEST_NAMES.E2E);
    await page.getByLabel(PROPERTY.LABEL_PRICE).fill(TEST_VALUES.PROPERTY_PRICE);
    await page.getByRole('button', { name: PROPERTY.BUTTON_SAVE }).click();
    await expect(page.getByText(TEST_NAMES.E2E).first()).toBeVisible({ timeout: 10000 });
  });

  test('edits a property name inline', async ({ page }) => {
    await page.getByRole('button', { name: PROPERTY.BUTTON_ADD }).click();
    await page.getByLabel(PROPERTY.LABEL_NAME).fill(TEST_NAMES.EDITABLE);
    await page.getByLabel(PROPERTY.LABEL_PRICE).fill(TEST_VALUES.PROPERTY_PRICE_LOW);
    await page.getByRole('button', { name: PROPERTY.BUTTON_SAVE }).click();
    await expect(page.getByText(TEST_NAMES.EDITABLE).first()).toBeVisible({ timeout: 10000 });

    const pencilButton = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    await pencilButton.click();

    const nameInput = page.getByLabel(PROPERTY.LABEL_NAME);
    await nameInput.clear();
    await nameInput.fill(TEST_NAMES.EDITED);

    await page.getByRole('button', { name: PROPERTY.BUTTON_SAVE_CHANGES }).click();
    await expect(page.getByText(TEST_NAMES.EDITED).first()).toBeVisible({ timeout: 10000 });
  });
});
