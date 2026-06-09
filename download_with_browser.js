const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function downloadWithBrowser() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto('https://www.instagram.com/gomezmica_/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Get all image srcs from the page
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        w: img.naturalWidth
      })).filter(i => i.src && !i.src.startsWith('data:'));
    });
    
    // Download each image using page.evaluate with fetch
    if (!fs.existsSync('assets')) fs.mkdirSync('assets');
    
    for (let i = 0; i < Math.min(images.length, 15); i++) {
      const img = images[i];
      try {
        const buffer = await page.evaluate(async (url) => {
          const resp = await fetch(url, { credentials: 'include' });
          const arr = await resp.arrayBuffer();
          return Array.from(new Uint8Array(arr));
        }, img.src);
        
        const filename = `assets/img_${i}_${img.alt.replace(/[^a-zA-Z0-9]/g, '_').substring(0,20) || 'post'}.jpg`;
        fs.writeFileSync(filename, Buffer.from(buffer));
        console.log(`OK: ${filename} (${buffer.length} bytes) alt="${img.alt}"`);
      } catch(e) {
        console.log(`FAIL img ${i}: ${e.message}`);
      }
    }
    
  } catch(e) {
    console.log('ERROR:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

downloadWithBrowser();
