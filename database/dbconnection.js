const mysql = require('mysql2')
require('dotenv').config()
const { logger } = require('../config/config')

const dbConfig = {
    connectionLimit: 100,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

logger.info(dbConfig)

const pool = mysql.createPool(dbConfig)

pool.on('connection', function (connection) {
    logger.info(`Connected to database '${connection.config.database}'`)
})

pool.on('acquire', function (connection) {
    logger.info('Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
    logger.info('Connection %d released', connection.threadId)
})

module.exports = pool