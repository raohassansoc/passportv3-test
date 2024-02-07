let mongoose = require("mongoose");
const Business = require("../Business/Business");
const Location = require("../Business/Location");
const RealEstate = require("../Business/RealEstate");
const IntegrationPartner = require("../IntegrationPartner/IntegrationPartner");
const RestaurantCategory = require("./RestaurantCategory");
const Currency = require("../Master/Currency");
const Country = require("../Master/Country");
const City = require("../Master/City");
const Province = require("../Master/Province");
let Schema = mongoose.Schema;

let RestaurantSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Restaurant Name."],
    minLength: [2, "Restaurant name Must be atleast 2 characters long."],
    maxLength: [100, "Restaurant name must be atmost 100 chracters long."],
  },
  description: {
    type: String,
  },
  business_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Business,
  },
  restaurant_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: RestaurantCategory,
    required: [
      true,
      "Restaurant Category Details required for Adding the Restaurant Data.",
    ],
  },
  restaurant_uuid: {
    type: String,
  },
  cuisine_uuid: {
    type: String,
  },
  neighbourhood_uuid: {
    type: String,
  },
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Location,
  }, // details in the location reference is service details

  company_name: {
    type: String,

  }, // business id in nutshell
  vat_number: {
    type: String,
  },
  public_key: {
    type: String,
  },
  thumbnail_image: {
    type: String,
  },
  images: {
    type: [String],
  },
  menu_url: {
    type: String,
  },
  website_url: {
    type: String,
  },
  primary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Contact Code required for Restaurant."],
  },
  primary_contact_number: {
    type: Number,
    required: [true, "Contact Number required for Restaurant."],
  },
  email_id: {
    type: String,
    unique: [
      true,
      "This Email ID is already being used by another Restaurant.",
    ],
    required: [true, "Email ID required for Restaurant."],
  },
  local_name: {
    type: String,
  },
  street_name: {
    type: String,
  },
  address_line_1: {
    type: String,
  },
  address_line_2: {
    type: String,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Province,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Country Data required for Restaurant."],
  },
  region_id: {
    type: String,
  },
  cuisine_id: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  is_featured: {
    type: Boolean,
    default: false,
  },
  location_googlemaps_link: {
    type: String,
  },
  ip_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: IntegrationPartner,
    },
  ],
  time_zone_name: {
    type: String,
    required: [true, "Please Provide Time Zone/Region Name."],
  },
  time_zone_delta: {
    type: String,
  },
  reservation_notice_duration: {
    type: Number,
  },
  attire: {
    type: String,
  },
  slug: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  alcohol_allowed: {
    type: Boolean,
    default: false,
  },
  kids_allowed: {
    type: Boolean,
    default: false,
  },
  pets_allowed: {
    type: Boolean,
    default: false,
  },
  is_vegetarian: {
    type: Boolean,
    default: true,
  },
  vallet_parking_available: {
    type: Boolean,
    default: false,
  },
  outdoor_seating_available: {
    type: Boolean,
    default: false,
  },
  smoking_allowed: {
    type: Boolean,
    default: false,
  },
  labels: {
    type: [String],
  },
  good_for: {
    type: [String],
  },
  no_of_tables: {
    type: Number,
  },
  total_max_capacity: {
    type: Number,
  },
  terms_and_conditions: {
    type: [String],
  },
  accepted_currency: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Currency,
    },
  ],
  average_rating: {
    type: Number,
    default: 0,
  },
  no_of_ratings: {
    type: Number,
    default: 0,
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

RestaurantSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Restaurant = mongoose.model("restaurant", RestaurantSchema);
module.exports = Restaurant;
