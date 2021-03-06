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

describe("Meals", () => {
    beforeEach((done) => {
        console.log("beforeEach called");

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEALS,
                function (error, results, fields) {
                    connection.release();
                    if (error) throw error;
                    console.log("beforeEach done");
                    done();
                }
            );
        });
    });

    describe("UC-301 Maaltijd aanmaken", () => {
        beforeEach((done) => {
            console.log("beforeEach called");
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        it("TC-301-1 Verplicht veld ontbreekt", (done) => {
            chai.request(server)
                .post("/api/meal")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    maxAmountOfParticipants: 8,
                    price: 4,
                    // "imageUrl": "randomUrl",
                    // "cookId": 1,
                    // "name": "Hihi",
                    description: "hihi",
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Not authorized");

                    done();
                });
        });

        it("TC-301-2 Niet ingelogd", (done) => {
            chai.request(server)
                .post("/api/meal")
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    maxAmountOfParticipants: 8,
                    price: 4,
                    imageUrl: "randomUrl",
                    cookId: 1,
                    name: "Hihi",
                    description: "hihi",
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Authorization header missing!");

                    done();
                });

            it("TC-301-3 Maaltijd succesvol toegevoegd", (done) => {
                chai.request(server)
                    .post("/api/meal")
                    .set({
                        Authorization:
                            `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                    })
                    .send({
                        isActive: 1,
                        isVega: 1,
                        isVegan: 1,
                        isToTakeHome: 1,
                        maxAmountOfParticipants: 8,
                        price: 4,
                        imageUrl: "randomUrl",
                        cookId: 1,
                        name: "Hihi",
                        description: "hihi",
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.an("object");

                        res.body.should.be
                            .an("object")
                            .that.has.all.keys("statusCode", "results");

                        let { statusCode, results } = res.body;
                        statusCode.should.be.an("number");
                        results.should.be
                            .an("object")
                            .that.has.all.keys(
                                "fieldCount",
                                "affectedRows",
                                "insertId",
                                "info",
                                "serverStatus",
                                "warningStatus"
                            );

                        let {
                            fieldCount,
                            affectedRows,
                            insertId,
                            info,
                            serverStatus,
                            warningStatus,
                        } = results;

                        fieldCount.should.be.an("number");
                        affectedRows.should.be.an("number");
                        insertId.should.be.an("number");
                        info.should.be.an("string");
                        serverStatus.should.be.an("number");
                        warningStatus.should.be.an("number");

                        done();
                    });
            });
        });
    });

    describe("UC-303 Lijst van maaltijden opvragen /api/meal", () => {
        beforeEach((done) => {
            console.log("beforeEach called");
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        it("TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd", (done) => {
            chai.request(server)
                .get("/api/meal")
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

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Not authorized");

                    done();
                });
        });
    });

    describe("UC-304 Details van een maaltijd opvragen", () => {
        beforeEach((done) => {
            console.log("beforeEach called");
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        it("TC-304-1 Maaltijd bestaat niet", (done) => {
            chai.request(server)
                .get("/api/meal/50000")
                .set({
                    Authorization:
                        `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey),
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("error", "datetime");

                    let { error, datetime } = res.body;

                    error.should.be
                        .an("string")
                        .that.contains("Not authorized");
                    datetime.should.be.an("string");

                    done();
                });
        });

        it("TC-304-2 Details van maaltijd geretourneerd", (done) => {
            chai.request(server)
                .get("/api/meal/1")
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

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Not authorized");

                    done();
                });
        });
    });

    describe("UC-305 Maaltijd verwijderen", () => {
        beforeEach((done) => {
            console.log("beforeEach called");
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        console.log("beforeEach done");
                        done();
                    }
                );
            });
        });

        it("TC-305-2 Niet ingelogd", (done) => {
            chai.request(server)
                .delete("/api/meal/1")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an("object");

                    res.body.should.be
                        .an("object")
                        .that.has.all.keys("datetime", "error");

                    let { datetime, error } = res.body;

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Authorization header missing!");

                    done();
                });
        });

        it("TC-305-3 Niet de eigenaar van de data", (done) => {
            chai.request(server)
                .delete("/api/meal/3")
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

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Not authorized");

                    done();
                });
        });

        it("TC-305-4 Maaltijd bestaat niet", (done) => {
            chai.request(server)
                .delete("/api/meal/50000")
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

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Not authorized");

                    done();
                });
        });

        it("TC-305-5 Maaltijd succesvol verwijderd", (done) => {
            chai.request(server)
                .delete("/api/meal/1")
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

                    datetime.should.be.an("string");
                    error.should.be
                        .an("string")
                        .that.contains("Not authorized");

                    done();
                });
        });
    });
});
