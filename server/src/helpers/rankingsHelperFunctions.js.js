const dict = {};

function fetchCollections(dict) {
  const rowsNodeList = document.querySelectorAll('[role=list] > div > a');
  const rows = Array.prototype.slice.call(rowsNodeList);

  rows.forEach(row => {
    const slug = _extractSlug(row);

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

function _extractRank(row) {
  try {
    return Number(row.innerText.split(/\D/)[0]);
  } catch (err) {
    return undefined;
  }
}
function _extractSlug(row) {
  try {
    const collectionUrlSplit = row.href.split("/");
    const slug = collectionUrlSplit[collectionUrlSplit.length - 1];
    return slug;
  } catch (err) {
    return undefined;
  }
}
function _extractLogo(row) {
  try {
    return row.querySelector(".Image--image").src;
  } catch (err) {
    return undefined;
  }
}
function _extractName(row) {
  try {
    return row.children[0].children[2].children[0].innerText;
  } catch (err) {
    return undefined;
  }
}
function _extractFloorPrice(row) { // only ETH floor prices, otherwise uzndefined
  try {
    return row.children[4].children[0].children[1].innerText;
  } catch (err) {
    return undefined;
  }
}
function _extractVolume(row) {
  try {
    return row.children[1].children[0].children[1].innerText;
  } catch (err) {
    return undefined;
  }
}
function _extractOneDayChange(row) {
  try {
    // return row.children[0].children[2].children[0].children[0].innerText;
    return row.children[2].children[0].children[0].innerText;
  } catch (err) {
    return undefined;
  }
}
function _extractSevenDayChange(row) {
  try {
    return row.children[3].children[0].children[0].innerText;
  } catch (err) {
    return undefined;
  }
}
function _extractOwners(row) {
  try {
    return row.children[5].children[0].innerHTML;
  } catch (err) {
    return undefined;
  }
}
function _extractItems(row) {
  try {
    return row.children[6].children[0].innerHTML;
  } catch (err) {
    return undefined;
  }
}