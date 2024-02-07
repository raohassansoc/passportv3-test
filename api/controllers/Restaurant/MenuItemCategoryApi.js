const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");

const { ObjectId } = require("mongodb");
const { MenuItemCategorySchema } = require("../../schemas/RestaurantSchema");
const MenuItemCategory = require("../../models/Restaurant/MenuItemCategory");

const MenuItemCategoryApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, MenuItemCategorySchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              MenuItemCategory,
              { _id: reqData._id },
              reqData
            );
          else response = await crudServices.insert(MenuItemCategory, reqData);
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Menu Item Category ${
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

      let pipeline_$match;

      if (req.query.restaurant_id) {
        pipeline_$match = {
          $expr: {
            $and: [
              { $eq: ["$category_id", "$$menuItemCategoryId"] },
              { $eq: ["$restaurant_id", ObjectId(req.query.restaurant_id)] },
            ],
          },
        };
      } else {
        pipeline_$match = {
          $expr: { $eq: ["$category_id", "$$menuItemCategoryId"] },
        };
      }

      let populate = [
        {
          from: "menu_items",
          let: { menuItemCategoryId: "$_id" },
          as: "MenuItem",
          pipeline: [
            {
              $match: pipeline_$match,
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
      ];

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: { _id: 1, name: 1, description: 1 },
        populate: populate,
      };

      let response = await crudServices.get(
        MenuItemCategory,
        executing_parameters
      );

      if (req.query.restaurant_id) {
      }

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Menu Item Category get successfully.",
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
        await crudServices.destroy(MenuItemCategory, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Menu Item Category deleted successfully.`,
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

module.exports = MenuItemCategoryApi;
