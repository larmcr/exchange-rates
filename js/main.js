const trans = {
  en: {
    buy: 'Buy',
    sell: 'Sell'
  },
  es: {
    buy: 'Compra',
    sell: 'Venta'
  }
};

const MINI = require('minified');
const $ = MINI.$;
const EE = MINI.EE;
const HTML = MINI.HTML;
const _ = MINI._;

const PREFIX = 'https://crossorigin.me/'

const setResult = (id, entity, result) => {
  const eRs = entity['parse'](result);
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

const showExchangeRates = (id) => {
  var entity = entities[id];
  // $('#result').set('$', '+spinner');
  $.request('get', `${PREFIX}${entity.url}`)
    .then((result) => setResult(id, entity, result));
};

const onEntityClicked = (event) => {
  var id = $(event.target).get('id');
  showExchangeRates(id);
};

$(() => {
  $('.entity').onClick(onEntityClicked);
});