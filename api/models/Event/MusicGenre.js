let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let MusicGenreSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Event Music Genre Name."],
    minLength: [2, "Event Music Genre name Must be atleast 2 characters long."],
    maxLength: [50, "Event Music Genre name must be atmost 50 chracters long."],
  },
  description: {
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

MusicGenreSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let MusicGenre = mongoose.model("event_music_genre", MusicGenreSchema);
module.exports = MusicGenre;
