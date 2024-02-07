let mongoose = require("mongoose");
const Mongo = require("../../config/mongoConnection");
const MongoService = {
  connect: async (environment) => {
    try {
      const mongoURL = Mongo[environment].mongoUrl;
      const mongo_connection = await mongoose.connect(mongoURL);
      console.log(
        `Connected to MongoDB database : ${mongo_connection.connection.host}:${mongo_connection.connection.port}`
      );
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  },
};
module.exports = MongoService.connect;
