const settlementRoutes = {
  "GET /settlement/get": "SettlementApi.get",
  "POST /settlement/save": "SettlementApi.save",
  "POST /settlement/delete": "SettlementApi.destroy",
  "GET /settlement/merchant-list":
    "SettlementApi.get_list_of_merchants_for_settlement",
  "POST /settlement/merchant-transaction-list":
    "SettlementApi.display_list_of_transactions_for_merchant",

  "GET /settlement-type/get": "SettlementTypeApi.get",
  "POST /settlement-type/save": "SettlementTypeApi.save",
  "POST /settlement-type/delete": "SettlementTypeApi.destroy",
};

module.exports = settlementRoutes;
