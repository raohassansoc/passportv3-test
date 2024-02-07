const restaurantRoutes = {
  "GET /menu-item/get": "MenuItemApi.get",
  "POST /menu-item/save": "MenuItemApi.save",
  "POST /menu-item/delete": "MenuItemApi.destroy",

  "GET /menu-item-category/get": "MenuItemCategoryApi.get",
  "POST /menu-item-category/save": "MenuItemCategoryApi.save",
  "POST /menu-item-category/delete": "MenuItemCategoryApi.destroy",

  "GET /cuisine/get": "CuisineApi.get",
  "POST /cuisine/save": "CuisineApi.save",
  "POST /cuisine/delete": "CuisineApi.destroy",

  "GET /restaurant/get": "RestaurantApi.get",
  "POST /restaurant/save": "RestaurantApi.save",
  "POST /restaurant/delete": "RestaurantApi.destroy",

  "GET /restaurant-category/get": "RestaurantCategoryApi.get",
  "POST /restaurant-category/save": "RestaurantCategoryApi.save",
  "POST /restaurant-category/delete": "RestaurantCategoryApi.destroy",

  "GET /schedule/get": "ScheduleApi.get",
  "POST /schedule/save": "ScheduleApi.save",
  "POST /schedule/delete": "ScheduleApi.destroy",

  "GET /schedule-day/get": "ScheduleDayApi.get",
  "POST /schedule-day/save": "ScheduleDayApi.save",
  "POST /schedule-day/delete": "ScheduleDayApi.destroy",

  "GET /rating/get": "RatingApi.get",
  "POST /rating/save": "RatingApi.save",
  "POST /rating/delete": "RatingApi.destroy",

  "GET /rating-category/get": "RatingCategoryApi.get",
  "POST /rating-category/save": "RatingCategoryApi.save",
  "POST /rating-category/delete": "RatingCategoryApi.destroy",

  "GET /integration-partner/restaurant":
    "RestaurantApi.get_all_restaurant_from_integration_partner",

  "GET /integration-partner/single-restaurant":
    "RestaurantApi.get_single_restaurant_using_uuid",
  "POST /integration-partner/restaurant":
    "RestaurantApi.onboard_one_restaurant_from_integration_partner",
  "POST /integration-partner/restaurant-multiple":
    "RestaurantApi.onboard_multiple_restaurant_from_integration_partener",
  "DELETE /integration-partner/remove-restaurant":
    "RestaurantApi.remove_on_boarded_restaurant",
};

module.exports = restaurantRoutes;
