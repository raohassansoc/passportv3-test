let mongoose = require("mongoose");
const { DECIMAL } = require("sequelize");
let Schema = mongoose.Schema;
const CountrySchema = require("./Country");

let ProvinceSchema = new Schema({
  name: {
    type: String,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CountrySchema,
  },
  state_code: {
    type: String,
  },
  latitude: {
    type: Schema.Types.Decimal128,
  },
  longitude: {
    type: Schema.Types.Decimal128,
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
let Province = mongoose.model("master_provinces", ProvinceSchema);
module.exports = Province;
