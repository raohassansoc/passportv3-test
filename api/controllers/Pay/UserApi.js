const UserModel = require("../../models/Pay/User");
const UserDevice = require("../../models/Pay/UserDevice");
const DeletedUsers = require("../../models/Pay/DeletedUser");
const { UserSchemas } = require("../../schemas/PaySchema");
const {
  UserCompositeUserDeviceSchema,
} = require("../../schemas/CompositeSchemas");

const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");

const Web3 = require("web3");
const awsHelper = require("../../helper/awsHelper");
const networkUrl = process.env.PROVIDER_URL;
const web3 = new Web3(new Web3.providers.HttpProvider(networkUrl));
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { welcome_html_content, pin_update_email } = require("./email_html");
const authToken = process.env.authToken
const accountSID = process.env.accountSID
const serviceID = process.env.serviceID
const client = require('twilio')(accountSID, authToken)

const UserApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_user = await crudServices.get(UserModel, executing_parameters);

      if (req.files != null) {
        if (req.files.profile_picture != undefined) {
          if (found_user.data[0].profile_picture)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_user.data[0].profile_picture
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.profile_picture
          );
          req.body.profile_picture = url;
        }
      }
    } else {
      if (req.files != null) {
        if (req.files.profile_picture != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.profile_picture
          );
          req.body.profile_picture = url;
        }
      }
    }
    validationService
      .validate(req.body, UserSchemas)
      .then(async (reqData) => {
        try {
          if (reqData._id) {
            let response = await crudServices.update(
              UserModel,
              { _id: reqData._id },
              reqData
            );
            return res.status(201).json({
              code: 200,
              success: true,
              message: `User updated successfully`,
              data: reqData || {},
            });
          } else {

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if(typeof(req.body.primary_contact_number) !== 'number' || req.body.primary_contact_number == undefined){
              return res.status(500).json({
                code: 500,
                success: false,
                message: "Invalid Contact Number",
              });
            }else if(!emailRegex.test(req.body.email_id)){
              return res.status(500).json({
                code: 500,
                success: false,
                message: "Invalid Email Number",
              });
            }else{
              let response = await crudServices.insert(UserModel, reqData);
              const userAccount = web3.eth.accounts.create();
              let userid_private;
  
              userid_private = `${process.env.NODE_ENV}_${response._id}`;
              await crudServices.update(
                UserModel,
                { _id: response._id },
                { public_key: userAccount.address }
              );
  
              awsHelper.saveSecret(userid_private, userAccount.privateKey);
              response.public_key = userAccount.address;
              jwt.sign(
                { id: response._id },
                "passportV3.io",
                async (err, Authorization) => {
                  return res
                    .cookie("Authorization", Authorization, {
                      maxAge: 90000,
                      httpOnly: false,
                    })
                    .status(200)
                    .json({
                      code: 200,
                      success: true,
                      message: `User created successfully`,
                      data: response || {},
                      token: Authorization,
                    });
                }
              );
            }

          }
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

  

  const loginAttempt = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.body.email_id) {
        whereClause.email_id = { $regex: new RegExp(req.body.email_id, "i") };
      }
      const executing_parameters = {
        where: whereClause,
        sortField: "_id",
        populate: [
          {
            from: "user_device", // Replace with the actual collection name
            localField: "_id",
            foreignField: "user_id",
            as: "UserDevice",
          },
        ],
        projection: {
          _id: 1,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
      };
      const user_data = await crudServices.get(UserModel, executing_parameters);
      let response;
      if (user_data.data.length > 0) {
        response = user_data.data[0];
      }
      if (response) {
        jwt.sign(
          { id: response._id },
          "passportV3.io",
          async (err, Authorization) => {
            return res
              .cookie("Authorization", Authorization, {
                maxAge: 90000,
                httpOnly: false,
              })
              .status(200)
              .json({
                code: 200,
                success: true,
                message: `User Logged in successfully`,
                data: response || {},
                token: Authorization,
              });
          }
        );
      } else {
        return res.status(201).json({
          success: false,
          code: 201,
          message: "Login not Available.",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };
  const usernameAvailability = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query.username) {
        whereClause.username = { $regex: new RegExp(`^${req.query.username}$`, "i") };
      }
      const executing_parameters = {
        where: whereClause,
        sortField: "_id",
        projection: {
          _id: 1,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
      };
      const user_data = await crudServices.get(UserModel, executing_parameters);
      let response;
      if (user_data.data.length > 0) {
        response = user_data.data[0];
      }
      if (response) {
        return res
          .status(500)
          .json({
            code: 500,
            success: false,
            message: `User name already taken`,
            data: response || {},
          });
      } else {
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Username Available.",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const sendOTP = async (req, res) => {
    try {
      function generateOTP() {
        // Define the length of the OTP
        const otpLength = 6;

        // Generate a random number between 100000 and 999999 (inclusive)
        const min = 100000;
        const max = 999999;
        const otp = Math.floor(Math.random() * (max - min + 1)) + min;

        // Ensure the OTP has exactly 6 digits by padding with leading zeros
        return otp.toString().padStart(otpLength, "0");
      }

      // Generate and log the OTP
      const otp = generateOTP();
      let template = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f2f2f2; padding: 20px;">
              <tr>
                  <td align="center">
                      <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px 0px #ccc;">
                          <tr>
                              <td>
                                  <h1 style="color: #333;">Your OTP</h1>
                                  <p style="color: #555; font-size: 18px;">Your one-time password (OTP) is:</p>
                                  <p style="font-size: 32px; color: #007BFF; font-weight: bold;">${otp}</p> <!-- Replace with the actual OTP -->
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>`;
      let on_login_email = {
        to: req.body.email_id,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: "Login Email Authentication @PassportV3",
        html: template,
      };

      await sgMail.send(on_login_email, function (err, json) {
        if (err) {
          return res.status(200).json({
            code: 2000,
            success: true,
            message: `Email not send.`,
            data: err,
          });
        } else {
          return res.status(200).json({
            code: 2000,
            success: true,
            message: `Email sent successfully.`,
            data: { otp: otp } || {},
          });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const login = async (req, res) => {
    if (
      req.query.user_id == undefined ||
      req.query.user_id == "" ||
      req.query.pin == undefined ||
      req.query.pin == ""
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Login Details.",
      });
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.query.user_id);

      const executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
      };

      let user = await crudServices.get(UserModel, executing_parameters);
      if (user.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Invalid Login Credentials",
        });

      const does_match = await bcrypt.compare(
        req.query.pin,
        user.data[0].hashed_pin
      );

      if (!does_match)
        return res.status(401).json({
          code: 401,
          message: "Invalid PIN",
          success: false,
        });

      let token = jwt.sign(
        {
          user_id: user.data[0]._id,
          user_public_key: user.data[0].public_key,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "12h" }
      );

      // find user booking if exists : has_booked_event:true

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Login Successfull.",
        user_public_key: user.data[0].public_key,
        token: token,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        message: "Internal Server Error",
        success: false,
      });
    }
  };

  // in both of these apis -> yet to add the magic link authentication flow
  const magic_link_authentication_and_add_device_in_existing_account = async (
    req,
    res
  ) => {
    const device_ip_address = req._remoteAddress;
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, UserCompositeUserDeviceSchema)
      .then(async (reqData) => {
        try {
          // add magic link authentication here
          reqData.ip_address = device_ip_address;
          await crudServices.insert(UserDevice, reqData);
        } catch (error) {
          console.log(error);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Error While Adding new Device Information.",
          });
        }

        if (reqData.keep_old_pin != undefined) {
          if (reqData.keep_old_pin == true) {
            return res.status(201).json({
              code: 201,
              success: true,
              message: "New Device is Configured for Access.",
            });
          } else {
            if (reqData.pin == undefined) {
              return res.status(501).json({
                code: 428,
                success: false,
                message:
                  "Please Provide PIN related Information for new Device.",
              });
            } else {
              reqData.pin = JSON.stringify(reqData.pin);
              reqData.hashed_pin = await bcrypt.hash(reqData.pin, saltRounds);
              try {
                await crudServices.update(
                  UserModel,
                  { _id: reqData.user_id },
                  reqData
                );
                return res.status(201).json({
                  code: 201,
                  success: true,
                  message: "New PIN is Configured for new Device.",
                });
              } catch (error) {
                console.log(error);
                return res.status(501).json({
                  code: 501,
                  success: false,
                  message:
                    "Error While Updating PIN, Old PIN can sill be used.",
                });
              }
            }
          }
        } else {
          return res.status(501).json({
            code: 428,
            success: false,
            message: "Please Provide PIN related Information for new Device.",
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

  const sign_up = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, UserCompositeUserDeviceSchema)
      .then(async (reqData) => {
        let new_user;
        try {
          new_user = await crudServices.insert(UserModel, reqData);
          const newUserWallet = web3.eth.accounts.create();

          let userid_private;
          userid_private = `${process.env.NODE_ENV}_${new_user._id}`;

          await crudServices.update(
            UserModel,
            { _id: new_user._id },
            { public_key: newUserWallet.address }
          );

          awsHelper.saveSecret(userid_private, newUserWallet.privateKey);
          new_user.public_key = newUserWallet.address;

          let on_signup_welcome_email = {
            to: reqData.email_id,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: "Welcome to Passport.",
            html: welcome_html_content,
          };

          await sgMail.send(on_signup_welcome_email);

          await res.status(201).json({
            code: 201,
            success: true,
            message: "User Details stored.",
            data: new_user,
          });
        } catch (error) {
          console.log(error);
          if (error.error.errors[0] != undefined && error.error.code == 11000) {
            return res.status(438).json({
              code: 438,
              success: false,
              message: error.error.errors[0].message,
              internal_error_code: error.error.code,
              internal_error_msg: error.error.message,
            });
          } else {
            console.log(error);
            return res.status(501).json({
              code: 501,
              success: false,
              message: "Error While Saving User Details.",
              error: error,
            });
          }
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
  }; // signup without pin

  const create_raw_user = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, UserCompositeUserDeviceSchema)
      .then(async (reqData) => {
        let new_user;
        try {
          let whereClause = {};
          whereClause.is_deleted = false;
          if (req.body.email_id) {
            whereClause.email_id = { $regex: req.body.email_id };
          }
          if (req.body.primary_contact_number) {
            whereClause.primary_contact_number = { $regex: req.body.primary_contact_number };
          }
          let executing_parameters = {
            where: whereClause,
          };

          let User = await crudServices.get(UserModel, executing_parameters);
          if (User.data[0] != undefined) {
            return res.status(219).json({
              code: 219,
              success: true,
              message: "User Already Exists. User Details Fetched.",
              data: {
                _id: User.data[0]._id,
                first_name: User.data[0].first_name,
                last_name: User.data[0].last_name,
              },
            });
          }

          let default_pin = "000000";
          reqData.hashed_pin = await bcrypt.hash(default_pin, saltRounds);

          new_user = await crudServices.insert(UserModel, reqData);
          const newUserWallet = web3.eth.accounts.create();

          let userid_private;
          userid_private = `${process.env.NODE_ENV}_${new_user._id}`;

          await crudServices.update(
            UserModel,
            { _id: new_user._id },
            { public_key: newUserWallet.address }
          );

          awsHelper.saveSecret(userid_private, newUserWallet.privateKey);
          new_user.public_key = newUserWallet.address;

          let on_signup_welcome_email = {
            to: reqData.email_id,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: "Welcome to Passport.",
            html: welcome_html_content,
          };

          await sgMail.send(on_signup_welcome_email);

          await res.status(201).json({
            code: 201,
            success: true,
            message: "User Details stored.",
            data: new_user,
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Error While Saving User Details.",
            error: error,
          });
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

  const add_pin_in_existing_account = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, UserCompositeUserDeviceSchema)
      .then(async (reqData) => {
        try {
          reqData.pin = JSON.stringify(reqData.pin);

          reqData.hashed_pin = await bcrypt.hash(reqData.pin, saltRounds);

          await crudServices.update(
            UserModel,
            { _id: reqData.user_id },
            reqData
          );

          if (
            reqData.is_pin_update != undefined &&
            reqData.is_pin_update == true
          ) {
            let whereClause = {};
            whereClause.is_deleted = false;
            whereClause._id = ObjectId(reqData.user_id);

            let executing_parameters = {
              where: whereClause,
              projection: {
                email_id: 1,
              },
            };

            let user = await crudServices.get(UserModel, executing_parameters);

            let on_pin_update_email = {
              from: process.env.SENDGRID_SENDER_EMAIL,
              to: user.data[0].email_id,
              subject:
                "Your Security Pin for Passport is Updated Successfully.",
              html: pin_update_email,
            };

            await sgMail.send(on_pin_update_email);
          }
          return res.status(200).json({
            code: 201,
            success: true,
            message: `Pin ${reqData.is_pin_update != undefined &&
              reqData.is_pin_update == true
              ? `reset`
              : `set`
              } Successfully.`,
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
          });
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
  }; // set pin

  const check_pin_of_user = async (req, res) => {
    if (req.query.user_id == undefined || req.query.user_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide User Details.",
      });
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.query.user_id);

      let executing_parameters = {
        where: whereClause,
      };

      let user = await crudServices.get(UserModel, executing_parameters);

      if (user.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Please Provide User Detials to check User Pin Status.",
        });

      let is_pin_set = user.data[0].hashed_pin != "null";
      return res.status(200).json({
        code: 200,
        success: true,
        is_pin_set: is_pin_set,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  }; // check pin

  const createWebWallet = async (req, res) => {
    try {
      const userAccount = web3.eth.accounts.create();
      let userid_private;

      userid_private = `${process.env.NODE_ENV}_${req.body._id}`;
      const updated_user = await crudServices.update(
        UserModel,
        { _id: req.body._id },
        { public_key: userAccount.address }
      );

      awsHelper.saveSecret(userid_private, userAccount.privateKey);
      req.body.public_key = userAccount.address;
      return res.status(201).json({
        code: 200,
        success: true,
        message: `User Wallet created successfully`,
        data: req.body || {},
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        let whereClause = {};
        whereClause.is_deleted = false;
        whereClause._id = ObjectId(req.body.record_id);
        const record = await crudServices.get(UserModel, {
          where: whereClause,
        });
        await crudServices.destroyHard(UserModel, { _id: req.body.record_id });
        await crudServices.insert(DeletedUsers, record.data[0]);
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
      console.log(error);
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
      if (req.query.primary_contact_number) {
        whereClause.primary_contact_number =
          parseInt(req.query.primary_contact_number)
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.public_key) whereClause.public_key = req.query.public_key;
      if (req.query.country_id)
        whereClause.country_id = ObjectId(req.query.country_id);
      if (req.query.city_id) whereClause.city_id = ObjectId(req.query.city_id);
      if (req.query.province_id)
        whereClause.province_id = ObjectId(req.query.province_id);
      console.log(whereClause);
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
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          __v: 0,
          is_deleted: 0,
          created_at: 0,
          deleted_at: 0,
          updated_at: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "email_id",
      };

      let response = await crudServices.get(UserModel, executing_parameters);

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

  const verifySmsOtp = async (req, res) => {
    try {
      if (req.query.contact_number && (req.query.code).length === 6) {
        client
          .verify
          .services(serviceID)
          .verificationChecks
          .create({
            to: `+${req.query.contact_number}`,
            code: req.query.code
          })
          .then(data => {
            console.log(data);
            if (data.status === "approved") {
              return res.status(200).send({
                code: 200,
                success: true,
                message: "User is Verified!!",
                data: data
              })
            }
            else {
              return res.status(500).send({
                code: 500,
                success: false,
                message: "Invalid OTP",
                contact_number: req.query.contact_number,
                data: data
              })
            }
          })

      } else {
        return res.status(500).send({
          code: 500,
          success: false,
          message: "Wrong phone number :(",
          contact_number: req.query.contact_number,
          data: data
        })
      }
    } catch (error) {
      console.log(error)
      return res.status(error.status).json(error.error);
    }
  }
  const sendSmsOtp = async (req, res) => {
    try {
      if (req.query.contact_number) {
        client
          .verify
          .services(serviceID)
          .verifications
          .create({
            to: `+${req.query.contact_number}`,
            channel: 'sms'
          })
          .then(data => {
            return res.status(200).json({
              code: 200,
              success: true,
              message: "Verification is sent!!",
              contact_number: req.query.contact_number,
              data
            });
          })
          .catch(err => {
            console.log(err);
            return res.status(500).json({
              code: 500,
              success: false,
              message: "Something want Wrong",
              contact_num: req.query.contact_num,
            });
          })
      } else {
        return res.status(200).json({
          code: 2000,
          success: true,
          message: "Wrong phone number :(",
          contact_num: req.query.contact_num,
        });
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Verification is sent!!",
        contact_number: req.query.contact_number,
      });
    } catch (error) {
      console.log(error)
      return res.status(error.status).json(error.error);
    }
  }

  return {
    save,
    destroy,
    get,
    createWebWallet,
    loginAttempt,
    login,
    sign_up,
    create_raw_user,
    magic_link_authentication_and_add_device_in_existing_account,
    add_pin_in_existing_account,
    check_pin_of_user,
    sendOTP,
    sendSmsOtp,
    verifySmsOtp,
    usernameAvailability
  };
};
module.exports = UserApi;
