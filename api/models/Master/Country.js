let mongoose = require("mongoose");
const { DECIMAL } = require("sequelize");
let Schema = mongoose.Schema;

let CountrySchema = new Schema({
  name: {
    type: String,
  },
  iso3: {
    type: String,
  },
  iso2: {
    type: String,
  },
  region_uuid: {
    type: String,
  },
  numeric_code: {
    type: String,
  },
  phone_code: {
    type: String,
  },
  capital: {
    type: String,
  },
  currency: {
    type: String,
  },
  currency_name: {
    type: String,
  },
  currency_symbol: {
    type: String,
  },
  tld: {
    type: String,
  },
  native: {
    type: String,
  },
  region: {
    type: String,
  },
  subregion: {
    type: String,
  },
  latitude: {
    type: Schema.Types.Decimal128,
  },
  longitude: {
    type: Schema.Types.Decimal128,
  },
  emoji: {
    type: String,
  },
  emojiU: {
    type: String,
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
CountrySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let Country = mongoose.model("master_countries", CountrySchema);
module.exports = Country;
