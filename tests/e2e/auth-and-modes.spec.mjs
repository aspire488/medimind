import { test, expect } from '@playwright/test';

async function openLogin(page) {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Enter your PIN')).toBeVisible();
}

test('standard patient can enter the demo dashboard', async ({ page }) => {
  await openLogin(page);
  await page.getByRole('button', { name: /Arjun \(Standard\)/ }).click();
  await expect(page).toHaveURL(/\/standard$/);
  await expect(page.getByText('Arjun Nair')).toBeVisible();
  await expect(page.getByText("Today's schedule")).toBeVisible();
});

test('senior mode can enter the senior dashboard', async ({ page }) => {
  await openLogin(page);
  await page.getByRole('button', { name: /Leela \(Senior\)/ }).click();
  await expect(page).toHaveURL(/\/senior$/);
  await expect(page.getByText('Leela Menon')).toBeVisible();
});

test('caregiver mode can enter the caregiver dashboard', async ({ page }) => {
  await openLogin(page);
  await page.getByRole('button', { name: /Priya \(Caregiver\)/ }).click();
  await expect(page).toHaveURL(/\/caregiver$/);
  await expect(page.getByText('Priya Nair')).toBeVisible();
});
