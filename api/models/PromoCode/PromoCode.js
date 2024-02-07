let mongoose = require("mongoose");
const DiscountType = require("./DiscountType");
const Event = require("../Event/Event");
let Schema = mongoose.Schema;

let PromoCodeSchema = new Schema({
  code: {
    type: String,
    required: [true, "Please Provide Promo Code Name/Code."],
    unique: [true, "Promo Code with this Code already exists."],
    minLength: [2, "Promo Code Name/Code Must be at least 2 characters long."],
    maxLength: [50, "Promo Code Name/Code must be at most 50 characters long."],
  },
  description: {
    type: String,
    minLength: [5, "Promo Code Description Must be atleast 5 characters long."],
    maxLength: [
      100,
      "Promo Code Description must be atmost 100 chracters long.",
    ],
  },
  discount_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DiscountType,
    required: [true, "Discount Type required for Promo Code."],
  },
  discount_value: {
    type: Number,
    required: [
      true,
      "Please Provide Discount value associated with Promo Code.",
    ],
  },
  is_redeemed: {
    type: Boolean,
    default: false,
  },
  start_date: {
    type: Date,
    default: new Date(),
  },
  end_date: {
    type: Date,
    default: new Date(),
  },
  event_list_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Event,
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

PromoCodeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let PromoCode = mongoose.model("promo_code", PromoCodeSchema);
module.exports = PromoCode;
