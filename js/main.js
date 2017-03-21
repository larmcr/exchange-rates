const MINI = require('minified');
const {
  $,
  EE,
  HTML,
  _
} = MINI;

const PREFIX = 'https://cors-anywhere.herokuapp.com/';
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
  finance: 'Financieras',
  mutual: 'Mutuales de vivienda',
  cooperative: 'Cooperativas',
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
      // console.info(result);
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
    name: 'Banco Davivienda (Costa Rica) S.A.',
    url: 'http://www.davivienda.cr',
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
  general: {
    name: 'Banco General (Costa Rica) S.A.',
    url: 'https://www.bgeneral.fi.cr/bgespanol/personal/index.asp',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('td');
      const buy = rates[14].innerText.substr(1).trim();
      const sell = rates[15].innerText.substr(1).trim();
      return cleanData(buy, sell);
    }
  },
  improsa: {
    name: 'Banco Improsa S.A.',
    url: 'https://www.grupoimprosa.com/banco',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('span');
      const buy = rates[70].innerText;
      const sell = rates[74].innerText;
      return cleanData(buy, sell);
    }
  },
  lafise: {
    name: 'Banco Lafise S.A.',
    url: 'https://www.lafise.com/DesktopModules/Servicios/API/TasaCambio/VerPorPaisActivo',
    group: 'private',
    prefix: true,
    ready: true,
    method: 'post',
    data: {
      Activo: true,
      Descripcion: '',
      IdPais: -1,
      PathUrl: 'https://www.lafise.com/blcr',
      SimboloCompra: '',
      SimboloVenta: '',
      ValorCompra: '',
      ValorVenta: '',
    },
    parse: (result) => {
      const json = $.parseJSON(result);
      const rates = json[1];
      const buy = rates.ValorCompra.split(' ')[1];
      const sell = rates.ValorVenta.split(' ')[1];
      return cleanData(buy, sell);
    }
  },
  promerica: {
    name: 'Banco Promérica S.A.',
    url: 'https://www.promerica.fi.cr/site/index.aspx',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('span');
      const buy = rates[0].innerText;
      const sell = rates[1].innerText;
      return cleanData(buy, sell);
    }
  },
  scotiabank: {
    name: 'Banco Scotiabank de Costa Rica S.A.',
    url: 'http://www.scotiabankcr.com/Personas/Default.aspx',
    group: 'private',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('span');
      const buy = rates[155].innerText.substr(1);
      const sell = rates[157].innerText.substr(1);
      return cleanData(buy, sell);
    }
  },
  prival: {
    name: 'Prival Bank (Costa Rica) S.A.',
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
  cafsa: {
    name: 'Financiera Cafsa S.A.',
    url: 'http://www.scotiabankcr.com/Personas/Default.aspx',
    group: 'finance',
    prefix: true,
    ready: false,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('span');
      const buy = rates[155].innerText.substr(1);
      const sell = rates[157].innerText.substr(1);
      return cleanData(buy, sell);
    }
  },
  comeca: {
    name: 'Financiera Comeca S.A.',
    url: 'http://www.fincomeca.fi.cr',
    group: 'finance',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('.smallGrey');
      const buy = rates[0].innerText.split(' ')[2];
      const sell = rates[1].innerText.split(' ')[2];
      return cleanData(buy, sell);
    }
  },
  desyfin: {
    name: 'Financiera Desyfin S.A.',
    url: 'http://www.desyfin.fi.cr',
    group: 'finance',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('strong');
      const buy = rates[0].innerText;
      const sell = rates[1].innerText;
      return cleanData(buy, sell);
    }
  },
  continental: {
    name: 'Financiera G&T Continental Costa Rica S.A.',
    url: 'http://www.gytcontinental.fi.cr',
    group: 'finance',
    prefix: true,
    ready: false,
    parse: (result) => {
      // const html = HTML(result);
      // const rates = html.select('strong');
      // const buy = rates[0].innerText;
      // const sell = rates[1].innerText;
      // return cleanData(buy, sell);
    }
  },
  alajuela: {
    name: 'Grupo Mutual Alajuela - La Vivienda de Ahorro y Préstamo',
    url: 'http://www.grupomutual.fi.cr',
    group: 'mutual',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const buy = html.select('#buyRate')[0].innerText;
      const sell = html.select('#sellRate')[0].innerText;
      return cleanData(buy, sell);
    }
  },
  mucap: {
    name: 'Mutual Cartago de Ahorro y Préstamo (MUCAP)',
    url: 'http://www.mucap.fi.cr/prxs/_tipoCambio.aspx/getTipoCambio',
    group: 'mutual',
    prefix: true,
    ready: true,
    method: 'post',
    data: '{"moneda":2}',
    settings: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
    parse: (result) => {
      const json = $.parseJSON(result);
      const rates = json.d.split(' ');
      const buy = rates[4].substr(1);
      const sell = rates[6].substr(1);
      return cleanData(buy, sell);
    }
  },
  coopeande: {
    name: 'Coope-ANDE N°1 R.L.',
    url: 'https://online.coope-ande.co.cr/coopeande/tipocambio',
    group: 'cooperative',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      console.info(html);
      const rates = html.select('h1')[0].innerText.split(' ');
      const buy = rates[3].split(':')[1];
      const sell = rates[7];
      return cleanData(buy, sell);
    }
  },
  coocique: {
    name: 'Cooperativa COOCIQUE R.L.',
    url: 'https://coocique.fi.cr',
    group: 'cooperative',
    prefix: true,
    ready: false,
    parse: (result) => {
      // const html = HTML(result);
      // const rates = html.select('h1')[0].innerText.split(' ');
      // const buy = rates[3].split(':')[1];
      // const sell = rates[7];
      // return cleanData(buy, sell);
    }
  },
  coopealianza: {
    name: 'Cooperativa Coopealianza R.L.',
    url: 'http://www.coopealianza.fi.cr/tc/compra.html',
    group: 'cooperative',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const buy = $(html[7])[0].innerText.split(' ')[5];
      const sell = $(html[11])[0].innerText.split(' ')[5];
      return cleanData(buy, sell);
    }
  },
  credecoop: {
    name: 'Cooperativa CREDECOOP R.L.',
    url: 'http://www.credecoop.fi.cr',
    group: 'cooperative',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('span');
      const buy = rates[45].innerText.split(' ')[3];
      const sell = rates[46].innerText.split(' ')[4];
      return cleanData(buy, sell);
    }
  },
  coopenae: {
    name: 'Cooperativa Nacional de Educadores R.L. (COOPENAE)',
    url: 'https://www.coopenae.cr/coopenae_virtual/TC.aspx',
    group: 'cooperative',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const buy = html.select('#lbl_compraR')[0].innerText;
      const sell = html.select('#lbl_ventaR')[0].innerText;
      return cleanData(buy, sell);
    }
  },
  marcos: {
    name: 'Cooperativa San Marcos R.L.',
    url: 'http://www.csm.fi.cr',
    group: 'cooperative',
    prefix: true,
    ready: true,
    parse: (result) => {
      const html = HTML(result);
      const rates = html.select('p');
      const buy = rates[7].innerText.split(' ')[1].substr(1);
      const sell = rates[8].innerText.split(' ')[1].substr(1);
      return cleanData(buy, sell);
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
  removeAndAddChildren(`tr-${id}`, [EE('td', cssClass, EE('small', `${SYMBOL} ${eRs.buy}`)), EE('td', cssClass, EE('small', `${SYMBOL} ${eRs.sell}`))]);
  $(`#td-${id}`).add(EE('small', {
    '$': `tr-${id}`
  }, (new Date).toLocaleTimeString()));
};

const showError = (id, status, statusText, responseText) => {
  $(`.tr-${id}`).remove();
  $(`#td-${id}`).add(EE('small', {
    '$': `tr-${id} error`
  }, 'Error al consultar'));
};

const showSpinner = (id) => {
  $(`.tr-${id}`).remove();
  const spinner = EE('div', {
    '$': `tr-${id} spinner-fix spinner`
  });
  $(`#td-${id}`).add(spinner);
}

const showExchangeRates = (id) => {
  showSpinner(id);
  const entity = entities[id];
  const url = entity.prefix ? `${PREFIX}${entity.url}` : entity.url;
  const method = entity.method || 'get';
  const data = entity.data;
  const settings = entity.settings;
  $.request(method, url, data, settings)
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
    }, EE('td', EE('em', group)));
    list.push(tr);
  };
  $('tbody').add(list);
};

const addEntities = () => {
  const list = [];
  Object.keys(entities).reverse().forEach((id) => {
    const entity = entities[id];
    const ready = entity.ready;
    const attributes = {
      '@id': id,
      '$': 'entity button-clear button-small',
    };
    if (!ready) attributes['@disabled'] = '';
    const message = EE('small', {
      '$': `tr-${id} ${ready ? 'available' : 'disabled'}`,
    }, `${ready ? 'Disponible' : 'No disponible'}`);
    const button = EE('button', attributes, entity.name);
    const tr = EE('tr', {
      '@id': `tr-${id}`
    }, [EE('td', {
      '@id': `td-${id}`
    }, message), EE('td', button)]);
    $(`#${entity.group}`).addAfter(tr);
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