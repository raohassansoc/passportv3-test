const payRoutes = {
  "GET /user/get": "UserApi.get",
  "POST /pay/user/save": "UserApi.save",
  "POST /user/delete": "UserApi.destroy",
  "POST /crypto/wallet/create": "UserApi.createWebWallet",

  "POST /pay/user/login-attempt": "UserApi.loginAttempt",
  "GET /pay/user/login": "UserApi.login",
  "POST /user/login/otp/send": "UserApi.sendOTP",
  "POST /pay/user/add-device":
    "UserApi.magic_link_authentication_and_add_device_in_existing_account",
  "POST /pay/user/signup": "UserApi.sign_up",
  "POST /pay/user/raw-create": "UserApi.create_raw_user",
  "POST /pay/user/add-pin": "UserApi.add_pin_in_existing_account",
  "GET /pay/user/pin-status": "UserApi.check_pin_of_user",

  "GET /user-device/get": "UserDeviceApi.get",
  "POST /user-device/save": "UserDeviceApi.save",
  "POST /user-device/delete": "UserDeviceApi.destroy",

  "GET /user/feed/get": "UserFeedApi.get",
  "POST /user/feed/save": "UserFeedApi.save",
  "POST /user/feed/delete": "UserFeedApi.destroy",

  'GET /user/sms/send/otp': 'UserApi.sendSmsOtp',
  'GET /user/sms/verify/otp': 'UserApi.verifySmsOtp',


  'GET /user/username/availability/get': 'UserApi.usernameAvailability',
};

module.exports = payRoutes;
