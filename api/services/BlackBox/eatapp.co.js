const AttributeMapping = require("../../models/IntegrationPartner/AttributeMapping");
const Country = require("../../models/Master/Country");
const Cuisine = require("../../models/Restaurant/Cuisine");
const { ObjectId } = require("mongodb");
const crudServices = require("../../services/mongo.crud.services");
const City = require("../../models/Master/City");
const Province = require("../../models/Master/Province");
const RestaurantCategory = require("../../models/Restaurant/RestaurantCategory");
const axios = require("axios");

const convertDatafromIPtoSelf = async (ip_id, data) => {
  try {
    let restaurant_reqData = {};

    if (data.region) {
      let whereClause_country = {};
      whereClause_country.is_deleted = false;
      whereClause_country.name = { $regex: data.region, $options: "i" };
      let exec_country = {
        where: whereClause_country,
      };
      let country = await crudServices.get(Country, exec_country);
      if (country.data[0] == undefined) {
        let country_data = await crudServices.insert(Country, {
          name: data.region,
          country_uuid: data.region_id,
        });
        restaurant_reqData.country_id = country_data._id;
      } else {
        if (country.country_uuid != data.region_id)
          await crudServices.update(
            Country,
            { _id: country.data[0]._id },
            { country_uuid: data.region_id }
          );
        restaurant_reqData.country_id = country.data[0]._id;
      }
    } else {
      let whereClause_country = {};
      whereClause_country.is_deleted = false;
      whereClause_country.name = { $regex: "not-available", $options: "i" };
      let exec_country = {
        where: whereClause_country,
      };
      let country = await crudServices.get(Country, exec_country);
      if (country.data[0] == undefined) {
        let country_data = await crudServices.insert(Country, {
          name: "not-available",
          country_uuid: data.region_id,
        });
        restaurant_reqData.country_id = country_data._id;
      } else {
        if (country.country_uuid != data.region_id)
          await crudServices.update(
            Country,
            { _id: country.data[0]._id },
            { country_uuid: data.region_id }
          );
        restaurant_reqData.country_id = country.data[0]._id;
      }
    }

    if (data.province) {
      let whereClause_province = {};
      whereClause_province.is_deleted = false;
      whereClause_province.name = { $regex: data.province, $options: "i" };
      let exec_province = {
        where: whereClause_province,
      };
      let province = await crudServices.get(Province, exec_province);
      if (province.data[0] == undefined) {
        let province_to_add = {};
        province_to_add.name = data.province;
        if (data.region)
          province_to_add.country_id = restaurant_reqData.country_id;
        let province_data = await crudServices.insert(
          Province,
          province_to_add
        );
        restaurant_reqData.province_id = province_data._id;
      } else {
        restaurant_reqData.province_id = province.data[0]._id;
      }
    } else {
      let whereClause_province = {};
      whereClause_province.is_deleted = false;
      whereClause_province.name = { $regex: "not-available", $options: "i" };
      let exec_province = {
        where: whereClause_province,
      };
      let province = await crudServices.get(Province, exec_province);
      if (province.data[0] == undefined) {
        let province_to_add = {};
        province_to_add.name = "not-available";
        if (data.region)
          province_to_add.country_id = restaurant_reqData.country_id;
        let province_data = await crudServices.insert(
          Province,
          province_to_add
        );
        restaurant_reqData.province_id = province_data._id;
      } else {
        restaurant_reqData.province_id = province.data[0]._id;
      }
    }

    if (data.city) {
      let whereClause_city = {};
      whereClause_city.is_deleted = false;
      whereClause_city.name = { $regex: data.city, $options: "i" };
      let exec_city = {
        where: whereClause_city,
      };
      let city = await crudServices.get(City, exec_city);
      if (city.data[0] == undefined) {
        let city_data = await crudServices.insert(City, {
          name: data.city,
          province_id: restaurant_reqData.province_id,
          country_id: restaurant_reqData.country_id,
        });
        restaurant_reqData.city_id = city_data._id;
      } else {
        restaurant_reqData.city_id = city.data[0]._id;
      }
    } else {
      let whereClause_city = {};
      whereClause_city.is_deleted = false;
      whereClause_city.name = { $regex: "not-available", $options: "i" };
      let exec_city = {
        where: whereClause_city,
      };
      let city = await crudServices.get(City, exec_city);
      if (city.data[0] == undefined) {
        let city_data = await crudServices.insert(City, {
          name: "not-available",
          province_id: restaurant_reqData.province_id,
          country_id: restaurant_reqData.country_id,
        });
        restaurant_reqData.city_id = city_data._id;
      } else {
        restaurant_reqData.city_id = city.data[0]._id;
      }
    }

    let cuisine_id = null;
    if (data.cuisine) {
      let whereClause_cuisine = {};
      whereClause_cuisine.is_deleted = false;
      whereClause_cuisine.name = { $regex: data.cuisine, $options: "i" };
      let exec_cuisine = {
        where: whereClause_cuisine,
      };
      let cuisine = await crudServices.get(Cuisine, exec_cuisine);
      if (cuisine.data[0] == undefined) {
        let cuisine_data = await crudServices.insert(Cuisine, {
          name: data.cuisine,
        });
        cuisine_id = cuisine_data._id;
      } else {
        cuisine_id = cuisine.data[0]._id;
      }
    }
    restaurant_reqData.cuisine_id = cuisine_id;

    if (data.establishment_type) {
      let whereClause_restaurant_category = {};
      whereClause_restaurant_category.is_deleted = false;
      whereClause_restaurant_category.name = {
        $regex: data.establishment_type,
        $options: "i",
      };

      let exec_rc = {
        where: whereClause_restaurant_category,
      };

      let restaurant_category = await crudServices.get(
        RestaurantCategory,
        exec_rc
      );

      if (restaurant_category.data[0] == undefined) {
        let restaurant_category_data = await crudServices.insert(
          RestaurantCategory,
          { name: data.establishment_type }
        );
        restaurant_reqData.restaurant_category_id =
          restaurant_category_data._id;
      } else {
        restaurant_reqData.restaurant_category_id =
          restaurant_category.data[0]._id;
      }
    } else {
      let whereClause_restaurant_category = {};
      whereClause_restaurant_category.is_deleted = false;
      whereClause_restaurant_category.name = {
        $regex: "not-available",
        $options: "i",
      };

      let exec_rc = {
        where: whereClause_restaurant_category,
      };

      let restaurant_category = await crudServices.get(
        RestaurantCategory,
        exec_rc
      );

      if (restaurant_category.data[0] == undefined) {
        let restaurant_category_data = await crudServices.insert(
          RestaurantCategory,
          { name: "not-available" }
        );
        restaurant_reqData.restaurant_category_id =
          restaurant_category_data._id;
      } else {
        restaurant_reqData.restaurant_category_id =
          restaurant_category.data[0]._id;
      }
    }

    restaurant_reqData.cuisine_uuid = data.cuisine_id;
    restaurant_reqData.neighbourhood_uuid = data.neighbourhood_uuid;

    restaurant_reqData.name = data.name;
    restaurant_reqData.description = data.description;
    restaurant_reqData.company_name = data.name;

    restaurant_reqData.restaurant_uuid = data.restaurant_uuid;
    restaurant_reqData.cuisine_uuid = data.cuisine_uuid;
    restaurant_reqData.neighbourhood_uuid = data.neighbourhood_uuid;
    restaurant_reqData.thumbnail_image = data.image_url;
    restaurant_reqData.images = data.image_urls;
    restaurant_reqData.menu_url = data.menu_url;
    restaurant_reqData.website_url = data.website;
    restaurant_reqData.primary_contact_id = restaurant_reqData.country_id;
    if (data.phone[0] == "+") data.phone = data.phone.substr(1);
    data.phone = parseInt(data.phone);
    restaurant_reqData.primary_contact_number = data.phone;
    restaurant_reqData.email_id = data.contact_email;
    restaurant_reqData.local_name = data.neighborhood;
    restaurant_reqData.street_name = data.neighborhood;
    restaurant_reqData.address_line_1 = data.address_line_1;
    restaurant_reqData.address_line_2 = data.address_line_2;
    restaurant_reqData.region_id = data.region_id;
    restaurant_reqData.zipcode = data.postal_code;
    restaurant_reqData.is_featured = true;
    restaurant_reqData.time_zone_name = data.time_zone_name;

    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${data.latitude}%2C${data.longitude}&timestamp=1331161200&key=${process.env.google_map_api_key}`;
    const tz_r = await axios.get(url);

    const time_diff_in_sec = tz_r.data.rawOffset;
    let time_zone_delta = "UTC";
    if (time_diff_in_sec > 0) time_zone_delta = `${time_zone_delta}+`;
    else time_zone_delta = `${time_zone_delta}-`;

    let abs_time_diff_in_sec = Math.abs(time_diff_in_sec);
    let time_diff_in_min = abs_time_diff_in_sec / 60;

    let hour_str;
    if (parseInt(time_diff_in_min / 60) < 10)
      hour_str = `0${parseInt(time_diff_in_min / 60)}`;
    else hour_str = `${parseInt(time_diff_in_min / 60)}`;

    let min_str;
    if (time_diff_in_min % 60 < 10) min_str = `0${time_diff_in_min % 60}`;
    else min_str = `${time_diff_in_min % 60}`;
    time_zone_delta = `${time_zone_delta}${hour_str}:${min_str}`;

    restaurant_reqData.time_zone_delta = time_zone_delta;
    restaurant_reqData.reservation_notice_duration =
      data.restaurant_notice_duration;
    restaurant_reqData.attire = data.attire;
    restaurant_reqData.slug = data.slug;
    restaurant_reqData.latitude = data.latitude;
    restaurant_reqData.longitude = data.longitude;
    restaurant_reqData.alcohol_allowed = data.alcohol;
    restaurant_reqData.vallet_parking_available = data.valet;
    restaurant_reqData.outdoor_seating_available = data.outdoor_seating;
    restaurant_reqData.smoking_allowed = data.smoking;
    restaurant_reqData.labels = data.labels;
    restaurant_reqData.good_for = data.good_for;
    restaurant_reqData.terms_and_conditions = data.terms_and_conditions;
    if (data.ratings_average)
      restaurant_reqData.average_rating = parseFloat(data.ratings_average);
    if (data.ratings_count)
      restaurant_reqData.no_of_ratings = parseInt(data.ratings_count);

    return restaurant_reqData;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  convertDatafromIPtoSelf,
};
