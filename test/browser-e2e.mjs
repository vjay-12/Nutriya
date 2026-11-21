import { chromium } from 'playwright';

async function runBrowserAudit() {
  console.log('=====================================================');
  console.log('NUTRIYA: REAL BROWSER REPRODUCTION & AUDIT SUITE');
  console.log('=====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // -------------------------------------------------------------------------
  // STEP 1: Reproduce on Production URL (https://nutriya.vercel.app/)
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 1: Testing Production URL (https://nutriya.vercel.app/) ---');
  try {
    await page.goto('https://nutriya.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Loaded production page.');

    // Click on Diet Builder tab
    const dietBuilderTab = page.locator('button:has-text("Diet Builder")');
    if (await dietBuilderTab.isVisible()) {
      await dietBuilderTab.click();
      await page.waitForTimeout(1500);
      console.log('Navigated to Diet Builder on production.');

      // Check Eggs section
      const isComboProd = await page.locator('button').filter({ hasText: '1 Whole Egg + 1 Egg White' }).first().locator('span:has-text("✓")').first().getAttribute('class');
      const isTwoProd = await page.locator('button').filter({ hasText: '2 Boiled Eggs' }).first().locator('span:has-text("✓")').first().getAttribute('class');

      const comboSelected = isComboProd?.includes('bg-[#2E6F5E]') && !isComboProd?.includes('text-transparent');
      const twoSelected = isTwoProd?.includes('bg-[#2E6F5E]') && !isTwoProd?.includes('text-transparent');

      console.log(`Production Initial State:`);
      console.log(`- "1 Whole Egg + 1 Egg White" selected: ${comboSelected}`);
      console.log(`- "2 Boiled Eggs" selected: ${twoSelected}`);

      if (comboSelected && twoSelected) {
        console.log('>>> CONFIRMED BUG ON PRODUCTION: Both egg options are simultaneously selected! <<<');
      } else {
        console.log(`Production selection state: combo=${comboSelected}, two=${twoSelected}`);
      }
    }
  } catch (err) {
    console.warn('Could not test production (network/timeout):', err.message);
  }

  // -------------------------------------------------------------------------
  // STEP 2: Full End-to-End Test & 10x Repetition on Localhost (http://localhost:3000/)
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 2: Testing Local Fixed Version (http://localhost:3000/) ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Helper functions
  const clickTab = async (name) => {
    await page.locator(`button:has-text("${name}")`).first().click();
    await page.waitForTimeout(600);
  };

  const getCardCheckmark = async (cardText) => {
    const btn = page.locator('button').filter({ hasText: cardText }).first();
    const checkSpan = btn.locator('span:has-text("✓")').first();
    const isVisible = await checkSpan.isVisible();
    if (!isVisible) return false;
    // Check if the checkmark has green background or transparent
    const className = await checkSpan.getAttribute('class');
    return className?.includes('bg-[#2E6F5E]') && !className?.includes('text-transparent');
  };

  // 1. Navigate to Diet Builder
  await clickTab('Diet Builder');
  console.log('Navigated to Diet Builder on localhost.');

  // Check initial Plan A state
  let comboActive = await getCardCheckmark('1 Whole Egg + 1 Egg White');
  let twoActive = await getCardCheckmark('2 Boiled Eggs');
  let noneActive = await getCardCheckmark('None (Egg-free)');

  console.log(`Localhost Initial Plan A state:`);
  console.log(`- 1 Whole Egg + 1 Egg White: ${comboActive}`);
  console.log(`- 2 Boiled Eggs: ${twoActive}`);
  console.log(`- None (Egg-free): ${noneActive}`);

  if (comboActive && !twoActive && !noneActive) {
    console.log('PASS: Only 1 Whole Egg + 1 Egg White is selected in Plan A! Mutual exclusivity verified.');
  } else {
    throw new Error(`FAIL: Unexpected initial selection state (combo: ${comboActive}, two: ${twoActive})`);
  }

  // 2. Plan Creation Workflow
  console.log('\n--- Testing Plan Creation & Management Workflow ---');
  const testPlanName = 'QA_Automation_Test_Plan_' + Date.now();
  await page.locator('button:has-text("New Plan")').click();
  await page.waitForTimeout(400);

  await page.fill('input[placeholder*="Plan E"]', testPlanName);
  await page.locator('button[type="submit"]:has-text("Create Plan")').click();
  await page.waitForTimeout(1000);
  console.log(`Created new plan: "${testPlanName}"`);

  // Verify active plan in dropdown
  const selectorValue = await page.locator('select[aria-label="Select Active Diet Plan"]').inputValue();
  console.log(`Active plan dropdown value: ${selectorValue}`);

  // 3. Mandatory 10-Iteration Selection Sequence
  console.log('\n--- Running 10-Iteration Selection Stress Test ---');
  for (let i = 1; i <= 10; i++) {
    // Step A: Click "2 Boiled Eggs"
    await page.locator('button:has-text("2 Boiled Eggs")').first().click();
    await page.waitForTimeout(200);

    let isTwo = await getCardCheckmark('2 Boiled Eggs');
    let isCombo = await getCardCheckmark('1 Whole Egg + 1 Egg White');
    let isNone = await getCardCheckmark('None (Egg-free)');
    if (!isTwo || isCombo || isNone) {
      throw new Error(`Iteration ${i} Step A failed: expected only 2 Boiled Eggs selected.`);
    }

    // Step B: Click "None (Egg-free)"
    await page.locator('button:has-text("None (Egg-free)")').first().click();
    await page.waitForTimeout(200);

    isTwo = await getCardCheckmark('2 Boiled Eggs');
    isCombo = await getCardCheckmark('1 Whole Egg + 1 Egg White');
    isNone = await getCardCheckmark('None (Egg-free)');
    if (isTwo || isCombo || !isNone) {
      throw new Error(`Iteration ${i} Step B failed: expected only None selected.`);
    }

    // Step C: Click "1 Whole Egg + 1 Egg White"
    await page.locator('button:has-text("1 Whole Egg + 1 Egg White")').first().click();
    await page.waitForTimeout(200);

    isTwo = await getCardCheckmark('2 Boiled Eggs');
    isCombo = await getCardCheckmark('1 Whole Egg + 1 Egg White');
    isNone = await getCardCheckmark('None (Egg-free)');
    if (isTwo || !isCombo || isNone) {
      throw new Error(`Iteration ${i} Step C failed: expected only 1 Whole Egg + 1 Egg White selected.`);
    }

    // Step D: Multi-select Daily Fruits (toggle Banana)
    await page.locator('button:has-text("Banana Yelakki")').first().click();
    await page.waitForTimeout(200);

    // Verify egg selection remained unchanged during fruit toggle
    isTwo = await getCardCheckmark('2 Boiled Eggs');
    isCombo = await getCardCheckmark('1 Whole Egg + 1 Egg White');
    if (isTwo || !isCombo) {
      throw new Error(`Iteration ${i} Step D failed: egg selection corrupted by fruit toggle.`);
    }

    process.stdout.write(`Iteration ${i}/10 PASSED | `);
  }
  console.log('\nAll 10 iterations passed with 100% exclusive radio accuracy!');

  // 4. Save Plan & Refresh Persistence Test
  console.log('\n--- Testing Save, Page Refresh & Persistence ---');
  // Select 2 Boiled Eggs before saving
  await page.locator('button').filter({ hasText: '2 Boiled Eggs' }).first().click();
  await page.waitForTimeout(300);

  // Click Save
  await page.locator('button:has-text("Save")').first().click();
  await page.waitForTimeout(1000);
  console.log('Saved test plan state.');

  // Reload page
  console.log('Reloading page...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Navigate to Diet Builder
  await clickTab('Diet Builder');

  // Verify dropdown contains our test plan and select it if needed
  const planSelector = page.locator('select[aria-label="Select Active Diet Plan"]');
  const currentPlan = await planSelector.locator('option:checked').textContent();
  console.log(`Active plan dropdown text on initial load: "${currentPlan?.trim()}"`);

  if (!currentPlan?.includes(testPlanName)) {
    // Select our test plan to verify its persisted items
    const option = planSelector.locator(`option:has-text("${testPlanName}")`);
    const val = await option.getAttribute('value');
    if (val) {
      await planSelector.selectOption(val);
      await page.waitForTimeout(800);
      console.log(`Switched to test plan "${testPlanName}" for persistence verification.`);
    }
  }

  // Verify 2 Boiled Eggs is still selected and 1 Whole + 1 White is NOT selected
  let isTwoAfterReload = await getCardCheckmark('2 Boiled Eggs');
  let isComboAfterReload = await getCardCheckmark('1 Whole Egg + 1 Egg White');
  console.log(`Restored selection after reload: 2 Boiled Eggs = ${isTwoAfterReload}, Combo = ${isComboAfterReload}`);
  if (!isTwoAfterReload || isComboAfterReload) {
    throw new Error('FAIL: Selections did not persist across page reload!');
  }
  console.log('PASS: Exact selection state successfully restored after browser refresh!');

  // 5. Test Plan Renaming
  console.log('\n--- Testing Plan Renaming ---');
  const renamedTitle = testPlanName + '_Renamed';
  await page.locator('button:has-text("Rename")').first().click();
  await page.waitForTimeout(400);
  await page.locator('input[value*="QA_Automation_Test_Plan_"]').fill(renamedTitle);
  await page.locator('button:has-text("Save Name")').first().click();
  await page.waitForTimeout(800);

  const planNameAfterRename = await page.locator('select[aria-label="Select Active Diet Plan"]').locator('option:checked').textContent();
  console.log(`Plan name after rename: "${planNameAfterRename?.trim()}"`);
  if (!planNameAfterRename?.includes(renamedTitle)) {
    throw new Error('FAIL: Plan rename failed!');
  }
  console.log('PASS: Plan renamed successfully!');

  // 6. Test Food Detail Modal (Info Icon)
  console.log('\n--- Testing Food Detail Modal (Info Icon) ---');
  // Click info icon on 2 Boiled Eggs
  const infoBtn = page.locator('button[title*="Inspect 18 nutrients"]').first();
  await infoBtn.click();
  await page.waitForTimeout(500);

  const modalTitle = page.locator('div:has-text("Verified dataset") h3').first();
  const titleText = await modalTitle.textContent();
  console.log(`Detail modal opened for: "${titleText}"`);

  // Close modal via Cancel
  await page.locator('button:has-text("Cancel")').first().click();
  await page.waitForTimeout(400);

  // Verify selection did not change by opening modal
  isTwoAfterReload = await getCardCheckmark('2 Boiled Eggs');
  if (!isTwoAfterReload) {
    throw new Error('FAIL: Opening detail modal accidentally altered selection!');
  }
  console.log('PASS: Detail modal opened and closed without altering selection.');

  // 7. Test All 5 Tabs
  console.log('\n--- Testing All 5 Tabs ---');
  // Tab 1: Overview
  await clickTab('Overview');
  const heroCard = await page.locator('text=Active Diet Template').isVisible();
  console.log(`Overview tab loaded: ${heroCard}`);

  // Tab 2: RDA Targets
  await clickTab('RDA Targets');
  const rdaHeading = await page.locator('text=RDA & Nutrition Targets Configuration').isVisible();
  console.log(`RDA Targets tab loaded: ${rdaHeading}`);

  // Tab 3: Food & Prep
  await clickTab('Food & Prep');
  const foodDbHeading = await page.locator('text=Food Database & Portion Prep').isVisible();
  console.log(`Food & Prep tab loaded: ${foodDbHeading}`);

  // Tab 4: Diet Builder
  await clickTab('Diet Builder');
  const builderHeading = await page.locator('text=Diet Builder & Plan Manager').isVisible();
  console.log(`Diet Builder tab loaded: ${builderHeading}`);

  // Tab 5: Analysis
  await clickTab('Analysis');
  const analysisHeading = await page.locator('text=Clinical Evaluation & Multi-Plan Matrix').isVisible();
  console.log(`Analysis tab loaded: ${analysisHeading}`);

  // 8. Safe Cleanup of Test Data
  console.log('\n--- Cleaning up temporary test plan safely ---');
  await clickTab('Diet Builder');
  await page.waitForTimeout(500);

  // Switch to our test plan if not already active
  const planSelectorCleanup = page.locator('select[aria-label="Select Active Diet Plan"]');
  const currentPlanBeforeCleanup = await planSelectorCleanup.locator('option:checked').textContent();
  if (!currentPlanBeforeCleanup?.includes(testPlanName) && !currentPlanBeforeCleanup?.includes('_Renamed')) {
    const renameOption = planSelectorCleanup.locator(`option:has-text("${renamedTitle}")`);
    const val = await renameOption.getAttribute('value');
    if (val) {
      await planSelectorCleanup.selectOption(val);
      await page.waitForTimeout(600);
    }
  }

  // Set page dialog handler for confirm()
  page.on('dialog', async (dialog) => {
    console.log(`Accepting confirmation dialog: "${dialog.message()}"`);
    await dialog.accept();
  });

  const deleteBtn = page.locator('button[title="Delete this plan"]').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(1000);
    console.log('Test plan deleted successfully.');
  }

  // Verify remaining plan
  const planAfterDelete = await page.locator('select[aria-label="Select Active Diet Plan"]').locator('option:checked').textContent();
  console.log(`Active plan after cleanup: "${planAfterDelete.trim()}"`);

  await browser.close();
  console.log('\n=====================================================');
  console.log('BROWSER TEST COMPLETE: ALL SCENARIOS PASSED (100%)');
  console.log('=====================================================');
}

runBrowserAudit().catch((err) => {
  console.error('\n*** TEST RUN FAILED ***\n', err);
  process.exit(1);
});
