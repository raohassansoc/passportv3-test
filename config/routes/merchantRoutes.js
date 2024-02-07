const merchantRoutes = {
  "GET /merchant/property/category/get": "PropertyCategoryApi.get",
  "POST /merchant/property/category/save": "PropertyCategoryApi.save",
  "POST /merchant/property/category/delete": "PropertyCategoryApi.destroy",

  "GET /merchant/property/get": "PropertyApi.get",
  "POST /merchant/property/save": "PropertyApi.save",
  "POST /merchant/property/delete": "PropertyApi.destroy",

  "GET /merchant/referral/get": "ReferralApi.get",
  "POST /merchant/referral/save": "ReferralApi.save",
  "POST /merchant/referral/delete": "ReferralApi.destroy",

  "GET /merchant/reward/get": "RewardApi.get",
  "POST /merchant/reward/save": "RewardApi.save",
  "POST /merchant/reward/delete": "RewardApi.destroy",

  "GET /merchant/time-period/get": "TimePeriodApi.get",
  "POST /merchant/time-period/save": "TimePeriodApi.save",
  "POST /merchant/time-period/delete": "TimePeriodApi.destroy",

  "GET /merchant/settlement-period/get": "SettlementPeriodApi.get",
  "POST /merchant/settlement-period/save": "SettlementPeriodApi.save",
  "POST /merchant/settlement-period/delete": "SettlementPeriodApi.destroy",
  "GET /merchant/settlement/calculation/get": "SettlementApi.get",
  "POST /merchant/settlement/calculation/save": "SettlementApi.save",
  "POST /merchant/settlement/calculation/delete": "SettlementApi.destroy",

  "GET /merchant/get": "MerchantApi.get",
  "POST /merchant/update": "MerchantApi.update",
  "POST /merchant/delete": "MerchantApi.destroy",
  "POST /merchant/signup": "MerchantApi.signup",
  "POST /merchant/admin-signup": "MerchantApi.admin_merchant_onboard",
  "POST /merchant/login": "MerchantApi.merchantLogin",
  "POST /merchant/update-password": "MerchantApi.update_password",

  "GET /merchant/status/get": "MerchantStatusApi.get",
  "POST /merchant/status/save": "MerchantStatusApi.save",
  "POST /merchant/status/delete": "MerchantStatusApi.destroy",

  "GET /company-type/get": "CompanyTypeApi.get",
  "POST /company-type/save": "CompanyTypeApi.save",
  "POST /company-type/delete": "CompanyTypeApi.destroy",

  "GET /account-type/get": "AccountTypeApi.get",
  "POST /account-type/save": "AccountTypeApi.save",
  "POST /account-type/delete": "AccountTypeApi.destroy",

  "GET /bank-details/get": "BankDetailsApi.get",
  "POST /bank-details/save": "BankDetailsApi.save",
  "POST /bank-details/delete": "BankDetailsApi.destroy",

  "POST /payment-verification/merchant":
    "PaymentVerificationApi.validate_merchant",
  "POST /payment-verification/merchant-user":
    "PaymentVerificationApi.validate_merchant_and_user",
};

module.exports = merchantRoutes;
