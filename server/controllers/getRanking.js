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

  const options = {
    nbrOfPages: pageNum,
    debug: false,
    sort: true,
    logs: true,
    browserInstance: undefined,
  }

  const rankings = await OpenseaScraper.rankings(period, options);

  var tokensArray = [];
  rankings.map((collection) => {
    tokensArray.push(collection.nativeCurrency)
  });
  tokensArray = [...new Set(tokensArray)];

  res.json({
    ranking: rankings,
  });
};