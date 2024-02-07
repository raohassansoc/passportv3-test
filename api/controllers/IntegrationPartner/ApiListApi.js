const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const { ApiListSchema } = require("../../schemas/IntegrationPartnerSchema");
const ApiList = require("../../models/IntegrationPartner/ApiList");

const ApiListApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, ApiListSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(ApiList, { _id: reqData._id }, reqData);
          } else {
            response = await crudServices.insert(ApiList, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Api List Details ${
              reqData._id ? "updated" : "created"
            } successfully`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json(error);
        }
      })
      .catch((err) => {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(ApiList, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Api List Details deleted successfully.`,
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
      return res.status(501).json(error);
    }
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.ip_id) {
        whereClause.ip_id = ObjectId(req.query.ip_id);
      }
      if (req.query.method_name) {
        whereClause.method_name = {
          $regex: req.query.method_name,
          $options: "i",
        };
      }
      if (req.query.api_method) {
        whereClause.api_method = {
          $regex: req.query.api_method,
          $options: "i",
        };
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
      let response = await crudServices.get(ApiList, {
        where: whereClause,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "name",
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: `Api List Details get successfully.`,
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  return {
    save,
    destroy,
    get,
  };
};
module.exports = ApiListApi;
