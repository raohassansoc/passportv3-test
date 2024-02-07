const fiatTransactionRoutes = {
  "GET /fiat-transaction-type/get": "FiatTransactionTypeApi.get",
  "POST /fiat-transaction-type/save": "FiatTransactionTypeApi.save",
  "POST /fiat-transaction-type/delete": "FiatTransactionTypeApi.destroy",

  "GET /fiat-transaction/get": "FiatTransactionApi.get",
  "GET /fiat-transaction/analytics": "FiatTransactionApi.analytics",
  "POST /fiat-transaction/save": "FiatTransactionApi.save",
  "POST /fiat-transaction/delete": "FiatTransactionApi.destroy",
};

module.exports = fiatTransactionRoutes;
