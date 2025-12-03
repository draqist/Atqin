import { expect, test } from '@playwright/test';

const randomUser = () => {
  const id = Date.now();
  return {
    name: `Test User ${id}`,
    username: `user${id}`,
    email: `user${id}@example.com`,
    password: 'password123',
  };
};

test.describe('Authentication', () => {
  test('should allow a user to register', async ({ page }) => {
    const user = randomUser();

    await page.goto('/register');

    await page.getByLabel('Full Name').fill(user.name);
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Expect to be redirected to dashboard or onboarding
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow a user to login', async ({ page }) => {
    // Note: This assumes a user exists. In a real E2E, we might seed the DB or register first.
    // For now, we'll register a fresh user to ensure success.
    const user = randomUser();

    // Register first
    await page.goto('/register');
    await page.getByLabel('Full Name').fill(user.name);
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Logout (assuming there's a logout button in the profile menu)
    // We might need to inspect the header for this. 
    // For now, let's just clear cookies/storage or assume we can login again.

    // Let's try to login with the new user in a fresh context or just logout
    // Inspecting Header might be needed, but let's try to just visit login page again (might redirect if auth)

    // Force logout by clearing cookies
    await page.context().clearCookies();

    await page.goto('/login');
    await page.getByLabel('Email or Username').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show guest view to unauthenticated users on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Instead of redirect, we expect the Guest View
    await expect(page.getByRole('heading', { name: 'Your Personal Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In to View' })).toBeVisible();
  });
});
