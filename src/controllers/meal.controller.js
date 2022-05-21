const dbconnection = require('../database/dbconnection')
const logger = require('../config/config').logger
const assert = require('assert')

/**
 * We exporteren hier een object. Dat object heeft attributen met een waarde.
 * Die waarde kan een string, number, boolean, array, maar ook een functie zijn.
 * In dit geval zijn de attributen functies.
 */
module.exports = {
    getById: (req, res, next) => {
        const mealId = req.params.movieId
        logger.debug(`Meal met ID ${mealId} gezocht`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                `SELECT * FROM meal WHERE id = ${mealId};`,
                function (error, results, fields) {
                    connection.release()

                    if (results.length == 0) {
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
            if (err) next(err) // not connected!

            // Use the connection
            connection.query(
                queryString,
                [name, isActive],
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) next(error)

                    // Don't use the connection here, it has been returned to the pool.
                    logger.debug('#results = ', results.length)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },

    // `id` int NOT NULL AUTO_INCREMENT,
//   `isActive` tinyint NOT NULL DEFAULT '0',
//   `isVega` tinyint NOT NULL DEFAULT '0',
//   `isVegan` tinyint NOT NULL DEFAULT '0',
//   `isToTakeHome` tinyint NOT NULL DEFAULT '1',
//   `dateTime` datetime NOT NULL,
//   `maxAmountOfParticipants` int NOT NULL DEFAULT '6',
//   `price` decimal(5,2) NOT NULL,
//   `imageUrl` varchar(255) NOT NULL,
//   `cookId` int DEFAULT NULL,
//   `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
//   `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
//   `name` varchar(200) NOT NULL,
//   `description` varchar(400) NOT NULL,
//   `allergenes` set('gluten','lactose','noten') NOT NULL DEFAULT '',
    createMovie: (req, res, next) => {
        logger.debug('createMovie aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            connection.query(
                `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (${req.body.isActive}, ${req.body.isVega}, ${req.body.isVegan}, ${req.body.isToTakeHome}, ${req.body.dateTime}, ${req.body.maxAmountOfParticipants}, ${req.body.price}, ${req.body.imageUrl}, ${req.id}, "${req.body.name}", "${req.body.description}");`,
                function (error, results, fields) {
                    if (error) {
                        connection.release()

                        const error = {
                            statusCode: 400,
                            error: 'meal input is wrong',
                        }

                        next(error)
                    } else {
                        connection.release()
            
                        if (error) throw error
            
                        res.status(200).json({
                            statusCode: 200,
                            results: results,
                        })
                    }
                }
            )
        })

        logger.debug(`index.js: movie successfully added!`)
        res.status(200).json({
            statusCode: 200,
            result,
        })
    },

    validateMovie: (req, res, next) => {
        const { title, year, studio } = req.body
        try {
            assert.equal(typeof title, 'string', 'title must be a string')
            assert.equal(typeof year, 'number', 'year must be a number')
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
        let mealId = req.params.id
        logger.debug('updateById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            try {
                connection.query(
                    `UPDATE meal SET isActive = ${req.body.isActive}, isVega = ${req.body.isVega}, isVegan = ${req.body.isVegan}, isToTakeHome = ${req.body.isToTakeHome}, dateTime = ${req.body.dateTime}, maxAmountOfParticipants = ${req.body.maxAmountOfParticipants}, price = ${req.body.price}, imageUrl = ${req.body.imageUrl}, cookId = ${req.id}, name = "${req.body.name}", description = "${req.body.description}" WHERE id = "${mealId}";`,
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