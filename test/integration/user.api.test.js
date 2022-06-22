process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const assert = require("assert");
require("dotenv").config();
const dbconnection = require("../../database/dbconnection");
const jwtSecretKey = require("../../src/config/config").jwtSecretKey;
const jwt = require("jsonwebtoken");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
    "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");' +
    "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
    '(2, "first", "last", "random@server.nl", "secret", "street", "city");';

const INSERT_MEALS =
    "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe("Users", () => {

    describe("UC201 Create user", () => {
        beforeEach((done) => {
            console.log("beforeEach called");
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;

                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release();

                        if (error) throw error;

                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        // Gebruiker is niet toegevoegd in het systeem. Responsestatus HTTP code 400 (Foute aanvraag) Response bevat JSON object met daarin generieke foutinformatie.
        it("TC-201-1 should return valid error when required value is not present", (done) => {
            chai.request(server)
                .post("/api/user")
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    // emailAdress: "random@gmail.com"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(500);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "message");

                    let { statusCode, message } = res.body;

                    done();
                });
        });

        it("TC-201-2 should return a valid error when email is invalid", (done) => {
            chai.request(server)
                .post("/api/user")
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: 1234,
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(500);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "message");

                    let { statusCode, message } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });

        it("TC-201-3 should return a valid error when password is invalid", (done) => {
            chai.request(server)
                .post("/api/user")
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: 1234,
                    emailAdress: "random@gmail.com",
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(500);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "message");

                    let { statusCode, message } = res.body;
                    statusCode.should.be.an("number");
                    message.should.be.an("string");

                    done();
                });
        });

        it("TC-201-4 should return a valid error when a user already exists", (done) => {
            // email is unique, so why is it addable?
            chai.request(server)
                .post("/api/user")
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "name@server.nl",
                })
                .end((err, res) => {
                    res.should.have.status(500);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "message");

                    let { statusCode, message } = res.body;
                    statusCode.should.be.an("number");
                    message.should.be.an("string");

                    done();
                });
        });

        // Gebruiker is toegevoegd in het systeem. Responsestatus HTTP code 200 Response bevat JSON object met daarin volledige gebruikersnaam en het gegenereerde token.
        it("TC-201-5 should add users to the database", (done) => {
            chai.request(server)
                .post("/api/user")
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "random@gmail.com",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("results", "statusCode");

                    let { results, statusCode } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });
    });

    describe("UC-202 showing users", () => {
        beforeEach((done) => {
            console.log("beforeEach called");

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met lege lijst.
        it("TC-202-1 show 0 users", (done) => {
            chai.request(server)
                .get("/api/user")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("results", "statusCode");

                    let { results, statusCode } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van twee gebruikers.
        it("TC-202-2 show 2 users", (done) => {
            chai.request(server)
                .get("/api/user")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "results");

                    let { statusCode, results } = res.body;
                    statusCode.should.be.an("number");
                    results.should.be.an("array").that.has.lengthOf(2);

                    done();
                });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met nul gebruikers.
        it("TC-202-3 show users on search term of nonexistent name", (done) => {
            chai.request(server)
                .get("/api/user?firstName=idontexist")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "results");

                    let { statusCode, results } = res.body;
                    statusCode.should.be.an("number");

                    results.should.be.an("array").that.has.lengthOf(0);

                    done();
                });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruikers.
        it("TC-202-4 show users by using search term on the field active=false", (done) => {
            chai.request(server)
                .get("/api/user?isActive=0")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "results");

                    let { statusCode, results } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruikers.
        it("TC-202-5 show users by using search term on the field active=true", (done) => {
            chai.request(server)
                .get("/api/user?isActive=1")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "results");

                    let { statusCode, results } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruikers.
        it("TC-202-6 show users on search term of existent name", (done) => {
            chai.request(server)
                .get("/api/user?firstName=first")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "results");

                    let { statusCode, results } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });
    });

    describe("UC-203 request personal user profile", () => {
        beforeEach((done) => {
            console.log("beforeEach called");

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-203-1 invalid token", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .set({
                    Authorization: `Bearer` + jwt.sign({ userId: 1 }, "wrong"),
                })
                .end((err, res) => {
                    res.should.have.status(422);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    done();
                });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruiker.
        it("TC-203-2 valid token and user exists", (done) => {
            chai.request(server)
                .get("/api/user/profile")
                .set({
                    Authorization: `Bearer` + jwt.sign({ userId: 1 }, "wrong"),
                })
                .end((err, res) => {
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    done();
                });
        });
    });

    describe("UC-204 details of a user", () => {
        beforeEach((done) => {
            console.log("beforeEach called");

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        // it ('TC-204-1 invalid token', (done) => {

        //     done()
        // })       ------------> what if you want to view someone elses profile? my reasoning was not needing a token to view a profile, just your own profile.
        //                        you might want to view the details of another cook, like we programmed in the app.

        // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-204-2 user id doesnt exist", (done) => {
            chai.request(server)
                .get("/api/user/50")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    console.log(res.body);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "message");

                    let { statusCode, message } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruiker.
        it("TC-204-3 user id exists", (done) => {
            chai.request(server)
                .get("/api/user/1")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("statusCode", "results");

                    let { statusCode, results } = res.body;
                    statusCode.should.be.an("number");

                    done();
                });
        });
    });

    describe("UC-205 updating a user", () => {
        beforeEach((done) => {
            console.log("beforeEach called");

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        // Responsestatus HTTP code 400 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-205-1 required field is missing", (done) => {
            chai.request(server)
                .put("/api/user/1", {
                    // firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "random@gmail.com",
                })
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    console.log(res.status);
                    console.log(res.body);
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;
                    error.should.be.an("string");

                    done();
                });
        });

        // Responsestatus HTTP code 400 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-205-3 invalid phone number", (done) => {
            chai.request(server)
                .put("/api/user/1", {
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: 123,
                    city: "Breda",
                    password: "secret",
                    emailAdress: "random@gmail.com",
                })
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    console.log(res.status);
                    console.log(res.body);
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;
                    error.should.be.an("string");

                    done();
                });
        });

        // Responsestatus HTTP code 400 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-205-4 user doesnt exist", (done) => {
            chai.request(server)
                .put("/api/user/50000", {
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: 123,
                    city: "Breda",
                    password: "secret",
                    emailAdress: "random@gmail.com",
                })
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;
                    error.should.be.an("string");

                    done();
                });
        });

        // Gebruiker is niet toegevoegd Responsestatus HTTP code 401 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-205-5 not logged in", (done) => {
            chai.request(server)
                .put("/api/user/1", {
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "random@gmail.com",
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;
                    error.should.be
                        .an("string")
                        .that.contains("Authorization header missing!");

                    done();
                });
        });

        // Gebruiker gewijzigd in database Responsestatus HTTP code 200 (OK) Response bevat JSON object met alle gegevens van de gebruiker.
        it("TC-205-6 user successfully updated", (done) => {
            chai.request(server)
                .put("/api/user/1", {
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "new@gmail.com",
                })
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    console.log(res.body);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    done();
                });
        });
    });

    describe("UC-206 deleting a user", () => {
        beforeEach((done) => {
            console.log("beforeEach called");

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-206-1 user doesnt exist", (done) => {
            chai.request(server)
                .delete("/api/user/50")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;
                    error.should.be.an("string");

                    done();
                });
        });

        // Gebruiker is niet toegevoegd Responsestatus HTTP code 401 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-206-2 not logged in", (done) => {
            chai.request(server)
                .delete("/api/user/1")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;
                    error.should.be
                        .an("string")
                        .that.contains("Authorization header missing!");

                    done();
                });
        });

        // Gebruiker is niet toegevoegd Responsestatus HTTP code 401 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it("TC-206-3 actor is not the owner", (done) => {
            chai.request(server)
                .delete("/api/user/2")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    done();
                });
        });

        // Gebruiker verwijderd uit database Responsestatus HTTP code 200 (OK)
        it("TC-206-4 user successfully deleted", (done) => {
            chai.request(server)
                .delete("/api/user/1")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    done();
                });
        });
    });
});
