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
  $(`#${id}`).next().remove();
  $(`#${id}`).addAfter(div);
};

const handleError = (id, entity, status, statusText, responseText) => {
  const div = EE('div', { '$': 'siimple-alert siimple-alert--error' }, `${status} -> ${statusText} -> ${responseText}`);
  $(`#${id}`).next().remove();
  $(`#${id}`).addAfter(div);
};

const showExchangeRates = (id) => {
  var entity = entities[id];
  const spinner = EE('div', { '$': '+spinner' });
  $(`#${id}`).addAfter(spinner);
  $.request('get', `${PREFIX}${entity.url}`)
    .then((result) => setResult(id, entity, result))
    .error((status, statusText, responseText) => handleError(id, entity, status, statusText, responseText));
;
};

const onEntityClicked = (event) => {
  var id = $(event.target).get('id');
  showExchangeRates(id);
};

const addEntities = () => {
  for (let id in entities) {
    const entity = entities[id];
    const div = EE('div', { '@id': id, '$': 'entity siimple-btn siimple-btn--blue' }, entity['name']);
    $(div).onClick(onEntityClicked);
    $('#entities').add(div);
  };
};

$(() => {
  addEntities();
});