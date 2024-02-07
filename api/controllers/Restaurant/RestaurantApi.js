const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const Restaurant = require("../../models/Restaurant/Restaurant");
const { RestaurantSchema } = require("../../schemas/RestaurantSchema");
const awsHelper = require("../../helper/awsHelper");
const Web3 = require("web3");
const ApiList = require("../../models/IntegrationPartner/ApiList");
const IntegrationPartner = require("../../models/IntegrationPartner/IntegrationPartner");
const axios = require("axios");
const networkUrl = process.env.alchemy_network_url;
const web3 = new Web3(new Web3.providers.HttpProvider(networkUrl));
const eatAppServices = require("../../services/BlackBox/eatapp.co");

const RestaurantApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_data = await crudServices.get(Restaurant, executing_parameters);
      req.body.images = [];
      if (
        req.body.to_be_deleted != undefined &&
        req.body.to_be_deleted.length &&
        found_data.data[0].images.length
      ) {
        for (let i = 0; i < found_data.data[0].images.length; ++i) {
          if (req.body.to_be_deleted.includes(found_data.data[0].images[i])) {
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].images[i]
            );
          } else {
            req.body.images.push(found_data.data[0].images[i]);
          }
        }
      } else {
        for (let i = 0; i < found_data.data[0].images.length; ++i) {
          req.body.images.push(found_data.data[0].images[i]);
        }
      }

      if (req.files != null) {
        if (req.files.thumbnail_image != undefined) {
          if (found_data.data[0].thumbnail_image)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].thumbnail_image
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.thumbnail_image
          );
          req.body.thumbnail_image = url;
        }
        if (req.files.images != undefined) {
          for (let i = 0; i < req.files.images.length; ++i) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images[i]
            );
            req.body.images.push(url);
          }
          if (
            req.files.images.length == undefined &&
            req.files.images != undefined
          ) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images
            );
            req.body.images.push(url);
          }
        }
      }
    } else {
      if (req.files != null) {
        if (req.files.thumbnail_image != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.thumbnail_image
          );
          req.body.thumbnail_image = url;
        }
        if (req.files.images != undefined) {
          req.body.images = [];
          for (let i = 0; i < req.files.images.length; ++i) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images[i]
            );
            req.body.images.push(url);
          }
          if (
            req.files.images.length == undefined &&
            req.files.images != undefined
          ) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images
            );
            req.body.images.push(url);
          }
        }
      }
    }
    validationService
      .validate(req.body, RestaurantSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              Restaurant,
              { _id: reqData._id },
              reqData
            );
          else {
            response = await crudServices.insert(Restaurant, reqData);

            const restaurantAccount = web3.eth.accounts.create();
            let restaurantid_restaurant_private;
            restaurantid_restaurant_private = `${process.env.NODE_ENV}_${response._id}_restaurant`;

            await crudServices.update(
              Restaurant,
              { _id: response._id },
              { public_key: restaurantAccount.address }
            );

            await awsHelper.saveSecret(
              restaurantid_restaurant_private,
              restaurantAccount.privateKey
            );
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Restaurant Details ${
              reqData._id ? "updated" : "created"
            } successfully.`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json(error);
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);

      if (req.query.keyword)
        whereClause.name = { $regex: req.query.keyword, $options: "i" };

      if (req.query.email_id)
        whereClause.email_id = { $regex: req.query.email_id };

      if (req.query.restaurant_uuid)
        whereClause.restaurant_uuid = { $regex: req.query.restaurant_uuid };

      if (req.query.cuisine_uuid)
        whereClause.cuisine_uuid = { $regex: req.query.cuisine_uuid };

      if (req.query.neighbourhood_uuid)
        whereClause.neighbourhood_uuid = {
          $regex: req.query.neighbourhood_uuid,
        };

      if (req.query.zipcode)
        whereClause.zipcode = { $regex: req.query.zipcode, $options: "i" };

      if (req.query.business_id)
        whereClause.business_id = ObjectId(req.query.business_id);

      if (req.query.location_id)
        whereClause.location_id = ObjectId(req.query.location_id);

      if (req.query.real_estate_id)
        whereClause.real_estate_id = ObjectId(req.query.real_estate_id);

      if (req.query.city_id) whereClause.city_id = ObjectId(req.query.city_id);

      if (req.query.province_id)
        whereClause.province_id = ObjectId(req.query.province_id);

      if (req.query.country_id)
        whereClause.country_id = ObjectId(req.query.country_id);

      if (req.query.restaurant_category_id)
        whereClause.restaurant_category_id = ObjectId(
          req.query.restaurant_category_id
        );

      if (req.query.is_featured != undefined)
        whereClause.is_featured = JSON.parse(req.query.is_featured);

      if (req.query.alcohol_allowed != undefined)
        whereClause.alcohol_allowed = JSON.parse(req.query.alcohol_allowed);

      if (req.query.kids_allowed != undefined)
        whereClause.kids_allowed = JSON.parse(req.query.kids_allowed);

      if (req.query.pets_allowed != undefined)
        whereClause.pets_allowed = JSON.parse(req.query.pets_allowed);

      if (req.query.vallet_parking_available != undefined)
        whereClause.vallet_parking_available = JSON.parse(
          req.query.vallet_parking_available
        );

      if (req.query.outdoor_seating_available != undefined)
        whereClause.outdoor_seating_available = JSON.parse(
          req.query.outdoor_seating_available
        );

      if (req.query.smoking_allowed != undefined)
        whereClause.smoking_allowed = JSON.parse(req.query.smoking_allowed);

      if (req.query.is_vegetarian != undefined)
        whereClause.is_vegetarian = JSON.parse(req.query.is_vegetarian);

      if (req.query.no_of_tables_lower_bound) {
        if (req.query.no_of_tables_upper_bound) {
          whereClause.$and = [
            {
              no_of_tables: {
                $gte: parseInt(req.query.no_of_tables_lower_bound),
              },
            },
            {
              no_of_tables: {
                $lte: parseInt(req.query.no_of_tables_upper_bound),
              },
            },
          ];
        } else {
          whereClause.no_of_tables = {
            $gte: parseInt(req.query.no_of_tables_lower_bound),
          };
        }
      }

      if (req.query.total_max_capacity_lower_bound) {
        if (req.query.total_max_capacity_upper_bound) {
          whereClause.$and = [
            {
              total_max_capacity: {
                $gte: parseInt(req.query.total_max_capacity_lower_bound),
              },
            },
            {
              total_max_capacity: {
                $lte: parseInt(req.query.total_max_capacity_upper_bound),
              },
            },
          ];
        } else {
          whereClause.total_max_capacity = {
            $gte: parseInt(req.query.total_max_capacity_lower_bound),
          };
        }
      }

      if (req.query.average_rating_lower_bound) {
        if (req.query.average_rating_upper_bound) {
          whereClause.$and = [
            {
              average_rating: {
                $gte: parseFloat(req.query.average_rating_lower_bound),
              },
            },
            {
              average_rating: {
                $lte: parseFloat(req.query.average_rating_upper_bound),
              },
            },
          ];
        } else {
          whereClause.average_rating = {
            $gte: parseFloat(req.query.average_rating_lower_bound),
          };
        }
      }

      if (req.query.no_of_ratings_lower_bound) {
        if (req.query.no_of_ratings_upper_bound) {
          whereClause.$and = [
            {
              no_of_ratings: {
                $gte: parseInt(req.query.no_of_ratings_lower_bound),
              },
            },
            {
              no_of_ratings: {
                $lte: parseInt(req.query.no_of_ratings_upper_bound),
              },
            },
          ];
        } else {
          whereClause.no_of_ratings = {
            $gte: parseInt(req.query.no_of_ratings_lower_bound),
          };
        }
      }

      const {
        query: { current_page, page_size },
      } = req;
      let skip;
      let limit;
      if (current_page && page_size) {
        skip =
          parseInt(current_page) > 0
            ? (parseInt(current_page) - 1) * parseInt(page_size)
            : 0;
        limit = parseInt(page_size);
      }

      let populate = [
        {
          from: "restaurant_categories",
          let: { categoryId: "$restaurant_category_id" },
          as: "RestaurantCategory",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$categoryId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "schedules",
          let: { restaurantId: "$_id" },
          as: "RestaurantSchedule",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$restaurant_id", "$$restaurantId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
            {
              $lookup: {
                from: "schedule_days",
                let: { scheduleDayId: "$schedule_day_id" },
                as: "RestaurantScheduleDay",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$scheduleDayId"] },
                    },
                  },
                  {
                    $project: {
                      is_deleted: 0,
                      deleted_at: 0,
                      created_at: 0,
                      updated_at: 0,
                      __v: 0,
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          from: "ratings",
          let: { restaurantId: "$_id" },
          as: "RestaurantRating",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$restaurant_id", "$$restaurantId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
            {
              $lookup: {
                from: "rating_categories",
                let: { ratingCategoryId: "$rating_category_id" },
                as: "RestaurantRatingCategory",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$ratingCategoryId"] },
                    },
                  },
                  {
                    $project: {
                      is_deleted: 0,
                      deleted_at: 0,
                      created_at: 0,
                      updated_at: 0,
                      __v: 0,
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          from: "menu_items",
          let: { restaurantId: "$_id" },
          as: "RestaurantMenuItem",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$restaurant_id", "$$restaurantId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
            {
              $lookup: {
                from: "menu_item_categories",
                let: { menuCategoryId: "$category_id" },
                as: "RestaurantMenuItemCategory",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$menuCategoryId"] },
                    },
                  },
                  {
                    $project: {
                      is_deleted: 0,
                      deleted_at: 0,
                      created_at: 0,
                      updated_at: 0,
                      __v: 0,
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { currenciesId: "$accepted_currency" },
          as: "Currencies",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$currenciesId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
            {
              $lookup: {
                from: "currency_categories",
                let: { categoryId: "$currency_category_id" },
                as: "CurrencyCategory",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$categoryId"] },
                    },
                  },
                  {
                    $project: {
                      is_deleted: 0,
                      deleted_at: 0,
                      created_at: 0,
                      updated_at: 0,
                      __v: 0,
                    },
                  },
                ],
              },
            },
          ],
        },
      ];

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let response = await crudServices.get(Restaurant, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      let final_response = [];
      if (req.query.ip_id) {
        for (let data of response.data) {
          for (const _data of data.ip_id) {
            if (_data == req.query.ip_id) {
              final_response.push(data);
            }
          }
        }
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Restaurant Details get successfully.",
        data: req.query.ip_id ? final_response : response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(Restaurant, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Restaurant Details deleted successfully.`,
          data: {},
        });
      } else {
        return res.status(207).json({
          code: 207,
          success: false,
          message: `Invalid Url Parameters`,
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const get_all_restaurant_from_integration_partner = async (req, res) => {
    if (req.query.ip_id == undefined || req.query.ip_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Integration Partner details to fetch respective Restaurant details.",
      });

    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.query.ip_id);

      let populate = [
        {
          from: "api_lists",
          let: { ipId: "$_id" },
          as: "ApiList",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$ip_id", "$$ipId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                ip_id: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let ip_data = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );

      let api_url = ip_data.data[0].hosted_end_point;
      const api_endpoint = ip_data.data[0].ApiList.find(
        (obj) => obj.method_name == "eatapp_restaurants_list_restaurants"
      );
      api_url = api_url + api_endpoint.api_endpoint_url;

      if (req.query.page && req.query.limit) {
        api_url = `${api_url}?page=${req.query.page}&limit=${req.query.limit}`;
      } else {
        if (req.query.page) api_url = `${api_url}?page=${req.query.page}`;
        if (req.query.limit) api_url = `${api_url}?limit=${req.query.limit}`;
      }

      const restaurants_response = await axios.get(api_url, {
        headers: {
          Authorization: `Bearer ${ip_data.data[0].authorization_token}`,
        },
      });

      if (req.query.city) {
        let filterd_data = [];
        for (let data of restaurants_response.data.data) {
          let city_name = data.attributes.city
            ? data.attributes.city
            : "not-available";
          if (req.query.city.includes(city_name)) filterd_data.push(data);
        }
        restaurants_response.data.data = filterd_data;
      }

      for (let data of restaurants_response.data.data) {
        let restaurant_uuid = data.attributes.restaurant_id;
        let whereClause_restaurant = {};
        whereClause_restaurant.restaurant_uuid = { $regex: restaurant_uuid };
        whereClause_restaurant.is_deleted = false;
        let executing_parameters_restaurant = {
          where: whereClause_restaurant,
        };
        let restaurant_data = await crudServices.get(
          Restaurant,
          executing_parameters_restaurant
        );
        if (restaurant_data.data[0] == undefined)
          data.attributes.is_onboarded = false;
        else data.attributes.is_onboarded = true;
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message:
          "Restaurants Details Fetched from Integration Partner Successfully.",
        data: restaurants_response.data.data,
        page_info: restaurants_response.data.meta,
      });
    } catch (error) {
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const get_single_restaurant_using_uuid = async (req, res) => {
    if (req.query.ip_id == undefined || req.query.ip_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Integration Partner details to fetch respective Restaurant details.",
      });

    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.query.ip_id);

      let populate = [
        {
          from: "api_lists",
          let: { ipId: "$_id" },
          as: "ApiList",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$ip_id", "$$ipId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                ip_id: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let ip_data = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );

      let api_url = ip_data.data[0].hosted_end_point;
      const api_endpoint = ip_data.data[0].ApiList.find(
        (obj) => obj.method_name == "eatapp_restaurants_show_single_restaurant"
      );
      api_url = api_url + api_endpoint.api_endpoint_url;

      api_url = `${api_url}/${req.query.restaurant_uuid}`;

      const restaurant_response = await axios.get(api_url, {
        headers: {
          Authorization: `Bearer ${ip_data.data[0].authorization_token}`,
        },
      });

      return res.status(200).json({
        code: 200,
        success: true,
        data: restaurant_response.data.data,
      });
    } catch (error) {
      console.log(error.response.data);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const onboard_one_restaurant_from_integration_partner = async (req, res) => {
    if (
      req.body.ip_id == undefined ||
      req.body.ip_id == "" ||
      req.body.restaurant_uuid == undefined ||
      req.body.restaurant_uuid == ""
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Integration Partner details & Restaurant Details to on-board respective Restaurants.",
      });

    try {
      // check if restaurant with this restaurant_id as restaurant_uuid exists

      let whereClause_restaurant = {};
      whereClause_restaurant.is_deleted = false;
      whereClause_restaurant.restaurant_uuid = {
        $regex: req.body.restaurant_uuid,
      };

      let executing_parameters_restaurant = {
        where: whereClause_restaurant,
      };

      let existing_data = await crudServices.get(
        Restaurant,
        executing_parameters_restaurant
      );
      if (existing_data.data[0] != undefined) {
        return res.status(202).json({
          code: 202,
          success: true,
          message: "Restaurant Was not On Boarded As resturant already exists.",
          data: existing_data.data[0],
        });
      }

      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body.ip_id);

      let populate = [
        {
          from: "api_lists",
          let: { ipId: "$_id" },
          as: "ApiList",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$ip_id", "$$ipId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                ip_id: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let ip_data = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );
      console.log(910, ip_data);
      let api_url = ip_data.data[0].hosted_end_point;

      const api_endpoint = ip_data.data[0].ApiList.find(
        (obj) => obj.method_name == "eatapp_restaurants_show_single_restaurant"
      );
      api_url = api_url + api_endpoint.api_endpoint_url;

      api_url = `${api_url}/${req.body.restaurant_uuid}`;

      const restaurant_response = await axios.get(api_url, {
        headers: {
          Authorization: `Bearer ${ip_data.data[0].authorization_token}`,
        },
      });

      restaurant_response.data.data.attributes.restaurant_uuid =
        restaurant_response.data.data.id;

      let transposed_data = await eatAppServices.convertDatafromIPtoSelf(
        req.body.ip_id,
        restaurant_response.data.data.attributes
      );

      let ip_id_array = [];
      ip_id_array.push(req.body.ip_id);

      transposed_data.ip_id = ip_id_array;

      const created_restaurant = await crudServices.insert(
        Restaurant,
        transposed_data
      );
      const restaurantAccount = web3.eth.accounts.create();
      let restaurantid_restaurant_private;
      restaurantid_restaurant_private = `${process.env.NODE_ENV}_${created_restaurant._id}_restaurant`;

      await crudServices.update(
        Restaurant,
        { _id: created_restaurant._id },
        { public_key: restaurantAccount.address }
      );
      await awsHelper.saveSecret(
        restaurantid_restaurant_private,
        restaurantAccount.privateKey
      );

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Restaurant On Boarded Successfully.",
        data: created_restaurant,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const onboard_multiple_restaurant_from_integration_partener = async (
    req,
    res
  ) => {
    if (
      req.body.ip_id == undefined ||
      req.body.ip_id == "" ||
      req.body.list_restaurant_uuid == undefined ||
      req.body.list_restaurant_uuid == ""
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Integration Partner details & Restaurant Details to on-board respective Restaurants.",
      });

    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body.ip_id);

      let populate = [
        {
          from: "api_lists",
          let: { ipId: "$_id" },
          as: "ApiList",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$ip_id", "$$ipId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                ip_id: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let ip_data = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );

      let api_url = ip_data.data[0].hosted_end_point;
      const api_endpoint = ip_data.data[0].ApiList.find(
        (obj) => obj.method_name == "eatapp_restaurants_show_single_restaurant"
      );
      api_url = api_url + api_endpoint.api_endpoint_url;
      let list_of_created_restaurants = [];

      for (let i = 0; i < req.body.list_restaurant_uuid.length; ++i) {
        let new_api_url = `${api_url}/${req.body.list_restaurant_uuid[i]}`;

        // if resturant exists with this uuid then continue

        let whereClause_restaurant = {};
        whereClause_restaurant.is_deleted = false;
        whereClause_restaurant.restaurant_uuid = {
          $regex: req.body.list_restaurant_uuid[i],
        };

        let executing_parameters_restaurant = {
          where: whereClause_restaurant,
        };

        let existing_data = await crudServices.get(
          Restaurant,
          executing_parameters_restaurant
        );

        if (existing_data.data[0] != undefined) {
          list_of_created_restaurants.push(existing_data.data[0]);
          continue;
        }

        const restaurant_response = await axios.get(new_api_url, {
          headers: {
            Authorization: `Bearer ${ip_data.data[0].authorization_token}`,
          },
        });

        restaurant_response.data.data.attributes.restaurant_uuid =
          restaurant_response.data.data.id;

        let transposed_data = await eatAppServices.convertDatafromIPtoSelf(
          req.body.ip_id,
          restaurant_response.data.data.attributes
        );

        let ip_id_array = [];
        ip_id_array.push(req.body.ip_id);

        transposed_data.ip_id = ip_id_array;
        const created_restaurant = await crudServices.insert(
          Restaurant,
          transposed_data
        );

        const restaurantAccount = web3.eth.accounts.create();
        let restaurantid_restaurant_private;
        restaurantid_restaurant_private = `${process.env.NODE_ENV}_${created_restaurant._id}_restaurant`;

        await crudServices.update(
          Restaurant,
          { _id: created_restaurant._id },
          { public_key: restaurantAccount.address }
        );

        await awsHelper.saveSecret(
          restaurantid_restaurant_private,
          restaurantAccount.privateKey
        );

        list_of_created_restaurants.push(created_restaurant);
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Restaurant On Boarded Successfully.",
        data: list_of_created_restaurants,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const remove_on_boarded_restaurant = async (req, res) => {
    if (req.body.restaurant_id == undefined || req.body.restaurant_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Restaurant Id to remove Restaurant from On boarded List.",
      });

    try {
      await crudServices.destroyHard(Restaurant, {
        _id: req.body.restaurant_id,
      });
      return res.status(200).json({
        code: 201,
        success: true,
        message: "Restaurant removed from On Boarded Restaurant List.",
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  return {
    save,
    get,
    destroy,
    get_all_restaurant_from_integration_partner,
    get_single_restaurant_using_uuid,
    onboard_one_restaurant_from_integration_partner,
    onboard_multiple_restaurant_from_integration_partener,
    remove_on_boarded_restaurant,
  };
};

module.exports = RestaurantApi;
