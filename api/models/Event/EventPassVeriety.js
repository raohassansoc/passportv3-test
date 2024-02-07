let mongoose = require("mongoose");
const Event = require("./Event");
let Schema = mongoose.Schema;

let EventPassVarietySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Event Pass Veriety Name."],
    minLength: [
      2,
      "Event Pass Veriety name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Event Pass Veriety name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    minLength: [
      10,
      "Event Pass Veriety Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      1000,
      "Event Pass Veriety Description must be atmost 1000 characters long.",
    ],
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Event,
    required: [
      true,
      "Event reference required for Event Pass Variety details.",
    ],
  },
  actual_price: {
    type: Number,
    required: [
      true,
      "Event Pass Variety Actual Price required to add Event Pass.",
    ],
  },
  sell_price: {
    type: Number,
    required: [
      true,
      "Event Pass Variety Sell Price required to add Event Pass.",
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

EventPassVarietySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let EventPassVariety = mongoose.model(
  "event_pass_variety",
  EventPassVarietySchema
);
module.exports = EventPassVariety;
