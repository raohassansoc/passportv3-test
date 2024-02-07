const UserCompositeUserDeviceSchema = {
  validate: { status: "required|string" },
  niceNames: { status: "Status" },
};

const MerchantCompositeUserSchema = {
  validate: {},
  niceNames: {},
};

module.exports = {
  UserCompositeUserDeviceSchema,
  MerchantCompositeUserSchema,
};
