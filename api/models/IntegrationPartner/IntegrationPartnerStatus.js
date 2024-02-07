let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let IntegrationPartnerStatusSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Integration Partner Status Name."],
    minLength: [
      2,
      "Integration Partner Status name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Integration Partner Status name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Integration Partner Status Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Integration Partner Status Description must be atmost 100 chracters long.",
    ],
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

IntegrationPartnerStatusSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let IntegrationPartnerStatus = mongoose.model(
  "integration_partner_status",
  IntegrationPartnerStatusSchema
);
module.exports = IntegrationPartnerStatus;
