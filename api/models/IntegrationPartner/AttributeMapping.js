let mongoose = require("mongoose");
const IntegrationPartner = require("./IntegrationPartner");
let Schema = mongoose.Schema;

let AttributeMappingSchema = new Schema({
  ip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: IntegrationPartner,
    required: [
      true,
      "Integration Partner Details required for Adding the Attribute Mapping.",
    ],
  },
  map: [
    {
      self_attr_name: String,
      ip_attr_name: String,
    },
  ],
  reverse_map: [
    {
      ip_attr_name: String,
      self_attr_name: String,
    },
  ],
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

AttributeMappingSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let AttributeMapping = mongoose.model(
  "attribute_mapping",
  AttributeMappingSchema
);
module.exports = AttributeMapping;
