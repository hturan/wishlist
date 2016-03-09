const cheerio = require('cheerio');
const request = require('request');
const express = require('express');
const cors = require('cors');

const app = express();
app.set('port', (process.env.PORT || 30001));
app.use(cors());

const priceFormatRe = /((?:R?\$|USD|\&pound\;|£|¥|€|\&\#163\;|\&\#xa3\;|\u00A3|\&yen\;|\uFFE5|\&\#165\;|\&\#xa5\;|\u00A5|eur|\&\#8364\;|\&\#x20ac\;)\s*\d[0-9\,\.]*)/gi;

function parsePriceFromBody(text) {
  /*
  - Strip spaces
  - Match currencies
  - TODO: Strip 0 values
  - TODO: Weight by styles (font-size, visibility, line-through)
  - TODO: Weight by position
  - TODO: Test class/id names
  */

  var prices = text.replace(/\s/g,"").match(priceFormatRe);

  if (prices) {
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

  request(url, (error, response, body) => {
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

app.listen(app.get('port'));
