const Guest = require("../../models/Booking/Guest");
const { GuestSchema } = require("../../schemas/BookingSchema");
const { ObjectId } = require("mongodb");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");

const GuestApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, GuestSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              Guest,
              { _id: reqData._id },
              reqData
            );
          else response = await crudServices.insert(Guest, reqData);
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Guest Details ${
              reqData._id ? "updated" : "created"
            } successfully.`,
            data: response || {},
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
      if (req.query.keyword)
        whereClause.first_name = { $regex: req.query.keyword, $options: "i" };
      if (req.query.first_name)
        whereClause.first_name = {
          $regex: req.query.first_name,
          $options: "i",
        };
      if (req.query.last_name)
        whereClause.last_name = { $regex: req.query.last_name, $options: "i" };
      if (req.query.email_id)
        whereClause.email_id = { $regex: req.query.email_id };

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

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: { __v: 0 },
      };

      let response = await crudServices.get(Guest, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Guest Details get successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 500,
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    }
  };
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(Guest, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Guest Details deleted successfully.`,
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
      return res.status(500).json({
        code: 500,
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    }
  };

  return {
    save,
    get,
    destroy,
  };
};

module.exports = GuestApi;
