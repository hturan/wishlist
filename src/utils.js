import { getCurrencyFromSymbol, getSymbolFromCurrency } from 'currency-symbol-map';

export function formatAmount(currency, amount) {
  return `${getSymbolFromCurrency(currency)}${(amount / 100).toFixed(2)}`;
}

export function unformatAmount(amountString) {
  const currencies = ['£', '$', '€'];
  let currency;
  let amount;

  if (currencies.indexOf(amountString.substr(0, 1)) > -1) {
    currency = amountString.substr(0, 1);
    amount = amountString.substr(1);
  } else {
    currency = '£';
    amount = amountString;
  }

  if (amount.indexOf('.') === -1) {
    amount = `${amount}00`;
  }

  return {
    currency: getCurrencyFromSymbol(currency),
    amount: parseInt(amount.replace('.', '').replace(',', ''), 10)
  };
}
