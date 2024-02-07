let mongoose = require("mongoose");
const Country = require("../Master/Country");
const Province = require("../Master/Province");
const City = require("../Master/City");
const ZipCode = require("../Master/ZipCode");
const MerchantStatus = require("./MerchantStatus");
let Schema = mongoose.Schema;
const { ObjectId } = require("mongodb");
const Currency = require("../Master/Currency");
const CompanyType = require("./CompanyType");

let MerchantSchemas = new Schema({
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  public_key: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Password required for Merchant SignUp."],
  },
  profile_picture: {
    type: String,
    default: null,
  },
  is_pwd_updated: {
    type: Boolean,
    default: false,
  },
  company_name: {
    type: String,
    default: null,
  },
  company_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CompanyType,
  },
  website_link: {
    type: String,
  },
  position_in_company: {
    type: String,
    default: null,
  },
  referral_code: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  primary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Contact Code required for Merchant SignUp."],
  },
  primary_contact_number: {
    type: Number,
    unique: [true, "Merchant with this Contact Number already exists."],
    required: [true, "Contact Number required for Merchant SignUp."],
  },
  email_id: {
    type: String,
    unique: [true, "Merchant with this Email ID already exists."],
    required: [true, "Email Id required for Merchant SignUp."],
  },
  vat_number: {
    type: String,
    default: null,
  },
  accepted_currency: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Currency,
    },
  ],
  address_line_1: {
    type: String,
    default: null,
  },
  address_line_2: {
    type: String,
    default: null,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    default: null,
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Province,
    default: null,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
    default: null,
  },
  zipcode: {
    type: String,
    default: null,
  },
  status_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MerchantStatus,
    default: ObjectId("650063d72c1366ac1161ea79"),
  },
  trading_license: {
    type: String,
    default: null,
  },
  contract: {
    type: String,
    default: null,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  updated_at: {
    type: Date,
    default: Date,
  },
  created_at: {
    type: Date,
    default: Date,
  },
});
MerchantSchemas.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let Merchant = mongoose.model("merchant", MerchantSchemas);
module.exports = Merchant;
