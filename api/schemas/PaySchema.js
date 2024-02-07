const UserDeviceSchema = {
  validator: {
    ip_address: "required|string",
  },
  niceNames: {
    ip_address: "IP Address",
  },
};
const UserSchemas = {
  validator: {
    email_id: "string",
  },
  niceNames: {
    email_id: "email id",
  },
};
const UserFeedSchema = {
  validator: {
    user_id: "string",
  },
  niceNames: {
    user_id: "user id",
  },
};
const DeletedUserSchemas = {
  validator: {
    email_id: "string",
  },
  niceNames: {
    email_id: "email id",
  },
};
module.exports = {
  UserSchemas,
  UserDeviceSchema,
  DeletedUserSchemas,
  UserFeedSchema
};
