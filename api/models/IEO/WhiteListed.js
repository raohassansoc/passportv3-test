let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let WhitelistedSchemas = new Schema({
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email_id: {
    type: String,
  },
  whatsapp_number: {
    type: String,
  },
  job_title: {
    type: String,
  },
  company_name: {
    type: String,
  },
  is_terms_condition: {
    type: Boolean,
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

let WhiteListed = mongoose.model("ieo_whitelisted", WhitelistedSchemas);
module.exports = WhiteListed;
