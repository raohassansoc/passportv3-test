const { AdminSchema } = require("../../schemas/AdminSchema");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const Admin = require("../../models/Admin/Admin");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const AdminApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, AdminSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            delete reqData.email_id;
            if (reqData.password) {
              reqData.password = await bcrypt.hash(
                reqData.password,
                saltRounds
              );
            }

            response = await crudServices.update(
              Admin,
              { _id: reqData._id },
              reqData
            );
          } else {
            reqData.password = await bcrypt.hash(reqData.password, saltRounds);
            response = await crudServices.insert(Admin, reqData);
          }
          return res.status(201).json({
            code: 201,
            success: true,
            message: `Admin ${
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
        await crudServices.destroy(Admin, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Admin deleted successfully.`,
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

  const adminLogin = async (req, res) => {
    if (
      req.body.key == undefined ||
      req.body.key == "" ||
      req.body.password == undefined ||
      req.body.password == ""
    ) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Invalid Login Credentials.",
      });
    }

    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause.$or = [
        { admin_name: req.body.key },
        { email_id: req.body.key },
      ];

      let populate = [
        {
          from: "admin_categories",
          let: { categoryId: "$category_id" },
          as: "AdminCategory",
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
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let admin_data = await crudServices.get(Admin, executing_parameters);

      if (admin_data.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Invalid Login Credentials.",
        });

      const does_match = await bcrypt.compare(
        req.body.password,
        admin_data.data[0].password
      );

      if (!does_match)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Password Mismatched.",
        });

      const token = jwt.sign(
        {
          admin_id: admin_data.data[0]._id,
          admin_category: admin_data.data[0].AdminCategory[0].name,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "12h" }
      );

      let data = {};
      data.admin_id = admin_data.data[0]._id;
      data.admin_category = admin_data.data[0].AdminCategory[0].name;
      data.token = token;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Login Successfull.",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query.keyword) {
        whereClause.$or = [
          { first_name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { last_name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { admin_name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { email_id: { $regex: new RegExp("^" + req.query.keyword, "i") } },
        ];
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.category_id) {
        whereClause.category_id = ObjectId(req.query.category_id);
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
          from: "admin_categories",
          let: { categoryId: "$category_id" },
          as: "AdminCategory",
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
        skip: skip,
        limit: limit,
        populate: populate,
      };

      let response = await crudServices.get(Admin, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: `Admin get successfully.`,
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
    adminLogin,
  };
};

module.exports = AdminApi;
