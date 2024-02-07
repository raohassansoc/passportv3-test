const Settlement = require("../../models/Settlement/Settlement");
const { SettlementSchema } = require("../../schemas/SettlementSchemas");

const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const Merchant = require("../../models/Merchant/Merchant");

const SettlementApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, SettlementSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(
              Settlement,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(Settlement, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Settlement ${
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

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query.keyword) {
        whereClause.name = { $regex: req.query.keyword, $options: "i" };
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }

      if (req.query.transaction_id) {
        whereClause.transaction_id = ObjectId(req.query.transaction_id);
      }

      if (req.query.settlement_type_id) {
        whereClause.settlement_type_id = ObjectId(req.query.settlement_type_id);
      }

      if (req.query.user_id) {
        whereClause.user_id = ObjectId(req.query.user_id);
      }

      if (req.query.merchant_id) {
        whereClause.merchant_id = ObjectId(req.query.merchant_id);
      }

      if (req.query.merchant_tct_id) {
        whereClause.merchant_tct_id = ObjectId(req.query.merchant_tct_id);
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

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "_id",
      };

      let response = await crudServices.get(Settlement, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `Settlement get successfully.`,
        data: response,
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
        await crudServices.destroy(Settlement, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Settlement deleted successfully.`,
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

  const get_list_of_merchants_for_settlement = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;

      let populate = [
        {
          from: "merchant_settlement_periods",
          let: { merchantId: "$_id" },
          as: "Settlement",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$merchant_id", "$$merchantId"] } },
            },
            {
              $project: { is_deleted: 0, deleted_at: 0, updated_at: 0, __v: 0 },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
        sortField: "_id",
      };

      let response = await crudServices.get(Merchant, executing_parameters);

      let merchant_list = [];
      for (let i = 0; i < response.data.length; ++i) {
        const day_diff =
          (new Date(new Date().toISOString().split("T")[0]) -
            response.data[i].Settlement[0].created_at) /
          (1000 * 3600 * 24);

        if (day_diff % response.data[i].Settlement[0].value == 0)
          merchant_list.push(response.data[i]);
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Merchant List Get Successfull For Settlement",
        data: merchant_list,
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const display_list_of_transactions_for_merchant = async (req, res) => {
    if (req.body.merchant_id == undefined || req.body.merchant_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Merchant Id for Un Settled Transactions.",
      });
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body.merchant_id);

      let populate = [
        {
          from: "transaction_histories",
          let: { merchantId: "$_id" },
          as: "Transactions",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$merchant_id", "$$merchantId"] },
                    { $eq: ["$is_settled", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchant_settlement_periods",
          let: { merchantId: "$_id" },
          as: "Settlement",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$merchant_id", "$$merchantId"] } },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchant_rewards",
          let: { merchantId: "$_id" },
          as: "Reward",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$merchant_id", "$$merchantId"] } },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchant_referrals",
          let: { merchantId: "$_id" },
          as: "Referral",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$merchant_id", "$$merchantId"] } },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
        sortField: "_id",
      };

      let merchant = await crudServices.get(Merchant, executing_parameters);

      // for every transactions in mercant.data.data.Transactions
      // reward fee to pay as pass token to mercant.data.data.Transactions.sender_id = (merchant.data.data.Transactions.sender_currency_qty)*(merchant.data.data.Reward.value['$numberDecimal']/100) <- from passport to user through token mint function <- then save instance in settlement
      // total fee to pay in currency received to passport from mercant.data.data.Transactions.merchant_id = (merchant.data.data.Transactions.sender_currency_qty)*((merchant.data.data.Reward.value['$numberDecimal']+merchant.data.data.Referral.value['$numberDecimal'])/100) <- first normal transaction from merchant to passport(as receiver) <- then save instance in settlement

      let transaction_filtered = [];

      for (let transaction of merchant.data[0].Transactions) {
        let number_of_pass_to_pay_to_user_in_token_from_passport,
          total_amount_of_currency_to_pay_to_passport_from_merchant;

        number_of_pass_to_pay_to_user_in_token_from_passport =
          transaction.sender_currency_qty *
          (parseFloat(merchant.data[0].Reward[0].value.toString()) / 100);

        total_amount_of_currency_to_pay_to_passport_from_merchant =
          transaction.sender_currency_qty *
          ((parseFloat(merchant.data[0].Reward[0].value.toString()) +
            parseFloat(merchant.data[0].Referral[0].value.toString())) /
            100);

        let ith_transaction_filterd = {};
        ith_transaction_filterd._id = transaction._id;
        ith_transaction_filterd.sender_id = transaction.sender_id;
        ith_transaction_filterd.merchant_id = transaction.merchant_id;
        ith_transaction_filterd.transaction_hash = transaction.transaction_hash;
        ith_transaction_filterd.number_of_pass_to_pay_to_user_in_token_from_passport =
          number_of_pass_to_pay_to_user_in_token_from_passport;
        ith_transaction_filterd.total_amount_of_currency_to_pay_to_passport_from_merchant =
          total_amount_of_currency_to_pay_to_passport_from_merchant;

        transaction_filtered.push(ith_transaction_filterd);
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Filtered Transaction Detais for Merchant Success.",
        data: transaction_filtered,
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const execute_settlement_for_merchant = async (req, res) => {
    if (req.body.merchant_id == undefined || req.body.merchant_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Merchant Id for Un Settled Transactions.",
      });
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body.merchant_id);

      let populate = [
        {
          from: "transaction_histories",
          let: { merchantId: "$_id" },
          as: "Transactions",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$merchant_id", "$$merchantId"] },
                    { $eq: ["$is_settled", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchant_settlement_periods",
          let: { merchantId: "$_id" },
          as: "Settlement",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$merchant_id", "$$merchantId"] } },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchant_rewards",
          let: { merchantId: "$_id" },
          as: "Reward",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$merchant_id", "$$merchantId"] } },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchant_referrals",
          let: { merchantId: "$_id" },
          as: "Referral",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$merchant_id", "$$merchantId"] } },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
        sortField: "_id",
      };

      let merchant = await crudServices.get(Merchant, executing_parameters);

      // for every transactions in mercant.data.data.Transactions
      // reward fee to pay as pass token to mercant.data.data.Transactions.sender_id = (merchant.data.data.Transactions.sender_currency_qty)*(merchant.data.data.Reward.value['$numberDecimal']/100) <- from passport to user through token mint function <- then save instance in settlement
      // total fee to pay in currency received to passport from mercant.data.data.Transactions.merchant_id = (merchant.data.data.Transactions.sender_currency_qty)*((merchant.data.data.Reward.value['$numberDecimal']+merchant.data.data.Referral.value['$numberDecimal'])/100) <- first normal transaction from merchant to passport(as receiver) <- then save instance in settlement

      let transaction_filtered = [];

      for (let transaction of merchant.data[0].Transactions) {
        let number_of_pass_to_pay_to_user_in_token_from_passport,
          total_amount_of_currency_to_pay_to_passport_from_merchant;

        number_of_pass_to_pay_to_user_in_token_from_passport =
          transaction.sender_currency_qty *
          (parseFloat(merchant.data[0].Reward[0].value.toString()) / 100);

        total_amount_of_currency_to_pay_to_passport_from_merchant =
          transaction.sender_currency_qty *
          ((parseFloat(merchant.data[0].Reward[0].value.toString()) +
            parseFloat(merchant.data[0].Referral[0].value.toString())) /
            100);

        let ith_transaction_filterd = {};
        ith_transaction_filterd._id = transaction._id;
        ith_transaction_filterd.sender_id = transaction.sender_id;
        ith_transaction_filterd.merchant_id = transaction.merchant_id;
        ith_transaction_filterd.transaction_hash = transaction.transaction_hash;
        ith_transaction_filterd.number_of_pass_to_pay_to_user_in_token_from_passport =
          number_of_pass_to_pay_to_user_in_token_from_passport;
        ith_transaction_filterd.total_amount_of_currency_to_pay_to_passport_from_merchant =
          total_amount_of_currency_to_pay_to_passport_from_merchant;

        transaction_filtered.push(ith_transaction_filterd);

        // mint number_of_pass_to_pay_to_user_in_token_from_passport token in user's account + settlement instance
        // transfer total_amount_of_currency_to_pay_to_passport_from_merchant from merchant to passport wallet + transacion instance + settlement instance
        // save status message
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: "All Transaction of this Merchant has been Setteled.",
        data: transaction_filtered,
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  return {
    save,
    get,
    destroy,
    get_list_of_merchants_for_settlement,
    display_list_of_transactions_for_merchant,
    execute_settlement_for_merchant,
  };
};

module.exports = SettlementApi;
