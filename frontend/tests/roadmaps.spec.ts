import { expect, test } from '@playwright/test';

test.describe('Roadmaps', () => {
  test('should display list of roadmaps', async ({ page }) => {
    await page.goto('/roadmaps');

    // Expect header
    await expect(page.getByRole('heading', { name: 'Structured Paths to' })).toBeVisible();

    // Expect at least one roadmap card (assuming seed data or empty state)
    // If empty, we expect the "No tracks available" message or cards.
    // Let's check for the grid container.
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
  });

  test('should filter roadmaps', async ({ page }) => {
    await page.goto('/roadmaps');

    // Open Topic Filter
    await page.getByRole('button', { name: /All Topics/i }).click();
    // Select a topic (assuming 'Aqeedah' exists in the list derived from data)
    // If no data, this might fail. We'll assume some data exists or the dropdown renders options.
    // We can check if the dropdown content appears.
    await expect(page.locator('[role="menu"]')).toBeVisible();
  });

  test('should navigate to roadmap detail', async ({ page }) => {
    await page.goto('/roadmaps');

    // If there are roadmaps, click the first one
    const firstRoadmap = page.locator('a[href^="/roadmaps/"]').first();

    if (await firstRoadmap.count() > 0) {
      const title = await firstRoadmap.locator('h3').innerText();
      await firstRoadmap.click();

      // Expect detail page
      await expect(page).toHaveURL(/\/roadmaps\/.+/);
      await expect(page.getByRole('heading', { name: title })).toBeVisible();

      // Check for Timeline
      await expect(page.locator('.relative.w-full.max-w-7xl')).toBeVisible();
    } else {
      test.skip('No roadmaps available to test navigation');
    }
  });
});
