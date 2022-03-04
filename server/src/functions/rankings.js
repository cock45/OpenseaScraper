const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
// const ProxyChain = require('proxy-chain');

const rankings = async (period = "total", optionsGiven = {}) => {
  const optionsDefault = {
    nbrOfPages: 1,
    debug: false,
    logs: false,
    browserInstance: undefined,
  };
  const options = { ...optionsDefault, ...optionsGiven };
  const { nbrOfPages, debug, logs, browserInstance } = options;

  const proxyList = [
    '209.127.191.180:9279',
    '45.142.28.83:8094',
    '45.136.231.43:7099',
    '45.137.60.112:6640',
    '45.136.228.85:6140',
    '45.134.184.43:6079 ',
    '193.8.56.119:9183 ',
    '45.140.13.124:9137',
    '45.136.231.85:7141',
    '45.134.184.201:6237',
  ];

  let browser = browserInstance;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: !debug, // when debug is true => headless should be false
      args: [
        '--window-size=1920,1080',
        `--proxy-server=${proxyList[0]}`,
        '--no-sandbox',
        // '--ignore-certificate-errors',
      ],
      executablePath: '/var/www/OpenseaScraper/server/node_modules/puppeteer/.local-chromium/linux-90192/chrome-linux/chrome'
      // executablePath: '/usr/bin/chromium-browser'
    });
  }

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en'
  });

  await page.authenticate({
    username: 'ijfnbper',
    password: 'lxloxxj2s23k'
  });

  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36');

  const url = getUrl(period);
  await page.goto(url);
  await page.waitForSelector('.cf-browser-verification', { hidden: true });
  await page.addScriptTag({ path: require.resolve("../helpers/rankingsHelperFunctions.js") });

  let dict = [];
  if (nbrOfPages == 1) {
    dict = await _scrollToBottomAndFetchCollections(page);
  } else {
    for (let i = 1; i < nbrOfPages; i++) {
      await _clickNextPageButton(page);
      if (i == nbrOfPages - 1) {
        await page.waitForSelector('.Image--image');
        dict = await _scrollToBottomAndFetchCollections(page);
      }
    }
  }
  await browser.close();

  const filtered = Object.values(dict).filter(o => o.rank !== 0 && o.name !== "");
  return filtered.sort((a, b) => a.rank - b.rank);
}

async function _clickNextPageButton(page) {
  await page.click('[value=arrow_forward_ios]');
}
async function _scrollToBottomAndFetchCollections(page) {
  return await page.evaluate(() => new Promise((resolve) => {
    var scrollTop = -1;
    const interval = setInterval(() => {
      window.scrollBy(0, 300);
      fetchCollections(dict);
      if (document.documentElement.scrollTop !== scrollTop) {
        scrollTop = document.documentElement.scrollTop;
        return;
      }
      clearInterval(interval);
      resolve(dict);
    }, 5);
  }));
}

function getUrl(type) {
  if (type === "1day") {
    return "https://opensea.io/rankings?sortBy=one_day_volume";

  } else if (type === "7days") {
    return "https://opensea.io/rankings?sortBy=seven_day_volume";

  } else if (type === "30days") {
    return "https://opensea.io/rankings?sortBy=thirty_day_volume";

  } else if (type === "total") {
    return "https://opensea.io/rankings?sortBy=total_volume";

  } else {
    throw new Error(`Invalid type provided. Expected: 24h,7d,30d,total. Got: ${type}`);
  }
}

module.exports = rankings;
