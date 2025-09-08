import { test, expect } from '@playwright/test';

test.describe('RSS Aggregator', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:51952');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the application with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/RSS/);
    
    // Check for main form elements
    await expect(page.locator('#rss-url')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error for empty URL', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Try to submit empty form
    await submitButton.click();
    
    // Should show validation error
    await expect(urlInput).toHaveClass(/is-invalid/);
  });

  test('should show validation error for invalid URL', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Enter invalid URL
    await urlInput.fill('invalid-url');
    await submitButton.click();
    
    // Should show validation error
    await expect(urlInput).toHaveClass(/is-invalid/);
    
    // Check for specific error message
    const feedback = page.locator('.invalid-feedback');
    await expect(feedback).toContainText('El enlace debe ser una URL válida');
  });

  test('should successfully load RSS feed', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Enter test RSS URL
    await urlInput.fill('test-rss.xml');
    await submitButton.click();
    
    // Wait for success message
    await expect(page.locator('.alert-success')).toContainText('RSS cargado con éxito');
    
    // Check that feed is displayed
    await expect(page.locator('.card').nth(1)).toBeVisible();
  });

  test('should show duplicate feed error', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Add RSS feed first time
    await urlInput.fill('test-rss.xml');
    await submitButton.click();
    
    // Wait for success
    await expect(page.locator('.alert-success')).toContainText('RSS cargado con éxito');
    
    // Try to add the same feed again
    await urlInput.fill('test-rss.xml');
    await submitButton.click();
    
    // Should show duplicate error
    await expect(urlInput).toHaveClass(/is-invalid/);
    await expect(page.locator('.invalid-feedback')).toContainText('El RSS ya existe');
  });

  test('should display posts with preview buttons', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Add RSS feed
    await urlInput.fill('test-rss.xml');
    await submitButton.click();
    
    // Wait for feed to load
    await expect(page.locator('.alert-success')).toContainText('RSS cargado con éxito');
    
    // Check for posts and preview buttons
    await expect(page.locator('.post-item').first()).toBeVisible();
    await expect(page.locator('.preview-btn').first()).toContainText('Vista previa');
  });

  test('should open preview modal when clicking preview button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Add RSS feed
    await urlInput.fill('test-rss.xml');
    await submitButton.click();
    
    // Wait for feed to load
    await expect(page.locator('.alert-success')).toContainText('RSS cargado con éxito');
    
    // Click preview button
    const previewButton = page.locator('.preview-btn').first();
    await previewButton.click();
    
    // Check modal is visible
    const modal = page.locator('#postPreviewModal');
    await expect(modal).toBeVisible();
    
    // Check modal content
    await expect(modal.locator('#modal-post-title')).toBeVisible();
    await expect(modal.locator('#modal-post-description')).toBeVisible();
  });

  test('should mark post as read after preview', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Add RSS feed
    await urlInput.fill('test-rss.xml');
    await submitButton.click();
    
    // Wait for feed to load
    await expect(page.locator('.alert-success')).toContainText('RSS cargado con éxito');
    
    // Get first post title (should be bold/unread initially)
    const firstPost = page.locator('.post-item').first();
    const postTitle = firstPost.locator('.post-title');
    
    // Verify it's unread (bold)
    await expect(postTitle).toHaveClass(/fw-bold/);
    
    // Click preview button
    const previewButton = firstPost.locator('.preview-btn');
    await previewButton.click();
    
    // Close modal
    const modal = page.locator('#postPreviewModal');
    await modal.locator('.btn-secondary').click();
    
    // Verify post is now marked as read (normal weight)
    await expect(postTitle).toHaveClass(/fw-normal/);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Enter URL that will cause network error
    await urlInput.fill('https://invalid-domain-that-does-not-exist.com/rss');
    await submitButton.click();
    
    // Should show error message (can be either network error or invalid RSS)
    const errorAlert = page.locator('.alert-danger');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/Error de red|El recurso no contiene un RSS válido/);
  });

  test('should handle invalid RSS content', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const urlInput = page.locator('#rss-url');
    
    // Enter URL that returns non-RSS content
    await urlInput.fill('https://example.com');
    await submitButton.click();
    
    // Should show invalid RSS error (wait for any error message)
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 10000 });
  });

  test('should switch language correctly', async ({ page }) => {
    // Click language dropdown
    const languageDropdown = page.locator('#languageDropdown');
    await languageDropdown.click();
    
    // Switch to English
    const englishLink = page.locator('[data-lang="en"]');
    await englishLink.click();
    
    // Check that interface changed to English
    await expect(page.locator('label[for="rss-url"]')).toContainText('RSS URL');
    
    // Switch back to Spanish
    await languageDropdown.click();
    const spanishLink = page.locator('[data-lang="es"]');
    await spanishLink.click();
    
    // Check that interface changed back to Spanish
    await expect(page.locator('label[for="rss-url"]')).toContainText('URL del RSS');
  });
});
