const UserDevice = require("../../models/Pay/UserDevice");

const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { UserDeviceSchema } = require("../../schemas/PaySchema");
const { ObjectId } = require("mongodb");
const saltRounds = 10;
const bcrypt = require("bcryptjs");

const UserDeviceApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, UserDeviceSchema)
      .then(async (reqData) => {
        try {
          let response;

          if (typeof reqData.pin != "string")
            reqData.password = JSON.stringify(reqData.pin);
          if (!/^\d{6}$/.test(reqData.password))
            return res.status(501).json({
              code: 501,
              success: false,
              message: `Pin must be of 6 digits only.`,
              data: reqData.pin,
            });
          const hashed_pin = await bcrypt.hash(reqData.pin, saltRounds);
          reqData.hashed_pin = hashed_pin;

          if (reqData._id) {
            response = await crudServices.update(
              UserDevice,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(UserDevice, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `User Device Information ${
              reqData._id ? "updated" : "created"
            } successfully`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(401).json({
            code: 401,
            success: false,
            error: error,
          });
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
      if (req.query.ip_address)
        whereClause.ip_address = ObjectId(req.query.ip_address);
      if (req.query.keyword)
        whereClause.$or = [
          { model_name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { os: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          {
            model_number: { $regex: new RegExp("^" + req.query.keyword, "i") },
          },
        ];

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
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          updated_at: 0,
          created_at: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "user_id",
        populate: [
          {
            from: "users",
            let: { userId: "$user_id" },
            as: "User",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] },
                },
              },
              {
                $project: {
                  is_deleted: 0,
                  deleted_at: 0,
                  updated_at: 0,
                  created_at: 0,
                },
              },
            ],
          },
        ],
      };

      let response = await crudServices.get(UserDevice, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "User Device Details Fetched Successfully.",
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
        await crudServices.destroy(UserDevice, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: "User Device Details Deleted.",
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

  return {
    save,
    get,
    destroy,
  };
};

module.exports = UserDeviceApi;
