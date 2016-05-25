const cheerio = require('cheerio');
const request = require('request');
const express = require('express');
const cors = require('cors');
const horizon = require('@horizon/server');

const app = express();

app.use(cors());

app.use(express.static('dist'));

app.get('/', (req, res) => {
  res.send(`
  <html>
    <head>
      <title>Wishlist</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="/horizon/horizon.js"></script>
    </head>
    <body>
      <section id="app"></section>
      <script src="/bundle.js"></script>
    </body>
  </html>
  `);
});


const priceFormatRe = /((?:R?\$|USD|\&pound\;|£|¥|€|\&\#163\;|\&\#xa3\;|\u00A3|\&yen\;|\uFFE5|\&\#165\;|\&\#xa5\;|\u00A5|eur|\&\#8364\;|\&\#x20ac\;)\s*\d[0-9\,\.]*)/gi;

function parsePriceFromBody(text) {
  /*
  - Strip spaces
  - Match currencies
  - TODO: Strip 0 values
  - TODO: Remove hidden elements
  - TODO: Remove 'line-through' elements
  - TODO: Weight by styles (font-size, line-through)
  - TODO: Weight by position
  - TODO: Test class/id names
  - TODO: Account for '35€' formatting
  */

  var prices = text.replace(/\s/g,"").match(priceFormatRe) || [];
  prices = prices.filter(price => /[1-9]/.test(price));

  if (prices.length > 0) {
    return {
      amount: prices[0].substr(1),
      currency: prices[0].substr(0, 1)
    };
  }

  return {
    amount: '0.00',
    currency: '£'
  };
}

app.get('/details/:url', (req, res) => {
  const url = req.params.url;

  console.time(`Fetching ${req.params.url}`);
  request(url, (error, response, body) => {
    console.timeEnd(`Fetching ${req.params.url}`);
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var priceData = parsePriceFromBody($('body').text());

      res.send({
        title: $('title').text(),
        amount: priceData.amount,
        currency: priceData.currency
      });
    } else {
      res.sendStatus(422);
    }
  });
});

const httpServer = app.listen(process.env.PORT || 3001);

horizon(httpServer, {
  auto_create_collection: true,
  auto_create_index: true,
  project_name: 'wishlist',
  permissions: false,
  rdb_host: 'localhost',
  rdb_port: 28015,
  auth: {
    allow_anonymous: false,
    allow_unauthenticated: true,
    token_secret: 'secret'
  }
});
