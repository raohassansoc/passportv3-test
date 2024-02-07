const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = require("mongodb");
const Country = require("../Master/Country");
const Merchant = require("../Merchant/Merchant");

let QRSchema = new Schema({
  name: {
    type: String,
    required: [true, "QR Name required for QR generation."],
  },
  link: {
    type: String,
    required: [true, "Please Provide QR code link."],
  },
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Merchant,
    required: [true, "Merchant Reference required to generate the QR code."],
  },
  merchant_public_key: {
    type: String,
    required: [
      true,
      "Merchant Account Reference required to generate the QR code.",
    ],
  },
  currency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Currency Reference required to generate the QR code."],
  },
  currency_qty: {
    type: String,
    required: [true, "Currency Quantity required to generate the QR code."],
  },
  qr_generation_timestamp: {
    type: Date,
    default: Date,
  },
  created_at: {
    type: Date,
    default: Date,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  updated_at: {
    type: Date,
    default: Date,
  },
});

QRSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let QR = mongoose.model("qr", QRSchema);
module.exports = QR;
