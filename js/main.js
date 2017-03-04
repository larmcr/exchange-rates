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
  const div = EE('div', {
    '$': `${id} siimple-alert siimple-alert--done`
  }, [
    getTranslation(eRs, 'es', 'buy'),
    getTranslation(eRs, 'es', 'sell'),
  ]);
  removeAndAddSibling(id, div);
};

const showError = (id, status, statusText, responseText) => {
  const div = EE('div', {
    '$': `${id} siimple-alert siimple-alert--error`
  }, 'Error al obtener información de la entidad');
  removeAndAddSibling(id, div);
};

const showSpinner = (id) => {
  const spinner = EE('div', {
    '$': `${id} spinner`
  });
  removeAndAddSibling(id, spinner);
}

const showExchangeRates = (id) => {
  showSpinner(id);
  const entity = entities[id];
  const url = entity['prefix'] ? `${PREFIX}${entity.url}` : entity.url;
  $.request('get', url)
    .then((result) => showResult(id, entity, result))
    .error((status, statusText, responseText) => showError(id, status, statusText, responseText));
};

const onEntityClicked = (event) => {
  var id = $(event.target).get('id');
  showExchangeRates(id);
};

const addEntities = () => {
  const list = [];
  for (let id in entities) {
    const cbId = `cb-${id}`;
    const checkbox = EE('div', {
    '$': 'siimple-checkbox',
    '@title': 'Comparar',
    }, [
      EE('input', { '@type': 'checkbox', '@value': id, '@id': cbId }),
      EE('label', { '@for': cbId }),
    ]);
    const entity = entities[id];
    const div = EE('div', {
      '@id': id,
      '$': 'entity siimple-btn siimple-btn--blue',
    }, entity['name']);
    list.push(checkbox, div);
  };
  $('#entities').add(list);
  $('.entity').onClick(onEntityClicked);
};

$(() => {
  addEntities();
});