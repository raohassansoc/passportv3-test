let mongoose = require("mongoose");
const Guest = require("./Guest");
let Schema = mongoose.Schema;
let User = require("../../models/Pay/User");
const PromoCode = require("../PromoCode/PromoCode");
const Transaction = require("../Transaction/TransactionHistory");
const Event = require("../Event/Event");
const EventPassVariety = require("../Event/EventPassVeriety");

let BookingSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: [true, "Please Provide User details who did the bookings."],
  },
  promo_code_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: PromoCode,
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Transaction,
  },
  total_guests: {
    type: Number,
  },
  guest_list_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Guest,
    },
  ],
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Event,
  },
  event_pass_variety_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: EventPassVariety,
  },
  currency: {
    type: String,
  },
  description: {
    type: String,
  },
  qr_url: {
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
  ticket_qty: {
    type: Number
  },
  ticket_number: {
    type: Number
  }
});

BookingSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Booking = mongoose.model("booking", BookingSchema);
module.exports = Booking;
