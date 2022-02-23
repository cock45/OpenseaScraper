// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Scrapes all collections from the Rankings page at https://opensea.io/rankings?sortBy=total_volume
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
  const { nbrOfPages, debug, logs, browserInstance } = { ...optionsDefault, ...optionsGiven };

  // init browser
  let browser = browserInstance;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: !debug, // when debug is true => headless should be false
      args: ['--start-maximized'],
    });
  }

  const page = await browser.newPage();
  const url = getUrl(period);
  logs && console.log("...opening url: " + url);
  await page.goto(url);

  logs && console.log("...🚧 waiting for cloudflare to resolve");
  await page.waitForSelector('.cf-browser-verification', { hidden: true });

  logs && console.log("...exposing helper functions through script tag")
  await page.addScriptTag({ path: require.resolve("../helpers/rankingsHelperFunctions.js") });

  logs && console.log("...scrolling to bottom and fetching collections.");
  let dict = await _scrollToBottomAndFetchCollections(page);

  // scrape n pages
  for (let i = 0; i < nbrOfPages - 1; i++) {
    await _clickNextPageButton(page);
    await page.waitForSelector('.Image--image');
    // logs && console.log("Page: " + i + " -> Items fetched so far: " + Object.keys(dict).length);
    dict = await _scrollToBottomAndFetchCollections(page);
  }

  await browser.close();

  // transform dict to array + remove invalid results
  const filtered = Object.values(dict).filter(o => o.rank !== 0 && o.name !== "");
  logs && console.log("...🥳 DONE. Total Collections fetched: " + Object.keys(dict).length);
  // order by rank
  return filtered.sort((a, b) => a.rank - b.rank);
}

module.exports = rankings;

/**
 * Helper Functions for OpenseaScraper.rankings()
 */
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
  console.log("type => ", type);
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