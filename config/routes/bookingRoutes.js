const bookingRoutes = {
  "GET /guest/get": "GuestApi.get",
  "POST /guest/save": "GuestApi.save",
  "POST /guest/delete": "GuestApi.destroy",

  "GET /booking/get": "BookingApi.get",
  "POST /booking/save": "BookingApi.save",
  "POST /booking/delete": "BookingApi.destroy",
  "POST /booking/book": "BookingApi.book",
  "GET /booking/guest/list/get": "BookingApi.getBookingUsers",
  "GET /booking/calculate-discounted-price":
    "BookingApi.get_booking_details_on_event_after_applying",
  "GET /booking/get-details/user-details":
    "BookingApi.get_booking_details_by_user_details",
  "GET /booking/get-details/all-attendees":
    "BookingApi.get_list_of_people_attending_the_event",
};

module.exports = bookingRoutes;
