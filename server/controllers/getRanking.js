const OpenseaScraper = require("../src/index");
const price = require("crypto-price");

const dotenv = require("dotenv");
const { default: axios } = require("axios");
dotenv.config();

// switch on/off which function to demo
const demoBasicInfo = true;
const demoOffers = true;
const demoOffersByUrl = true;
const demoRankings = true;
const demoOffersByScrolling = true;
const demoOffersByScrollingByUrl = true;

exports.getRanking = async (req, res, next) => {
  const period = req.body.period;
  const pageNum = req.body.pageNum;
  console.log(period, pageNum);

  const options = {
    nbrOfPages: pageNum,
    debug: false,
    sort: true,
    logs: true,
    browserInstance: undefined,
  }

  const rankings = await OpenseaScraper.rankings(period, options);

  console.log('length: ', rankings.length);
  console.log("1: ", rankings[0]);
  console.log("2: ", rankings[99]);

  var tokensArray = [];
  rankings.map((collection) => {
    tokensArray.push(collection.nativeCurrency)
  });
  tokensArray = [...new Set(tokensArray)];

  res.json({
    ranking: rankings,
  });

  // get offersByScrolling
  // if (demoOffersByScrolling) {
  //   console.log(`\n\n\n\n✅ === OpenseaScraper.offersByScrolling(slug, 40) ===`);
  //   const result = await OpenseaScraper.offersByScrolling(slug, 40, options);
  //   console.log(`total Offers: ${result.stats.totalOffers}`);
  //   console.log(`all scraped offers (max 40):`);
  //   console.dir(result.offers, { depth: null });
  // }

  // get offersByScrollingByUrl
  // if (demoOffersByScrollingByUrl) {
  //   console.log(`\n\n\n\n✅ === OpenseaScraper.offersByScrollingByUrl(url, 42) ===`);
  //   const urlByScrolling = "https://opensea.io/collection/boredapeyachtclub?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Clothes&search[stringTraits][0][values][0]=Black%20Suit";
  //   const resultByScrolling = await OpenseaScraper.offersByScrollingByUrl(urlByScrolling, 42, options);
  //   console.log(`total Offers: ${resultByScrolling.stats.totalOffers}`);
  //   console.log(`all scraped offers (max 42):`);
  //   console.dir(resultByScrolling.offers, { depth: null });
  // }

  // console.log("\n🎉 DEMO ENDED 🥳")
};