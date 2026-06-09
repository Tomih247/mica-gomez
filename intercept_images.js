const { chromium } = require('playwright-core');
const fs = require('fs');

async function downloadWithIntercept() {
  let browser;
  const savedImages = {};
  
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Intercept image responses
    context.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      if ((contentType.includes('image') || url.includes('.jpg') || url.includes('.webp')) && 
          (url.includes('fbcdn.net') || url.includes('cdninstagram.com')) &&
          !url.includes('emoji')) {
        try {
          const buffer = await response.body();
          if (buffer.length > 5000) { // skip tiny images
            const key = Object.keys(savedImages).length;
            savedImages[key] = { url, buffer, size: buffer.length };
          }
        } catch(e) {}
      }
    });
    
    const page = await context.newPage();
    await page.goto('https://www.instagram.com/gomezmica_/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    if (!fs.existsSync('assets')) fs.mkdirSync('assets');
    
    for (const [key, img] of Object.entries(savedImages)) {
      const ext = img.url.includes('.webp') ? 'webp' : 'jpg';
      const dest = `assets/ig_${key}.${ext}`;
      fs.writeFileSync(dest, img.buffer);
      console.log(`Saved: ${dest} (${img.size} bytes) from ${img.url.substring(0,80)}...`);
    }
    
    console.log(`Total: ${Object.keys(savedImages).length} images`);
    
  } catch(e) {
    console.log('ERROR:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

downloadWithIntercept();
