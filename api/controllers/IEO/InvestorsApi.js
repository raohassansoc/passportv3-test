const InvestorsModel = require("../../models/IEO/Investors");
const { InvestorSchemas } = require("../../schemas/IeoSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const InvestorsApi = () => {
  const create = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, InvestorSchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            const updated_user = await crudServices.update(
              InvestorsModel,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(InvestorsModel, reqData);
          }
          jwt.sign(
            { id: reqData.email_id },
            "passportV3.io",
            async (err, Authorization) => {
              return res
                .cookie("Authorization", Authorization, {
                  maxAge: 90000,
                  httpOnly: false,
                })
                .status(201)
                .json({
                  code: 200,
                  success: true,
                  message: `User ${
                    reqData._id ? "updated" : "created"
                  } successfully`,
                  data: response || {},
                  token: Authorization,
                });
            }
          );
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
  const investorLogin = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, InvestorSchemas)
      .then(async (reqData) => {
        try {
          let response;
          let whereClause = {};
          whereClause.is_deleted = false;
          if (reqData.email_id) {
            whereClause.email_id = reqData.email_id;
          }
          let responseData = await crudServices.get(InvestorsModel, {
            where: whereClause,
            projection: {
              _id: 1,
              public_key: 1,
              status: 1,
              name: 1,
              email_id: 1,
              primary_contact_number: 1,
              dob: 1,
              first_name: 1,
              last_name: 1,
              telegram_id: 1,
              country_id: 1,
            },
          });
          if (responseData.data.length > 0) {
            response = responseData.data;
          } else {
            response = await crudServices.insert(InvestorsModel, reqData);
          }
          jwt.sign(
            { id: response._id },
            "passportV3.io",
            async (err, Authorization) => {
              return res
                .cookie("Authorization", Authorization, {
                  maxAge: 90000,
                  httpOnly: false,
                })
                .status(201)
                .json({
                  code: 200,
                  success: true,
                  message: `User logged in successfully`,
                  data: response || {},
                  token: Authorization,
                });
            }
          );
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
  // for deleting Category
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(InvestorsModel, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `User deleted successfully.`,
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
        whereClause.email_id = { $regex: req.query.keyword, $options: "i" };
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
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
      let response = await crudServices.get(InvestorsModel, {
        where: whereClause,
        projection: {
          _id: 1,
          public_key: 1,
          status: 1,
          name: 1,
          email_id: 1,
          primary_contact_number: 1,
          dob: 1,
          first_name: 1,
          last_name: 1,
          telegram_id: 1,
          country_id: 1,
        },
        skip: skip,
        limit: limit,
        sortField: "email_id",
        populate: [
          {
            from: "master_countries",
            let: { countryId: "$country_id" },
            as: "Country",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$countryId"] },
                },
              },
              {
                $project: {
                  name: 1,
                  population: 1,
                },
              },
            ],
          },
        ],
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: `User get successfully.`,
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  return {
    destroy,
    get,
    create,
    investorLogin,
  };
};
module.exports = InvestorsApi;
