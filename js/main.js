const MINI = require('minified');
const {
  $,
  EE,
  HTML,
  _
} = MINI;

const PREFIX = 'https://crossorigin.me/';
const SYMBOL = '₡';

const format = (val) => _.formatValue('#.00', val);

const parse = (val) => parseFloat(val.replace(',', '.'));

const cleanData = (buy, sell) => {
  const buyParsed = parse(buy);
  const sellParsed = parse(sell);
  return {
    buy: format(buyParsed),
    sell: format(sellParsed),
    avg: format((buyParsed + sellParsed) / 2),
  };
};

const groups = {
  public: 'Bancos públicos',
  private: 'Bancos privados',
};

const entities = {
  bccr: {
    name: 'Banco Central de Costa Rica (BCCR)',
    url: 'http://www.bccr.fi.cr/Indicadores/IndicadoresJSON.ashx',
    group: 'public',
    prefix: true,
    ready: true,
    parse: (result) => {
      const {
        TipoCambioCompra,
        TipoCambioVenta
      } = $.parseJSON(result);
      return cleanData(TipoCambioCompra, TipoCambioVenta);
    }
  },
  bancredito: {
    name: 'Banco Crédito Agrícola de Cartago (Bancrédito)',
    url: 'https://www.bancreditocr.com/tipoCambio/TipoCambio.xml',
    group: 'public',
    prefix: true,
    ready: false,
    parse: (result) => {
      console.info(result);
      // const html = HTML(result);
      // const buy = $(html.select('.compra')[0]).select('span').text();
      // const sell = $(html.select('.venta')[0]).select('span').text();
      // return cleanData(buy, sell);
    }
  },
  bcr: {
    name: 'Banco de Costa Rica (BCR)',
    url: 'http://www.bancobcr.com/js/tipoCambio/BUS/actual_formato.asp?i=ES',
    group: 'public',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('.tipocambio_currency');
      const buy = $(rates[0]).text();
      const sell = $(rates[1]).text();
      return cleanData(buy, sell);
    }
  },
  bncr: {
    name: 'Banco Nacional de Costa Rica (BNCR)',
    url: 'http://www.bncr.fi.cr/BNCR/TipoCambio.aspx',
    group: 'public',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const buy = $(html.select('.compra')[0]).select('span').text();
      const sell = $(html.select('.venta')[0]).select('span').text();
      return cleanData(buy, sell);
    }
  },
  bp: {
    name: 'Banco Popular y de Desarrollo Comunal (BP)',
    url: 'https://www.bancopopular.fi.cr/bpop/Inicio.aspx',
    group: 'public',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('.MoneyExchange').select('span').select('span').text().split(':');
      const buy = rates[1].split(' ')[1].trim();
      const sell = rates[2].split(' ')[1].trim();;
      return cleanData(buy, sell);
    }
  },
  bac: {
    name: 'Banco BAC San José S.A.',
    url: 'https://www.sucursalmovil.com/secm/exchangeRate.go',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('.listTd33');
      const buy = rates[1].innerText;
      const sell = rates[2].innerText;
      return cleanData(buy, sell);
    }
  },
  prival: {
    name: 'Banco Prival (antes Bansol)',
    url: 'https://www.prival.com/costa-rica/banca-privada/productos-servicios/canje-de-monedas',
    group: 'private',
    prefix: true,
    ready: false,
    parse: (result) => {
      // const html = HTML(result);
      // const rates = html.select('div');
      // console.info(rates);
      // const buy = rates[1].innerText;
      // const sell = rates[2].innerText;
      // return cleanData(buy, sell);
    }
  },
};

const consts = {
  buy: 'Compra',
  sell: 'Venta',
  avg: 'Promedio'
};

const getValue = (eRs, type) => {
  return EE('p', {
    '$': 'c-paragraph'
  }, [
    HTML(`<strong>${consts[type]}: </strong>`),
    `${SYMBOL} ${eRs[type]}`
  ]);
};

const removeAndAddSibling = (id, element) => {
  $(`.${id}`).remove();
  $(`#${id}`).addAfter(element);
};

const showResult = (id, entity, result) => {
  const eRs = entity.parse(result);
  const div = EE('div', {
    '$': `${id} half c-card`
  }, EE('div', {
    '$': 'c-card__item'
  }, [
    getValue(eRs, 'buy'),
    getValue(eRs, 'sell'),
    getValue(eRs, 'avg'),
  ]));
  const now = EE('span', {
    '$': `${id} c-badge c-badge--ghost c-badge--success`
  }, [(new Date()).toLocaleTimeString()]);
  removeAndAddSibling(id, [HTML('&nbsp;&nbsp;&nbsp;'), now, div]);
};

const showError = (id, status, statusText, responseText) => {
  const div = EE('div', {
    '$': `${id} c-alert c-alert--error`
  }, 'Error al obtener información de la entidad');
  removeAndAddSibling(id, div);
};

const showSpinner = (id) => {
  const spinner = EE('div', {
    '$': `${id} half c-alert c-alert--success`,
  }, [EE('span', 'Consultando...'), HTML('&nbsp;&nbsp;&nbsp;'), EE('span', {
    '$': `${id} spinner`
  })]);
  removeAndAddSibling(id, spinner);
}

const showExchangeRates = (id) => {
  showSpinner(id);
  const entity = entities[id];
  const url = entity.prefix ? `${PREFIX}${entity.url}` : entity.url;
  $.request('get', url)
    .then((result) => showResult(id, entity, result))
    .error((status, statusText, responseText) => showError(id, status, statusText, responseText));
};

const onEntityClicked = (event) => {
  var id = event.target ? $(event.target).get('id') : event.get('id');
  showExchangeRates(id);
};

const addGroups = () => {
  const list = [];
  for (let id in groups) {
    const group = groups[id];
    const checkbox = EE('input', { '@id': `accordion-${id}`, '@type': 'checkbox' });
    const label = EE('label', { '$': 'c-card__item', '@for': `accordion-${id}` }, group);
    const div = EE('div', {
      '@id': id,
      '$': 'c-card__item',
    });
    list.push([checkbox, label, div]);
  };
  $('#groups').add(list);
};

const addEntities = () => {
  const list = [];
  for (let id in entities) {
    const entity = entities[id];
    const cbId = `cb-${id}`;
    const ready = entity.ready;
    const checkboxAttributes = {
      '@type': 'checkbox',
      '@value': id,
      '@id': cbId,
    };
    if (!ready) checkboxAttributes['@disabled'] = '';
    const checkbox = EE('label', {
      '$': 'c-toggle c-toggle--warning',
    }, [
      EE('input', checkboxAttributes),
      EE('div', {
        '$': 'c-toggle__track'
      }, EE('div', {
        '$': 'c-toggle__handle'
      }))
    ]);
    const div = EE('button', {
      '@id': id,
      '$': `entity c-button ${ready? 'c-button--info' : 'disabled' }`,
    }, entity.name);
    $(`#${entity.group}`).add([checkbox, div, EE('br'), EE('br')]);
  };
  $('.entity').onClick(onEntityClicked);
};

const onQueryAllClicked = () => {
  for (let id in entities) {
    if (entities[id].ready) {
      const entity = $(`#${id}`);
      entity.trigger('click', entity);
    }
  };
};

$(() => {
  addGroups();
  addEntities();
  $('#query-all').onClick(onQueryAllClicked);
});