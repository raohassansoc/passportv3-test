const supertest = require("supertest");
const app = require('../api/api');
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')


describe("Booking API Testing", () => {
    // For Create Booking
    test("Booking Ticket for an Event", async () => {
        const response = await supertest(app)
            .post("/public/api/booking/book")
            .send({
                user_id: "65bb4faa90b73b6b74e4df44",
                transaction_id: "6524025ba632e0c336726498",
                event_id: "65c22a803031f57d23e2b1bc",
                currency: "USD",
                description: "hello world description on change",
                event_pass_variety_id: "65c22aa83031f57d23e2b1c9",
                ticket_qty: 5,
                token_id: "tok_1Oh6MzKNO7OmoLqd8hwrqaQO"
            });
        console.log(response)
        expect(response.statusCode).toBe(201);

    }, 20000);

    // If Token Id is Already used
    test("Booking Ticket for an Event when Token ID is already used", async () => {
        const response = await supertest(app)
            .post("/public/api/booking/book")
            .send({
                user_id: "65bb4faa90b73b6b74e4df44",
                transaction_id: "6524025ba632e0c336726498",
                event_id: "65c22a803031f57d23e2b1bc",
                currency: "USD",
                description: "hello world description on change",
                event_pass_variety_id: "65c22aa83031f57d23e2b1c9",
                ticket_qty: 5,
                token_id: "tok_1Oh6LZKNO7OmoLqdZZ3obT9D"
            });
        expect(response.statusCode).toBe(501);

    }, 20000);

    // If Event Id Is Missing
    test("Booking Ticket for an Event If Event Id is missing", async () => {
        const response = await supertest(app)
            .post("/public/api/booking/book")
            .send({
                user_id: "65bb4faa90b73b6b74e4df44",
                transaction_id: "6524025ba632e0c336726498",
                event_id: "",
                currency: "USD",
                description: "hello world description on change",
                event_pass_variety_id: "65c22aa83031f57d23e2b1c9",
                ticket_qty: 5,
                token_id: "tok_1Oh6MJKNO7OmoLqdVXcSFqzN"
            });
        expect(response.statusCode).toBe(401);

    }, 20000);

    // If User Id Is Missing
    test("Booking Ticket for an Event If User Id is missing", async () => {
        const response = await supertest(app)
            .post("/public/api/booking/book")
            .send({
                user_id: "",
                transaction_id: "6524025ba632e0c336726498",
                event_id: "65c22a803031f57d23e2b1bc",
                currency: "USD",
                description: "hello world description on change",
                event_pass_variety_id: "65c22aa83031f57d23e2b1c9",
                ticket_qty: 5,
                token_id: "tok_1Oh6MJKNO7OmoLqdVXcSFqzN"
            });
        expect(response.statusCode).toBe(401);

    }, 20000);

    // If Event Pass Variety Id Is Missing
    test("Booking Ticket for an Event If Event Pass Variety Id is missing", async () => {
        const response = await supertest(app)
            .post("/public/api/booking/book")
            .send({
                user_id: "65bb4faa90b73b6b74e4df44",
                transaction_id: "6524025ba632e0c336726498",
                event_id: "65c22a803031f57d23e2b1bc",
                currency: "USD",
                description: "hello world description on change",
                event_pass_variety_id: "",
                ticket_qty: 5,
                token_id: "tok_1Oh6MJKNO7OmoLqdVXcSFqzN"
            });
        expect(response.statusCode).toBe(401);

    }, 20000);

    // If Ticket Quantity Is Missing
    test("Booking Ticket for an Event If Ticket Quantity is missing", async () => {
        const response = await supertest(app)
            .post("/public/api/booking/book")
            .send({
                user_id: "65bb4faa90b73b6b74e4df44",
                transaction_id: "6524025ba632e0c336726498",
                event_id: "65c22a803031f57d23e2b1bc",
                currency: "USD",
                description: "hello world description on change",
                event_pass_variety_id: "",
                ticket_qty: undefined,
                token_id: "tok_1Oh6MJKNO7OmoLqdVXcSFqzN"
            });
        expect(response.statusCode).toBe(401);

    }, 20000);

});