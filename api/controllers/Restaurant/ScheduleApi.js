const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const Schedule = require("../../models/Restaurant/Schedule");
const { ScheduleSchema } = require("../../schemas/RestaurantSchema");

const ScheduleApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, ScheduleSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              Schedule,
              { _id: reqData._id },
              reqData
            );
          else {
            response = await crudServices.insert(Schedule, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Schedule Details ${
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
    if (req.query.current_time) {
      let new_date = new Date(req.query.current_time);
      req.query.current_time = new_date;
    }
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      if (req.query.restaurant_id)
        whereClause.restaurant_id = ObjectId(req.query.restaurant_id);
      if (req.query.schedule_day_id)
        whereClause.schedule_day_id = ObjectId(req.query.schedule_day_id);

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

      if (req.query.current_time) {
        whereClause.$and = [
          {
            openning_hours_start_time: {
              $lte: req.query.current_time,
            },
          },
          {
            openning_hours_end_time: { $gte: req.query.current_time },
          },
        ];
      }

      let populate = [
        {
          from: "schedule_days",
          let: { scheduleDayId: "$schedule_day_id" },
          as: "ScheduleDay",
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
        {
          from: "restaurants",
          let: { restaurantId: "$restaurant_id" },
          as: "Restaurant",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$restaurantId"] },
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

      let response = await crudServices.get(Schedule, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Schedule get successfully.",
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
        await crudServices.destroy(Schedule, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Schedule deleted successfully.`,
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

module.exports = ScheduleApi;
