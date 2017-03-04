const cleanData = (buy, sell) => ({
  buy: buy.replace(',', '.'),
  sell: sell.replace(',', '.')
});

const entities = {
  bccr: {
    name: 'Banco Central de Costa Rica',
    url: 'http://www.bccr.fi.cr/Indicadores/IndicadoresJSON.ashx',
    parse: (result) => {
      const {
        TipoCambioCompra,
        TipoCambioVenta
      } = $.parseJSON(result);
      return cleanData(TipoCambioCompra, TipoCambioVenta);
    }
  }
};