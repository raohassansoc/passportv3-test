const transactionRoutes = {
  "POST /on-ramp/custom/transfer":
    "CustomOnRampApi.CustomOnRampTransactionInitiation",

  "POST /dough/transfer/custom": "DoughPaymentApi.DoughPayment",

  "POST /transaction-history/create-raw":
    "SelfTransferApi.create_raw_transaction_history",

  "GET /transaction-history/get": "WalletTransactionApi.get",
  "GET /transaction_history/merchant/get":
    "WalletTransactionApi.get_transaction_history_merchant",
  "POST /pass/token/transfer/create": "WalletTransactionApi.transferToken",
  "POST /pass/token/merchant/transfer/create":
    "WalletTransactionApi.merchantPayment",
  "POST /pass/token/mint/create": "WalletTransactionApi.mintToken",
  "GET /crypto/token/balance/get": "WalletTransactionApi.getWalletBalance",
  "GET /cashback/rewards/customer/get":
    "WalletTransactionApi.getCustomerRewardsTotal",
  "GET /cashback/rewards/merchant/get":
    "WalletTransactionApi.getMerchantRewardsTotal",
  "POST /pass/transfer/user-to-merchant":
    "WalletTransactionApi.user_payment_to_merchant",
  "POST /transaction-history/delete": "WalletTransactionApi.destroy",
  "POST /merchant/on-qr-cancellation/process":
    "WalletTransactionApi.on_merchant_payment_qr_cancellation_proccess",
  "POST /merchant/on-qr-expiration/process":
    "WalletTransactionApi.on_qr_expiry_process",

  "GET /self-transfer/get": "SelfTransferApi.get",
  "POST /self-transfer/save": "SelfTransferApi.save",
  "POST /self-transfer/delete": "SelfTransferApi.destroy",

  "GET /transaction-status/get": "TransactionStatusApi.get",
  "POST /transaction-status/save": "TransactionStatusApi.save",
  "POST /transaction-status/delete": "TransactionStatusApi.destroy",

  "POST /user/on-ramp/access-token/create": "OnRampApi.onRampAccessToken",
  "POST /user/on-ramp/order/create": "OnRampApi.onRampCreateOrder",
  "GET /user/on-ramp/crypto/list/get": "OnRampApi.cryptoList",
  "GET /user/on-ramp/fiat/list/get": "OnRampApi.fiatList",
  "POST /user/on-ramp/create/token/order": "OnRampApi.newOnRampOrder",
  "GET /timezone/city": "OnRampApi.get_tz",
  "POST /user/on-ramp/payment/verification":
    "OnRampApi.on_ramp_payment_success_handler",
  "POST /user/on-ramp/payment-failure/handler":
    "OnRampApi.on_ramp_payment_failure_handler",
  "POST /on-ramp/fiat-to-crypto/conversion-rate":
    "OnRampApi.get_fiat_to_crypto_rate",
};

module.exports = transactionRoutes;
