const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. 主页
    console.log('访问主页...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '1-homepage-top.png'), fullPage: false });
    console.log('✓ 主页顶部截图完成');

    // 向下滚动
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, '2-homepage-scrolled.png'), fullPage: false });
    console.log('✓ 主页滚动后截图完成');

    // 2. 日记列表页
    console.log('访问日记列表页...');
    await page.goto('http://localhost:5173/diary');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '3-diary-list.png'), fullPage: true });
    console.log('✓ 日记列表页截图完成');

    // 3. 单篇日记页
    console.log('访问单篇日记页...');
    await page.goto('http://localhost:5173/diary/1');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '4-diary-post-top.png'), fullPage: false });
    console.log('✓ 日记详情页顶部截图完成');

    // 滚动到评论区
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, '5-diary-post-comments.png'), fullPage: false });
    console.log('✓ 日记评论区截图完成');

    // 4. 成长时间线页
    console.log('访问成长时间线页...');
    await page.goto('http://localhost:5173/growth');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '6-growth-timeline.png'), fullPage: true });
    console.log('✓ 成长时间线页截图完成');

    // 5. 留言板页
    console.log('访问留言板页...');
    await page.goto('http://localhost:5173/guestbook');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '7-guestbook.png'), fullPage: true });
    console.log('✓ 留言板页截图完成');

    // 6. 关于我页
    console.log('访问关于我页...');
    await page.goto('http://localhost:5173/about');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '8-about.png'), fullPage: true });
    console.log('✓ 关于我页截图完成');

    console.log('\n所有截图已保存到 screenshots 目录');
  } catch (error) {
    console.error('截图过程中出错:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
