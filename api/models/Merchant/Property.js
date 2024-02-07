let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Country = require("../Master/Country");
const Province = require("../Master/Province");
const City = require("../Master/City");
const ZipCode = require("../Master/ZipCode");
const PropertyCateCategory = require("./PropertyCategory");
const Merchant = require("./Merchant");
const { ARRAY } = require("sequelize");

let PropertySchemas = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  property_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: PropertyCateCategory,
  },
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Merchant,
  },
  property_size: {
    type: String,
  },
  image: {
    type: [String],
  },
  thumbnail_image: {
    type: String,
  },
  property_code: {
    type: String,
  },
  primary_contact_number: {
    type: Number,
  },
  is_primary_number_whatsapp: {
    type: Number,
  },
  alternate_contact_number: {
    type: Number,
  },
  email_id: {
    type: String,
  },
  accepted_currency: {
    type: String,
  },
  address_line_1: {
    type: String,
  },
  address_line_2: {
    type: String,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Province,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
  },
  zipcode_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ZipCode,
  },
  manager_name: {
    type: String,
  },
  manager_email_id: {
    type: String,
  },
  manager_contact_number: {
    type: Number,
  },
  is_deleted: {
    type: Boolean,
  },
  deleted_at: {
    type: Date,
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
PropertySchemas.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let Property = mongoose.model("merchant_property", PropertySchemas);
module.exports = Property;
