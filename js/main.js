const MINI = require('minified');
const { $, EE, HTML, _ } = MINI;

const PREFIX = 'https://crossorigin.me/';
const SYMBOL = '₡';

const cleanData = (buy, sell) => ({
  buy: _.formatValue('#.00', parseFloat(buy.replace(',', '.'))),
  sell: _.formatValue('#.00', parseFloat(sell.replace(',', '.'))),
});

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
  const eRs = entity.parse(result);
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
    '$': `${id} siimple-alert`,
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
    const dom = EE('div', {
      '@id': id,
      '$': 'siimple-h4',
    }, groups[id]);
    list.push(dom);
  };
  $('#groups').add(list);
};

const addEntities = () => {
  const list = [];
  for (let id in entities) {
    const entity = entities[id];
    const cbId = `cb-${id}`;
    const ready = entity.ready;
    const checkbox = EE('div', {
      '$': 'siimple-checkbox',
      '@title': 'Comparar',
      '@style': ready ? '' : 'pointer-events:none;',
    }, [
      EE('input', {
        '@type': 'checkbox',
        '@value': id,
        '@id': cbId
      }),
      EE('label', {
        '@for': cbId
      }),
    ]);
    const div = EE('div', {
      '@id': id,
      '$': 'entity siimple-btn siimple-btn--blue',
      '@style': ready ? '' : 'pointer-events:none;',
    }, entity.name);
    const message = EE('div', {
      '$': `${id} siimple-alert ${ready ? '' : 'siimple-alert--warning'}`,
    }, ready ? 'Disponible' : 'No Disponible');
    $(`#${entity.group}`).addAfter([checkbox, div, message, EE('br')]);
  };
  $('.entity').onClick(onEntityClicked);
};

const onClickAll = () => {
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
  $('#click-all').onClick(onClickAll);
});