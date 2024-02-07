let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let SettlementTypeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Settlement Type Name."],
    minLength: [2, "Settlement Type name Must be atleast 2 characters long."],
    maxLength: [50, "Settlement Type name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    required: [true, "Please Provide Settlement Type Description."],
    minLength: [
      5,
      "Settlement Type Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Settlement Type Description must be atmost 100 chracters long.",
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

SettlementTypeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let SettlementType = mongoose.model("settlement_type", SettlementTypeSchema);
module.exports = SettlementType;
