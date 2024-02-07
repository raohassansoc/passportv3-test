const InvestorSchemas = {
  validator: {
    email_id: "required|string",
  },
  niceNames: {
    email_id: "email id",
  },
};
const WhiteListedSchemas = {
  validator: {
    email_id: "required|string",
  },
  niceNames: {
    email_id: "email id",
  },
};
const TransactionSchemas = {
  validator: {
    amount: "required",
  },
  niceNames: {
    email_id: "email id",
  },
};
const walletSchemas = {
  validator: {
    user_public_key: "required|string",
    amount: "integer",
  },
  niceNames: {
    user_public_key: "email id",
  },
};
const transferSchemas = {
  validator: {
    _id: "required|string",
    amount: "string",
  },
  niceNames: {
    user_public_key: "email id",
  },
};

module.exports = {
  walletSchemas,
  transferSchemas,
  InvestorSchemas,
  TransactionSchemas,
  WhiteListedSchemas
};
