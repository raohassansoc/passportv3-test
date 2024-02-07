const usersRoutes = {
  "POST /wallet/currency/convert/get": "PaymentApi.convertCurrency",
  "POST /wallet/on-ramp/payment/get": "PaymentApi.payment",
  "POST /wallet/off-ramp/payment/get": "PaymentApi.payout",

  "POST /wallet/on-ramp/token/create": "WalletApi.userPayment",
  "POST /wallet/token/balance/get": "WalletApi.getWalletBalance",
  "POST /wallet/token/transfer/get": "WalletApi.transferToken",
  "GET /wallet/transaction/get": "WalletApi.getTransaction",

  "GET /investor/get": "InvestorsApi.get",
  "POST /investor/save": "InvestorsApi.create",
  "POST /investor/login": "InvestorsApi.investorLogin",
  "POST /investor/delete": "InvestorsApi.destroy",

  "POST /wallet/equity/calculation": "TransactionApi.equityCalculation",
  "GET /user/wallet/transaction/get": "TransactionApi.get",
  "POST /user/wallet/transaction/create": "TransactionApi.create",
  "GET /user/wallet/value/get": "TransactionApi.getTotal",
  "GET /user/wallet/email/send": "TransactionApi.createEmail",

  // creating routes for whitelisted
  "GET /whitelisted/get": "WhiteListedApi.get",
  "POST /whitelisted/save": "WhiteListedApi.save",
  "POST /whitelisted/delete": "WhiteListedApi.destroy",

};

module.exports = usersRoutes;
