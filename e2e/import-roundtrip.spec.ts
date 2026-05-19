import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.setTimeout(60_000);

test('GLB roundtrip: export demo scene, clear, re-import', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Load demo scene via dropdown
  await page.click('button:has-text("示例场景")');
  await page.waitForTimeout(500);
  const menuItems = page.locator('.ant-dropdown-menu-item');
  const count = await menuItems.count();
  if (count > 0) {
    await menuItems.first().click();
  }
  await page.waitForTimeout(1000);

  // Verify objects loaded
  const sceneName = await page.evaluate(() => {
    const store = (window as any).__ZUSTAND_STORE__;
    return { objects: store.getState().objects.length, name: store.getState().sceneName };
  });
  console.log(`Loaded scene: ${JSON.stringify(sceneName)}`);
  expect(sceneName.objects).toBeGreaterThan(0);

  // Export as GLB
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("导出")');
  const download = await downloadPromise;
  const downloadPath = path.join('/tmp', download.suggestedFilename());
  await download.saveAs(downloadPath);
  console.log(`Exported: ${fs.statSync(downloadPath).size} bytes`);

  // Clear scene
  await page.evaluate(() => {
    (window as any).__ZUSTAND_STORE__?.getState().clearScene();
  });
  await page.waitForTimeout(300);

  // Import the GLB
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('button:has-text("导入")');
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(downloadPath);

  // Wait for loading + rendering
  await page.waitForTimeout(3000);

  // Check results
  const result = await page.evaluate(() => {
    const store = (window as any).__ZUSTAND_STORE__;
    const s = store.getState();
    const obj = s.objects[0];
    return {
      objects: s.objects.length,
      hasModelData: !!obj?.modelData,
      dataSize: obj?.modelData?.byteLength,
    };
  });
  console.log(`Import result: ${JSON.stringify(result)}`);

  expect(result.objects).toBe(1);
  expect(result.hasModelData).toBe(true);
  expect(result.dataSize).toBeGreaterThan(0);

  // Check critical errors (ignore R3F casing warnings)
  const realErrors = errors.filter(e =>
    !e.includes('incorrect casing') &&
    !e.includes('unrecognized') &&
    !e.includes('non-boolean')
  );
  expect(realErrors).toEqual([]);
});