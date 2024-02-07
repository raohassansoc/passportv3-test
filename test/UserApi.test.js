const supertest = require("supertest");
const app = require('../api/api');
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
describe("User Testing", () => {

  // beforeAll(async () => {
  //   const mongoServer = await MongoMemoryServer.create()
  //   await mongoose.connect(mongoServer.getUri())
  // })
  // afterAll(async () => {
  //   await mongoose.disconnect();
  //   await mongoose.connection.close();
  // })

  // For Create New User
  test("Create User with alldata", async () => {
    const response = await supertest(app)
      .post("/public/api/pay/user/save")
      .send({
        status: "active",
        first_name: "Hassanf",
        last_name: "sfsdfsfdf",
        email_id: "example1@passportv3.io",
        primary_contact_number: 1234567890,
        dob: "2001-11-15T14:35:55.294+00:00",
        country_id: "64c3fce99fb6be4e11772d6b",
        telegram_id: "sfsdfsdfds",
        is_investor: true
      });
    expect(response.statusCode).toBe(200);

  }, 20000);

  test("Create User With Missing Some Fields", async () => {
    const response = await supertest(app)
      .post("/public/api/pay/user/save")
      .send({
        status: "active",
        first_name: "Hassanf",
        dob: "2001-11-15T14:35:55.294+00:00",
        country_id: "64c3fce99fb6be4e11772d6b",
        is_investor: true
      });
    expect(response.statusCode).toBe(500);
  });

  test("Create User With Invalid Email", async () => {
    const response = await supertest(app)
      .post("/public/api/pay/user/save")
      .send({
        status: "active",
        first_name: "Hassanf",
        last_name: "sfsdfsfdf",
        email_id: "hiralgmdaail.com",
        primary_contact_number: 1234567890,
        dob: "2001-11-15T14:35:55.294+00:00",
        country_id: "64c3fce99fb6be4e11772d6b",
        telegram_id: "sfsdfsdfds",
        is_investor: true
      });
    expect(response.statusCode).toBe(500);

  });

  test("Create User With Invalid Contact Number", async () => {
    const response = await supertest(app)
      .post("/public/api/pay/user/save")
      .send({
        status: "active",
        first_name: "Hassanf",
        last_name: "sfsdfsfdf",
        email_id: "hiral@gmdaail.com",
        primary_contact_number: (1123333333333234567890).toString(),
        dob: "2001-11-15T14:35:55.294+00:00",
        country_id: "64c3fce99fb6be4e11772d6b",
        telegram_id: "sfsdfsdfds",
        is_investor: true
      });
    expect(response.statusCode).toBe(500);

  });

  // For Existing User to Update
  test("Update User Using Object_id", async () => {
    const response = await supertest(app)
      .post("/public/api/pay/user/save")
      .send({
        _id: '64e32ae7385abb70138edc0c',
        first_name: "Hassan",
        last_name: "asif",
      });
    expect(response.statusCode).toBe(201);
  });



});