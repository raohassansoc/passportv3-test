const AccountTypeSchema = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Name",
  },
};
const CategorySchemas = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Name",
  },
};
const CompanyTypeSchema = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Name",
  },
};
const ReferralSchemas = {
  validator: {
    value: "required|decimal",
    merchant_id: "string",
  },
  niceNames: {
    name: "Name",
  },
};
const RewardSchemas = {
  validator: {
    value: "required|decimal",
    merchant_id: "string",
  },
  niceNames: {
    name: "Name",
  },
};
const SettlementPeriodSchemas = {
  validator: {
    value: "required|integer",
    merchant_id: "string",
  },
  niceNames: {
    name: "Name",
  },
};
const MerchantSchemas = {
  validator: {
  },
  niceNames: {
  },
};
const MerchantStatusSchemas = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Merchant Status Name",
  },
};
const TimePeriodSchemas = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Name",
  },
};
const PropertySchemas = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Name",
  },
};
const BankDetailsSchemas = {
  validator: {},
  niceNames: {},
};

module.exports = {
  AccountTypeSchema,
  CategorySchemas,
  CompanyTypeSchema,
  MerchantSchemas,
  MerchantStatusSchemas,
  PropertySchemas,
  BankDetailsSchemas,
  ReferralSchemas,
  RewardSchemas,
  TimePeriodSchemas,
  SettlementPeriodSchemas,
};
