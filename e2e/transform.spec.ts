import { test, expect } from '@playwright/test';

function store(page: any) {
  return page.evaluate(() => (window as any).__ZUSTAND_STORE__?.getState());
}

test.describe('TransformControls drag behavior', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(500);
    // Clear scene
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store?.getState().clearScene();
    });
  });

  test('E2E-001: app loads and canvas is visible', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('E2E-002: add object via UI toolbar', async ({ page }) => {
    await page.click('button:has-text("添加")');
    await page.waitForTimeout(300);
    await page.click('.ant-dropdown-menu-item:has-text("方块")');
    await page.waitForTimeout(500);

    const state = await store(page);
    expect(state.objects).toHaveLength(1);
    expect(state.objects[0].kind).toBe('box');
    expect(state.objects[0].name).toBe('box_1');
    expect(state.selectedId).toBe(state.objects[0].id);
  });

  test('E2E-003: add multiple objects with unique names', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("添加")');
      await page.waitForTimeout(200);
      await page.click('.ant-dropdown-menu-item:has-text("方块")');
      await page.waitForTimeout(300);
    }

    const state = await store(page);
    expect(state.objects).toHaveLength(3);
    const names = state.objects.map((o: any) => o.name);
    expect(names).toEqual(['box_1', 'box_2', 'box_3']);
  });

  test('E2E-004: select object shows property panel', async ({ page }) => {
    await page.click('button:has-text("添加")');
    await page.waitForTimeout(200);
    await page.click('.ant-dropdown-menu-item:has-text("方块")');
    await page.waitForTimeout(500);

    // Property panel should show the object controls
    await expect(page.getByText('落回地面')).toBeVisible();
    await expect(page.getByText('整体缩放')).toBeVisible();
  });

  test('E2E-005: drop to ground sets correct Y position', async ({ page }) => {
    // Add a box and move it up
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().addObject('box', { x: 0, y: 5, z: 0 });
    });
    await page.waitForTimeout(500);

    // Click drop to ground
    await page.click('button:has-text("落回地面")');
    await page.waitForTimeout(300);

    const state = await store(page);
    expect(state.objects[0].position.y).toBe(0.5); // box half-height
  });

  test('E2E-006: transform updates store via simulate drag flow', async ({ page }) => {
    // Add object
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().addObject('box', { x: 0, y: 0, z: 0 });
    });
    await page.waitForTimeout(300);

    const stateBefore = await store(page);
    const id = stateBefore.objects[0].id;
    expect(stateBefore.objects[0].position).toEqual({ x: 0, y: 0, z: 0 });

    // Simulate a drag: saveHistory then updateTransform (as handleTransformEnd would do)
    await page.evaluate((objId: string) => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().saveHistory();
      store.getState().updateTransform(objId, { x: 3, y: 2, z: -1 });
    }, id);
    await page.waitForTimeout(300);

    const stateAfter = await store(page);
    const obj = stateAfter.objects.find((o: any) => o.id === id);
    expect(obj).toBeTruthy();
    expect(obj.position).toEqual({ x: 3, y: 2, z: -1 });
  });

  test('E2E-007: undo restores position after transform', async ({ page }) => {
    // Add object and transform it
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().addObject('box', { x: 0, y: 0, z: 0 });
    });
    await page.waitForTimeout(200);

    const state1 = await store(page);
    const id = state1.objects[0].id;

    // Do a transform (simulating drag start → drag end)
    await page.evaluate((objId: string) => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().saveHistory();
      store.getState().updateTransform(objId, { y: 5 });
    }, id);
    await page.waitForTimeout(200);

    const state2 = await store(page);
    expect(state2.objects[0].position.y).toBe(5);

    // Undo
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().undo();
    });
    await page.waitForTimeout(200);

    const state3 = await store(page);
    const restored = state3.objects.find((o: any) => o.id === id);
    expect(restored).toBeTruthy();
    expect(restored.position.y).toBe(0);
  });

  test('E2E-008: canvas click selects object', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().addObject('box', { x: 0, y: 0, z: 0 });
    });
    await page.waitForTimeout(300);

    // Deselect by clicking empty area
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().selectObject(null);
    });
    await page.waitForTimeout(100);
    const deselected = await store(page);
    expect(deselected.selectedId).toBeNull();

    // Click center of canvas (where the box should be)
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
      await page.waitForTimeout(300);

      const state = await store(page);
      // Object at (0,0,0) or nearby should be selected when clicking center
      // Note: This depends on camera angle and object position
      expect(state.selectedId).toBeTruthy();
    }
  });

  test('E2E-009: gizmo drag simulates correct end position', async ({ page }) => {
    // This test simulates the full drag flow:
    // 1. saveHistory (drag start)
    // 2. Multiple position updates during drag (simulated by onObjectChange tracking)
    // 3. Final position sync (drag end via onMouseUp)

    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().addObject('box', { x: 0, y: 0, z: 0 });
    });
    await page.waitForTimeout(200);

    const state1 = await store(page);
    const id = state1.objects[0].id;
    const initialY = state1.objects[0].position.y;

    // Simulate: drag start saves history, then final position is synced on mouseUp
    await page.evaluate((objId: string) => {
      const store = (window as any).__ZUSTAND_STORE__;
      const obj = store.getState().objects.find((o: any) => o.id === objId);
      if (!obj) throw new Error('Object not found');

      // Drag start
      store.getState().saveHistory();

      // During drag, TransformControls moves the object visually (no store updates)
      // On mouseUp, the final position is synced:
      store.getState().updateTransform(objId, { y: 4.2 }, undefined, undefined);
    }, id);
    await page.waitForTimeout(200);

    const state2 = await store(page);
    const obj = state2.objects.find((o: any) => o.id === id);
    expect(obj.position.y).not.toBe(initialY);
    expect(obj.position.y).toBe(4.2);

    // Verify the object didn't snap back (position is not initial)
    expect(obj.position.y).not.toBe(0);
  });

  test('E2E-010: multiple sequential drags accumulate correctly', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().addObject('box', { x: 0, y: 0, z: 0 });
    });
    await page.waitForTimeout(200);

    const state1 = await store(page);
    const id = state1.objects[0].id;

    // First drag
    await page.evaluate((objId: string) => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().saveHistory();
      store.getState().updateTransform(objId, { x: 2 }, undefined, undefined);
    }, id);
    await page.waitForTimeout(100);

    // Second drag
    await page.evaluate((objId: string) => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().saveHistory();
      store.getState().updateTransform(objId, { x: 5 }, undefined, undefined);
    }, id);
    await page.waitForTimeout(100);

    const state2 = await store(page);
    const obj = state2.objects.find((o: any) => o.id === id);
    expect(obj.position.x).toBe(5);

    // Undo twice should go back to original
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().undo();
    });
    await page.waitForTimeout(100);

    const state3 = await store(page);
    const after1undo = state3.objects.find((o: any) => o.id === id);
    expect(after1undo.position.x).toBe(2);

    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      store.getState().undo();
    });
    await page.waitForTimeout(100);

    const state4 = await store(page);
    const after2undo = state4.objects.find((o: any) => o.id === id);
    expect(after2undo.position.x).toBe(0);
  });
});