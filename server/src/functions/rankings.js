// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// load helper function to detect stealth plugin
const { warnIfNotUsingStealth } = require("../helpers/helperFunctions.js");

/**
 * Scrapes all collections from the Rankings page at https://opensea.io/rankings
 * options = {
 *   nbrOfPages: number of pages that should be scraped? (defaults to 1 Page = top 100 collections)
 *   debug: [true,false] enable debugging by launching chrome locally (omit headless mode)
 *   logs: [true,false] show logs in the console
 *   browserInstance: browser instance created with puppeteer.launch() (bring your own puppeteer instance)
 * }
 */
const rankings = async (type = "total", optionsGiven = {}) => {
  const optionsDefault = {
    debug: false,
    logs: false,
    browserInstance: undefined,
  };
  const options = { ...optionsDefault, ...optionsGiven };
  const { debug, logs, browserInstance } = options;
  const customPuppeteerProvided = Boolean(optionsGiven.browserInstance);
  logs && console.log(`=== OpenseaScraper.rankings() ===\n`);

  // init browser
  let browser = browserInstance;
  if (!customPuppeteerProvided) {
    browser = await puppeteer.launch({
      headless: !debug, // when debug is true => headless should be false
      args: ['--start-maximized'],
    });
  }
  customPuppeteerProvided && warnIfNotUsingStealth(browser);

  const page = await browser.newPage();
  const url = getUrl(type);
  logs && console.log("...opening url: " + url);
  await page.goto(url);

  logs && console.log("...🚧 waiting for cloudflare to resolve");
  await page.waitForSelector('.cf-browser-verification', { hidden: true });

  logs && console.log("extracting __NEXT_DATA variable");
  const __NEXT_DATA__ = await page.evaluate(() => {
    const nextDataStr = document.getElementById("__NEXT_DATA__").innerText;
    return JSON.parse(nextDataStr);
  });

  // extract relevant info
  const top100 = _parseNextDataVarible(__NEXT_DATA__);
  logs && console.log(`🥳 DONE. Total ${top100.length} Collections fetched: `);
  return top100;
}

function _parseNextDataVarible(__NEXT_DATA__) {
  const extractFloorPrice = (statsV2) => {
    try {
      return {
        amount: Number(statsV2.floorPrice.eth),
        currency: "ETH",
      }
    } catch (err) {
      return null;
    }
  }
  const extractCollection = (obj) => {

    return {
      name: obj.name,
      slug: obj.slug,
      logo: obj.logo,
      isVerified: obj.isVerified,
      nativeCurrency: obj.nativePaymentAsset.symbol,
      floorPrice: obj.statsV2.floorPrice ? Number(obj.statsV2.floorPrice.unit) : 0,
      numOwners: Number(obj.statsV2.numOwners),
      totalSupply: Number(obj.statsV2.totalSupply),
      oneDayVolume: Number(obj.statsV2.oneDayVolume.unit),
      sevenDayVolume: Number(obj.statsV2.sevenDayVolume.unit),
      thirtyDayVolume: Number(obj.statsV2.thirtyDayVolume),
      oneDayChange: Number(obj.statsV2.oneDayChange),
      sevenDayChange: Number(obj.statsV2.sevenDayChange),
      thirtyDayChange: Number(obj.statsV2.thirtyDayChange),
      totalVolume: Number(obj.statsV2.totalVolume.unit)
      // statsV2: obj.statsV2, // 🚧 comment back in if you need additional stats
    };
  }
  return __NEXT_DATA__.props.relayCache[0][1].json.data.rankings.edges.map(obj => extractCollection(obj.node));
}

function getUrl(type) {
  if (type === "1day") {
    return "https://opensea.io/rankings?sortBy=one_day_volume";

  } else if (type === "7days") {
    return "https://opensea.io/rankings?sortBy=seven_day_volume";

  } else if (type === "30days") {
    return "https://opensea.io/rankings?sortBy=thirty_day_volume";

  } else if (type === "all") {
    return "https://opensea.io/rankings?sortBy=total_volume";

  } else {
    throw new Error(`Invalid type provided. Expected: 24h,7d,30d,total. Got: ${type}`);
  }
}
module.exports = rankings;

