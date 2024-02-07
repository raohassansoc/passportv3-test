let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Restaurant = require("./Restaurant");
const ScheduleDay = require("./ScheduleDay");

let ScheduleSchema = new Schema({
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Restaurant,
    required: [
      true,
      "Restaurant Details required for Adding the Schedule Data.",
    ],
  },
  schedule_day_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ScheduleDay,
    required: [
      true,
      "Schedule Day Details required for Adding the Schedule Data.",
    ],
  },
  openning_hours_start_time: {
    type: Date,
    default: Date,
    set: function (openning_hours_start_time) {
      openning_hours_start_time = new Date(openning_hours_start_time);
      const year = openning_hours_start_time.getFullYear();
      const month = openning_hours_start_time.getMonth();
      const day = openning_hours_start_time.getDate();
      const hours = openning_hours_start_time.getHours();
      const minutes = openning_hours_start_time.getMinutes();
      const seconds = openning_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
  },
  openning_hours_end_time: {
    type: Date,
    default: Date,
    set: function (openning_hours_end_time) {
      openning_hours_end_time = new Date(openning_hours_end_time);
      const year = openning_hours_end_time.getFullYear();
      const month = openning_hours_end_time.getMonth();
      const day = openning_hours_end_time.getDate();
      const hours = openning_hours_end_time.getHours();
      const minutes = openning_hours_end_time.getMinutes();
      const seconds = openning_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  breakfast_hours_start_time: {
    type: Date,
    default: Date,
    set: function (breakfast_hours_start_time) {
      breakfast_hours_start_time = new Date(breakfast_hours_start_time);
      const year = breakfast_hours_start_time.getFullYear();
      const month = breakfast_hours_start_time.getMonth();
      const day = breakfast_hours_start_time.getDate();
      const hours = breakfast_hours_start_time.getHours();
      const minutes = breakfast_hours_start_time.getMinutes();
      const seconds = breakfast_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  breakfast_hours_end_time: {
    type: Date,
    default: Date,
    set: function (breakfast_hours_end_time) {
      breakfast_hours_end_time = new Date(breakfast_hours_end_time);
      const year = breakfast_hours_end_time.getFullYear();
      const month = breakfast_hours_end_time.getMonth();
      const day = breakfast_hours_end_time.getDate();
      const hours = breakfast_hours_end_time.getHours();
      const minutes = breakfast_hours_end_time.getMinutes();
      const seconds = breakfast_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
  },
  brunch_hours_start_time: {
    type: Date,
    default: Date,
    set: function (brunch_hours_start_time) {
      brunch_hours_start_time = new Date(brunch_hours_start_time);
      const year = brunch_hours_start_time.getFullYear();
      const month = brunch_hours_start_time.getMonth();
      const day = brunch_hours_start_time.getDate();
      const hours = brunch_hours_start_time.getHours();
      const minutes = brunch_hours_start_time.getMinutes();
      const seconds = brunch_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  brunch_hours_end_time: {
    type: Date,
    default: Date,
    set: function (brunch_hours_end_time) {
      brunch_hours_end_time = new Date(brunch_hours_end_time);
      const year = brunch_hours_end_time.getFullYear();
      const month = brunch_hours_end_time.getMonth();
      const day = brunch_hours_end_time.getDate();
      const hours = brunch_hours_end_time.getHours();
      const minutes = brunch_hours_end_time.getMinutes();
      const seconds = brunch_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
  },
  lunch_hours_start_time: {
    type: Date,
    default: Date,
    set: function (lunch_hours_start_time) {
      lunch_hours_start_time = new Date(lunch_hours_start_time);
      const year = lunch_hours_start_time.getFullYear();
      const month = lunch_hours_start_time.getMonth();
      const day = lunch_hours_start_time.getDate();
      const hours = lunch_hours_start_time.getHours();
      const minutes = lunch_hours_start_time.getMinutes();
      const seconds = lunch_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  lunch_hours_end_time: {
    type: Date,
    default: Date,
    set: function (lunch_hours_end_time) {
      lunch_hours_end_time = new Date(lunch_hours_end_time);
      const year = lunch_hours_end_time.getFullYear();
      const month = lunch_hours_end_time.getMonth();
      const day = lunch_hours_end_time.getDate();
      const hours = lunch_hours_end_time.getHours();
      const minutes = lunch_hours_end_time.getMinutes();
      const seconds = lunch_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
  },
  refreshment_hours_start_time: {
    type: Date,
    default: Date,
    set: function (refreshment_hours_start_time) {
      refreshment_hours_start_time = new Date(refreshment_hours_start_time);
      const year = refreshment_hours_start_time.getFullYear();
      const month = refreshment_hours_start_time.getMonth();
      const day = refreshment_hours_start_time.getDate();
      const hours = refreshment_hours_start_time.getHours();
      const minutes = refreshment_hours_start_time.getMinutes();
      const seconds = refreshment_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  refreshment_hours_end_time: {
    type: Date,
    default: Date,
    set: function (refreshment_hours_end_time) {
      refreshment_hours_end_time = new Date(refreshment_hours_end_time);
      const year = refreshment_hours_end_time.getFullYear();
      const month = refreshment_hours_end_time.getMonth();
      const day = refreshment_hours_end_time.getDate();
      const hours = refreshment_hours_end_time.getHours();
      const minutes = refreshment_hours_end_time.getMinutes();
      const seconds = refreshment_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
  },
  dinner_hours_start_time: {
    type: Date,
    default: Date,
    set: function (dinner_hours_start_time) {
      dinner_hours_start_time = new Date(dinner_hours_start_time);
      const year = dinner_hours_start_time.getFullYear();
      const month = dinner_hours_start_time.getMonth();
      const day = dinner_hours_start_time.getDate();
      const hours = dinner_hours_start_time.getHours();
      const minutes = dinner_hours_start_time.getMinutes();
      const seconds = dinner_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  dinner_hours_end_time: {
    type: Date,
    default: Date,
    set: function (dinner_hours_end_time) {
      dinner_hours_end_time = new Date(dinner_hours_end_time);
      const year = dinner_hours_end_time.getFullYear();
      const month = dinner_hours_end_time.getMonth();
      const day = dinner_hours_end_time.getDate();
      const hours = dinner_hours_end_time.getHours();
      const minutes = dinner_hours_end_time.getMinutes();
      const seconds = dinner_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
  },
  maintenance_hours_start_time: {
    type: Date,
    default: Date,
    set: function (maintenance_hours_start_time) {
      maintenance_hours_start_time = new Date(maintenance_hours_start_time);
      const year = maintenance_hours_start_time.getFullYear();
      const month = maintenance_hours_start_time.getMonth();
      const day = maintenance_hours_start_time.getDate();
      const hours = maintenance_hours_start_time.getHours();
      const minutes = maintenance_hours_start_time.getMinutes();
      const seconds = maintenance_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  maintenance_hours_end_time: {
    type: Date,
    default: Date,
    set: function (maintenance_hours_end_time) {
      maintenance_hours_end_time = new Date(maintenance_hours_end_time);
      const year = maintenance_hours_end_time.getFullYear();
      const month = maintenance_hours_end_time.getMonth();
      const day = maintenance_hours_end_time.getDate();
      const hours = maintenance_hours_end_time.getHours();
      const minutes = maintenance_hours_end_time.getMinutes();
      const seconds = maintenance_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
  },
  renovation_hours_start_time: {
    type: Date,
    default: Date,
    set: function (renovation_hours_start_time) {
      renovation_hours_start_time = new Date(renovation_hours_start_time);
      const year = renovation_hours_start_time.getFullYear();
      const month = renovation_hours_start_time.getMonth();
      const day = renovation_hours_start_time.getDate();
      const hours = renovation_hours_start_time.getHours();
      const minutes = renovation_hours_start_time.getMinutes();
      const seconds = renovation_hours_start_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 1);
      return new_date;
    },
  },
  renovation_hours_end_time: {
    type: Date,
    default: Date,
    set: function (renovation_hours_end_time) {
      renovation_hours_end_time = new Date(renovation_hours_end_time);
      const year = renovation_hours_end_time.getFullYear();
      const month = renovation_hours_end_time.getMonth();
      const day = renovation_hours_end_time.getDate();
      const hours = renovation_hours_end_time.getHours();
      const minutes = renovation_hours_end_time.getMinutes();
      const seconds = renovation_hours_end_time.getSeconds();
      const new_date = new Date(year, month, day, hours, minutes, seconds, 0);
      return new_date;
    },
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

ScheduleSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Schedule = mongoose.model("schedules", ScheduleSchema);
module.exports = Schedule;
