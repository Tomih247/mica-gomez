const { chromium } = require('playwright-core');

async function getInstagramProfile() {
  let browser;
  try {
    browser = await chromium.launch({ 
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox']
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    await page.goto('https://www.instagram.com/gomezmica_/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const data = await page.evaluate(() => {
      const metaImage = document.querySelector('meta[property="og:image"]');
      const metaTitle = document.querySelector('meta[property="og:title"]');
      const metaDesc = document.querySelector('meta[name="description"]');
      
      return {
        ogImage: metaImage ? metaImage.content : '',
        title: metaTitle ? metaTitle.content : '',
        description: metaDesc ? metaDesc.content : '',
        pageTitle: document.title,
        bodyText: document.body ? document.body.innerText.substring(0, 500) : ''
      };
    });
    
    console.log(JSON.stringify(data));
  } catch(e) {
    console.log(JSON.stringify({ error: e.message }));
  } finally {
    if (browser) await browser.close();
  }
}

getInstagramProfile();
