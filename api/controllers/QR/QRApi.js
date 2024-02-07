const QR = require("../../models/QR/QR");
const { QRSchema } = require("../../schemas/QRSchema");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");

const { ObjectId } = require("mongodb");
const TransactionStatus = require("../../models/Transaction/TransactionStatus");

const QRApi = () => {
  const save = async (req, res) => {
    if (
      (req.body.merchant_id != undefined || req.body.merchant_id != "") &&
      (req.body.currency_id != undefined || req.body.currency_id != "") &&
      (req.body.currency_qty != undefined || req.body.currency_qty != "")
    ) {
      req.body.name = `${req.body.merchant_id}|${req.body.currency_id}|${req.body.currency_qty}`;
    }
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, QRSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            response = await crudServices.update(
              QR,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(QR, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `QR Code Instance ${
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
      if (req.query.merchant_id)
        whereClause.merchant_id = ObjectId(req.query.merchant_id);
      if (req.query.currency_id)
        whereClause._id = ObjectId(req.query.currency_id);
      if (req.query.name) whereClause.name = req.query.name;

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
          from: "currencies",
          let: { currencyId: "$currency_id" },
          as: "Currency",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$currencyId"] },
                    { $eq: ["$is_deleted", false] },
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
          from: "merchants",
          let: { merchantId: "$merchant_id" },
          as: "Merchant",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$merchantId"] },
                    { $eq: ["$is_deleted", false] },
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
      ];

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
        populate: populate,
      };

      let response = await crudServices.get(QR, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      for (let i = 0; i < response.data.length; ++i) {
        let is_qr_expired = false;
        let milliseconds_until_expiry =
          601000 -
          new Date().getTime() +
          response.data[i].qr_generation_timestamp.getTime();

        if (milliseconds_until_expiry <= 0) is_qr_expired = true;

        response.data[i].is_qr_expired = is_qr_expired;
        if (!is_qr_expired)
          response.data[i].milliseconds_until_expiry =
            milliseconds_until_expiry;
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "QR Instace get successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const get_transaction_details_by_qr_id = async (req, res) => {
    if (req.body.qr_id == undefined || req.body.qr_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        messge: "Please Provide QR Id.",
      });

    try {
      let whereClause = {};
      if (req.body.qr_id) whereClause._id = ObjectId(req.body.qr_id);

      let populate = [
        {
          from: "transaction_histories",
          let: { qrId: "$_id" },
          as: "Transaction",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$qr_id", "$$qrId"] },
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
            {
              $lookup: {
                from: "transaction_statuses",
                let: { statusId: "$status_id" },
                as: "TrnsactionStatus",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$statusId"] },
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
            },
            {
              $lookup: {
                from: "currencies",
                let: { currencyId: "$sender_currency_id" },
                as: "Currency",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$currencyId"] },
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
                  {
                    $lookup: {
                      from: "currency_categories",
                      let: { currencyCategoryId: "$currency_category_id" },
                      as: "CurrencyCategory",
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ["$_id", "$$currencyCategoryId"] },
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
                  },
                ],
              },
            },
          ],
        },
      ];

      const executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
      };

      let response = await crudServices.get(QR, executing_parameters);

      if (response.data[0].Transaction[0] == undefined)
        return res.status(201).json({
          code: 201,
          success: true,
          is_transaction_done: false,
        });

      let transaction_status =
        response.data[0].Transaction[0].TrnsactionStatus[0].name;
      delete response.data[0].Transaction[0].TrnsactionStatus;

      if (transaction_status == "success") {
        return res.status(201).json({
          code: 201,
          success: true,
          is_transaction_done: true,
          is_transaction_success: true,
          transaction_data: response.data[0].Transaction[0],
        });
      } else {
        return res.status(201).json({
          code: 201,
          success: true,
          is_transaction_done: true,
          is_transaction_success: false,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal server error.",
      });
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(QR, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `QR Instance deleted successfully.`,
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

  const generate_qr_code = async (req, res) => {
    if (
      req.body.merchant_id == undefined ||
      req.body.merchant_id == "" ||
      req.body.merchant_public_key == undefined ||
      req.body.merchant_public_key == "" ||
      req.body.currency_id == undefined ||
      req.body.currency_id == "" ||
      req.body.currency_qty == undefined ||
      req.body.currency_qty == ""
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Missing Required Details to generate QR code.",
      });

    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, QRSchema)
      .then(async (reqData) => {
        try {
          let qr_name = `${reqData.merchant_id}_${
            reqData.merchant_public_key
          }_${reqData.currency_id}_${reqData.currency_qty}_${Date.now()}`;

          const hashed_qr_name = await bcrypt.hash(qr_name, saltRounds);

          let qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
            hashed_qr_name
          )}&format=jpeg`;

          reqData.name = hashed_qr_name;
          reqData.link = qr_url;

          let response = await crudServices.insert(QR, reqData);
          response.is_qr_expired = false;
          let milliseconds_until_expiry =
            601000 -
            new Date().getTime() +
            response.qr_generation_timestamp.getTime();
          response.milliseconds_until_expiry = milliseconds_until_expiry;

          return res.status(201).json({
            code: 201,
            success: true,
            data: response,
            message: "QR Generated successfully.",
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

  return {
    save,
    get,
    destroy,
    generate_qr_code,
    get_transaction_details_by_qr_id,
  };
};

module.exports = QRApi;
