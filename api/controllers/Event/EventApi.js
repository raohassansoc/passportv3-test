const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const Event = require("../../models/Event/Event");
const { EventSchema } = require("../../schemas/EventSchema");
const awsHelper = require("../../helper/awsHelper");

const EventApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_data = await crudServices.get(Event, executing_parameters);
      req.body.images = [];
      if (
        req.body.to_be_deleted != undefined &&
        req.body.to_be_deleted.length &&
        found_data.data[0].images.length
      ) {
        for (let i = 0; i < found_data.data[0].images.length; ++i) {
          if (req.body.to_be_deleted.includes(found_data.data[0].images[i])) {
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].images[i]
            );
          } else {
            req.body.images.push(found_data.data[0].images[i]);
          }
        }
      } else {
        if (found_data.data[0].images.length)
          for (let i = 0; i < found_data.data[0].images.length; ++i) {
            req.body.images.push(found_data.data[0].images[i]);
          }
      }

      if (req.files != null) {
        if (req.files.thumbnail_image != undefined) {
          if (found_data.data[0].thumbnail_image)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].thumbnail_image
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.thumbnail_image
          );
          req.body.thumbnail_image = url;
        }
        if (req.files.images != undefined) {
          for (let i = 0; i < req.files.images.length; ++i) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images[i]
            );
            req.body.images.push(url);
          }
          if (
            req.files.images.length == undefined &&
            req.files.images != undefined
          ) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images
            );
            req.body.images.push(url);
          }
        }
      }
    } else {
      if (req.files != null) {
        if (req.files.thumbnail_image != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.thumbnail_image
          );
          req.body.thumbnail_image = url;
        }
        if (req.files.images != undefined) {
          req.body.images = [];
          for (let i = 0; i < req.files.images.length; ++i) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images[i]
            );
            req.body.images.push(url);
          }
          if (
            req.files.images.length == undefined &&
            req.files.images != undefined
          ) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images
            );
            req.body.images.push(url);
          }
        }
      }
    }
    validationService
      .validate(req.body, EventSchema)
      .then(async (reqData) => {
        try {
          let response;

          if (reqData._id) {
            response = await crudServices.update(
              Event,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(Event, { ...reqData, available_tickets: reqData.total_tickets });
          }
          return res.status(201).json({
            code: 201,
            success: true,
            message: `Event Details ${reqData._id ? `updated` : `created`
              } successfully.`,
            data: response,
          });
        } catch (error) {
          console.log(error.error.errors);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error",
            error: error,
          });
        }
      })
      .catch((err) => {
        console.log(err.error.errors);
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };

  const get = async (req, res) => {
    await validationService.convertIntObj(req.query);
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      if (req.query.category_ids) {
        let categoryIds = req.query.category_ids.map((x) => ObjectId(x));
        whereClause.category_id = { $in: categoryIds };
      }
      if (req.query.city_ids) {
        let cityIds = req.query.city_ids.map((x) => ObjectId(x));
        whereClause.city_id = { $in: cityIds };
      }
      if (req.query.locations) {
        whereClause.location = { $in: req.query.locations };
      }
      if (req.query.is_featured != undefined)
        whereClause.is_featured = JSON.parse(req.query.is_featured);

      if (req.query.today != undefined && JSON.parse(req.query.today) == true) {
        const current_time = new Date();
        const end_of_day = new Date();
        end_of_day.setHours(23, 59, 59, 999);

        whereClause.start_time = { $gte: current_time, $lte: end_of_day };
      }

      if (
        req.query.tomorrow != undefined &&
        JSON.parse(req.query.tomorrow) == true
      ) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const end_of_tomorrow = new Date(tomorrow);
        tomorrow.setHours(0, 0, 0, 1);
        end_of_tomorrow.setHours(23, 59, 59, 999);

        whereClause.start_time = { $gte: tomorrow, $lte: end_of_tomorrow };
      }

      if (
        req.query.next_week != undefined &&
        JSON.parse(req.query.next_week) == true
      ) {
        const today = new Date();
        const next_sunday = new Date(today);
        next_sunday.setDate(today.getDate() + (7 - today.getDay()));

        const next_saturday = new Date(next_sunday);
        next_sunday.setHours(0, 0, 0, 1);
        next_saturday.setDate(next_sunday.getDate() + 6);
        next_saturday.setHours(23, 59, 59, 999);

        whereClause.start_time = { $gte: next_sunday, $lte: next_saturday };
      }

      if (req.query.past != undefined && JSON.parse(req.query.past) == true) {
        const current_time = new Date();
        whereClause.start_time = { $lte: current_time };
      }

      if (
        req.query.past == undefined &&
        req.query.today == undefined &&
        req.query.tomorrow == undefined &&
        req.query.next_week == undefined
      ) {
        const current_time = new Date();
        whereClause.start_time = { $gte: current_time };
      } // to by default filtering future events

      if (req.query.keyword) {
        whereClause.$or = [
          { name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { location: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          {
            time_zone_name: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];
      }

      if (req.query.music_genre_ids && req.query.music_genre_ids.length > 0) {
        const music_genre_query = req.query.music_genre_ids.map((id) =>
          ObjectId(id)
        );
        whereClause.music_genre_ids = { $all: music_genre_query };
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
          from: "currencies",
          let: { currencyId: "$currency_id" },
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
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "event_categories",
          let: { categoryId: "$category_id" },
          as: "EventCategory",
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
        {
          from: "event_pass_varieties",
          let: { eventId: "$_id" },
          as: "EventPassVariety",
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
        {
          from: "event_hosts",
          let: { eventHostIds: "$event_host_ids" },
          as: "EventHosts",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$eventHostIds"] },
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
          from: "event_additional_packages",
          let: { eventId: "$_id" },
          as: "AdditionalPackages",
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
        {
          from: "event_music_genres",
          let: { musicGenreIds: "$music_genre_ids" },
          as: "MusicGenres",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$musicGenreIds"] },
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
          from: "master_cities",
          let: { cityId: "$city_id" },
          as: "City",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$cityId"] },
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

      let response = await crudServices.get(Event, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Event Details get successfully.",
        data: response.data,
        page_info: page_info,
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
  const getEventBookingUserDetails = async (req, res) => {
    await validationService.convertIntObj(req.query);
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      if (req.query.category_ids) {
        let categoryIds = req.query.category_ids.map((x) => ObjectId(x));
        whereClause.category_id = { $in: categoryIds };
      }
      if (req.query.city_ids) {
        let cityIds = req.query.city_ids.map((x) => ObjectId(x));
        whereClause.city_id = { $in: cityIds };
      }
      if (req.query.locations) {
        whereClause.location = { $in: req.query.locations };
      }
      if (req.query.is_featured != undefined)
        whereClause.is_featured = JSON.parse(req.query.is_featured);

      if (req.query.today != undefined && JSON.parse(req.query.today) == true) {
        const current_time = new Date();
        const end_of_day = new Date();
        end_of_day.setHours(23, 59, 59, 999);

        whereClause.start_time = { $gte: current_time, $lte: end_of_day };
      }

      if (
        req.query.tomorrow != undefined &&
        JSON.parse(req.query.tomorrow) == true
      ) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const end_of_tomorrow = new Date(tomorrow);
        tomorrow.setHours(0, 0, 0, 1);
        end_of_tomorrow.setHours(23, 59, 59, 999);

        whereClause.start_time = { $gte: tomorrow, $lte: end_of_tomorrow };
      }

      if (
        req.query.next_week != undefined &&
        JSON.parse(req.query.next_week) == true
      ) {
        const today = new Date();
        const next_sunday = new Date(today);
        next_sunday.setDate(today.getDate() + (7 - today.getDay()));

        const next_saturday = new Date(next_sunday);
        next_sunday.setHours(0, 0, 0, 1);
        next_saturday.setDate(next_sunday.getDate() + 6);
        next_saturday.setHours(23, 59, 59, 999);

        whereClause.start_time = { $gte: next_sunday, $lte: next_saturday };
      }

      if (req.query.past != undefined && JSON.parse(req.query.past) == true) {
        const current_time = new Date();
        whereClause.start_time = { $lte: current_time };
      }

      if (
        req.query.past == undefined &&
        req.query.today == undefined &&
        req.query.tomorrow == undefined &&
        req.query.next_week == undefined
      ) {
        const current_time = new Date();
        whereClause.start_time = { $gte: current_time };
      } // to by default filtering future events

      if (req.query.keyword) {
        whereClause.$or = [
          { name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { location: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          {
            time_zone_name: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];
      }

      if (req.query.music_genre_ids && req.query.music_genre_ids.length > 0) {
        const music_genre_query = req.query.music_genre_ids.map((id) =>
          ObjectId(id)
        );
        whereClause.music_genre_ids = { $all: music_genre_query };
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
          from: "currencies",
          let: { currencyId: "$currency_id" },
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
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "event_categories",
          let: { categoryId: "$category_id" },
          as: "EventCategory",
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
        {
          from: "event_pass_varieties",
          let: { eventId: "$_id" },
          as: "EventPassVariety",
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
        {
          from: "event_hosts",
          let: { eventHostIds: "$event_host_ids" },
          as: "EventHosts",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$eventHostIds"] },
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
          from: "event_additional_packages",
          let: { eventId: "$_id" },
          as: "AdditionalPackages",
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
        {
          from: "event_music_genres",
          let: { musicGenreIds: "$music_genre_ids" },
          as: "MusicGenres",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$musicGenreIds"] },
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
          from: "master_cities",
          let: { cityId: "$city_id" },
          as: "City",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$cityId"] },
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

      let response = await crudServices.get(Event, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Event Details get successfully.",
        data: response.data,
        page_info: page_info,
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

  const check_future_featured_event = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause.is_featured = true;
      const current_time = new Date();
      whereClause.start_time = { $gte: current_time };

      let executing_parameters = {
        where: whereClause,
        projection: {
          _id: 1,
          name: 1,
        },
      };

      let response = await crudServices.get(Event, executing_parameters);

      return res.status(201).json({
        code: 201,
        success: true,
        does_featured_event_exists: response.data[0] ? true : false,
        message: `${response.data[0]
          ? `One Featured Event Exists.`
          : `No Featured Event Exists.`
          }`,
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
        await crudServices.destroy(Event, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Event Details deleted successfully.`,
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
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const get_event_booking_numeric_analytics = async (req, res) => {
    if (req.query.event_id == undefined || req.query.event_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Event Id to get Event-Booking Analytics.",
      });

    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.query.event_id);

      let populate = [
        {
          from: "bookings",
          let: { eventId: "$_id" },
          as: "Bookings",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$event_id", "$$eventId"],
                },
              },
            },
            {
              $project: {
                __v: 0,
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        populate: populate,
      };

      let event_data = await crudServices.get(Event, executing_parameters);

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Event-Booking Analytics calculated.",
        data: {
          total_booking_limit: event_data.data[0].total_booking_limit,
          total_bookings: event_data.data[0].Bookings.length,
          total_bookings_left:
            event_data.data[0].total_booking_limit -
            event_data.data[0].Bookings.length,
        },
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

  const get_ticket_availability_status = async (req, res) => {
    if (!req.query.event_id)
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Event Id.",
      });
    try {
      const getEvent = await Event.findById(req.query.event_id)
      let ticketStatus = {
        sale: getEvent.sale,
        total_tickets: getEvent.total_tickets,
        available_tickets: getEvent.available_tickets
      }
      return res.status(200).json({
        code: 200,
        success: true,
        message: "Booking Details get successfully.",
        data: ticketStatus,
      });
    } catch (error) {
      console.log(error)
      return res.status(501).json({
        code: 501,
        success: true,
        message: `Internal Server Error. ${error}`,
        data: ticketStatus,
      });
    }
  }

  return {
    save,
    get,
    destroy,
    check_future_featured_event,
    get_event_booking_numeric_analytics,
    get_ticket_availability_status
  };
};

module.exports = EventApi;
