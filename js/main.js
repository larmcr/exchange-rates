const cleanData = (buy, sell) => ({
  buy: buy.replace(',', '.'),
  sell: sell.replace(',', '.')
});

const trans = {
  en: {
    buy: 'Buy',
    sell: 'Sell'
  },
  es: {
    buy: 'Compra',
    sell: 'Venta'
  }
}

const parsers = {
  bccr: (result) => {
    const {
      TipoCambioCompra,
      TipoCambioVenta
    } = $.parseJSON(result);
    return cleanData(TipoCambioCompra, TipoCambioVenta);
  }
}

const urls = {
  bccr: 'http://www.bccr.fi.cr/Indicadores/IndicadoresJSON.ashx'
};

const MINI = require('minified');
const $ = MINI.$;
const EE = MINI.EE;
const HTML = MINI.HTML;
const _ = MINI._;

const PREFIX = 'https://crossorigin.me/'

const setResult = (entity, result) => {
  const eRs = parsers[entity](result);
  const symbol = '₡';
  const div = EE('div', { '$': 'siimple-alert siimple-alert--done' }, [
    EE('div', [
      HTML(`<strong>${trans['es']['buy']}: </strong>`),
      `${symbol} ${eRs.buy}`
    ]),
    EE('div', [
      HTML(`<strong>${trans['es']['sell']}: </strong>`),
      `${symbol} ${eRs.sell}`
    ]),
  ]);
  $('#result').set('innerHTML', null);
  $('#result').add(div);
};

const showExchangeRatesOfEntitiy = (event) => {
  var id = $(event.target).get('id');
  console.info(id);
  var entity = entities[id];
  console.info(entity.url);
  // $('#result').set('$', '+spinner');
  $.request('get', `${PREFIX}${entity.url}`)
    .then((result) => setResult(id, result));
}

$(() => {
  $('.entity').onClick(showExchangeRatesOfEntitiy);
});