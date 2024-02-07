let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let Model = mongoose.model;
const User = require("./User");

const UserDeviceSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  ip_address: {
    type: String,
    required: true,
    unique: true,
  },
  mac_address: {
    type: String,
    required: true,
    unique: true,
  },
  os: {
    type: String,
  },
  model_number: {
    type: String,
  },
  model_name: {
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
});

UserDeviceSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let UserDevice = Model("user_device", UserDeviceSchema);
module.exports = UserDevice;
