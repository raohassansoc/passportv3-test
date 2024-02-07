const development = {
  mongoUrl:
    "mongodb+srv://api-dev:5dSjxHEV4EROfUJP@api-dev.ggiycqe.mongodb.net/Passport_online?retryWrites=true&w=majority",
};

const testing = {
  mongoUrl: "mongodb://localhost:27017/data",
};

const production = {
  mongoUrl:
    "mongodb+srv://api-prod:f2qMRAOCI3Gz4ES5@api-prod.0zfcqae.mongodb.net/Passport_online?retryWrites=true&w=majority",
};

module.exports = {
  development,
  testing,
  production,
};
