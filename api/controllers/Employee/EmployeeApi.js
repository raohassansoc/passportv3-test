const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const { EmployeeSchema } = require("../../schemas/EmployeeSchema");
const Employee = require("../../models/Employee/Employee");
const awsHelper = require("../../helper/awsHelper");

const EmployeeApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_data = await crudServices.get(Employee, executing_parameters);
      if (req.files != null) {
        if (req.files.identity_proof != undefined) {
          if (found_data.data[0].identity_proof)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].identity_proof
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.identity_proof
          );
          req.body.identity_proof = url;
        }
        if (req.files.profile_picture != undefined) {
          if (found_data.data[0].profile_picture)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].profile_picture
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.profile_picture
          );
          req.body.profile_picture = url;
        }
      }
    } else {
      if (req.files != null) {
        if (req.files.identity_proof != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.identity_proof
          );
          req.body.identity_proof = url;
        }
        if (req.files.profile_picture != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.profile_picture
          );
          req.body.profile_picture = url;
        }
      }
    }
    validationService
      .validate(req.body, EmployeeSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            response = await crudServices.update(
              Employee,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(Employee, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Employee Details ${
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
        whereClause.$or = [
          {
            first_name: { $regex: new RegExp("^" + req.query.keyword, "i") },
          },
          {
            last_name: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
          {
            email_id: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];
      if (req.query.contact_code_id)
        whereClause.contact_code_id = ObjectId(req.query.contact_code_id);
      if (req.query.status_id)
        whereClause.status_id = ObjectId(req.query.status_id);
      if (req.query.designation_id)
        whereClause.designation_id = ObjectId(req.query.designation_id);
      if (req.query.restaurant_id)
        whereClause.restaurant_id = ObjectId(req.query.restaurant_id);
      if (req.query.city_id) whereClause.city_id = ObjectId(req.query.city_id);
      if (req.query.province_id)
        whereClause.province_id = ObjectId(req.query.province_id);
      if (req.query.country_id)
        whereClause.country_id = ObjectId(req.query.country_id);

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
          from: "employee_statuses",
          let: { statusId: "$status_id" },
          as: "EmployeeStatus",
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
          from: "employee_designations",
          let: { designationId: "$designation_id" },
          as: "EmployeeDesignation",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$designationId"] },
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
          from: "restaurants",
          let: { restaurantId: "$restaurant_id" },
          as: "Restaurant",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$restaurantId"] },
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

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let response = await crudServices.get(Employee, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Employee get successfully.",
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
        await crudServices.destroy(Employee, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Employee deleted successfully.`,
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

module.exports = EmployeeApi;
