const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Scrapes all collections from the Rankings page at https://opensea.io/rankings
 * options = {
 *   nbrOfPages: number of pages that should be scraped? (defaults to 1 Page = top 100 collections)
 *   debug: [true,false] enable debugging by launching chrome locally (omit headless mode)
 *   logs: [true,false] show logs in the console
 *   browserInstance: browser instance created with puppeteer.launch() (bring your own puppeteer instance)
 * }
 */
const rankings = async (period = "total", optionsGiven = {}) => {
  const optionsDefault = {
    nbrOfPages: 1,
    debug: false,
    logs: false,
    browserInstance: undefined,
  };
  const options = { ...optionsDefault, ...optionsGiven };
  const { nbrOfPages, debug, logs, browserInstance } = options;

  // init browser
  let browser = browserInstance;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: !debug, // when debug is true => headless should be false
      args: ['--window-size=1920,1080'],
    });
  }

  const page = await browser.newPage();
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
    // keep in mind inside the browser context we have the global variable "dict" initialized
    // defined inside src/helpers/rankingsHelperFunctions.js
    var scrollTop = -1;
    const interval = setInterval(() => {
      console.log("another scrol... dict.length = " + Object.keys(dict).length);
      window.scrollBy(0, 50);
      // fetchCollections is a function that is exposed through page.addScript() and
      // is defined inside src/helpers/rankingsHelperFunctions.js
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
