const { BookingSchema } = require("../../schemas/BookingSchema");
const { ObjectId } = require("mongodb");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const Booking = require("../../models/Booking/Booking");
const Users = require("../../models/Pay/User");
// const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const stripe = require("stripe")(process.env.STRIPE_API_KEY_TEST);
const sgMail = require("@sendgrid/mail");
const PromoCode = require("../../models/PromoCode/PromoCode");
const EventPassVariety = require("../../models/Event/EventPassVeriety");
const Event = require("../../models/Event/Event");
const FiatTransaction = require("../../models/FiatTransaction/FiatTransaction");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const BookingApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, BookingSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              Booking,
              { _id: reqData._id },
              reqData
            );
          else {
            response = await crudServices.insert(Booking, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Booking Details ${reqData._id ? "updated" : "created"
              } successfully.`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
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

  const book = async (req, res) => {
    if (
      req.body.user_id == undefined ||
      req.body.user_id == "" ||
      req.body.event_id == undefined ||
      req.body.event_id == "" ||
      req.body.event_pass_variety_id == undefined ||
      req.body.event_pass_variety_id == "" ||
      req.body.ticket_qty == undefined
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Missing Required Details to make booking of Event.",
      });

    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, BookingSchema)
      .then(async (reqData) => {
        try {
          let whereClause_epv = {};
          whereClause_epv.is_deleted = false;
          whereClause_epv._id = ObjectId(req.body.event_pass_variety_id);
          let populate_epv = [
            {
              from: "events",
              let: { eventId: "$event_id" },
              as: "Event",
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$eventId"] },
                  },
                },
                {
                  $project: {
                    __v: 0,
                    is_deleted: 0,
                    deleted_at: 0,
                    created_at: 0,
                    uodated_at: 0,
                  },
                },
                {
                  $lookup: {
                    from: "bookings",
                    let: { eventId: "$_id" },
                    as: "Bookings",
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$event_id", "$$eventId"] },
                              { $eq: ["$is_deleted", false] },
                            ],
                          },
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
                {
                  $lookup: {
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
                          _id: 1,
                          currency_code: 1,
                          currency_name: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ];

          // if addional package id is provided then push extra lookup in pipeline
          if (reqData.additional_package_id) {
            let addional_package_lookup = {
              $lookup: {
                from: "event_additional_packages",
                let: {
                  eventId: "$_id",
                  ap_id: ObjectId(reqData.additional_package_id),
                },
                as: "AdditionalPackages",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$event_id", "$$eventId"] },
                          { $eq: ["$_id", "$$ap_id"] },
                          { $eq: ["$is_deleted", false] },
                        ],
                      },
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
            };
            populate_epv[0].pipeline.push(addional_package_lookup);
          }

          let executing_parameters_epv = {
            where: whereClause_epv,
            populate: populate_epv,
          };
          let epv_data = await crudServices.get(
            EventPassVariety,
            executing_parameters_epv
          );

          if (
            epv_data.data[0].Event[0].available_tickets == 0
            // epv_data.data[0].Event[0].total_booking_limit <=
            // epv_data.data[0].Event[0].Bookings.length
          )
            return res.status(401).json({
              code: 401,
              success: false,
              message:
                "Booking can not be Processed as Because all Available Tickets is Sole.",
            });

          if (
            (req.body.total_guests != undefined &&
              req.body.guest_list_ids == undefined) ||
            (req.body.total_guests == undefined &&
              req.body.guest_list_ids != undefined) ||
            (req.body.total_guests != undefined &&
              req.body.guest_list_ids != undefined &&
              req.body.guest_list_ids.length != parseInt(req.body.total_guests))
          )
            return res.status(401).json({
              code: 401,
              success: false,
              message:
                "Make Sure that Invited Guests details are Sent Correctly.",
            });

          let final_amount = epv_data.data[0].sell_price;
          if (
            reqData.additional_package_id &&
            epv_data.data[0].Event[0].AdditionalPackages[0] != undefined
          ) {
            final_amount =
              final_amount +
              epv_data.data[0].Event[0].AdditionalPackages[0].price;

            if (req.body.total_guests != undefined)
              final_amount =
                final_amount +
                parseInt(req.body.total_guests) *
                epv_data.data[0].Event[0].AdditionalPackages[0].price;
          }

          if (req.body.promo_code_id) {
            let whereClause_pc = {};
            whereClause_pc.is_deleted = false;
            whereClause_pc._id = ObjectId(req.body.promo_code_id);
            let populate = [
              {
                from: "discount_types",
                let: { discountTypeId: "$discount_type_id" },
                as: "DiscountType",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$discountTypeId"] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                    },
                  },
                ],
              },
            ];
            let executing_parameters_pc = {
              where: whereClause_pc,
              populate: populate,
            };
            let pc_data = await crudServices.get(
              PromoCode,
              executing_parameters_pc
            );
            if (pc_data.data[0].is_redeemed == true)
              return res.status(401).json({
                code: 401,
                success: false,
                message: "Promo Code Already Used.",
              });
            final_amount =
              parseFloat(final_amount) *
              (1 - parseFloat(pc_data.data[0].discount_value / 100));
          }

          let whereClause_user = {};
          whereClause_user.is_deleted = false;
          whereClause_user._id = ObjectId(reqData.user_id);

          let executing_parameters_user = {
            where: whereClause_user,
          };

          let charge_id;

          let User = await crudServices.get(Users, executing_parameters_user);
          if (final_amount != 0) {
            // Paypass card detail
            if (reqData.token_id == undefined || reqData.token_id == "")
              return res.status(401).json({
                code: 401,
                success: false,
                message: "Please Provide Card Details for Payment.",
              });

            let address = {};
            address.line1 = "default";
            address.city = "Dubai";
            address.state = "Dubai";
            address.country = "US";
            address.postal_code = 0;

            const customer = await stripe.customers.create({
              email: User.data[0].email_id,
              source: reqData.token_id,
              name: `${User.data[0].first_name} ${User.data[0].last_name}`,
              address: address,
            });
            console.log(
              340,
              epv_data.data[0].Event[0].Currency[0].currency_code
            );

            // Bypass strip 
            try {
              const payment = await stripe.charges.create({
                amount: parseInt(final_amount) * 100,
                currency: epv_data.data[0].Event[0].Currency[0].currency_code,
                description: req.body.description,
                customer: customer.id,
              });
              charge_id = payment.id;
              console.log(payment.id);
            } catch (error) {
              return res.status(501).json({
                code: 501,
                success: false,
                message: "Stripe Payment Failed.",
                error: error.raw.message,
              });
            }
          }

          let booking_reqData = {};
          booking_reqData.user_id = ObjectId(req.body.user_id);
          if (req.body.promo_code_id)
            booking_reqData.promo_code_id = ObjectId(req.body.promo_code_id);
          booking_reqData.total_guests = req.body.total_guests;
          booking_reqData.guest_list_ids = req.body.guest_list_ids;
          booking_reqData.event_id = ObjectId(req.body.event_id);
          booking_reqData.event_pass_variety_id = ObjectId(
            req.body.event_pass_variety_id
          );
          booking_reqData.currency = req.body.currency;
          booking_reqData.description = req.body.description;

          // Multi ticket functionality
          const ticketToInsert = [];
          for (let i = 0; i < req.body.ticket_qty; i++) {
            ticketToInsert.push({
              ...booking_reqData,
              ticket_number: i + 1
            })
          }

          const saved_booking = await Booking.insertMany(ticketToInsert)

          // Single Ticket 
          // let saved_booking = await crudServices.insert(
          //   Booking,
          //   booking_reqData
          // );

          if (saved_booking) {
            let update_available_ticket = epv_data.data[0].Event[0].available_tickets - req.body.ticket_qty;
            let updatedSaleValue = true
            if (update_available_ticket == 0) {
              updatedSaleValue = false
            }
            Event.findByIdAndUpdate(
              epv_data.data[0].Event[0]._id,
              { $set: { available_tickets: update_available_ticket, sale: updatedSaleValue } },
              { new: true },
              (err, updatedEvent) => {
                if (err) {
                  console.error('Error updating the event:', err);
                } else {
                  console.log('Updated available ticket quantity in event:', updatedEvent);
                }
              }
            )
          }

          let fiat_transaction_reqData = {};
          fiat_transaction_reqData.user_id = ObjectId(req.body.user_id);
          fiat_transaction_reqData.fiat_transaction_type_id = ObjectId(
            "6540f92ea0a03d122bcd78c2"
          ); // prod: 65410767e7e49eca803f3cbe, dev: 6540f92ea0a03d122bcd78c2
          fiat_transaction_reqData.transffered_currency_name = "aed";
          fiat_transaction_reqData.transffered_currency_id = ObjectId(
            "6540fba183ad6424485009dd"
          ); // prod: 654107b1b2d0bdceccf1be49, dev: 6540fba183ad6424485009dd
          fiat_transaction_reqData.transffered_currency_qty = final_amount;
          fiat_transaction_reqData.stripe_charge_id = charge_id
            ? charge_id
            : null;
          fiat_transaction_reqData.received_currency_id =
            fiat_transaction_reqData.transffered_currency_id;
          fiat_transaction_reqData.received_currency_qty =
            fiat_transaction_reqData.transffered_currency_qty;

          await crudServices.insert(FiatTransaction, fiat_transaction_reqData);

          // generate qr code and update saved_booking with url
          let booking_id = saved_booking._id;
          let webview_url = `https://passportv3.io/booking-details/${booking_id}`;
          let qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
            webview_url
          )}&format=jpeg`;

          await crudServices.update(
            Booking,
            { _id: booking_id },
            { qr_url: qr_url }
          );
          saved_booking.qr_url = qr_url;

          if (req.body.promo_code_id)
            await crudServices.update(
              PromoCode,
              { _id: req.body.promo_code_id },
              { is_redeemed: true }
            );

          let formatted_date, formatted_time;
          const dateObj = new Date(epv_data.data[0].Event[0].date);
          const options = { year: "numeric", month: "short", day: "numeric" };
          const formattedDate = dateObj.toLocaleDateString("en-US", options);
          formatted_date = formattedDate.replace(/,/g, ".");
          let dateObj2 = new Date(epv_data.data[0].Event[0].start_time);
          const hours = dateObj2.getUTCHours();
          const minutes = dateObj2.getUTCMinutes();
          const formattedHours = hours.toString().padStart(2, "0");
          const formattedMinutes = minutes.toString().padStart(2, "0");
          formatted_time = `${formattedHours}:${formattedMinutes}`;

          let on_event_booking_email_html = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width" />
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta name="x-apple-disable-message-reformatting" />
              <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800&display=swap"
                rel="stylesheet"
              />
              <link
                href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap"
                rel="stylesheet"
              />
              <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css"
                crossorigin="anonymous"
              />

              <style>
                html,
                body {
                  margin: 0 auto !important;
                  padding: 0 !important;
                  font-family: "Montserrat", sans-serif;
                  font-size: 16px;
                  line-height: 30px;
                  background-color: #000;
                }
                @import url("https://fonts.googleapis.com/css2?family=Montserrat&Roboto:wght@100;200;300;400;500;600;700;800&display=swap");

                table {
                  margin: 0 auto !important;
                }
                img {
                  -ms-interpolation-mode: bicubic;
                }
                a {
                  text-decoration: none;
                }
                *[x-apple-data-detectors],
                .unstyle-auto-detected-links *,
                .aBn {
                  border-bottom: 0 !important;
                  cursor: default !important;
                  color: inherit !important;
                  text-decoration: none !important;
                  font-size: inherit !important;
                  font-family: inherit !important;
                  font-weight: inherit !important;
                  line-height: inherit !important;
                }
                @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                  u ~ div .email-container {
                    min-width: 300px !important;
                  }
                }
                @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                  u ~ div .email-container {
                    min-width: 350px !important;
                  }
                }
                @media only screen and (min-device-width: 414px) {
                  u ~ div .email-container {
                    min-width: 400px !important;
                  }
                }
              </style>

              <style>
                .headding-text {
                  text-align: center;
                }
                .headding-text p {
                  color: #909090;
                  text-align: center;
                  font-family: "Roboto", sans-serif;
                  font-size: 13px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: 50px;
                  margin: 14px auto 0px;
                  width: 90%;
                  letter-spacing: 0.25px;
                  border-bottom: 1px dotted #909090;
                }
                .logo-head {
                  padding: 15px 9px 0px;
                }
                .logo-head img {
                  width: 120px;
                }
                .heading-section {
                  padding: 0.5rem 1.8rem 1.5rem;
                  margin: 0 auto;
                }
                .heading-section-line {
                  border-bottom: 1px dotted #909090;
                  width: 90%;
                  margin: 0 auto 10px;
                }
                .heading-section h3 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 42px;
                  font-style: normal;
                  font-weight: 600;
                  line-height: 120%;
                  letter-spacing: -3px;
                  margin: 0px;
                  margin-top: -20px;
                }
                .heading-section h4 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 15px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 28px;
                  letter-spacing: -1px;
                  margin: 15px 0px 2px;
                }
                .heading-section h5 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 13px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 30px;
                  letter-spacing: 0px;
                  margin: 0px 0px 7px;
                }
                .heading-section span {
                  margin: 0px 2px;
                }

                .heading-section input {
                  height: 20px;
                  padding: 5px 2px;
                  border: 0px;
                  margin: 0px 2px; /* color: #fff; */
                }

                .heading-section input:focus-visible {
                  outline-offset: none;
                }

                .heading-section p {
                  color: #909090;
                  font-family: "Montserrat", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 28px;
                  margin-bottom: 0px;
                  padding-top: 0px;
                  padding-right: 7px;
                  margin-top: 3px;
                }
                .heading-copy {
                  padding: 0rem 2rem 2rem 2rem;
                }
                .headding-bottom p {
                  color: #909090;
                  text-align: center;
                  font-family: "Roboto", sans-serif;
                  font-size: 13px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: 30px;
                  margin: 20px auto;
                  padding-top: 12px;
                  width: 90%;
                  letter-spacing: 0.25px;
                  border-top: 1px dotted #909090;
                }
                .bg-color-link {
                  padding: 15px 20px;
                  background-color: #262626;
                  border-radius: 15px;
                  margin: 0.2rem 2rem 1.5rem;
                }
                .bg-color-link h3 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 15px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 27px;
                  margin: 2px 0px 4px;
                  letter-spacing: -0.16px;
                }
                .bg-color-link p {
                  color: #909090;
                  font-family: "Montserrat", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 400; /* line-height: 42px; */
                  letter-spacing: -0.42px;
                  padding: 5px 0px 5px 0px;
                  margin: 0px 0px;
                }
                .bg-color-link p input {
                  height: 20px;
                  padding: 5px 4px;
                  border: 0px;
                  margin: 0px 3px; /* color: #fff; */
                }

                .bg-color-link a {
                  color: #b4abd5;
                  font-family: "Roboto", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: 28px;
                  letter-spacing: 0.25px;
                }
                .bg-color-link img {
                  margin: 6px 4px -4px;
                  width: 17px;
                }

                .bg-color-link h4 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 700;
                  padding: 15px 0px;
                  line-height: 120%;
                  letter-spacing: -0.42px;
                  text-transform: uppercase;
                  margin: 0px;
                  border-radius: 8px;
                  background: rgba(83, 83, 83, 0.3);
                }

                .Click-hear {
                  width: 90%;
                  border-radius: 4px;
                  background: #6a0bff;
                  border: none;
                  margin-top: 15px;
                  height: 50px;
                }
                .click-link-text h3 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 28px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 130%;
                  letter-spacing: -2.6px;
                  margin: 10px 0px 20px;
                }
                .click-link-text p {
                  color: #909090;
                  font-family: "Roboto", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: 28px;
                  letter-spacing: 0.25px;
                  margin: 0px;
                }
                .Click-hear a {
                  color: #fff;
                  text-align: center;
                  font-family: "Montserrat", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 700;
                  line-height: 28px;
                  text-transform: uppercase;
                }
                .headding-bottom {
                  text-align: center;
                }
                .headding-bottom p {
                  color: #909090;
                  text-align: center;
                  font-family: "Roboto", sans-serif;
                  font-size: 13px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: 30px;
                  margin: 20px auto;
                  padding-top: 12px;
                  width: 90%;
                  letter-spacing: 0.25px;
                  border-top: 1px dotted #909090;
                }

                .sub-total-text {
                  border-radius: 15px;
                  background-color: #262626;
                }
                .sub-total-text p {
                  margin: 0px;
                }
                .sub-total-text h4 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 700;
                  padding: 13px 0px;
                  line-height: 120%;
                  letter-spacing: -0.42px;
                  text-transform: uppercase;
                  margin: 0px;
                  border-radius: 8px;
                  background: rgba(83, 83, 83, 0.3);
                }
                .bg-box-total {
                  padding: 0px 20px;
                  background-color: #262626;
                  border-radius: 15px 15px 0px 0px;
                  margin: 0rem 1.8rem 0rem;
                }
                .bg-box-total h3 {
                  color: #909090;
                  font-family: "Montserrat", sans-serif;
                  font-size: 16px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 120%;
                  letter-spacing: 0.48px;
                  text-transform: uppercase;
                }
                .bg-box-img {
                  padding: 0px 20px; /* opacity: 0.1; */
                  background-color: #1e1e1e;
                  border-radius: 0px 0px 15px 15px;
                  margin: 0rem 1.8rem 1.2rem;
                }
                .bg-box-img table tr {
                  padding: 15px 0px;
                  line-height: 40px;
                  display: flex;
                  border-bottom: 1px solid rgba(83, 83, 83, 0.4);
                  align-items: center;
                }
                .bg-box-img h4 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 700;
                  padding: 15px 0px;
                  line-height: 120%;
                  letter-spacing: -0.42px;
                  text-transform: uppercase;
                  margin: 0px;
                  border-radius: 8px;
                  background: rgba(83, 83, 83, 0.3);
                }
                .bg-box-img p {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 15px;
                  font-style: normal;
                  font-weight: 500;
                  margin: 0px 0px;
                  line-height: 120%;
                  letter-spacing: -0.16px;
                }
                .bg-box-img h3 {
                  color: #fff;
                  font-family: "Montserrat", sans-serif;
                  font-size: 16.9px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 129%; /* 20.28px */
                  letter-spacing: -0.169px;
                  margin: 1px 0px 4px;
                }
                .images-boxes {
                  padding: 10px;
                  border-radius: 10px;
                }
                .images-squre {
                  text-align: center !important;
                }
                .images-squre img {
                  object-fit: cover !important;
                  width: 280px !important;
                  height: 280px !important;
                  padding: 30px;
                }
              </style>
            </head>

            <body
              width="100%"
              style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly"
            >
              <center style="width: 100%">
                <div style="max-width: 680px; margin: 50px auto" class="email-container">
                  <table
                    align="center"
                    role="presentation"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    width="100%"
                    style="margin: auto; background-color: #181818; overflow: hidden"
                  >
                    <tbody>
                      <tr>
                        <td class="headding-text" style="text-align: center">
                          <p>
                            If you are having problems viewing this in your email browser
                            please click here
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td class="logo-head" style="text-align: left">
                          <img
                            src="https://s3.eu-north-1.amazonaws.com/passportv3.io/1697522537241_logo_passport.png"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table
                            role="presentation"
                            cellspacing="0"
                            cellpadding="0"
                            border="0"
                            width="100%"
                          >
                            <tr>
                              <td>
                                <div class="heading-section">
                                  <table width="100%">
                                    <tr>
                                      <td width="55%">
                                        <h3>Ticket Confirmed!</h3>
                                        <h4>${epv_data.data[0].Event[0].name
            }</h4>
                                        <h5>
                                          <span>${formatted_date}</span> |
                                          <span>${formatted_time}</span> |
                                          <span
                                            >${epv_data.data[0].Event[0].location
            }</span
                                          >
                                        </h5>
                                        <p>
                                          You have successfully purchased entry into the
                                          above event. See below for the details Also, you
                                          can click the link below to view your official
                                          tickets for entry at the door.
                                        </p>
                                      </td>

                                      <td width="45%" align="center">
                                        <div class="images-boxes">
                                          <div class="images-squre">
                                            <img
                                              src="https://s3.eu-north-1.amazonaws.com/passportv3.io/1697712201164_true-images.png"
                                            />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </div>

                                <div class="heading-section-line"></div>
                                <table width="90%">
                                  <tbody>
                                    <tr>
                                      <td align="Left" class="click-link-text">
                                        <h3>You Bought :</h3>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                <div class="bg-color-link">
                                  <table width="100%">
                                    <tbody>
                                      <tr colspan="2">
                                        <td width="80%">
                                          <h3>${epv_data.data[0].Event[0].name
            }</h3>
                                          <p>
                                            ${epv_data.data[0].name} |
                                            <span>${formatted_date}</span>
                                          </p>
                                        </td>
                                        <td width="20%" align="center">
                                          <h4>${epv_data.data[0].sell_price} ${epv_data.data[0].Event[0].Currency[0].currency_code
            }</h4>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                <div class="bg-box-total">
                                  <table width="100%">
                                    <tr>
                                      <td width="100%"><h3>SUBTOTAL</h3></td>
                                    </tr>
                                  </table>
                                </div>
                                <div class="bg-box-img">
                                  <table width="100%">
                                    <tr>
                                      <td width="80%"><p>Ticket Price</p></td>
                                      <td width="20%" align="center">
                                        <h4>${epv_data.data[0].sell_price} ${epv_data.data[0].Event[0].Currency[0].currency_code
            }</h4>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td width="80%"><p>Taxes & Fees</p></td>
                                      <td width="20%" align="center"><h4>0 ${epv_data.data[0].Event[0].Currency[0]
              .currency_code
            }</h4></td>
                                    </tr>
                                    <tr>
                                      <td width="80%">
                                        <p style="color: #22ab94">Promo Code Discount</p>
                                      </td>
                                      <td width="20%" align="center">
                                        <h4
                                          style="
                                            color: #22ab94;
                                            background-color: rgba(34, 171, 148, 0.2);
                                          "
                                        >
                                          ${final_amount -
            epv_data.data[0].sell_price
            }
                                          ${epv_data.data[0].Event[0]
              .Currency[0].currency_code
            }
                                        </h4>
                                      </td>
                                    </tr>
                                    <tr style="border-bottom: none">
                                      <td width="80%">
                                        <h3>Total Cost</h3>
                                        <p style="color: #909090; font-weight: 400">
                                          after taxes & fees applied
                                        </p>
                                      </td>
                                      <td width="20%" align="center">
                                        <h4>
                                          ${final_amount == 0
              ? "FREE"
              : `${final_amount}
                                          ${epv_data.data[0].Event[0].Currency[0].currency_code}`
            }
                                        </h4>
                                      </td>
                                    </tr>
                                  </table>
                                </div>

                                <table width="100%">
                                  <tr>
                                    <td align="center">
                                      <button class="Click-hear">
                                        <a href="">VIEW TICKET IN PASSPORT APP</a>
                                      </button>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td class="headding-bottom" style="text-align: center">
                          <p>
                            If you no longer wish to recive this emails please click
                            Unsubscribe at any moment.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </center>
            </body>
          </html>
          `;

          let on_event_booking_email = {
            to: User.data[0].email_id,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: "Your Reservation For PassportV3 Event is Confirmed",
            html: on_event_booking_email_html,
          };

          await sgMail.send(on_event_booking_email);

          return res.status(201).json({
            code: 201,
            success: true,
            message: "Booking Success.",
            data: saved_booking,
          });
        } catch (error) {
          console.log(error);
          if (error.type != undefined && error.type == "StripeCardError")
            return res.status(error.statusCode).json({
              code: 501,
              stripe_server_code: error.statusCode,
              success: false,
              message: error.raw.message,
            });
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
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

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      if (req.query.user_id) whereClause.user_id = ObjectId(req.query.user_id);
      if (req.query.promo_code_id)
        whereClause.promo_code_id = ObjectId(req.query.promo_code_id);
      if (req.query.transaction_id)
        whereClause.transaction_id = ObjectId(req.query.transaction_id);
      if (req.query.event_id)
        whereClause.event_id = ObjectId(req.query.event_id);
      if (req.query.event_pass_variety_id)
        whereClause.event_pass_variety_id = ObjectId(
          req.query.event_pass_variety_id
        );

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
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "events",
          let: { eventId: "$event_id" },
          as: "Event",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$eventId"] },
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
          from: "event_pass_varieties",
          let: { eventpassvarietyId: "$event_pass_variety_id" },
          as: "EventPassVariety",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$eventpassvarietyId"] },
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
        projection: { __v: 0 },
        populate: populate,
      };

      let response = await crudServices.get(Booking, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Booking Details get successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 500,
        success: false,
        message: "Internal Server Error",
        error: err,
      });
    }
  };

  const getBookingUsers = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
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
      const userList = await Booking.aggregate([
        {
          $match: {
            is_deleted: false,
          },
        },
        {
          $group: {
            _id: "$user_id",
          },
        },
      ]);
      console.log(userList);
      // Extract the user IDs from the aggregation results
      const userIds = userList.map((user) => user._id);
      if (userIds) {
        {
          whereClause._id = { $in: userIds };
        }
      }

      whereClause.$or = [
        { first_name: { $regex: new RegExp(req.query.keyword, "i") } },
        { last_name: { $regex: new RegExp(req.query.keyword, "i") } },
      ];
      // Combine "OR" conditions into a single "OR" query
      let populate = [
        {
          from: "users_feeds",
          let: { userId: "$_id" },
          as: "UsersFeed",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user_id", "$$userId"] },
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
      ]
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
        populate: populate
      };

      let response = await crudServices.get(Users, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Booking Details get successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 500,
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    }
  };

  const get_booking_details_on_event_after_applying = async (req, res) => {
    if (
      req.query.user_id == undefined ||
      req.query.user_id == "" ||
      req.query.event_id == undefined ||
      req.query.event_id == "" ||
      req.query.event_pass_variety_id == undefined ||
      req.query.event_pass_variety_id == "" ||
      req.query.promo_code_id == undefined ||
      req.query.promo_code_id == ""
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Sufficient details to calculate the discounted price for booking.",
      });

    await validationService.convertIntObj(req.query);
    try {
      let whereClause_pc = {};
      whereClause_pc.is_deleted = false;
      whereClause_pc._id = ObjectId(req.query.promo_code_id);

      let populate = [
        {
          from: "discount_types",
          let: { discountTypeId: "$discount_type_id" },
          as: "DiscountType",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$discountTypeId"] },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      ];

      let executing_parameters_pc = {
        where: whereClause_pc,
        populate: populate,
      };

      let pc_details = await crudServices.get(
        PromoCode,
        executing_parameters_pc
      );

      if (pc_details.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Promo Code Does not Exists.",
        });

      if (pc_details.data[0].is_redeemed)
        return res.status(401).json({
          code: 401,
          success: false,
          message:
            "This Promo Code is already Redemeed and Can not be redemeed again.",
        });

      let whereClause_epv = {};
      whereClause_epv.is_deleted = false;
      whereClause_epv._id = ObjectId(req.query.event_pass_variety_id);

      populate = [
        {
          from: "events",
          let: { eventId: "$event_id" },
          as: "Event",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$eventId"] },
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

      if (req.query.additional_package_id) {
        let addional_package_lookup = {
          $lookup: {
            from: "event_additional_packages",
            let: {
              eventId: "$_id",
              ap_id: ObjectId(req.query.additional_package_id),
            },
            as: "AdditionalPackages",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$event_id", "$$eventId"] },
                      { $eq: ["$_id", "$$ap_id"] },
                      { $eq: ["$is_deleted", false] },
                    ],
                  },
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
        };
        populate[0].pipeline.push(addional_package_lookup);
      }

      let executing_parameters_epv = {
        where: whereClause_epv,
        populate: populate,
      };

      let epv_details = await crudServices.get(
        EventPassVariety,
        executing_parameters_epv
      );

      if (
        epv_details.data[0] == undefined ||
        (epv_details.data[0] && epv_details.data[0].Event[0] == undefined) ||
        (req.query.additional_package_id &&
          epv_details.data[0] &&
          epv_details.data[0].Event[0] &&
          epv_details.data[0].Event[0].AdditionalPackages[0] == undefined)
      )
        return res.status(401).json({
          code: 401,
          success: false,
          message: "This Error Should never occur :: inconsistence database.",
        });

      if (
        (req.query.total_guests != undefined &&
          req.query.guest_list_ids == undefined) ||
        (req.query.total_guests == undefined &&
          req.query.guest_list_ids != undefined) ||
        (req.query.total_guests != undefined &&
          req.query.guest_list_ids != undefined &&
          req.query.guest_list_ids.length != parseInt(req.query.total_guests))
      )
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Make Sure that Invited Guests details are Sent Correctly.",
        });

      if (
        req.query.total_guests != undefined &&
        req.query.total_guests >
        epv_details.data[0].Event[0].total_guest_invitation_limit
      )
        return res.status(401).json({
          code: 401,
          success: false,
          message: `You can not Invite more than ${epv_details.data[0].Event[0].total_guest_invitation_limit} guests for booking of this Event.`,
        });

      // calculate discounted price based on event pass variety sell price and promo code details

      let event_pass_sell_price = epv_details.data[0].sell_price;
      if (
        req.query.additional_package_id &&
        epv_details.data[0].Event[0].AdditionalPackages[0] != undefined
      ) {
        event_pass_sell_price =
          event_pass_sell_price +
          epv_details.data[0].Event[0].AdditionalPackages[0].price;

        if (req.query.total_guests != undefined)
          event_pass_sell_price =
            event_pass_sell_price +
            parseInt(req.query.total_guests) *
            epv_details.data[0].Event[0].AdditionalPackages[0].price;
      }

      const event_pass_discounted_sell_price =
        parseFloat(event_pass_sell_price) *
        (1 - parseFloat(pc_details.data[0].discount_value / 100));

      return res.status(200).json({
        code: 200,
        success: true,
        orignal_price: event_pass_sell_price,
        discounted_price: parseInt(event_pass_discounted_sell_price),
        discount_percentage: pc_details.data[0].discount_value,
        message: "Discounted Price for Event Pass Calculated Successfully.",
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

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(Booking, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Booking Details deleted successfully.`,
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
      return res.status(500).json({
        code: 500,
        success: false,
        message: "Internal Server Error",
        error: err,
      });
    }
  };

  const get_booking_details_by_user_details = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query.keyword)
        whereClause.$or = [
          { first_name: { $regex: new RegExp(req.query.keyword, "i") } },
          { email_id: { $regex: new RegExp(req.query.keyword, "i") } },
        ];
      if (req.query.primary_contact_number)
        whereClause.primary_contact_number = parseInt(
          req.query.primary_contact_number
        );

      let populate = [
        {
          from: "bookings",
          let: { userId: "$_id" },
          as: "Booking",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user_id", "$$userId"] },
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
                from: "events",
                let: { eventId: "$event_id" },
                as: "Event",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$eventId"] },
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
            {
              $lookup: {
                from: "event_pass_varieties",
                let: { eventPassVarietyId: "$event_pass_variety_id" },
                as: "EventPassVariety",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$eventPassVarietyId"] },
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

      let executing_parameters_user = {
        where: whereClause,
        populate: populate,
      };

      let user = await crudServices.get(Users, executing_parameters_user);
      if (user.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "User Does not Exists with these details.",
        });

      let booking_data = user.data[0].Booking;
      delete user.data[0].Booking;
      booking_data[0].User = user.data;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Booking Details Fetched from User Details",
        data: booking_data[0],
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Invalid Server Error.",
      });
    }
  };

  const get_list_of_people_attending_the_event = async (req, res) => {
    if (req.query.event_id == undefined || req.query.event_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Event Id to get the list of People Attending the Event.",
      });
    try {
      let whereClauseEvent = {};
      whereClauseEvent.is_deleted = false;

      if (req.query.event_id) { whereClauseEvent.event_id = ObjectId(req.query.event_id); }
      const executing_parameters_event = {
        where: whereClauseEvent,
        limit: 1,
        sortField: "sell_price",
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
      };

      let responseEventVariety = await crudServices.get(
        EventPassVariety,
        executing_parameters_event
      );


      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      whereClause.event_id = ObjectId(req.query.event_id);
      let populate = [
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
                created_at: 0,
                updated_at: 0,
              },
            },
            {
              $lookup: {
                from: "users_feeds",
                let: { userId: "$_id" },
                as: "UsersFeed",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$user_id", "$$userId"] },
                          { $eq: ["$is_deleted", false] },
                        ],
                      }
                      ,
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
              }
            }
          ],

        },
      ];

      const executing_parameters = {
        where: whereClause,
        projection: {
          _id: 1,
          user_id: 1,
          guest_list_ids: 1,
          total_guests: 1,
          event_pass_variety_id: {
            $cond: {
              if: { $eq: ["$event_pass_variety_id", responseEventVariety.data[0]._id] },
              then: true,
              else: false,
            },
          },
        },
        populate: populate,
      };

      let response = await crudServices.get(Booking, executing_parameters);
      let final_attendees_list = response.data.reduce(
        (attendees, ith_booking) => {
          if (ith_booking.User[0]) {
            ith_booking.User[0].is_vip = ith_booking.event_pass_variety_id
            attendees.push(ith_booking.User[0]);
          }
          return attendees;
        },
        []
      );

      if (req.query.keyword) {
        final_attendees_list = final_attendees_list.filter(
          (x) =>
            x.first_name.toLowerCase() == req.query.keyword.toLowerCase() ||
            (x.last_name &&
              x.last_name.toLowerCase() == req.query.keyword.toLowerCase()) ||
            (x.email_id &&
              x.email_id.toLowerCase() == req.query.keyword.toLowerCase())
        );
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Booking Details get successfully.",
        data: final_attendees_list,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };


  return {
    save,
    book,
    get,
    destroy,
    get_booking_details_on_event_after_applying,
    get_booking_details_by_user_details,
    getBookingUsers,
    get_list_of_people_attending_the_event
  };
};

module.exports = BookingApi;
