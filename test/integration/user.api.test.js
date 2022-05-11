process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../app')
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test. --test
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de UserId, die moet matchen
 * met de user die je ook toevoegt.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Users', () => {
    //
    // informatie over before, after, beforeEach, afterEach:
    // https://mochajs.org/#hooks
    //
    before((done) => {
        console.log(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        )
        console.log('before done')
        done()
    })

    describe('UC201 Create user', () => {
        //
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()
                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        // Gebruiker is niet toegevoegd in het systeem. Responsestatus HTTP code 400 (Foute aanvraag) Response bevat JSON object met daarin generieke foutinformatie.
        it('TC-201-1 should return valid error when required value is not present', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    // firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "j.doe@server.com"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('first name must be a string')

                    done()
                })
        })

        it('TC-201-2 should return a valid error when email is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: 1234
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('email address must be a string')

                    done()
                })
            done()
        })

        it ('TC-201-3 should return a valid error when password is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: 1234,
                    emailAdress: "j.doe@server.com"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('password must be a string')

                    done()
                })
            done()
        })

        it ('TC-201-4 should return a valid error when a user already exists', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "j.doe@server.com"
                },
                {
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "j.doe@server.com"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('duplicate')

                    done()
                })
            done()
        })

        // Gebruiker is toegevoegd in het systeem. Responsestatus HTTP code 200 Response bevat JSON object met daarin volledige gebruikersnaam en het gegenereerde token.
        it ('TC-201-5 should add users to the database', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "John",
                    lastName: "Doe",
                    street: "Lovensdijkstraat 61",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "j.doe@server.com"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode')

                    let { statusCode } = res.body
                    statusCode.should.be.an('number')

                    done()
                })
            done()
        })
    })

    describe('UC-202 showing users', () => {
        beforeEach((done) => {
            console.log('beforeEach called')

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release()
                        if (error) throw error
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        // Responsestatus HTTP code 200 Response bevat JSON object met lege lijst.
        it ('TC-202-1 show 0 users', (done) => {
            chai.request(server)
            .get('/api/user')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode')

                let { statusCode } = res.body
                statusCode.should.be.an('number')

                done()
            })
            done()
        })

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van twee gebruikers.
        it ('TC-202-2 show 2 users', (done) => {
            chai.request(server)
            .post('/api/user')
            .send({
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                password: "secret",
                emailAdress: "j.doe@server.com"
            },
            {
                firstName: "Lisa",
                lastName: "Lol",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                password: "secret",
                emailAdress: "l.lol@server.com"
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.length.should.be
                    .eql(2)

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode')

                let { statusCode, error } = res.body
                statusCode.should.be.an('number')

                done()
            })
            done()
        })

        // Responsestatus HTTP code 200 Response bevat JSON object met nul gebruikers. ?????????????????????????????????????????
        // it ('TC-202-3 show users on search term of nonexistent name', (done) => {
        //     chai.request(server)
        //     .get('/api/user/1')
        //     .end((err, res) => {
        //         res.should.have.status(200)
        //         res.should.be.an('object')

        //         res.body.length.should.be
        //             .eql(2)

        //         res.body.should.be
        //             .an('object')
        //             .that.has.all.keys('statusCode')

        //         let { statusCode, error } = res.body
        //         statusCode.should.be.an('number')

        //         done()
        //     })
        //     done()
        // })

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruikers.
        // it ('TC-202-4 show users by using search term on the field active=false', (done) => {

        //     done()
        // })

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruikers.
        // it ('TC-202-5 show users by using search term on the field active=true', (done) => {

        //     done()
        // })

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruikers.
        // it ('TC-202-6 show users on search term of existent name', (done) => {

        //     done()
        // })
    })

    // describe('UC-203 request personal user profile', () => {
    //     beforeEach((done) => {
    //         console.log('beforeEach called')

    //         dbconnection.getConnection(function (err, connection) {
    //             if (err) throw err
    //             connection.query(
    //                 CLEAR_DB + INSERT_USER,
    //                 function (error, results, fields) {
    //                     connection.release()
    //                     if (error) throw error
    //                     console.log('beforeEach done')
    //                     done()
    //                 }
    //             )
    //         })
    //     })

    //     // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
    //     it ('TC-203-1 invalid token', (done) => {

    //         done()
    //     })

    //     // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruiker.
    //     it ('TC-203-2 valid token and user exists', (done) => {

    //         done()
    //     })
    // })

    describe('UC-204 details of a user', () => {
        beforeEach((done) => {
            console.log('beforeEach called')

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release()
                        if (error) throw error
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        // it ('TC-204-1 invalid token', (done) => {
            
        //     done()
        // })

        // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it ('TC-204-2 user id doesnt exist', (done) => {
            chai.request(server)
            .get('/api/user/50')
            .end((err, res) => {
                assert.ifError(err)
                    res.should.have.status(404)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('not found')

                    done()
            })
            done()
        })

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruiker.
        it ('TC-204-3 user id exists', (done) => {
            chai.request(server)
            .get('/api/user/1')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode')

                let { statusCode } = res.body
                statusCode.should.be.an('number')

                done()
            })
            done()
        })
    })

    describe('UC-205 updating a user', () => {
        beforeEach((done) => {
            console.log('beforeEach called')

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release()
                        if (error) throw error
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        // Responsestatus HTTP code 400 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it ('TC-205-1 required field is missing', (done) => {
            chai.request(server)
            .put('/api/user/1', {
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                // password: "secret",
                emailAdress: "j.doe@server.com"
            })
            .end((err, res) => {
                assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('field')

                    done()
            })
            done()
        })

        // Responsestatus HTTP code 400 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding. --> there is no postal code
        // it ('TC-205-2 invalid postal code', (done) => {
            
        //     done()
        // })

        // Responsestatus HTTP code 400 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding. --> havent done validation of fields yet in class
        // it ('TC-205-3 invalid phone number', (done) => {
        
        //     done()
        // })

        // Responsestatus HTTP code 400 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it ('TC-205-4 user doesnt exist', (done) => {
            chai.request(server)
            .get('/api/user/50')
            .end((err, res) => {
                assert.ifError(err)
                    res.should.have.status(404)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('not found')

                    done()
            })
            done()
        })

        // Gebruiker is niet toegevoegd Responsestatus HTTP code 401 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding. --> yet to come in class too
        // it ('TC-205-5 not logged in', (done) => {

        //     done()
        // })

        // Gebruiker gewijzigd in database Responsestatus HTTP code 200 (OK) Response bevat JSON object met alle gegevens van de gebruiker.
        it ('TC-205-6 user successfully updated', (done) => {
            chai.request(server)
            .put('/api/user/1', {
                firstName: "John",
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                password: "secret",
                emailAdress: "j.doe@server.com"
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode')

                let { statusCode } = res.body
                statusCode.should.be.an('number')

                done()
            })
            done()
        })
    })

    describe('UC-206 deleting a user', () => {
        beforeEach((done) => {
            console.log('beforeEach called')

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        connection.release()
                        if (error) throw error
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        // Responsestatus HTTP code 404 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        it ('TC-206-1 user doesnt exist', (done) => {
            chai.request(server)
                .delete('/api/user/50')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('found')

                    done()
                })
            done()
        })

        // Gebruiker is niet toegevoegd Responsestatus HTTP code 401 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        // it ('TC-206-2 not logged in', (done) => {

        //     done()
        // })

        // Gebruiker is niet toegevoegd Responsestatus HTTP code 401 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding.
        // it ('TC-206-3 actor is not the owner', (done) => {

        //     done()
        // })

        // Gebruiker verwijderd uit database Responsestatus HTTP code 200 (OK)
        it ('TC-206-4 user successfully deleted', (done) => {
            chai.request(server)
            .delete('/api/user/1')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode')

                let { statusCode } = res.body
                statusCode.should.be.an('number')

                done()
            })
            done()
        })
    })

    // describe('UC-303 Lijst van maaltijden opvragen /api/meal', () => {
    //     //
    //     beforeEach((done) => {
    //         console.log('beforeEach called')
    //         // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
    //         dbconnection.getConnection(function (err, connection) {
    //             if (err) throw err // not connected!
    //             connection.query(
    //                 CLEAR_DB + INSERT_USER + INSERT_MEALS,
    //                 function (error, results, fields) {
    //                     // When done with the connection, release it.
    //                     connection.release()
    //                     // Handle error after the release.
    //                     if (error) throw error
    //                     // Let op dat je done() pas aanroept als de query callback eindigt!
    //                     console.log('beforeEach done')
    //                     done()
    //                 }
    //             )
    //         })
    //     })

    //     it('TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd', (done) => {
    //         chai.request(server)
    //             .get('/api/movie')
    //             .end((err, res) => {
    //                 assert.ifError(err)

    //                 res.should.have.status(200)
    //                 res.should.be.an('object')

    //                 res.body.should.be
    //                     .an('object')
    //                     .that.has.all.keys('results', 'statusCode')

    //                 let { statusCode, results } = res.body
    //                 statusCode.should.be.an('number')
    //                 results.should.be.an('array').that.has.length(2)
    //                 results[0].name.should.equal('Meal A')
    //                 results[0].id.should.equal(1)
    //                 done()
    //             })
    //     })
    //     // En hier komen meer testcases
    // })
})