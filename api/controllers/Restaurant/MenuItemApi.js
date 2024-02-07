const { MenuItemSchema } = require("../../schemas/RestaurantSchema");
const MenuItem = require("../../models/Restaurant/MenuItem");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const awsHelper = require("../../helper/awsHelper");

const MenuItemApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_data = await crudServices.get(MenuItem, executing_parameters);
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

      console.log("Before images were deleted. ", found_data.data[0].images);
      console.log("After images were deleted. ", req.body.images);

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
      console.log("After new images were added. ", req.body.images);
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
      .validate(req.body, MenuItemSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              MenuItem,
              { _id: reqData._id },
              reqData
            );
          else response = await crudServices.insert(MenuItem, reqData);
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Menu Item Details ${
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
        whereClause.$or = [
          {
            name: { $regex: new RegExp("^" + req.query.keyword, "i") },
          },
          {
            cuisine_details: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];
      if (req.query.is_vegetarian != undefined)
        whereClause.is_vegetarian = JSON.parse(req.query.is_vegetarian);
      if (req.query.is_served_during_breakfast != undefined)
        whereClause.is_served_during_breakfast = JSON.parse(
          req.query.is_served_during_breakfast
        );
      if (req.query.is_served_during_brunch != undefined)
        whereClause.is_served_during_brunch = JSON.parse(
          req.query.is_served_during_brunch
        );
      if (req.query.is_served_during_lunch != undefined)
        whereClause.is_served_during_lunch = JSON.parse(
          req.query.is_served_during_lunch
        );
      if (req.query.is_served_during_refreshment != undefined)
        whereClause.is_served_during_refreshment = JSON.parse(
          req.query.is_served_during_refreshment
        );
      if (req.query.is_served_during_dinner != undefined)
        whereClause.is_served_during_dinner = JSON.parse(
          req.query.is_served_during_dinner
        );
      if (req.query.category_id)
        whereClause.category_id = ObjectId(req.query.category_id);
      if (req.query.currency_id)
        whereClause.currency_id = ObjectId(req.query.currency_id);
      if (req.query.restaurant_id)
        whereClause.restaurant_id = ObjectId(req.query.restaurant_id);
      if (req.query.cuisine_id)
        whereClause.cuisine_id = ObjectId(req.query.cuisine_id);

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
          from: "menu_item_categories",
          let: { categoryId: "$category_id" },
          as: "MenuCategory",
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
          from: "currencies",
          let: { currencyId: "$currency_id" },
          as: "MenuItemCurrency",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$currencyId"] },
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
                let: { currencyCategoryId: "$currency_category_id" },
                as: "MenuItemCurrencyCategory",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$currencyCategoryId"] },
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

      let response = await crudServices.get(MenuItem, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Menu Item Details get successfully.",
        data: response.data,
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
        await crudServices.destroy(MenuItem, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Menu Item Details deleted successfully.`,
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

  return {
    save,
    get,
    destroy,
  };
};

module.exports = MenuItemApi;
