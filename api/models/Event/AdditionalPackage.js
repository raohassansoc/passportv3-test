let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Event = require("./Event");

let AdditionalPackageSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Event Additional Package Name."],
    minLength: [
      2,
      "Event Additional Package name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Event Addtional Package name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, "Please Provide Price for this event Additional Package."],
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Event,
    required: [
      true,
      "Event Reference required to add Additional Package of the event.",
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

AdditionalPackageSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let AdditionalPackage = mongoose.model(
  "event_additional_package",
  AdditionalPackageSchema
);

module.exports = AdditionalPackage;
