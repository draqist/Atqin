import { expect, test } from '@playwright/test';

test.describe('Library', () => {
  test('should display books in the library', async ({ page }) => {
    await page.goto('/library');

    // Expect at least one book card to be visible
    // We look for links that match the pattern /library/[uuid]
    const bookLinks = page.locator('a[href^="/library/"]');
    await expect(bookLinks.first()).toBeVisible();
  });

  test('should filter books by search query', async ({ page }) => {
    await page.goto('/library');

    // Type in search box
    const searchInput = page.getByPlaceholder('Search library...');
    await searchInput.fill('Aqeedah'); // Assuming 'Aqeedah' returns something or nothing, but filters list

    // Wait for debounce
    await page.waitForTimeout(600);

    // Verify URL param
    expect(page.url()).toContain('q=Aqeedah');
  });

  test('should navigate to book details', async ({ page }) => {
    await page.goto('/library');

    const firstBook = page.locator('a[href^="/library/"]').first();
    const bookTitle = await firstBook.locator('h3').innerText();

    await firstBook.click();

    // Expect to be on details page
    await expect(page).toHaveURL(/\/library\/.+/);

    // Expect title to be visible on the new page
    await expect(page.getByRole('heading', { name: bookTitle })).toBeVisible();
  });
});
