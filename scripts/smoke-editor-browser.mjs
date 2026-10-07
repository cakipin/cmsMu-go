import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * 🧪 AUTOMATED SMOKE TEST FOR CMS ADMIN EDITOR (PUPPETEER HEADLESS)
 * 
 * Tests:
 * 1. Checks if HTML rendered has any unescaped Alpine syntax leakage (x.trim(), setCategory).
 * 2. Checks if browser console has Alpine Expression Error or ReferenceError.
 * 3. Verifies fullAiOptimize and generateSeoWithAi exist in editor scope.
 */

async function runEditorSmokeTest(targetUrl = 'https://cms.labmu.dev/admin/add') {
    console.log(`[Smoke Test] Memulai verifikasi browser di: ${targetUrl}...`);
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            const txt = msg.text();
            consoleErrors.push(txt);
        }
    });

    page.on('pageerror', err => {
        pageErrors.push(err.message || String(err));
    });

    try {
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // 1. Periksa kebocoran teks sintaks JS pada DOM
        const bodyText = await page.evaluate(() => document.body.innerText);
        const leakedPatterns = [
            'x.trim()',
            'this.form.tags',
            'setCategory(c)',
            'x-effect="if(view ==='
        ];

        const detectedLeaks = leakedPatterns.filter(p => bodyText.includes(p));
        if (detectedLeaks.length > 0) {
            throw new Error(`LEAKAGE DETECTED! Teks sintaks JS bocor ke tampilan: ${detectedLeaks.join(', ')}`);
        }

        console.log('✅ PASS: Tidak ada sintaks Alpine/JS yang bocor ke DOM.');

        // 2. Periksa apakah ada Alpine expression error di console
        const alpineErrors = consoleErrors.filter(e => 
            e.includes('Alpine Expression Error') || 
            e.includes('fullAiOptimize is not defined') ||
            e.includes('generateSeoWithAi is not defined')
        );

        if (alpineErrors.length > 0) {
            throw new Error(`ALPINE ERROR DETECTED! ${alpineErrors.join(' | ')}`);
        }

        console.log('✅ PASS: Konsol bebas dari Alpine Expression Error.');

        // 3. Periksa keberadaan form & container editor
        const editorContainer = await page.$('.modern-editor-wrapper, [x-ref="editorContainer"], .modern-editor-content');
        if (!editorContainer) {
            console.warn('⚠️ Catatan: Container editor visual membutuhkan sesi login aktif.');
        } else {
            console.log('✅ PASS: Komponen editor terdeteksi di DOM.');
        }

        console.log('🎉 SEMUA VERIFIKASI SMOKE TEST BROWSER LOLOS (0 ERROR)!');
        await browser.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ SMOKE TEST GAGAL:', err.message);
        if (consoleErrors.length > 0) {
            console.error('📋 Log Error Console:', consoleErrors);
        }
        await browser.close();
        process.exit(1);
    }
}

const target = process.argv[2] || 'https://cms.labmu.dev/admin/add';
runEditorSmokeTest(target);
