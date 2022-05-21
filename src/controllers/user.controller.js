const database = require('../../database/inmemdb')
const dbconnection = require('../../database/dbconnection')
const assert = require('assert')
const { logger } = require('../config/config')

module.exports = {

    getPersonalProfile: (req, res, next) => {
        logger.debug(`getPersonalProfile called`)
        dbconnection.getConnection(function (err, connection) {
            connection.query(
                `SELECT * FROM user WHERE id = ${req.id};`,
                function (error, results, fields) {
                    logger.debug(`SELECT * FROM user WHERE id = ${req.id};`)

                    if (results.length > 0) {
                        connection.release()

                        if (error) throw error

                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    } else {
                        connection.release()

                        const error = {
                            statusCode: 400,
                            error: 'user already exists',
                        }

                        next(error)
                    }
                }
            )
        })
    },

    // id, firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city
    createUser: (req, res, next) => {
        logger.debug('createUser aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            connection.query(
                `SELECT * from user WHERE emailAdress = "${req.body.emailAdress}";`,
                function (error, results, fields) {
                    logger.debug(`SELECT * from user WHERE emailAdress = "${req.body.emailAdress}";`)
                    
                    if (results.length > 0) {
                        connection.release()

                        const error = {
                            statusCode: 400,
                            error: 'user already exists',
                        }

                        next(error)
                    } else {
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
                    }
                }
            )
        })
    },

    getById: (req, res, next) => {
        const userId = req.params.id
        logger.debug(`User met ID ${userId} gezocht`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                `SELECT * FROM user WHERE id = ${userId};`,
                function (error, results, fields) {
                    connection.release()

                    if (results.length == 0) {
                        next({
                            statusCode: 404,
                            error: 'User ID does not exist'
                        })
                    } else {
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                }
            )
        })
    },

    getAll: (req, res, next) => {
        logger.debug('getAll aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    'SELECT id, firstName, lastName FROM user;',
                    function (error, results, fields) {
                        connection.release()
    
                        if (error) throw error
    
                        logger.debug('#results = ', results.length)
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                )
            } catch (err) {
                logger.error(`Error message: ${err.message}`)
                logger.error(`Error code: ${err.code}`)

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
        logger.debug('updateById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    `UPDATE user SET firstName = "${req.body.firstName}", lastName = "${req.body.lastName}", isActive = ${req.body.isActive}, emailAdress = "${req.body.emailAdress}", password = "${req.body.password}", phoneNumber = "${req.body.phoneNumber}", street = "${req.body.street}", city = "${req.body.city}" WHERE id = "${userId}";`,
                    function (error, results, fields) {
                        connection.release()
    
                        if (error) throw error
    
                        logger.debug(`updated user ${userId} successfully!`)
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                )
            } catch (err) {
                logger.error(`Error message: ${err.message}`)
                logger.error(`Error code: ${err.code}`)

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
        logger.debug('deleteById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            
            connection.query(
                `DELETE FROM user WHERE id = ${userId};`,
                function (error, results, fields) {
                    connection.release()

                    if (error) throw error

                    logger.debug(`deleted user ${userId} successfully!`)
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
        logger.debug(req.body)
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
            logger.error(`Error message: ${err.message}`)
            logger.error(`Error code: ${err.code}`)
            // zie de Express handleiding op https://expressjs.com/en/guide/error-handling.html
            const error = {
                statusCode: 400,
                error: err.message,
            }

            next(error)
        }
    },
}