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

const PREFIX = 'https://crossorigin.me/';
const SYMBOL = '₡';

const getTranslation = (eRs, locale, type) => {
  return EE('div', [
    HTML(`<strong>${trans[locale][type]}: </strong>`),
    `${SYMBOL} ${eRs[type]}`
  ]);
};

const setResult = (id, entity, result) => {
  const eRs = entity['parse'](result);
  const div = EE('div', { '$': 'siimple-alert siimple-alert--done' }, [
    getTranslation(eRs, 'es', 'buy'),
    getTranslation(eRs, 'es', 'sell'),
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

const addEntities = () => {
  
};

$(() => {
  $('.entity').onClick(onEntityClicked);
});