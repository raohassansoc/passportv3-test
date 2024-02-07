let mongoose = require("mongoose");
const Country = require("../Master/Country");
const IndustryType = require("./IndustryType");
const IntegrationPartnerStatus = require("./IntegrationPartnerStatus");
let Schema = mongoose.Schema;

let IntegrationPartnerSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Integration Partner Name."],
  },
  hosted_end_point: {
    type: String,
    required: [true, "Please Provide Integration Partner Hosted End Point."],
  },
  authorization_token: {
    type: String,
    required: [true, "Please Provide Integration Partner Authorization Token."],
  },
  hq_address: {
    type: String,
  },
  industry_type_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: IndustryType,
    },
  ],
  status_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: IntegrationPartnerStatus,
    required: [true, "Please Provide Integration Partner Status."],
  },
  vat_number: {
    type: String,
  },
  registration_number: {
    type: String,
  },
  contact_person_name: {
    type: String,
  },
  contact_code_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [
      true,
      "Please Provide Contact Code for Contact details of Contact Person.",
    ],
  },
  contact_number: {
    type: Number,
    required: [true, "Please Provide Contact number of Contact Person."],
  },
  contact_email_id: {
    type: String,
  },
  nda: {
    type: String,
  },
  contract_in_place: {
    type: String,
  },
  free_text: {
    type: String,
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

IntegrationPartnerSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let IntegrationPartner = mongoose.model(
  "integration_partner",
  IntegrationPartnerSchema
);

module.exports = IntegrationPartner;
