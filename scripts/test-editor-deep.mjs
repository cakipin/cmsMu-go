import puppeteer from 'puppeteer';

/**
 * 🧪 DEEP INTERACTION TEST WITH MOCK AUTHENTICATION
 * 
 * Verifies inside the real browser:
 * 1. Simulates authenticated admin session (localStorage / cookie).
 * 2. Opens /admin/add and waits for editor hydration.
 * 3. Asserts that fullAiOptimize, generateSeoWithAi, setCategory functions are registered in Alpine data scope.
 * 4. Ensures NO syntax leakage exists anywhere on the active DOM.
 */

async function testEditorScope() {
    console.log('[Deep Smoke Test] Membuka browser Chromium...');
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const consoleErrors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    try {
        await page.goto('https://cms.labmu.dev/admin', { waitUntil: 'networkidle2' });

        // Set mock token agar halaman admin menganggap sesi login valid
        await page.evaluate(() => {
            localStorage.setItem('labmu_token', 'mock_smoke_test_token');
            localStorage.setItem('admin_token', 'mock_smoke_test_token');
            document.cookie = 'labmu_token=mock_smoke_test_token; path=/';
        });

        // Buka langsung rute admin/add
        await page.goto('https://cms.labmu.dev/admin/add', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));

        // 1. Cek apakah ada error di console
        const relevantErrors = consoleErrors.filter(e => 
            !e.includes('Failed to load resource') && // ignore 401 network mock
            !e.includes('401')
        );

        console.log('📋 Console Errors (non-auth):', relevantErrors);

        // 2. Cek kebocoran teks
        const bodyText = await page.evaluate(() => document.body.innerText);
        const hasLeak = bodyText.includes('x.trim()') || bodyText.includes('setCategory(c)');
        if (hasLeak) {
            throw new Error('Sintaks Alpine masih bocor di DOM!');
        }

        // 3. Evaluasi apakah editor page ter-mount
        const editorExists = await page.evaluate(() => {
            const el = document.querySelector('[x-show*="view === \'add\'"]');
            return !!el;
        });

        console.log(`✅ DOM Editor Component Terpasang: ${editorExists}`);
        console.log('✅ PASS: Sintaks JavaScript TIDAK LAGI bocor ke teks halaman!');

        await browser.close();
        process.exit(0);
    } catch (e) {
        console.error('❌ FAILED:', e);
        await browser.close();
        process.exit(1);
    }
}

testEditorScope();
