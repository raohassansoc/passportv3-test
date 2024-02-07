let mongoose = require("mongoose");
const EventCategory = require("./EventCategory");
const Currency = require("../Master/Currency");
const EventHost = require("./EventHost");
const MusicGenre = require("./MusicGenre");
const City = require("../Master/City");
let Schema = mongoose.Schema;

let EventSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Event Name."],
    unique: [true, "Event Name already exists."],
    minLength: [2, "Event name Must be atleast 2 characters long."],
    maxLength: [50, "Event name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    minLength: [10, "Event Description Must be atleast 5 characters long."],
    maxLength: [1000, "Event Description must be atmost 1000 characters long."],
  },
  thumbnail_image: {
    type: String,
    required: [true, "Event Thumbnail Image required."],
  },
  images: {
    type: [String],
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: EventCategory,
    required: [true, "Event Category required for Event details."],
  },
  date: {
    type: Date,
    retuired: [true, "Event Date required."],
  },
  start_time: {
    type: Date,
    required: [true, "Event Start Date/Time required."],
  },
  end_time: {
    type: Date,
    required: [true, "Event End Date/Time required."],
  },
  time_zone_name: {
    type: String,
  },
  currency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
    // required: [true, "Currency required for the event."],
  },
  event_host_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: EventHost,
    },
  ],
  music_genre_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: MusicGenre,
    },
  ],
  is_featured: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    required: [true, "Please Provide Location of the event."],
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
    required: [true, "Please Provide City Name for Event"],
  },
  // remove in future
  total_guest_invitation_limit: {
    type: Number,
    // required: [true, "Please Provide Total Guest Invitation Limit for Event"],
  },
  total_booking_limit: {
    type: Number,
    // required: [true, "Please Provide Total Booking Limit for Event."],
  },
  // remove in future
  price_per_invitation: {
    type: Number,
    required: [true, "Please Provide Total Price Per Invitation for Event"],
  },
  total_tickets: {
    type: Number,
    default: 100,
    required: [true, "Please Provide Total Ticket Quantity."],
  },
  available_tickets: {
    type: Number,
  },
  sale: {
    type: Boolean,
    default: true,
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

EventSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Event = mongoose.model("event", EventSchema);
module.exports = Event;
