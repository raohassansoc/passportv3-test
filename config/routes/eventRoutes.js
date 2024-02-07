const eventRoutes = {
  "GET /event-category/get": "EventCategoryApi.get",
  "POST /event-category/save": "EventCategoryApi.save",
  "POST /event-category/delete": "EventCategoryApi.destroy",

  "GET /music-genre/get": "MusicGenreApi.get",
  "POST /music-genre/save": "MusicGenreApi.save",
  "POST /music-genre/delete": "MusicGenreApi.destroy",

  "GET /event/get": "EventApi.get",
  "POST /event/save": "EventApi.save",
  "POST /event/delete": "EventApi.destroy",
  "GET /event-booking-analytics/get":
    "EventApi.get_event_booking_numeric_analytics",
  "GET /event/check-featured-event": "EventApi.check_future_featured_event",
  "GET /event/ticket_availibility": "EventApi.get_ticket_availability_status",

  "GET /event-pass-variety/get": "EventPassVarietyApi.get",
  "POST /event-pass-variety/save": "EventPassVarietyApi.save",
  "POST /event-pass-variety/delete": "EventPassVarietyApi.destroy",

  "GET /event-host/get": "EventHostApi.get",
  "POST /event-host/save": "EventHostApi.save",
  "POST /event-host/delete": "EventHostApi.destroy",

  "GET /event-host-category/get": "EventHostCategoryApi.get",
  "POST /event-host-category/save": "EventHostCategoryApi.save",
  "POST /event-host-category/delete": "EventHostCategoryApi.destroy",

  "GET /event-additional-package/get": "AdditionalPackageApi.get",
  "POST /event-additional-package/save": "AdditionalPackageApi.save",
  "POST /event-additional-package/delete": "AdditionalPackageApi.destroy",
};

module.exports = eventRoutes;
