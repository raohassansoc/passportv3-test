let mongoose = require("mongoose");
const Country = require("../Master/Country");
const Province = require("../Master/Province");
const City = require("../Master/City");
const ZipCode = require("../Master/ZipCode");
const Merchant = require("./Merchant");
const AccountType = require("./AccountType");
let Schema = mongoose.Schema;

let BankDetailsSchemas = new Schema({
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Merchant,
    required: true,
  },
  bank_name: {
    type: String,
  },
  account_holder_name: {
    type: String,
  },
  bank_branch_code: {
    type: String,
  },
  account_number: {
    type: String,
  },
  account_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: AccountType,
  },
  swift_code: {
    type: String,
  },
  iban: {
    type: String,
  },
  bank_address_line_1: {
    type: String,
  },
  bank_address_line_2: {
    type: String,
  },
  bank_city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
  },
  bank_province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Province,
  },
  bank_country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  bank_zipcode: {
    type: String,
  },
  miscleneous_details: [
    {
      key: { type: String },
      value: { type: String },
    },
  ],
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

BankDetailsSchemas.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let MerchantBankDetails = mongoose.model(
  "merchant_bank_detils",
  BankDetailsSchemas
);

module.exports = MerchantBankDetails;
