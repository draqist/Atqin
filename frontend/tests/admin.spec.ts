import { expect, test } from '@playwright/test';

test.describe('Admin', () => {
  test('should redirect unauthenticated users from admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect non-admin users from admin dashboard', async ({ page }) => {
    // Register a normal user
    const id = Date.now();
    const user = {
      name: `Normal User ${id}`,
      username: `normal${id}`,
      email: `normal${id}@example.com`,
      password: 'password123',
    };

    await page.goto('/register');
    await page.getByLabel('Full Name').fill(user.name);
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Try to access admin
    await page.goto('/admin');

    // Should be redirected to library or home, NOT admin
    // The AdminNavItem component redirects to /library if role != admin
    await expect(page).toHaveURL(/\/library/);
  });
});
