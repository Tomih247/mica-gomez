const { chromium } = require('playwright-core');
const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    };
    https.get(url, options, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function getInstagramData() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto('https://www.instagram.com/gomezmica_/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    
    const data = await page.evaluate(() => {
      // Get all images on the page
      const allImgs = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight
      }));
      
      // Get post links
      const postLinks = Array.from(document.querySelectorAll('a[href*="/p/"]')).map(a => a.href).slice(0, 9);
      
      return { allImgs, postLinks };
    });
    
    console.log('POST LINKS:', JSON.stringify(data.postLinks));
    console.log('IMAGES:', JSON.stringify(data.allImgs.filter(i => i.src && !i.src.startsWith('data:')).slice(0, 15)));
    
  } catch(e) {
    console.log('ERROR:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

getInstagramData();
