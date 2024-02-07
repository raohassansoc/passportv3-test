let mongoose = require("mongoose");
const IntegrationPartner = require("./IntegrationPartner");
let Schema = mongoose.Schema;

let ApiListSchema = new Schema({
  ip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: IntegrationPartner,
    required: [
      true,
      "Integration Partner Details required for Adding the Api List.",
    ],
  },
  method_name: {
    type: String,
    required: [true, "Please Provide Api method Name for Api List."],
  },
  api_method: {
    type: String,
    required: [true, "Please Provide Api method for Api List."],
  },
  api_endpoint_url: {
    type: String,
    required: [true, "Please Provide Api endpoint url for Api List."],
  },
  required_attributes_query: {
    type: [String],
  },
  optional_attributes_query: {
    type: [String],
  },
  required_attributes_params: {
    type: [String],
  },
  optional_attributes_params: {
    type: [String],
  },
  required_attributes_body: {
    type: [String],
  },
  optional_attributes_body: {
    type: [String],
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

ApiListSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let ApiList = mongoose.model("api_list", ApiListSchema);
module.exports = ApiList;
