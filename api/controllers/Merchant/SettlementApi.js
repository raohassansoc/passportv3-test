const SettlementModel = require("../../models/Transaction/TransactionHistory");
const { SettlementPeriodSchemas } = require("../../schemas/MerchantSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");

const SettlementApi = () => {
  // For create and update  SettlementPeriod
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, SettlementPeriodSchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(
              SettlementModel,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(SettlementModel, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Settlement Period ${
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
  // for deleting  SettlementPeriod
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(SettlementModel, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Settlement Period deleted successfully.`,
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
      if (req.query.keyword) {
        whereClause.name = { $regex: req.query.keyword, $options: "i" };
      }

      const today = new Date();

      // Set the start and end of today (midnight to end of day)
      today.setHours(0, 0, 0, 0); // Set to midnight
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999); // Set to end of day
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      whereClause.merchant_id = { $exists: true, $ne: null };
      whereClause.is_settled = false;
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
      let response = await crudServices.get(SettlementModel, {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
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
        message: `Settlement Period get successfully.`,
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
module.exports = SettlementApi;
