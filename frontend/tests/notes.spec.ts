import { expect, test } from '@playwright/test';

test.describe('Notes', () => {
  test('should require login to access editor', async ({ page }) => {
    // Try to access a write page directly
    await page.goto('/library/some-book-id/write');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow writing and publishing a note', async ({ page }) => {
    // 1. Register/Login
    const id = Date.now();
    const user = {
      name: `Writer ${id}`,
      username: `writer${id}`,
      email: `writer${id}@example.com`,
      password: 'password123',
    };

    await page.goto('/register');
    await page.getByLabel('Full Name').fill(user.name);
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Go to a book's write page (assuming we have a valid book ID, or we mock navigation)
    // Since we don't have a guaranteed book ID, we'll navigate via library
    await page.goto('/library');
    const firstBook = page.locator('a[href^="/library/"]').first();

    if (await firstBook.count() > 0) {
      await firstBook.click();

      // Click "Draft" or "Quick Note" area to go to full editor
      // Or use the "Continue to Full Editor" button if visible
      // The QuickNote component has a button "Continue to Full Editor"
      await page.getByRole('button', { name: 'Continue to Full Editor' }).click();

      // 3. Write content
      const editor = page.locator('.ProseMirror');
      await editor.fill('This is a test reflection.');

      // 4. Publish
      await page.getByRole('button', { name: 'Publish Note' }).click();

      // Fill dialog
      await page.getByLabel('Title').fill('My Test Reflection');
      await page.getByLabel('Description').fill('Testing E2E');

      // Click Publish Now
      await page.getByRole('button', { name: 'Publish Now' }).click();

      // Expect dialog to close and maybe button text to change to "Update Note"
      await expect(page.getByRole('button', { name: 'Update Note' })).toBeVisible();
    } else {
      test.skip('No books available to test notes');
    }
  });
});
