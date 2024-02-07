// Do not temper with this file content

const rawRoutes = {
  "POST /upload/file/s3": "RawApi.upload_file_on_s3",
  "POST /aws/s3/user/secret": "RawApi.retrieve_secret_key_of_user",
  "GET /aws/test/function": "RawApi.aws_test_function",

  "POST /test/card/create": "CardApi.create_card",
  "POST /test/wallet/get-balance": "CardApi.view_balance",
  "POST /test/wallet/create-sub-wallet": "CardApi.create_sub_wallet",
  "GET /test/mswipe/status": "CardApi.check_platform_status",
};

module.exports = rawRoutes;
