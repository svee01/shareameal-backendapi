const database = require('../../database/inmemdb')
const dbconnection = require('../../database/dbconnection')
const assert = require('assert')

/**
 * We exporteren hier een object. Dat object heeft attributen met een waarde.
 * Die waarde kan een string, number, boolean, array, maar ook een functie zijn.
 * In dit geval zijn de attributen functies.
 */
module.exports = {
    // createMovie is een attribuut dat als waarde een functie heeft.
    createUser: (req, res, next) => {
        // Hier gebruiken we nu de inmem database module om een movie toe te voegen.
        // Optie: check vooraf of req.body wel de juiste properties/attribute bevat - gaan we later doen

        // We geven in de createMovie functie de callbackfunctie mee. Die kan een error of een result teruggeven.
        database.createUser(req.body, (error, result) => {
            if (error) {
                console.log(`Error message: ${err.message}`)
                console.log(`Error code: ${err.code}`)

                const error = {
                    statusCode: 400,
                    error: err.message,
                }

                next(error)
            }
            if (result) {
                console.log(`app.js: movie successfully added!`)
                res.status(200).json({
                    statusCode: 200,
                    result,
                })
            }
        })
    },

    getById: (req, res, next) => {
        const userId = req.params.userId
        console.log(`User met ID ${userId} gezocht`)
        let user = database.filter((item) => item.id == userId)
        if (user.length > 0) {
            console.log(user)
            res.status(200).json({
                status: 200,
                result: user,
            })
        } else {
            console.log(`Error message: ${err.message}`)
            console.log(`Error code: ${err.code}`)
            
            const error = {
                status: 401,
                result: `User with ID ${userId} not found`,
            }

            next(error)
        }
    },

    getAll: (req, res, next) => {
        console.log('getAll aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            // if (err) throw err // not connected!
            // Use the connection
            try {
                connection.query(
                    'SELECT id, firstName, lastName FROM user;',
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()
    
                        // Handle error after the release.
                        if (error) throw error
    
                        // Don't use the connection here, it has been returned to the pool.
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

//   `id` int NOT NULL AUTO_INCREMENT,
//   `firstName` varchar(255) NOT NULL,
//   `lastName` varchar(255) NOT NULL,
//   `isActive` tinyint NOT NULL DEFAULT '1',
//   `emailAdress` varchar(255) NOT NULL,
//   `password` varchar(255) NOT NULL,
//   `phoneNumber` varchar(255) DEFAULT '-',
//   `roles` set('admin','editor','guest') NOT NULL DEFAULT 'editor,guest',
//   `street` varchar(255) NOT NULL,
//   `city` varchar(255) NOT NULL,
    updateById: (req, res, next) => {
        console.log('updateById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            // if (err) throw err
            try {
                connection.query(
                    `UPDATE user SET firstName = ${req.firstName}, lastName = ${req.lastName}, emailAdress = ${req.emailAdress}, password = ${req.password}, phoneNumber = ${req.phoneNumber}, street = ${req.street}, city = ${req.city} WHERE id = ${req.id};`,
                    function (error, results, fields) {
                        connection.release()
    
                        if (error) throw error
    
                        console.log(`update user ${req.id} successfully!`)
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
        console.log('deleteById aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            
            connection.query(
                `DELETE FROM user WHERE id = ${req.id};`,
                function (error, results, fields) {
                    connection.release()

                    if (error) throw error

                    console.log(`update user ${req.id} successfully!`)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },

    // `id` int NOT NULL AUTO_INCREMENT,
    // `firstName` varchar(255) NOT NULL,
    // `lastName` varchar(255) NOT NULL,
    // `isActive` tinyint NOT NULL DEFAULT '1',
    // `emailAdress` varchar(255) NOT NULL,
    // `password` varchar(255) NOT NULL,
    // `phoneNumber` varchar(255) DEFAULT '-',
    // `roles` set('admin','editor','guest') NOT NULL DEFAULT 'editor,guest',
    // `street` varchar(255) NOT NULL,
    // `city` varchar(255) NOT NULL,
    validateUser: (req, res, next) => {
        // We krijgen een movie object binnen via de req.body.
        // Dat object splitsen we hier via object decomposition
        // in de afzonderlijke attributen.
        const { firstName, lastName, street, city, emailAdress, password } = req.body
        try {
            // assert is een nodejs library om attribuutwaarden te valideren.
            // Bij een true gaan we verder, bij een false volgt een exception die we opvangen.
            assert.equal(typeof firstName, 'string', 'first name must be a string')
            assert.equal(typeof lastName, 'string', 'last name must be a string')
            assert.equal(typeof street, 'string', 'street address must be a string')
            assert.equal(typeof city, 'string', 'city address must be a string')
            assert.equal(typeof emailAdress, 'string', 'email address must be a string')
            assert.equal(typeof password, 'string', 'password address must be a string')
            // assert.equal(typeof phoneNumber, 'string', 'phone number address must be a string')
            // als er geen exceptions waren gaan we naar de next routehandler functie.
            next()
        } catch (err) {
            // Hier kom je als een assert failt.
            console.log(`Error message: ${err.message}`)
            console.log(`Error code: ${err.code}`)
            // Hier geven we een generiek errorobject terug. Dat moet voor alle
            // foutsituaties dezelfde structuur hebben. Het is nog mooier om dat
            // via de Express errorhandler te doen; dan heb je één plek waar je
            // alle errors afhandelt.
            // zie de Express handleiding op https://expressjs.com/en/guide/error-handling.html
            const error = {
                statusCode: 400,
                error: err.message,
            }

            next(error)
        }
    },
}