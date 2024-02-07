let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ScheduleDaySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Schedule Week day name."],
    unique: [true, "Schedule Week Day Name already exists."],
    minLength: [6, "Schedule Week Day Name Must be atleast 6 characters long."],
    maxLength: [9, "Schedule Week Day Name must be atmost 9 chracters long."],
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

ScheduleDaySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let ScheduleDay = mongoose.model("schedule_day", ScheduleDaySchema);
module.exports = ScheduleDay;
