const dbconnection = require('../../database/dbconnection')
const logger = require('../config/config').logger
const assert = require('assert')

module.exports = {
    getById: (req, res, next) => {
        const mealId = req.params.id
        logger.debug(`Meal met ID ${mealId} gezocht`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                `SELECT * FROM meal WHERE id = ${mealId};`,
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        next({
                            statusCode: 404,
                            error: 'Meal ID does not exist'
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
        logger.debug(`getAll aangeroepen. req.userId = ${req.userId}`)

        const queryParams = req.query
        logger.debug(queryParams)

        let { name, isActive } = req.query
        let queryString = 'SELECT `id`, `name` FROM `meal`'
        if (name || isActive) {
            queryString += ' WHERE '
            if (name) {
                queryString += '`name` LIKE ?'
                name = '%' + name + '%'
            }
            if (name && isActive) queryString += ' AND '
            if (isActive) {
                queryString += '`isActive` = ?'
            }
        }
        queryString += ';'
        logger.debug(`queryString = ${queryString}`)

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err)

            connection.query(
                queryString,
                [name, isActive],
                function (error, results, fields) {
                    connection.release()

                    if (error) next(error)

                    logger.debug('#results = ', results.length)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },

    createMovie: (req, res, next) => {
        logger.debug('createMovie aangeroepen')
        meal = req.body
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            connection.query(
                `INSERT INTO meal SET ${meal};`,
                function (error, results, fields) {
                    if (error) {
                        connection.release()

                        const error = {
                            statusCode: 400,
                            error: 'meal input was wrong',
                        }

                        next(error)
                    } else {
                        connection.release()

                        logger.info(`app.js: movie successfully added!`)
            
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                }
            )
        })
    },

    //isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, cookId, name, description
    validateMovie: (req, res, next) => {
        const { isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, cookId, name, description } = req.body
        try {
            assert.equal(typeof isActive, 'number', 'isActive must be a number')
            assert.equal(typeof isVega, 'number', 'isVega must be a number')
            assert.equal(typeof isVegan, 'number', 'isVegan must be a number')
            assert.equal(typeof isToTakeHome, 'number', 'isToTakeHome must be a number')
            assert.equal(typeof maxAmountOfParticipants, 'number', 'maxAmountOfParticipants must be a number')
            assert.equal(typeof imageUrl, 'string', 'imageUrl must be a string')
            assert.equal(typeof name, 'string', 'name must be a string')
            assert.equal(typeof description, 'string', 'description must be a string')
            next()
        } catch (err) {
            logger.debug(`Error message: ${err.message}`)
            logger.debug(`Error code: ${err.code}`)

            res.status(400).json({
                statusCode: 400,
                error: err.message,
            })
        }
    },

    // isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants,                                                                                                                                         price, imageUrl, cookId, name, description
    updateById: (req, res, next) => {
        const meal = req.body
        let mealId = req.params.id
        logger.debug('updateById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    `UPDATE meal SET ${meal} WHERE id = "${mealId}";`,
                    function (error, results, fields) {
                        connection.release()
    
                        if (error) throw error
    
                        logger.debug(`updated meal ${mealId} successfully!`)
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
        let mealId = req.params.id
        logger.debug('deleteById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            
            connection.query(
                `DELETE FROM meal WHERE id = ${mealId};`,
                function (error, results, fields) {
                    connection.release()

                    if (error) throw error

                    logger.debug(`deleted meal ${mealId} successfully!`)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },
}