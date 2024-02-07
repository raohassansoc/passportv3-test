const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const SelfTransfer = require("../../models/Transaction/SelfTransfer");
const { SelfTransferSchema } = require("../../schemas/TransactionSchema");
const { ObjectId } = require("mongodb");
const Currency = require("../../models/Master/Currency");
const axios = require("axios");
const Transaction = require("../../models/Transaction/TransactionHistory");

const SelfTransferApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, SelfTransferSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = crudServices.update(
              SelfTransfer,
              { _id: reqData._id },
              reqData
            );
          else {
            let whereClause = {};
            whereClause.is_deleted = false;
            whereClause._id = ObjectId(reqData.currency1_id);
            const executing_parameters_1 = {
              where: whereClause,
              projection: {
                currency_code: 1,
              },
            };
            const currency1 = await crudServices.get(
              Currency,
              executing_parameters_1
            );

            whereClause._id = ObjectId(reqData.currency2_id);
            const executing_parameters_2 = {
              where: whereClause,
              projection: {
                currency_code: 1,
              },
            };
            const currency2 = await crudServices.get(
              Currency,
              executing_parameters_2
            );

            const url1 = `https://www.coinbase.com/graphql/query?operationName=ConverterQuery&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22ec2eb80a8b6a8d98c754b1e307d895b73446f92ec219ef6dd41081f45ac2c5ae%22%7D%7D&variables=%7B%22baseSymbol%22%3A%22${currency1.data[0].currency_code}%22%2C%22targetCurrency%22%3A%22USD%22%2C%22country%22%3A%22IN%22%2C%22genericTablePage%22%3A1%2C%22genericTableAssetsPerPage%22%3A30%7D`;

            const url2 = `https://www.coinbase.com/graphql/query?operationName=ConverterQuery&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22ec2eb80a8b6a8d98c754b1e307d895b73446f92ec219ef6dd41081f45ac2c5ae%22%7D%7D&variables=%7B%22baseSymbol%22%3A%22${currency1.data[0].currency_code}%22%2C%22targetCurrency%22%3A%22${currency2.data[0].currency_code}%22%2C%22country%22%3A%22IN%22%2C%22genericTablePage%22%3A1%2C%22genericTableAssetsPerPage%22%3A30%7D`;

            let curr1tousd, curr1tocurr2;

            try {
              curr1tousd = await axios.get(url1);
              if (curr1tousd.data.errors)
                return res.status(404).json({
                  code: 404,
                  success: false,
                  message: "error from axios get url1",
                });
            } catch (error) {
              return res.status(401).json({
                code: 401,
                success: true,
                message: "error in axios1",
                data: response || {},
              });
            }

            try {
              curr1tocurr2 = await axios.get(url2);
              if (curr1tocurr2.data.errors)
                return res.status(404).json({
                  code: 404,
                  success: false,
                  message: "error from axios get url2",
                });
            } catch (error) {
              return res.status(401).json({
                code: 401,
                success: true,
                message: "error in axios2",
                data: response || {},
              });
            }

            reqData.currency1_current_valuation = parseFloat(
              curr1tousd.data.data.assetBySymbol.latestQuoteV3.price
            );
            reqData.currency2_qty = parseFloat(
              reqData.currency1_qty *
                curr1tocurr2.data.data.assetBySymbol.latestQuoteV3.price
            );
            reqData.currency2_current_valuation = parseFloat(
              curr1tousd.data.data.assetBySymbol.latestQuoteV3.price /
                curr1tocurr2.data.data.assetBySymbol.latestQuoteV3.price
            );

            response = await crudServices.insert(SelfTransfer, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Self Transfer Details ${
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
      if (req.query.currency1_id)
        whereClause.currency1_id = ObjectId(req.query.currency1_id);
      if (req.query.currency2_id)
        whereClause.currency2_id = ObjectId(req.query.currency2_id);

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
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
      };

      let response = await crudServices.get(SelfTransfer, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Self Transfar data fetched successfully.",
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
        await crudServices.destroy(SelfTransfer, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Self Transfar Record deleted successfully.`,
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

  const create_raw_transaction_history = async (req, res) => {
    let {
      sender_id,
      sender_currency_id,
      sender_currency_qty,
      receiver_id,
      receiver_currency_id,
      transaction_hash,
      status_id,
    } = req.body;

    try {
      let created_transaction = await crudServices.insert(Transaction, {
        sender_id,
        sender_currency_id,
        sender_currency_qty,
        receiver_id,
        receiver_currency_id,
        transaction_hash,
        status_id,
      });

      return res.status(201).json({
        code: 201,
        success: true,
        data: created_transaction,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error.Error,
      });
    }
  };

  return {
    save,
    get,
    destroy,
    create_raw_transaction_history,
  };
};

module.exports = SelfTransferApi;
