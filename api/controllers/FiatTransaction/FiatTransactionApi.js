const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const FiatTransaction = require("../../models/FiatTransaction/FiatTransaction");
const {
  FiatTransactionSchema,
} = require("../../schemas/FiatTransactionSchema");

const FiatTransactionApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, FiatTransactionSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              FiatTransaction,
              { _id: reqData._id },
              reqData
            );
          else response = await crudServices.insert(FiatTransaction, reqData);
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Fiat Transaction ${
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
      if (req.query.user_id) whereClause.user_id = ObjectId(req.query.user_id);
      if (req.query.fiat_transaction_type_id)
        whereClause.fiat_transaction_type_id = ObjectId(
          req.query.fiat_transaction_type_id
        );
      if (req.query.transffered_currency_id)
        whereClause.transffered_currency_id = ObjectId(
          req.query.transffered_currency_id
        );
      if (req.query.received_currency_id)
        whereClause.received_currency_id = ObjectId(
          req.query.received_currency_id
        );

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
        projection: {
          __v: 0,
          is_deleted: 0,
          created_at: 0,
          updated_at: 0,
          deleted_at: 0,
        },
      };

      let response = await crudServices.get(
        FiatTransaction,
        executing_parameters
      );

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Fiat Transaction get successfully.",
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
        await crudServices.destroy(FiatTransaction, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Fiat Transaction deleted successfully.`,
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

  const analytics = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      if (req.query.user_id) whereClause.user_id = ObjectId(req.query.user_id);
      if (req.query.fiat_transaction_type_id)
        whereClause.fiat_transaction_type_id = ObjectId(
          req.query.fiat_transaction_type_id
        );
      if (req.query.transffered_currency_id)
        whereClause.transffered_currency_id = ObjectId(
          req.query.transffered_currency_id
        );
      if (req.query.received_currency_id)
        whereClause.received_currency_id = ObjectId(
          req.query.received_currency_id
        );

      if (req.query.start_time && req.query.end_time) {
        whereClause.$and = [
          { created_at: { $gte: new Date(req.query.start_time) } },
          { created_at: { $lte: new Date(req.query.end_time) } },
        ];
      } else if (req.query.start_time) {
        whereClause.created_at = { $gte: new Date(req.query.start_time) };
      } else if (req.query.end_time) {
        whereClause.created_at = { $lte: new Date(req.query.end_time) };
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

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          __v: 0,
          is_deleted: 0,
          updated_at: 0,
          deleted_at: 0,
        },
      };

      let response = await crudServices.get(
        FiatTransaction,
        executing_parameters
      );


      console.log(response);

      let analytics_data = {};
      analytics_data.total_fiat_transactions = response.data.length;
      analytics_data.total_amount_of_transffered_currency =
        response.data.reduce(
          (total, obj) => (total = total + obj.transffered_currency_qty),
          0
        );
      analytics_data.total_amount_of_received_currency = response.data.reduce(
        (total, obj) => (total = total + obj.received_currency_qty),
        0
      );

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Analytics Calculated!!",
        analytics_data: analytics_data,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  return {
    save,
    get,
    destroy,
    analytics,
  };
};

module.exports = FiatTransactionApi;
