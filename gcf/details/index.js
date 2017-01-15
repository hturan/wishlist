require('isomorphic-fetch');

const url = require('url');
const cheerio = require('cheerio');

const currencyMapping = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY'
};

// TODO: Add consistent data feeds
// TODO: Create mapping between tld and currency
// TODO: Make use of 'og:title', 'og:price:amount' and 'og:price:currency', along with 'itemprop' fallbacks
const selectorMapping = {
  "www.amazon.co.uk": {
    price: "#priceblock_saleprice, #priceblock_dealprice, #priceblock_ourprice, #actualPriceValue, #buyNewSection .a-color-price, ul.swatches .our-price",
    title: "#productTitle"
  },
  "www.amazon.com": {
    price: "#priceblock_saleprice, #priceblock_dealprice, #priceblock_ourprice, #actualPriceValue, #buyNewSection .a-color-price, ul.swatches .our-price",
    title: "#productTitle"
  },
  "shop.creativeapplications.net": {
    price: "#price",
    title: "#product_detail_info h1"
  },
  "buyolympia.com": {
    price: "#price-string",
    title: ".buyoly-item-title, [itemprop=name]"
  },
  "www.normanrecords.com": {
    price: ".price:not(.strikethrough)",
    title: ".edit_title[itemprop=name]"
  },
  "bleep.com": {
    price: ".price",
    title: ".release-title[itemprop=name]"
  },
  "www.juno.co.uk": {
    price: ".product-price",
    title: ".product-title h2"
  },
  "www.evanscycles.com": {
    price: "div.product-info-wrapper span[property='lowPrice']",
    title: "h1.product-title"
  },
  "www.wiggle.co.uk": {
    price: "span.js-unit-price",
    title: "h1#productTitle"
  },
  "store.steampowered.com": (url, res) => {
    const appId = url.split('/')[4]; 

    fetch(`http://store.steampowered.com/api/appdetails?appids=${appId}&cc=uk`)
    .then(response => response.json())
    .then(data => {
      res.status(200).json({
        currency: data[appId]['data']['price_overview']['currency'],
        amount: data[appId]['data']['price_overview']['final'],
        title: data[appId]['data']['name']
      });
    })
  },
  "www.fangamer.com": {
    price: "#price-field",
    title: ".product-info-container h1"
  },
  // "www.draplin.com" - TODO: Invalid markup :(
  "papafoxtrot.com": {
    price: ".display-price .uc-price",
    title: ".pane-node-title .pane-content"
  },
  // TODO: Invalid markup, need separate currency/amount parsing for meta tags
  // "shop.malikafavre.com": {
  //   price: "meta[property='og:price:amount']",
  //   title: "meta[property='og:title']"
  // },
  "www.discogs.com": {
    price: ".price",
    title: "title"
  },
  "itunes.apple.com": {
    price: ".price",
    title: "h1[itemprop=name]"
  },
  // TODO: Incapsula protected
  // "bookshop.theguardian.com": {
  //   price: ".our-price",
  //   title: "title"
  // },
  "www.hustwit.com": {
    price: "ins .amount, .amount",
    title: "title"
  },
  "www.theghostlystore.com": {
    price: ".price",
    title: "h2.product-title"
  },
  "www.ebay.co.uk": {
    price: "#prcIsum, .vi-price-np",
    title: "title"
  },
  "www.roughtrade.com": {
    price: ".buy_button",
    title: "#album_info h2:nth-child(2)"
  },
  "goodfuckingdesignadvice.com": {
    price: ".price",
    title: "meta[property='og:title']"
  },
  "www.walmart.com": {
    price: ".Price.Price--large",
    title: "h1[itemprop=name]"
  },
  "www.etsy.com": {
    price: "#listing-price",
    title: "meta[property='og:title']"
  },
  "www.bestbuy.com": {
    price: ".item-price",
    title: "title"
  },
  "www.ikea.com": {
    price: "#price1",
    title: "title"
  },
  "www.argos.co.uk": {
    price: ".price",
    title: "h2[itemprop=name]"
  },
  "www.staples.com": {
    price: ".SEOFinalPrice",
    title: "title"
  },
  "www.asos.com": {
    price: ".product_price_details",
    title: "h1 span.product_title"
  },
  // "www.dx.com" - TODO: Fix weird currency selection
  // "www.komplett.no" - TODO: Better price parsing, auto currency detection
  "www.zappos.com": {
    price: ".price.nowPrice, .price.salePrice",
    title: "meta[property='og:title']"
  },
  "www.barnesandnoble.com": {
    price: ".price.current-price",
    title: "title"
  },
  "www.overstock.com": {
    price: ".price",
    title: "title"
  },
  "www.jcpenney.com": {
    price: ".gallery_page_price[itemprop=price]",
    title: "title"
  },
  "www.toysrus.com": {
    price: "#price .retail",
    title: "title"
  },
  "www.gap.com": {
    price: ".product-price",
    title: "title"
  },
  "store.playstation.com": (url, res) => {
    const psnId = url.substr(url.indexOf('cid=') + 4); 

    fetch(`https://store.playstation.com/chihiro-api/viewfinder/GB/en/19/${psnId}`)
    .then(response => response.json())
    .then(data => {
      var currency, amount;

      currency = currencyMapping[data['default_sku']['display_price'].charAt(0)];

      if (data['default_sku']['rewards'].length > 0) {
        const discount = data['default_sku']['rewards'][0];
        amount = discount['bonus_price'] || discount['price'];
      } else {
        amount = data['default_sku']['price'];
      }

      const title = data['short_name'];

      res.status(200).json({
        currency,
        amount,
        title
      });
    })
  },
  "www.aceandtate.co.uk": {
    price: ".regular-price",
    title: "meta[property='og:title']"
  },
  "shop.killscreendaily.com": {
    price: "#ProductPrice",
    title: "[itemprop=name]"
  }
};

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
exports.details = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const providedUrl = decodeURIComponent(req.query.url);

  if (providedUrl) {
    const hostname = url.parse(providedUrl).hostname;

    if (selectorMapping[hostname]) {
      if (typeof selectorMapping[hostname] === 'function') {
        selectorMapping[hostname](providedUrl, res);
      } else {
        fetch(providedUrl)
        .then(response => response.text())
        .then(text => {
          const $ = cheerio.load(text);
          const priceString = $(selectorMapping[hostname].price).first().text();
          const formattedPriceString = formatPriceString(priceString.trim());

          res.status(200).json({
            currency: formattedPriceString.currency,
            amount: formattedPriceString.amount,
            title: formatTitle($(selectorMapping[hostname].title).first())
          });
        });
      }
    } else {
      res.status(422).json({
        error: `Selector not found for ${hostname}`
      });
    }
  } else {
    res.status(422).json({
      error: 'Invalid URL specified'
    });
  }
};
