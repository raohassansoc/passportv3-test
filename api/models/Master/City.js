let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let Model = mongoose.model;
const CountrySchema = require("./Country");
const ProvinceSchemas = require("./Province");

let CitySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide City Name."],
    minLength: [2, "City name Must be atleast 2 characters long."],
    maxLength: [50, "City name must be atmost 50 chracters long."],
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CountrySchema,
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ProvinceSchemas,
  },
  latitude: {
    type: Schema.Types.Decimal128,
  },
  longitude: {
    type: Schema.Types.Decimal128,
  },
  icon: {
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
CitySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let City = mongoose.model("master_cities", CitySchema);
module.exports = City;
