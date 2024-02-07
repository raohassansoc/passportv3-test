let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let EventHostSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Event Host Name."],
    minLength: [2, "Event Host name Must be atleast 2 characters long."],
    maxLength: [50, "Event Host name must be atmost 50 chracters long."],
  },
  title: {
    type: String,
    required: [true, "Please provide Title for Event Host."],
  },
  image: {
    type: String,
    required: [true, "Please Provide Image of Event Host."],
  },
  description: {
    type: String,
  },
  facebook_url: {
    type: String,
    required: [true, "Please Provide Facebook URL of Event Host."],
  },
  instagram_url: {
    type: String,
    required: [true, "Please Provide Instagram URL of Event Host."],
  },
  youtube_url: {
    type: String,
    required: [true, "Please Provide Youtube URL of Event Host."],
  },
  spotify_url: {
    type: String,
    required: [true, "Please Provide Spotify URL of Event Host."],
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

EventHostSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let EventHost = mongoose.model("event_host", EventHostSchema);
module.exports = EventHost;
