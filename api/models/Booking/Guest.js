let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let GuestSchema = new Schema({
  first_name: {
    type: String,
    required: [true, "Please Provide Guest First Name of Guest."],
  },
  last_name: {
    type: String,
    required: [true, "Please Provide Guest Last Name of Guest."],
  },
  email_id: {
    type: String,
  },
  contact_number: {
    type: Number,
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

GuestSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Guest = mongoose.model("guest", GuestSchema);
module.exports = Guest;
