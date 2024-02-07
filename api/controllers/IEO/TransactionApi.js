const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { TransactionSchemas } = require("../../schemas/IeoSchemas");

const Transaction = require("../../models/IEO/Transaction");
const { ObjectId } = require("mongodb");
const sgMail = require("@sendgrid/mail");
const sendgridAPIKey =
  "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";
sgMail.setApiKey(sendgridAPIKey);


const TransactionApi = () => {
  const calculateEquityBonus = (investmentAmount) => {
    const totalValuation = 30e6; // Negative value since it's a debt (liability)
    const tokenPercentage = 50;
    // Calculate the equity value for the investment
    const equityPercent = 100 - tokenPercentage;
    const equityValue = (investmentAmount * equityPercent) / 100;

    // Calculate the pass token value for the investment
    const passTokenValue = (investmentAmount * tokenPercentage) / 100;

    // Calculate the equity percentage of total valuation
    const equityPercentageOfTotal = (equityValue / totalValuation) * 100;

    // Calculate the pass token percentage of total valuation
    const passTokenPercentageOfTotal = (passTokenValue / totalValuation) * 100;

    return {
      equityValue,
      passTokenValue,
      equityPercentageOfTotal,
      passTokenPercentageOfTotal,
    };
  };

  const create = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, TransactionSchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            const update_transaction = await crudServices.update(
              Transaction,
              { _id: reqData._id },
              reqData
            );
          } else {
            if (reqData.is_only_pass) {
              let data = {
                public_key:
                  reqData.public_key !== undefined ? reqData.public_key : null,
                user_id: reqData.user_id,
                amount: reqData.amount,
                token_value: reqData.amount,
                currency: reqData.currency,
                is_crypto: reqData.is_crypto,
              };
              response = await crudServices.insert(Transaction, data);
            } else {
              let equity = calculateEquityBonus(reqData.amount);
              let data = {
                public_key:
                  reqData.public_key !== undefined ? reqData.public_key : null,
                user_id: reqData.user_id,
                amount: reqData.amount,
                token_value: equity.passTokenValue,
                equity: equity.equityPercentageOfTotal,
                currency: reqData.currency,
                is_crypto: reqData.is_crypto,
              };
              response = await crudServices.insert(Transaction, data);
            }
          }

          return res.status(201).json({
            code: 200,
            success: true,
            message: `Transaction ${
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
  const createEmail = async (req, res) => {
    try {
      const msg = {
        to: `${req.body.email_id}`,
        from: "hiral@bintech.services",
        subject: "PASSPORT Equity Purchase",
        Text: "Email for Equity purchase",
      };
      sgMail.send(msg, function (err, json) {
        if (err) {
          return res.status(200).json({
            code: 2000,
            success: true,
            message: `Email not send.`,
            data: {},
          });
        } else {
          return res.status(200).json({
            code: 2000,
            success: true,
            message: `Email sent successfully.`,
            data: json || {},
          });
        }
      });
    } catch (error) {
      console.log(error);
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
      if (req.query.user_id) {
        whereClause.user_id = ObjectId(req.query.user_id);
      }
      if (req.query.public_key) {
        whereClause.public_key = req.query.public_key;
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
      let response = await crudServices.get(Transaction, {
        where: whereClause,
        projection: {
          _id: 1,
          public_key: 1,
          user_id: 1,
          amount: 1,
          token_value: 1,
          equity: 1,
          bonus_equity: 1,
          is_type: 1,
          currency: 1,
          is_crypto: 1,
          created_at: 1,
        },
        skip: skip,
        limit: limit,
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `Transaction get successfully.`,
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };
  const getTotal = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.user_id) {
        whereClause.user_id = ObjectId(req.query.user_id);
      }
      if (req.query.public_key) {
        whereClause._id = req.query.public_key;
      }
      const token = await Transaction.aggregate([
        {
          $match: whereClause,
        },
        {
          $group: {
            _id: null,
            totalToken: { $sum: "$token_value" },
          },
        },
      ]);
      const equity = await Transaction.aggregate([
        {
          $match: whereClause,
        },
        {
          $group: {
            _id: null,
            totalEquity: { $sum: "$equity" },
          },
        },
      ]);
      const investmentAmount = await Transaction.aggregate([
        {
          $match: whereClause,
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      return res.status(200).json({
        code: 200,
        success: true,
        message: `Transaction get successfully.`,
        token: token[0] || [],
        equity: equity[0] || [],
        investmentAmount: investmentAmount[0] || [],
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const equityCalculation = async (req, res) => {
    try {
      // Example usage:
      const investmentAmount = req.body.value; // Replace with the actual investment amount
      const result = calculateEquityBonus(investmentAmount);
      result.investmentAmount = parseInt(investmentAmount);
      console.log("Token Reward:", result.passTokenPercentageOfTotal);
      console.log("Equity Percentage:", result.equityPercentageOfTotal);

      return res.status(201).json({
        code: 200,
        success: true,
        message: `Equity get successfully.`,
        data: result || {},
      });
    } catch (error) {
      return res.status(501).json(error);
    }
  };

  return {
    get,
    equityCalculation,
    create,
    getTotal,
    createEmail,
  };
};
module.exports = TransactionApi;
