const MerchantModel = require("../../models/Merchant/Merchant");
const UserModel = require("../../models/Pay/User");
const {
  MerchantCompositeUserSchema,
} = require("../../schemas/CompositeSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const awsHelper = require("../../helper/awsHelper");

const Web3 = require("web3");
const token = require("../../../Pass.json");
const contractABI = token.abi;
const contractAddress = "0x2091baB09ABc7Df5662fa756dce26E3Afe51E5f1";
const providerUrl =
  "https://sepolia.infura.io/v3/4ca7f7208ad84483b2eb48ef1c1d8de9";
const web3 = new Web3(providerUrl);
const myTokenContract = new web3.eth.Contract(contractABI, contractAddress);

const PaymentVerificationApi = () => {
  const validate_merchant = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, MerchantCompositeUserSchema)
      .then(async (reqData) => {
        try {
          let whereClause = {};
          whereClause.is_deleted = false;
          whereClause._id = ObjectId(reqData.merchant_id);

          const executing_parameters = {
            where: whereClause,
            projection: {
              _id: 1,
              public_key: 1,
            },
            sortField: "_id",
          };

          const merchant = await crudServices.get(
            MerchantModel,
            executing_parameters
          );

          if (!merchant) {
            return res.status(401).json({
              code: 401,
              success: false,
              message: "Merchant not Found.",
            });
          }

          let merchant_private_key,
            merchant_id_private = `${merchant.data[0]._id}_private`;

          try {
            merchant_private_key = await awsHelper.retrieveSecret(
              merchant_id_private
            );
          } catch (error) {
            return res.status(401).json({
              code: 401,
              success: false,
              message: "Error Retriving Merchant Secret Credentail.",
              data: {},
            });
          }

          return res.status(200).json({
            code: 200,
            success: true,
            message: "Merchant Found",
            data: {
              merchant_public_key: merchant.data[0].public_key,
              merchant_private_key: merchant_private_key,
            },
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

  const validate_merchant_and_user = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, MerchantCompositeUserSchema)
      .then(async (reqData) => {
        try {
          let whereClause = {};
          whereClause.is_deleted = false;
          whereClause._id = ObjectId(reqData.merchant_id);

          let executing_parameters;
          executing_parameters = {
            where: whereClause,
            projection: {
              _id: 1,
              public_key: 1,
            },
            sortField: "_id",
          };

          let merchant = await crudServices.get(
            MerchantModel,
            executing_parameters
          );

          if (!merchant || merchant.totalCount == 0)
            return res.status(401).json({
              code: 401,
              success: false,
              message: "Merchant not Found.",
            });

          let merchant_private_key,
            merchant_id_private = `${merchant.data[0]._id}_private`;

          try {
            merchant_private_key = await awsHelper.retrieveSecret(
              merchant_id_private
            );
          } catch (error) {
            return res.status(401).json({
              code: 401,
              success: false,
              message: "Error Retriving Merchant Secret Credentail.",
              data: {},
            });
          }

          whereClause._id = ObjectId(reqData.user_id);
          executing_parameters = {
            where: whereClause,
            projection: {
              _id: 1,
              public_key: 1,
            },
            sortField: "_id",
          };

          let user = await crudServices.get(UserModel, executing_parameters);
          if (!user || user.totalCount == 0)
            return res.status(401).json({
              code: 401,
              success: false,
              message: "User not Found.",
              data: {
                user: {},
                merchant: {
                  merchant_public_key: merchant.data[0].public_key,
                  merchant_private_key: merchant_private_key,
                },
              },
            });

          let user_private_key,
            user_id_private = `${user.data[0]._id}_private`;

          try {
            user_private_key = await awsHelper.retrieveSecret(user_id_private);
          } catch (error) {
            return res.status(401).json({
              code: 401,
              success: false,
              message: "Error Retriving User Secret Credentail.",
              data: {},
            });
          }

          return res.status(200).json({
            code: 200,
            success: true,
            message: "Merchant and User Found",
            data: {
              user: {
                user_public_key: user.data[0].public_key,
                user_private_key: user_private_key,
              },
              merchant: {
                merchant_public_key: merchant.data[0].public_key,
                merchant_private_key: merchant_private_key,
              },
            },
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

  return {
    validate_merchant,
    validate_merchant_and_user,
  };
};

module.exports = PaymentVerificationApi;
