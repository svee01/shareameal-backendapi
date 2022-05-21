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

                    if (error || results.length == 0) {
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

    //isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price,                                                                                                                                                                                                                     imageUrl, cookId, name, description
    createMovie: (req, res, next) => {
        logger.debug('createMovie aangeroepen')
        let cookId = req.userId
        let price = parseFloat(req.body.price)
        logger.debug(`${req.body.isActive}, ${req.body.isVega}, ${req.body.isVegan}, ${req.body.isToTakeHome}, ${req.body.maxAmountOfParticipants}, ${price}, "${req.body.imageUrl}", ${cookId}, "${req.body.name}", "${req.body.description}"`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            connection.query(
                `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (${req.body.isActive}, ${req.body.isVega}, ${req.body.isVegan}, ${req.body.isToTakeHome}, ${req.body.maxAmountOfParticipants}, ${req.body.price}, "${req.body.imageUrl}", ${cookId}, "${req.body.name}", "${req.body.description}");`,
                function (error, results, fields) {
                    logger.debug(results)
                    logger.debug(error)
                    if (results) {
                        connection.release()
            
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    } else {
                        connection.release()

                        next({
                            statusCode: 400,
                            error: 'meal already exists',
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
        const cookId = req.userId
        let mealId = req.params.id
        logger.debug('updateById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            try {
                connection.query(
                    `UPDATE meal SET isActive = ${req.body.isActive}, isVega = ${req.body.isVega}, isVegan = ${req.body.isVegan}, isToTakeHome = ${req.body.isToTakeHome}, maxAmountOfParticipants = ${req.body.maxAmountOfParticipants}, price = ${req.body.price}, imageUrl = ${req.body.imageUrl}, cookId = ${cookId}, name = "${req.body.name}", description = "${req.body.description}" WHERE id = "${mealId}";`,
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

                next({
                    statusCode: 400,
                    error: err.message,
                })
            }
        })
    },

    deleteById: (req, res, next) => {
        let mealId = req.params.id
        logger.debug('deleteById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            
            connection.query(
                `SELECT * FROM meal WHERE id = ${mealId};`,
                function (error, results, fields) {
                    if (results.length == 0) {
                        next({
                            statusCode: 404,
                            error: 'meal not found',
                        })
                    } else {
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
                    }
                }
            )
        })
    },
}