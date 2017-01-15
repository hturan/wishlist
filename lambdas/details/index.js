require('isomorphic-fetch');

const url = require('url');
const cheerio = require('cheerio');

const currencyMapping = require('./currencyMapping');
const selectorMapping = require('./selectors');

// TODO: Smarter amount formatting. Detect commas and decimals, then convert to pence.
// TODO: Smarter currency detection, e.g after amount
function formatPriceString(priceString) {
  const currencyRegex = /(\$|USD|\£|GBP|\&pound\;|\&\#163\;|\&\#xa3\;|\u00A3|\¥|\&yen\;|\uFFE5|\&\#165\;|\&\#xa5\;|\u00A5|\€|EUR|\&\#8364\;|\&\#x20ac\;)/gi;
  const amountRegex = /(\s*\d[\d\,\.]*)/gi;

  return {
    currency: currencyMapping[priceString.match(currencyRegex)[0]] || priceString.match(currencyRegex)[0],
    amount: parseInt(priceString.match(amountRegex)[0].replace('.', '').replace(',', ''), 10)
  };
}

function formatTitle(node) {
  if (node[0].tagName === 'meta') {
    return node.attr('content');
  } else {
    return node.text().trim();
  }
}

// TODO: Handle regional mis-match. 'GBP' request, but the server's in Ireland, so getting 'EUR' prices. Currency conversion? AWS multi-region?
exports.handler = (event, context, callback) => {
  const providedUrl = decodeURIComponent(event.url);

  if (providedUrl) {
    const hostname = url.parse(providedUrl).hostname;

    if (selectorMapping[hostname]) {
      if (typeof selectorMapping[hostname] === 'function') {
        selectorMapping[hostname](providedUrl, callback);
      } else {
        fetch(providedUrl)
        .then(response => response.text())
        .then(text => {
          const $ = cheerio.load(text);
          const priceString = $(selectorMapping[hostname].price).first().text();
          const formattedPriceString = formatPriceString(priceString.trim());

          callback(null, {
            currency: formattedPriceString.currency,
            amount: formattedPriceString.amount,
            title: formatTitle($(selectorMapping[hostname].title).first())
          });
        });
      }
    } else {
      callback(`Selector not found for ${hostname}`);
    }
  } else {
    callback('Invalid URL specified');
  }
};

// exports.handler({url: process.argv[2]}, null, (error, success) => console.log(error || success));
