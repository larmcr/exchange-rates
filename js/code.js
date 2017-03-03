const spinner = new Spinner({
  lines: 10,
  length: 15,
  width: 5,
  radius: 10,
  scale: 0.5,
  corners: 1,
  color: '#57607c',
  opacity: 0.25,
  rotate: 0,
  direction: 1,
  speed: 1,
  trail: 60,
  fps: 20,
  zIndex: 2e9,
  className: 'spinner',
  top: '15%',
  left: '15%',
  shadow: false,
  hwaccel: false // Whether to use hardware acceleration
  , position: 'absolute' // Element positioning
}).spin();

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

const getExchangeRates = (entity) => {
  $('#result').add(spinner.el);
  $.request('get', `${PREFIX}${urls[entity]}`)
    .then((result) => setResult(entity, result));
}