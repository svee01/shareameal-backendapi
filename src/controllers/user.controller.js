const database = require('../../database/inmemdb')
const dbconnection = require('../../database/dbconnection')
const assert = require('assert')

module.exports = {
    // id, firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city
    createUser: (req, res, next) => {
        console.log('createUser aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES ("${req.body.firstName}", "${req.body.lastName}", "${req.body.isActive}", "${req.body.emailAdress}", "${req.body.password}", "${req.body.phoneNumber}", "${req.body.street}", "${req.body.city}");`,
                    function (error, results, fields) {
                        connection.release()

                        if (error) throw error

                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                )
            } catch (err) {
                console.log(`Error message: ${err.message}`)
                console.log(`Error code: ${err.code}`)

                const error = {
                    statusCode: 400,
                    error: err.message,
                }

                next(error)
            }
        })
    },

    getById: (req, res, next) => {
        const userId = req.params.id
        console.log(`User met ID ${userId} gezocht`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    `SELECT * FROM user WHERE id = ${userId};`,
                    function (error, results, fields) {
                        connection.release()

                        if (error) throw error

                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                )
            } catch (err) {
                console.log(`Error message: ${err.message}`)
                console.log(`Error code: ${err.code}`)

                const error = {
                    statusCode: 400,
                    error: err.message,
                }

                next(error)
            }
        })
    },

    getAll: (req, res, next) => {
        console.log('getAll aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    'SELECT id, firstName, lastName FROM user;',
                    function (error, results, fields) {
                        connection.release()
    
                        if (error) throw error
    
                        console.log('#results = ', results.length)
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                )
            } catch (err) {
                console.log(`Error message: ${err.message}`)
                console.log(`Error code: ${err.code}`)

                const error = {
                    statusCode: 400,
                    error: err.message,
                }

                next(error)
            }
        })
    },

    // id, firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city
    updateById: (req, res, next) => {
        let userId = req.params.id
        console.log('updateById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    `UPDATE user SET firstName = "${req.body.firstName}", lastName = "${req.body.lastName}", isActive = ${req.body.isActive}, emailAdress = "${req.body.emailAdress}", password = "${req.body.password}", phoneNumber = "${req.body.phoneNumber}", street = "${req.body.street}", city = "${req.body.city}" WHERE id = "${req.body.id}";`,
                    function (error, results, fields) {
                        connection.release()
    
                        if (error) throw error
    
                        console.log(`updated user ${userId} successfully!`)
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                )
            } catch (err) {
                console.log(`Error message: ${err.message}`)
                console.log(`Error code: ${err.code}`)

                const error = {
                    statusCode: 400,
                    error: err.message,
                }

                next(error)
            }
        })
    },

    deleteById: (req, res, next) => {
        let userId = req.params.id
        console.log('deleteById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            
            connection.query(
                `DELETE FROM user WHERE id = ${userId};`,
                function (error, results, fields) {
                    connection.release()

                    if (error) throw error

                    console.log(`deleted user ${userId} successfully!`)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },

    // id, firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city
    validateUser: (req, res, next) => {
        const { firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city } = req.body
        try {
            assert.equal(typeof firstName, 'string', 'first name must be a string')
            assert.equal(typeof lastName, 'string', 'last name must be a string')
            assert.equal(typeof street, 'string', 'street must be a string')
            assert.equal(typeof city, 'string', 'city must be a string')
            assert.equal(typeof emailAdress, 'string', 'email address must be a string')
            assert.equal(typeof password, 'string', 'password must be a string')
            assert.equal(typeof isActive, 'number', 'is active must be a number')
            assert.equal(typeof phoneNumber, 'string', 'phone number must be a string')
            next()
        } catch (err) {
            console.log(`Error message: ${err.message}`)
            console.log(`Error code: ${err.code}`)
            // zie de Express handleiding op https://expressjs.com/en/guide/error-handling.html
            const error = {
                statusCode: 400,
                error: err.message,
            }

            next(error)
        }
    },
}