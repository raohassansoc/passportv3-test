const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const { EventHostSchema } = require("../../schemas/EventSchema");
const awsHelper = require("../../helper/awsHelper");
const EventHost = require("../../models/Event/EventHost");

const EventHostApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_data = await crudServices.get(EventHost, executing_parameters);
      req.body.images = [];

      if (req.files != null) {
        if (req.files.image != undefined) {
          if (found_data.data[0].image)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].image
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.image
          );
          req.body.image = url;
        }
      }
    } else {
      if (req.files != null) {
        if (req.files.image != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.image
          );
          req.body.image = url;
        }
      }
    }
    validationService
      .validate(req.body, EventHostSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            response = await crudServices.update(
              EventHost,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(EventHost, reqData);
          }
          return res.status(201).json({
            code: 201,
            success: true,
            message: `Event Host Details ${
              reqData._id ? `updated` : `created`
            } successfully.`,
            data: response,
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

      if (req.query.keyword) {
        whereClause.$or = [
          { name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { title: { $regex: new RegExp("^" + req.query.keyword, "i") } },
        ];
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
          from: "events",
          let: { eventHostId: "$_id" },
          as: "Events",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$eventHostId", "$event_host_ids"] },
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

      let response = await crudServices.get(EventHost, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Event Host Details get successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(EventHost, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Event Host Details deleted successfully.`,
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
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  return {
    save,
    get,
    destroy,
  };
};

module.exports = EventHostApi;
