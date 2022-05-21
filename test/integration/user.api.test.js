process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../app')
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')
const { jwtSecretKey } = require('../../src/config/config')
const jwt = require('jsonwebtoken')

chai.should()
chai.use(chaiHttp)

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");' +
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "first", "last", "random@server.nl", "secret", "street", "city");'

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Login', () => {
    before((done) => {
        console.log(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        )
        console.log('before done')
        done()
    })

    describe('UC101 Login', () => {

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

        // Response bevat JSON object met daarin generieke foutinformatie en code 400
        it('TC-101-1 Required field is missing', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "random@gmail.com",
                    // password: "secret",
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

                    done()
                })
        })

        it('TC-101-2 Unvalid email address', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "unvalidemail",
                    password: "secret",
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

                    done()
                })
        })

        it('TC-101-3 Unvalid password', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "random@gmail.com",
                    password: "wrongwrong",
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

                    done()
                })
        })

        // Response bevat JSON object met daarin generieke foutinformatie en code 404
        it('TC-101-4 User doesnt exist', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "idontexist@gmail.com",
                    password: "wrongwrong",
                })
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

                    done()
                })
        })

        // Response bevat JSON object met daarin volledige gebruikersinformatie en het gegenereerde token en code 200
        it('TC-101-5 User doesnt exist', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    emailAdress: "random@gmail.com",
                    password: "secret",
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'results')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')

                    done()
                })
        })
    })
})

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

        // Gebruiker is niet toegevoegd in het systeem. Responsestatus HTTP code 400 (Foute aanvraag) Response bevat JSON object met daarin generieke foutinformatie.
        it('TC-201-1 should return valid error when required value is not present', (done) => {
            chai.request(server)
                .post('/api/user')
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
        })

        it('TC-201-2 should return a valid error when email is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
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
        })

        it ('TC-201-3 should return a valid error when password is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: 1234,
                    emailAdress: "random@gmail.com"
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
        })

        it ('TC-201-4 should return a valid error when a user already exists', (done) => { // email is unique, so why is it addable?
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "name@server.nl"
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
                        .that.contains('already exists')

                    done()
                })
        })

        // Gebruiker is toegevoegd in het systeem. Responsestatus HTTP code 200 Response bevat JSON object met daarin volledige gebruikersnaam en het gegenereerde token.
        it ('TC-201-5 should add users to the database', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Milan",
                    lastName: "Knol",
                    isActive: 1,
                    street: "Lovensdijkstraat 61",
                    phoneNumber: "0612345678",
                    city: "Breda",
                    password: "secret",
                    emailAdress: "random@gmail.com"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { results, statusCode } = res.body
                    statusCode.should.be.an('number')

                    done()
                })
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
                    .that.has.all.keys('results', 'statusCode')

                let { results, statusCode } = res.body
                statusCode.should.be.an('number')

                done()
            })
        })

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van twee gebruikers.
        it ('TC-202-2 show 2 users', (done) => {
            chai.request(server)
            .get('/api/user')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode', 'results')

                let { statusCode, results } = res.body
                statusCode.should.be.an('number')
                results.should.be.an('array')
                    .that.has.lengthOf(2)

                done()
            })
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

    describe('UC-203 request personal user profile', () => {
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
        it ('TC-203-1 invalid token', (done) => {

            done()
        })

        // Responsestatus HTTP code 200 Response bevat JSON object met gegevens van gebruiker.
        it ('TC-203-2 valid token and user exists', (done) => {

            done()
        })
    })

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
                console.log(res.body)
                assert.ifError(err)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode', 'error')

                let { statusCode, error } = res.body
                statusCode.should.be.an('number')
                error.should.be
                    .an('string')
                    .that.contains('does not exist')

                done()
            })
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
                    .that.has.all.keys('statusCode', 'results')

                let { statusCode, results } = res.body
                statusCode.should.be.an('number')

                done()
            })
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
            .put('/api/user/0', {
                // firstName: "Milan",
                lastName: "Knol",
                isActive: 1,
                street: "Lovensdijkstraat 61",
                phoneNumber: "0612345678",
                city: "Breda",
                password: "secret",
                emailAdress: "random@gmail.com"
            })
            .end((err, res) => {
                console.log(res.status)
                console.log(res.body)
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
                        .that.contains('first name must be')

                    done()
            })
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
                        .that.contains('does not exist')

                    done()
            })
        })

        // Gebruiker is niet toegevoegd Responsestatus HTTP code 401 Response bevat JSON object met daarin generieke foutinformatie, met specifieke foutmelding. --> yet to come in class too
        // it ('TC-205-5 not logged in', (done) => {

        //     done()
        // })

        // Gebruiker gewijzigd in database Responsestatus HTTP code 200 (OK) Response bevat JSON object met alle gegevens van de gebruiker.
        it ('TC-205-6 user successfully updated', (done) => {
            chai.request(server)
            .put('/api/user/1')
            .send({
                firstName: "Milan",
                lastName: "Knol",
                isActive: 1,
                street: "Lovensdijkstraat 61",
                phoneNumber: "0612345678",
                city: "Breda",
                password: "secret",
                emailAdress: "new@gmail.com"
            })
            .end((err, res) => {
                console.log(res.body)
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode', 'results')

                let { statusCode, results } = res.body
                statusCode.should.be.an('number')

                done()
            })
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
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'results')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    // error.should.be
                    //     .an('string')
                    //     .that.contains('found')

                    done()
                })
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
                    .that.has.all.keys('statusCode', 'results')

                let { statusCode, results } = res.body
                statusCode.should.be.an('number')

                done()
            })
        })
    })
})

describe('Meals', () => {
    beforeEach((done) => {
        console.log('beforeEach called')

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEALS,
                function (error, results, fields) {
                    connection.release()
                    if (error) throw error
                    console.log('beforeEach done')
                    done()
                }
            )
        })
    })

    describe('UC-301 Maaltijd aanmaken', () => {
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

        // code 400
        it('TC-301-1 Verplicht veld ontbreekt', (done) => {
            chai.request(server)
                .post('/api/meal')
                .set({ "Authorization": `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey)})
                .send({
                    "isActive": 1,
                    "isVega": 1,
                    "isVegan": 1,
                    "isToTakeHome": 1,
                    "maxAmountOfParticipants": 8,
                    "price": 4,
                    // "imageUrl": "randomUrl",
                    // "cookId": 1,
                    // "name": "Hihi",
                    "description": "hihi",
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
                    
                    done()
                })
        })

        // code 401
        it('TC-301-2 Niet ingelogd', (done) => {
            chai.request(server)
                .get('/api/movie')
                .send({
                    "isActive": 1,
                    "isVega": 1,
                    "isVegan": 1,
                    "isToTakeHome": 1,
                    "maxAmountOfParticipants": 8,
                    "price": 4,
                    "imageUrl": "randomUrl",
                    "cookId": 1,
                    "name": "Hihi",
                    "description": "hihi",
                })
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(401)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    
                    done()
        })

        // code 200
        it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
            chai.request(server)
            .post('/api/meal')
            .set({ "Authorization": `Bearer` + jwt.sign({ userId: 1 }, jwtSecretKey)})
            .send({
                "isActive": 1,
                "isVega": 1,
                "isVegan": 1,
                "isToTakeHome": 1,
                "maxAmountOfParticipants": 8,
                "price": 4,
                "imageUrl": "randomUrl",
                "cookId": 1,
                "name": "Hihi",
                "description": "hihi",
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('statusCode', 'results')

                let { statusCode, results } = res.body
                statusCode.should.be.an('number')
                
                done()
            })
        })
    })

    describe('UC-303 Lijst van maaltijden opvragen /api/meal', () => {
        
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

        // code 200
        it('TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })
    })

    describe('UC-304 Details van een maaltijd opvragen', () => {
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

        // code 404
        it('TC-304-1 Maaltijd bestaat niet', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })

        // code 200
        it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })
    })

    describe('UC-305 Maaltijd verwijderen', () => {
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
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

        // code 401
        it('TC-305-2 Niet ingelogd', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })

        // code 403
        it('TC-305-3 Niet de eigenaar van de data', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })

        // code 404
        it('TC-305-4 Maaltijd bestaat niet', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })

        // code 200
        it('TC-305-5 Maaltijd succesvol verwijderd', (done) => {
            chai.request(server)
                .get('/api/movie')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
            })
        })
    })
})