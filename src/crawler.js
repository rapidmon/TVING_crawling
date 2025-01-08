const puppeteer = require('puppeteer');

let cachedData = [];
let lastUpdated = null;

async function scrapeTvingData() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto('https://user.tving.com/pc/user/otherLogin.tving?loginType=10', { waitUntil: 'networkidle2' });
        await page.type('#a', 'heej0913'); // ID
        await page.type('#b', 'gmlwjd2630!'); // Password
        await page.click('#doLoginBtn');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('로그인 성공');

        await page.goto('https://www.tving.com/live', { waitUntil: 'networkidle2' });
        const liveData = await page.evaluate(() => {
            const items = document.querySelectorAll('.live-ranking-content-wrapper.cursor-pointer.w-full');
            return Array.from(items).map(item => {
                const texts = item.querySelectorAll('.atom-text-wrapper');
                if (texts.length === 3) {
                    return {
                        channel: texts[0]?.innerText.trim() || 'Unknown',
                        program: texts[1]?.innerText.trim() || 'Unknown',
                        viewership: texts[2]?.innerText.trim() || 'Unknown',
                    };
                }
                return null;
            }).filter(Boolean);
        });

        return liveData;
    } catch (error) {
        console.error('크롤링 오류:', error);
        return [];
    } finally {
        await browser.close();
    }
}

async function monitorData(interval = 60000) {
    console.log(`데이터 모니터링 시작 (주기: ${interval / 1000}초)`);

    while (true) {
        try {
            const newData = await scrapeTvingData();
            if (!cachedData.length || JSON.stringify(newData) !== JSON.stringify(cachedData)) {
                cachedData = newData;
                lastUpdated = new Date().toLocaleString();
                console.log(`데이터 갱신: ${lastUpdated}`);
            }
        } catch (error) {
            console.error('모니터링 오류:', error);
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }
}

function getCachedData() {
    return { data: cachedData, lastUpdated };
}

module.exports = { scrapeTvingData, monitorData, getCachedData };