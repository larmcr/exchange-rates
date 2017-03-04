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

const removeAndAddSibling = (id, element) => {
  $(`.${id}`).remove();
  $(`#${id}`).addAfter(element);
};

const showResult = (id, entity, result) => {
  const eRs = entity['parse'](result);
  const div = EE('div', { '$': `${id} siimple-alert siimple-alert--done` }, [
    getTranslation(eRs, 'es', 'buy'),
    getTranslation(eRs, 'es', 'sell'),
  ]);
  removeAndAddSibling(id, div);
};

const showError = (id, entity, status, statusText, responseText) => {
  const div = EE('div', { '$': `${id} siimple-alert siimple-alert--error` }, `${status} -> ${statusText} -> ${responseText}`);
  removeAndAddSibling(id, div);
};

const showSpinner = (id) => {
  const spinner = EE('div', { '$': `${id} spinner` });
  removeAndAddSibling(id, spinner);
}

const showExchangeRates = (id) => {
  showSpinner(id);
  var entity = entities[id];
  $.request('get', `${PREFIX}${entity.url}`)
    .then((result) => showResult(id, entity, result))
    .error((status, statusText, responseText) => showError(id, entity, status, statusText, responseText));
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