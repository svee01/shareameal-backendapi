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

describe("Login", () => {
    describe("UC101 Login", () => {
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

        // Response bevat JSON object met daarin generieke foutinformatie en code 400
        it("TC-101-1 Required field is missing", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: "m.vandullemen@server.nl",
                    // password: "secret",
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(422);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("error", "datetime");

                    let { datetime, error } = res.body;
                    error.should.be.an("string");

                    done();
                });
        });

        it("TC-101-2 Unvalid email address", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: 123,
                    password: "secret",
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(422);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;
                    error.should.be.an("string");

                    done();
                });
        });

        it("TC-101-3 Unvalid password", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: "m.vandullemen@server.nl",
                    password: "wrongwrong",
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "message");

                    let { datetime, message } = res.body;

                    done();
                });
        });

        // Response bevat JSON object met daarin generieke foutinformatie en code 404
        it("TC-101-4 User doesnt exist", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: "idontexist@gmail.com",
                    password: "wrongwrong",
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "message");

                    let { datetime, message } = res.body;

                    done();
                });
        });

        // Response bevat JSON object met daarin volledige gebruikersinformatie en het gegenereerde token en code 200
        it("TC-101-5 Successfully logged in", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: "name@server.nl",
                    password: "secret",
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
});
