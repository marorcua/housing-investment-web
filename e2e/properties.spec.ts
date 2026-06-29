import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000';

async function cleanDb() {
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'admin' }) });
  const { token } = await login.json();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const list = await fetch(`${API}/properties`, { headers });
  const props = await list.json();
  for (const p of props) {
    await fetch(`${API}/properties/${p.id}`, { method: 'DELETE', headers });
  }
}

test.describe('Property management', () => {
  test.beforeAll(async () => {
    await cleanDb();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your Investments')).toBeVisible({ timeout: 10000 });
  });

  test('shows empty state when no properties exist', async ({ page }) => {
    await expect(page.getByText('No properties found')).toBeVisible();
  });

  test('adds a new property', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Property' }).click();
    await page.getByLabel('Property Name').fill('E2E Test Property');
    await page.getByLabel(/Purchase Price/i).fill('200000');
    await page.getByRole('button', { name: 'Save Property' }).click();
    await expect(page.getByText('E2E Test Property')).toBeVisible({ timeout: 10000 });
  });

  test('edits a property name inline', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Property' }).click();
    await page.getByLabel('Property Name').fill('Editable Property');
    await page.getByLabel(/Purchase Price/i).fill('150000');
    await page.getByRole('button', { name: 'Save Property' }).click();
    await expect(page.getByText('Editable Property')).toBeVisible({ timeout: 10000 });

    const pencilButton = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    await pencilButton.click();

    const nameInput = page.getByLabel('Property Name');
    await nameInput.clear();
    await nameInput.fill('Edited Property');

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Edited Property')).toBeVisible({ timeout: 10000 });
  });
});
