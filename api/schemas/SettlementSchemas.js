const SettlementSchema = {
  validator: {
  },
  niceNames: {
  },
};

const SettlementTypeSchemas = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Name",
  },
};

module.exports = {
  SettlementSchema,
  SettlementTypeSchemas,
};
