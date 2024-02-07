let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const CountrySchema = require("./Country");
const ProvinceSchemas = require("./Province");
const CitySchemas = require("./City");

let ZipCodeSchema = new Schema({
  name: {
    type: String,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CountrySchema,
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ProvinceSchemas,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CitySchemas,
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
ZipCodeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let ZipCode = mongoose.model("master_zipcode", ZipCodeSchema);
module.exports = ZipCode;
