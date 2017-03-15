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
  bct: {
    name: 'Banco BCT S.A.',
    url: 'http://www.bancobct.com',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('table').select('td');
      const buy = rates[1].innerText.split(' ')[1];
      const sell = rates[3].innerText.split(' ')[1];
      return cleanData(buy, sell);
    }
  },
  cathay: {
    name: 'Banco Cathay de Costa Rica S.A.',
    url: 'https://www.bancocathay.com',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const buy = html.select('#lblCompra')[0].innerText.substr(1);
      const sell = html.select('#lblVenta')[0].innerText.substr(1);
      return cleanData(buy, sell);
    }
  },
  davivienda: {
    name: 'Banco Davivienda (Costa Rica) S.A',
    url: 'http://www.davivienda.cr/',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('#tipo_cambio').select('span');
      const buy = rates[2].innerText.trim();
      const sell = rates[3].innerText.trim();
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

const removeAndAddChildren = (id, children) => {
  $(`.${id}`).remove();
  $(`#${id}`).add(children);
};

const showResult = (id, entity, result) => {
  const eRs = entity.parse(result);
  const cssClass = {
    '$': `tr-${id}`
  };
  removeAndAddChildren(`tr-${id}`, [EE('td', cssClass, `${SYMBOL} ${eRs.buy}`), EE('td', cssClass, `${SYMBOL} ${eRs.sell}`)]);
  $(`#td-${id}`).add(EE('label', {
    '$': `tr-${id} label success`
  }, (new Date).toLocaleString()));
};

const showError = (id, status, statusText, responseText) => {
  $(`.tr-${id}`).remove();
  $(`#td-${id}`).add(EE('label', {
    '$': `tr-${id} label error`
  }, 'Error al consultar'));
};

const showSpinner = (id) => {
  $(`.tr-${id}`).remove();
  const spinner = EE('div', {
    '$': `tr-${id} spinner`
  });
  $(`#td-${id}`).add(spinner);
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
    const tr = EE('tr', {
      '@id': `${id}`
    }, EE('td', EE('em', EE('strong', group))));
    list.push(tr);
  };
  $('tbody').add(list);
};

const addEntities = () => {
  const list = [];
  Object.keys(entities).reverse().forEach ((id) => {
    const entity = entities[id];
    const ready = entity.ready;
    const attributes = {
      '@id': id,
      '$': 'entity pseudo',
    };
    if (!ready) attributes['@disabled'] = '';
    const button = EE('button', attributes, entity.name);
    $(`#${entity.group}`).addAfter(EE('tr', {
      '@id': `tr-${id}`
    }, [EE('td', {
      '@id': `td-${id}`
    }), EE('td', button)]));
  });
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