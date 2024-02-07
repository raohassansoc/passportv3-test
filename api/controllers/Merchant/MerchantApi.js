const MerchantModel = require("../../models/Merchant/Merchant");
const { MerchantSchemas } = require("../../schemas/MerchantSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const awsHelper = require("../../helper/awsHelper");
const Web3 = require("web3");
const networkUrl = process.env.alchemy_network_url;
const web3 = new Web3(new Web3.providers.HttpProvider(networkUrl));
const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const util = require("util");
const randomBytes = util.promisify(crypto.randomBytes);
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require("jsonwebtoken");
const SettlementPeriod = require("../../models/Merchant/SettlementPeriod");
const Referral = require("../../models/Merchant/Referral");
const Reward = require("../../models/Merchant/Reward");

const MerchantApi = () => {
  const update = async (req, res) => {
    await validationService.convertIntObj(req.body);
    let whereClause = {};
    whereClause.is_deleted = false;
    whereClause._id = ObjectId(req.body._id);

    let executing_parameters = {
      where: whereClause,
    };

    let found_merchant = await crudServices.get(
      MerchantModel,
      executing_parameters
    );

    if (req.files != null) {
      if (req.files.profile_picture != undefined) {
        if (found_merchant.data[0].profile_picture)
          await awsHelper.deleteSingleImageFilefromS3fromBackend(
            found_merchant.data[0].profile_picture
          );
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.profile_picture
        );
        req.body.profile_picture = url;
      }
      if (req.files.trading_license != undefined) {
        if (found_merchant.data[0].trading_license)
          await awsHelper.deleteSingleImageFilefromS3fromBackend(
            found_merchant.data[0].trading_license
          );
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.trading_license
        );
        req.body.trading_license = url;
      }
      if (req.files.contract != undefined) {
        if (found_merchant.data[0].contract)
          await awsHelper.deleteSingleImageFilefromS3fromBackend(
            found_merchant.data[0].contract
          );
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.contract
        );
        req.body.contract = url;
      }
    }

    if (req.body.password) delete req.body.password;
    if (req.body.email_id) delete req.body.email_id;

    validationService
      .validate(req.body, MerchantSchemas)
      .then(async (reqData) => {
        try {
          let response;
          response = await crudServices.update(
            MerchantModel,
            { _id: reqData._id },
            reqData
          );
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Merchant ${reqData._id ? "updated" : "created"
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

  // for deleting merchant
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(MerchantModel, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Merchant deleted successfully.`,
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
        whereClause.first_name = { $regex: req.query.keyword, $options: "i" };
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.country_id) {
        whereClause.country_id = ObjectId(req.query.country_id);
      }
      if (req.query.province_id) {
        whereClause.province_id = ObjectId(req.query.province_id);
      }
      if (req.query.status_id) {
        whereClause.status_id = ObjectId(req.query.status_id);
      }
      if (req.query.city_id) {
        whereClause.city_id = ObjectId(req.query.city_id);
      }
      if (req.query.company_type_id) {
        whereClause.company_type_id = ObjectId(req.query.company_type_id);
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
          from: "merchant_statuses",
          let: { statusId: "$status_id" },
          as: "MerchantStatus",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$statusId"] },
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
          from: "currencies",
          let: { currenciesId: "$accepted_currency" },
          as: "Currencies",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$currenciesId"] },
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
            {
              $lookup: {
                from: "currency_categories",
                let: { categoryId: "$currency_category_id" },
                as: "CurrencyCategory",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$categoryId"] },
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
            },
          ],
        },
      ];

      let response = await crudServices.get(MerchantModel, {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "first_name",
        populate: populate,
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `Merchant get successfully.`,
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };
  // login
  const merchantLogin = async function (req, res) {
    if (req.body.email_id == undefined || req.body.password == undefined)
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Missing required parameters.",
      });
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause.email_id = req.body.email_id;

      const executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        sortField: "email_id",
      };

      const merchant = await crudServices.get(
        MerchantModel,
        executing_parameters
      );
      console.log(merchant);
      if (!merchant.data || merchant.data.length == 0) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Merchant Does not Exists.",
        });
      }

      const does_match = await bcrypt.compare(
        req.body.password,
        merchant.data[0].password
      );

      if (!does_match)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Password Mismatched",
        });

      const token = jwt.sign(
        {
          merchant_id: merchant.data[0]._id,
          merchant_public_key: merchant.data[0].public_key,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "12h" }
      );

      let data = {};
      data.email_id = req.body.email_id;
      data.merchant_id = merchant.data[0]._id;
      data.merchant_public_key = merchant.data[0].public_key;
      data.is_first_login = !merchant.data[0].is_pwd_updated;
      if (merchant.data[0].is_pwd_updated) data.token = token;
      //
      return res.status(200).json({
        code: 201,
        success: true,
        message: "Login Successfull",
        data: data,
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

  function generateRandomHexCode(length) {
    const randomBytes = crypto.randomBytes(length / 2);
    return randomBytes.toString("hex").toUpperCase();
  }
  // signup
  const signup = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.files != null) {
      if (req.files.trading_license != undefined) {
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.trading_license
        );
        req.body.trading_license = url;
      }
      if (req.files.contract != undefined) {
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.contract
        );
        req.body.contract = url;
      }
    }
    validationService
      .validate(req.body, MerchantSchemas)
      .then(async (reqData) => {
        try {
          let response;
          const random_hex_password = generateRandomHexCode(12);
          const hashed_password = await bcrypt.hash(
            random_hex_password,
            saltRounds
          );

          reqData.password = hashed_password;
          response = await crudServices.insert(MerchantModel, reqData);

          const userAccount = web3.eth.accounts.create();

          let merchant_id_private;

          merchant_id_private = `${process.env.NODE_ENV}_${response._id}`;

          awsHelper.saveSecret(merchant_id_private, userAccount.privateKey);

          await crudServices.update(
            MerchantModel,
            { _id: response._id },
            { public_key: userAccount.address }
          );

          let success_merchant_onboard_email = {
            to: reqData.email_id,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: "Regarding successful Merchant On Board on @Passport.",
            text: `Your Passport Merchant On Boarding was a success. Here are your Initiall Login Credentials. Email ID: ${reqData.email_id} , Password: ${random_hex_password}`,
          };

          await sgMail.send(success_merchant_onboard_email);

          return res.status(201).json({
            code: 200,
            success: true,
            message: `Merchant SignUp successfully`,
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

  const admin_merchant_onboard = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.files != null) {
      if (req.files.profile_picture != undefined) {
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.profile_picture
        );
        req.body.profile_picture = url;
      }
      if (req.files.trading_license != undefined) {
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.trading_license
        );
        req.body.trading_license = url;
      }
      if (req.files.contract != undefined) {
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.contract
        );
        req.body.contract = url;
      }
    }

    validationService
      .validate(req.body, MerchantSchemas)
      .then(async (reqData) => {
        try {
          let response;
          const random_hex_password = generateRandomHexCode(12);
          const hashed_password = await bcrypt.hash(
            random_hex_password,
            saltRounds
          );

          console.log(468, random_hex_password);

          reqData.password = hashed_password;
          reqData.status_id = ObjectId("651e845ece8c4f45f6ba9c79");
          response = await crudServices.insert(MerchantModel, reqData);


          const userAccount = web3.eth.accounts.create();

          let merchant_id_private;

          merchant_id_private = `${process.env.NODE_ENV}_${response._id}`;

          awsHelper.saveSecret(merchant_id_private, userAccount.privateKey);

          await crudServices.update(
            MerchantModel,
            { _id: response._id },
            {
              public_key: userAccount.address,
            }
          );

          await crudServices.insert(SettlementPeriod, {
            merchant_id: response._id,
            value: reqData.settlementPeriod_value,
          });
          await crudServices.insert(Reward, {
            merchant_id: response._id,
            value: reqData.reward_value,
          });
          await crudServices.insert(Referral, {
            merchant_id: response._id,
            value: reqData.referral_value,
          });

          let success_merchant_onboard_email = {
            to: reqData.email_id,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: "Regarding successful Merchant On Board on @Passport.",
            text: `Your Passport Merchant On Boarding was a success. Your Passport Account is approved. Here are your Initiall Login Credentials. Email ID: ${reqData.email_id} , Password: ${random_hex_password}`,
          };

          await sgMail.send(success_merchant_onboard_email);

          return res.status(201).json({
            code: 200,
            success: true,
            message: `Merchant SignUp successfully`,
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

  // update password
  const update_password = async (req, res) => {
    if (req.body.email_id == undefined || req.body.new_password == undefined)
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Required Password update details",
      });
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause.email_id = req.body.email_id;

      const executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        sortField: "email_id",
      };

      const merchant = await crudServices.get(
        MerchantModel,
        executing_parameters
      );

      if (!merchant.data || merchant.data.length == 0) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Merchant Does not Exists.",
        });
      }

      let new_hashed_password = await bcrypt.hash(
        req.body.new_password,
        saltRounds
      );

      await crudServices.update(
        MerchantModel,
        { _id: merchant.data[0]._id },
        { password: new_hashed_password, is_pwd_updated: true }
      );

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Merchant Password Updated.",
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  return {
    update,
    destroy,
    get,
    signup,
    merchantLogin,
    update_password,
    admin_merchant_onboard,
  };
};
module.exports = MerchantApi;
