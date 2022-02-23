/**
 * === HELPER FUNCTIONS FOR : OpenseaScraper.rankings() ===
 * These are all functions that need to be exposed inside
 * puppeteers page.evaluate() function (inside the chromium instance)
 * additionally to the functions we also need a global variable
 * "dict" that holds a dictionary of all scraped collections
 *
 * To make it more readable we outsource this to a seperate file,
 * then load the file via puppeteers page.addScriptTag() function
 */

// initialize dict global variable inside puppeteer chromium instance
// to save all scraped data
const dict = {};

// fetches collections that are currently visible on the page
// and save them to the passed dictionary, with the slug being the key.
// When a collection is already in the dict it will be overwritten.
function fetchCollections(dict) {
  const rowsNodeList = document.querySelectorAll('[role=list] > div > a');
  const rows = Array.prototype.slice.call(rowsNodeList);
  // const nextDataStr = document.getElementById("__NEXT_DATA__").innerText;
  // const __NEXT_DATA__ = JSON.parse(nextDataStr);
  // const rows = __NEXT_DATA__.props.relayCache[0][1].json.data.rankings.edges;

  rows.forEach(row => {
    const slug = _extractSlug(row);
    // const obj = row.node;
    // const slug = obj.slug;

    if (slug) { // if slug exists, override dict
      dict[slug] = {
        name: _extractName(row),
        slug: slug,
        logo: _extractLogo(row),
        rank: _extractRank(row),
        volume: _extractVolume(row),
        floorPrice: _extractFloorPrice(row),
        oneDayChange: _extractOneDayChange(row),
        sevenDayChange: _extractSevenDayChange(row),
        owners: _extractOwners(row),
        items: _extractItems(row),
      };
    }
  })
}
        // nativeCurrency: obj.nativePaymentAsset.symbol,
        // numOwners: Number(obj.statsV2.numOwners),
        // totalSupply: Number(obj.statsV2.totalSupply),
        // oneDayVolume: Number(obj.statsV2.oneDayVolume.unit),
        // sevenDayVolume: Number(obj.statsV2.sevenDayVolume.unit),
        // thirtyDayVolume: Number(obj.statsV2.thirtyDayVolume),
        // thirtyDayChange: Number(obj.statsV2.thirtyDayChange),
        // totalVolume: Number(obj.statsV2.totalVolume.unit)
function _extractRank(row) {
  try {
    // return Number(row.querySelector("div > div").innerText);
    return Number(row.innerText.split(/\D/)[0]);
  } catch(err) {
    return undefined;
  }
}
function _extractSlug(row) {
  try {
    const collectionUrlSplit = row.href.split("/");
    const slug = collectionUrlSplit[collectionUrlSplit.length - 1];
    // const collectionUrlSplit = row.querySelector('a').href.split("/");
    // const slug = collectionUrlSplit[collectionUrlSplit.length - 1];
    return slug;
  } catch(err) {
    return undefined;
  }
}
function _extractLogo(row) {
  try {
    return row.querySelector(".Image--image").src;
  } catch(err) {
    return undefined;
  }
}
function _extractName(row) {
  try {
    //return row.querySelector(".Ranking--collection-name-overflow").innerText;
    return row.children[0].children[2].children[0].innerText;
  } catch(err) {
    return undefined;
  }
}
function _extractFloorPrice(row) { // only ETH floor prices, otherwise uzndefined
  try {
    return row.children[4].children[0].children[1].innerText;
  } catch(err) {
    return undefined;
  }
}
function _extractVolume(row) {
  try {
    return row.children[1].children[0].children[1].innerText;
  } catch(err) {
    return undefined;
  }
}
function _extractOneDayChange(row) {
  try {
    // return row.children[0].children[2].children[0].children[0].innerText;
    return row.children[2].children[0].children[1].innerText;
  } catch(err) {
    return undefined;
  }
}
function _extractSevenDayChange(row) {
  try {
    return row.children[3].children[0].children[0].innerText;
  } catch(err) {
    return undefined;
  }
}
function _extractOwners(row) {
  try {
    return row.children[5].children[0].innerHTML;
  } catch(err) {
    return undefined;
  }
}
function _extractItems(row) {
  try {
    return row.children[6].children[0].innerHTML;
  } catch(err) {
    return undefined;
  }
}